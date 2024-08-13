use futures::StreamExt;
use indoc::indoc;
use nostr::{JsonUtil, PublicKey};
use std::{path::Path, str::FromStr, sync::Arc, time::Duration};
use tokio::sync::mpsc::{Receiver, Sender};
use tracing::debug;

use sqlx::{
    sqlite::{SqliteAutoVacuum, SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions}, ConnectOptions as _, FromRow, Pool, QueryBuilder, Sqlite
};

use crate::sqlx_extras::Extras as _;

/// The interface to our underlying database.
#[derive(Clone)]
pub(crate) struct DB {
    pool: Arc<Pool<Sqlite>>,
}

type DbResult<T> = Result<T, sqlx::Error>;

impl DB {
    pub async fn init(db_file: &str) -> Result<(), sqlx::Error> {
        let mut conn = SqliteConnectOptions::from_str(db_file)?
            .journal_mode(SqliteJournalMode::Wal)
            .create_if_missing(true)
            .connect()
            .await?;

        debug!("create table");
        sqlx::query(indoc! {"
            CREATE TABLE event(
                jsonb BLOB NOT NULL
                , id TEXT NOT NULL AS (jsonb ->> '$.id')
                , kind INT NOT NULL AS (jsonb ->> '$.kind')
                , pubkey TEXT NOT NULL AS (jsonb ->> '$.pubkey')
                , signature TEXT NOT NULL AS (jsonb ->> '$.sig')
                , content TEXT NOT NULL AS (jsonb ->> '$.content')
                , created_at INTEGER NOT NULL AS (jsonb ->> '$.created_at')
                , created_at_utc TEXT NOT NULL AS (datetime(created_at, 'unixepoch'))
                , json TEXT NOT NULL AS (json(jsonb))
            ) STRICT
        "})
            .execute(&mut conn)
            .await?;

        debug!("create indexes");
        sqlx::query(indoc! {"
            CREATE UNIQUE INDEX event_id ON event(unhex(id)); -- Using unhex to save on index size.
            CREATE INDEX event_kind ON event(kind, created_at);
            CREATE INDEX event_created_at ON event(created_at, unhex(id));
            CREATE INDEX event_pubkey ON event(unhex(pubkey), created_at DESC);
            CREATE INDEX event_pubkey_kind ON event(unhex(pubkey), kind, created_at DESC); -- Useful for finding the latest profile/follow-list, etc
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE VIEW tag_view AS
            SELECT
                e.id AS event_id
                , t.value ->> '$[0]' AS name
                , t.value ->> '$[1]' AS value
                , t.value ->> '$[2]' AS value2
                , t.value ->> '$[2]' AS value3
                , t.id AS json_id
            FROM
                event AS e
                , json_each(jsonb, '$.tags') AS t
            ORDER BY
                unhex(event_id)
                , json_id
            ;
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE TABLE tag( -- 'materialized view' of event tags
                event_id BLOB NOT NULL
                , name TEXT NOT NULL
                , value TEXT NOT NULL
            );
            CREATE INDEX tag_event ON tag(event_id);
            CREATE INDEX tag_name_value ON tag(name, value);
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE TRIGGER event_tags AFTER INSERT ON event
            BEGIN
                INSERT INTO tag(event_id, name, value)
                SELECT unhex(t.event_id), name, value
                FROM tag_view AS t
                WHERE unhex(t.event_id) = unhex(new.id)
                AND length(t.name) = 1;
            END;

            CREATE TRIGGER event_tags_delete AFTER DELETE ON event
            BEGIN
                DELETE FROM tag WHERE event_id = unhex(old.id);
            END;
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE VIEW event_latest_kind AS
            WITH k AS (
                SELECT
                    e.pubkey
                    , e.kind
                    , e.id AS event_id
                    , row_number() OVER (
                        PARTITION BY unhex(e.pubkey), e.kind
                        ORDER BY unhex(e.pubkey), e.kind, created_at DESC
                    ) AS row_number
                FROM event AS e
            )
            SELECT
                pubkey, kind, event_id
            FROM k
            WHERE row_number = 1;
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE VIEW profile_info AS
            SELECT
                elk.pubkey
                , e.content ->> '$.name' AS name
                , e.content ->> '$.display_name' AS display_name
                , e.content ->> '$.username' AS username
                , e.content ->> '$.nip05' AS nip05
                , e.content ->> '$.about' AS about
            FROM
                event_latest_kind AS elk
                JOIN event AS e ON (unhex(e.id) = unhex(elk.event_id))
            WHERE
                elk.kind = 0;
            SELECT * from profile_info;
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE VIEW follows AS
            SELECT
                elk.pubkey AS follower
                , t.value AS followed
            FROM
                event_latest_kind AS elk
                JOIN tag AS t ON (t.event_id = unhex(elk.event_id) AND t.name = 'p')
            WHERE elk.kind = 3;
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE VIEW follows_named AS
            SELECT
                follower
                , pi1.name AS follower_name
                , followed
                , pi2.name AS followed_name
            FROM
                follows AS f
                -- JOIN event AS e ON (unhex(e.id) = unhex(elk.event_id))
                LEFT JOIN profile_info AS pi1 ON (unhex(pi1.pubkey) = unhex(follower))
                LEFT JOIN profile_info AS pi2 ON (unhex(pi2.pubkey) = unhex(followed))
            ;
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE TABLE allow_users(
                pubkey TEXT NOT NULL
                , note TEXT DEFAULT NULL
                , allowed_levels INTEGER NOT NULL DEFAULT 1
            )
        "})
            .execute(&mut conn)
            .await?;

        sqlx::query(indoc! {"
            CREATE VIEW allowed_users AS
            WITH RECURSIVE
                au(pubkey, level) AS (
                    SELECT pubkey, allowed_levels FROM allow_users
                    UNION
                    SELECT followed, au.level - 1
                    FROM au
                    JOIN follows ON (unhex(au.pubkey) = unhex(follows.follower))
                    WHERE au.level > 0
                )
            select * from au;
        "})
            .execute(&mut conn)
            .await?;

        Ok(())
    }

    /// Create a DB pool, and also open an initial connection to test it.
    pub async fn connect(db_file: &Path) -> Result<Self, sqlx::Error> {
        let pool = SqlitePoolOptions::new()
            .max_connections(20)
            .idle_timeout(Duration::from_secs(60))
            .acquire_timeout(Duration::from_secs(5))
            .connect_with(
                SqliteConnectOptions::new()
                    .auto_vacuum(SqliteAutoVacuum::Incremental)
                    .journal_mode(SqliteJournalMode::Wal)
                    .filename(db_file),
            )
            .await?;

        Ok(Self {
            pool: Arc::new(pool),
        })
    }

    /// Save an event to the DB.
    ///
    /// Note: Assumes you've already validated the event.
    pub async fn save_event(&self, event: &nostr::Event) -> Result<(), sqlx::Error> {
        let query = sqlx::query(indoc! {"
            INSERT INTO event(jsonb)
            VALUES (jsonb(?))
        "})
            .bind(event.as_json());
        query.execute(&*self.pool).await?;
        Ok(())
    }

    pub(crate) async fn get_event(
        &self,
        id: nostr::EventId,
    ) -> Result<Option<nostr::Event>, sqlx::Error> {
        let filters = vec![nostr::Filter {
            ids: Some({
                let mut s = std::collections::HashSet::new();
                s.insert(id);
                s
            }),
            ..Default::default()
        }];

        let mut chan = self.search(filters);
        let Some(result) = chan.recv().await else {
            return Ok(None);
        };

        Ok(Some(result?))
    }

    /// Search for events matching the given filters.
    /// Returns a receiver channel onto which the results will be delivered.
    pub(crate) fn search(
        &self,
        filters: Vec<nostr::Filter>,
    ) -> Receiver<Result<nostr::Event, sqlx::Error>> {
        let (sender, receiver) = tokio::sync::mpsc::channel(10);

        let db = self.clone();
        tokio::spawn(async move { db._search(filters, sender).await });
        receiver
    }

    async fn _search(
        &self,
        filters: Vec<nostr::Filter>,
        sender: Sender<Result<nostr::Event, sqlx::Error>>,
    ) {
        let mut query = sqlx::QueryBuilder::new("SELECT json FROM event WHERE true");
        filter_to_sql(&mut query, filters);

        let mut stream = query.build_query_as().fetch(self.pool.as_ref());
        while let Some(row) = stream.next().await {
            let row: JsonRow = match row {
                Err(err) => {
                    let _ = sender.send(Err(err)).await;
                    return;
                }
                Ok(row) => row,
            };
            let event = match nostr::Event::from_json(row.json) {
                Ok(event) => event,
                Err(err) => {
                    let res = Err(sqlx::Error::ColumnDecode {
                        index: "event.json".into(),
                        source: err.into(),
                    });
                    let _ = sender.send(res).await;
                    return;
                }
            };
            let res = sender.send(Ok(event)).await;
            if res.is_err() {
                return;
            }
        }
    }

    /// Count the events matching some filters.
    pub async fn count(&self, filters: Vec<nostr::Filter>) -> DbResult<u64> {
        let mut query = QueryBuilder::new("SELECT COUNT(*) FROM event WHERE true");
        filter_to_sql(&mut query, filters);
        let (count,): (i64,) = query.build_query_as().fetch_one(self.pool.as_ref()).await?;

        Ok(count as u64)
    }

    pub(crate) async fn user_allowed(&self, pubkey: &PublicKey) -> DbResult<bool> {
        let row: (bool,) = sqlx::query_as(indoc! {"
            SELECT EXISTS (
                SELECT pubkey from allowed_users where pubkey = ?
            )"})
            .bind(pubkey.to_string())
            .fetch_one(self.pool.as_ref())
            .await?;

        Ok(row.0)
    }

    /// True iff this event is referred to by one on the server:
    pub(crate) async fn referred_event(&self, id: &nostr::EventId) -> DbResult<bool> {
        let row: HasRefRow = sqlx::query_as(indoc! {"
            SELECT EXISTS (
                SELECT name from tag where name = 'e' AND value = ?
            ) AS has_ref
        "})
            .bind(id.to_string())
            .fetch_one(self.pool.as_ref())
            .await?;

        Ok(row.has_ref)
    }

    /// True iff this pubkey is referred to by someone on this server.
    /// Includes if "someone" is by an event that uses this pubkey.
    pub(crate) async fn referred_pubkey(
        &self,
        pubkey: &nostr::PublicKey,
    ) -> Result<bool, sqlx::Error> {
        let row: HasRefRow = sqlx::query_as(indoc! {"
            SELECT EXISTS (
                SELECT name from tag where name = 'p' AND value = ?
            ) OR EXISTS (
                SELECT 1 from event where unhex(pubkey) = ?
            ) AS has_ref
        "})
            .bind(pubkey.to_string())
            .bind(pubkey.to_bytes().to_vec())
            .fetch_one(self.pool.as_ref())
            .await?;

        Ok(row.has_ref)
    }
}

/// Shared logic for selecting events or counts of events.
fn filter_to_sql(query: &mut sqlx::QueryBuilder<'_, Sqlite>, filters: Vec<nostr::types::Filter>,) {
    if let Some(filter) = filters.first() {
        let nostr::Filter {
            authors,
            generic_tags: _, // TODO
            ids,
            kinds,
            limit,
            search: _,
            since,
            until,
        } = filter;
        if let Some(authors) = authors {
            if !authors.is_empty() {
                query.push(" AND ");
                query.is_in("unhex(pubkey)", authors.iter().map(|it| it.to_bytes().to_vec()));
            }
        }
        if let Some(until) = until {
            // Note: NIP-1 docs this as inclusive.
            // ... At least, once this gets merged: https://github.com/nostr-protocol/nips/pull/1284
            query.push(" AND created_at <= ");
            query.push_bind(until.as_i64());
        }
        if let Some(since) = since {
            query.push(" AND created_at >= ");
            query.push_bind(since.as_i64());
        }

        let mut has_ids = false;
        let mut has_kinds = false;

        if let Some(ids) = ids {
            if !ids.is_empty() {
                has_ids = true;
                query.push(" AND ");
                query.is_in("unhex(id)", ids.into_iter().map(|id| id.as_bytes().to_vec()));
            }
        }

        if let Some(kinds) = kinds {
            if !kinds.is_empty() {
                has_kinds = true;
                query.push(" AND ");
                query.is_in("kind", kinds.iter().map(|it| it.as_u64() as i64));
            }
        }

        if !(has_kinds || has_ids) {
            // Don't show Kind 1064 (file contents) unless explicitly requested:
            query.push(" AND kind <> 1064");
        }

        // Since we always have a limit (below), we should make sure to strictly order by created_at so that
        // clients can resume a query if they want.
        query.push(" ORDER BY created_at DESC");

        let limit = limit.unwrap_or(100) as i64;
        query.push(" LIMIT ");
        query.push_bind(limit);
    }
}

#[derive(sqlx::FromRow, Debug)]
struct JsonRow {
    json: String,
}

#[derive(FromRow)]
struct HasRefRow {
    has_ref: bool,
}