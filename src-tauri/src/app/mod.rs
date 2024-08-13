pub mod actions;
pub mod domain;
pub mod core;

use surrealdb::{Surreal, engine::local::File};
use tauri::{State, Manager};

use std::{string::String, collections::HashMap, sync::Arc};
use serde::{Serialize, Deserialize};
use serde_json::{Value};
use std::string::ToString;
use crate::app::core::action_handler::ActionDispatcher;
use crate::app::core::surreal_repository::SurrealRepository;
use crate::app::domain::classifier_service::ClassifierService;

#[derive(Deserialize, Serialize)]
pub struct IpcMessage {
    pub domain: String,
    pub action: Value
}

pub struct ApplicationContext {
    pub action_dispatchers: HashMap<String, Arc<dyn ActionDispatcher + Sync + Send>>
}

impl ApplicationContext {
    pub async fn new() -> Self {
        let surreal_db = Surreal::new::<File>("../testdata/surreal/learn_once.db").await.unwrap();
        surreal_db.use_ns("learn_once_namespace").use_db("learn_once_database").await.unwrap();

        let repository = Box::new(SurrealRepository::new(Box::new(surreal_db), "classifiers"));
        let service = Arc::new(ClassifierService::new(repository));

        let mut action_dispatchers = HashMap::new();
        action_dispatchers.insert(actions::classifier_action::CLASSIFIER_DOMAIN.to_string(), service.clone());
        action_dispatchers.insert(actions::application_action::APPLICATION_DOMAIN.to_string(), service.clone());

        Self { action_dispatchers }
    }
}

// async stateful commands must return Result
// https://github.com/tauri-apps/tauri/discussions/4317
#[tauri::command]
pub async fn ipc_message(message: IpcMessage,
                     context: State<'_, ApplicationContext>) -> Result<IpcMessage, ()> {
    let dispatcher = context.action_dispatchers.get(&message.domain).unwrap();
    let response = dispatcher.dispatch_action(message.domain.to_string(),message.action).await;
    Ok(IpcMessage {
        domain: message.domain,
        action: response
    })
}
