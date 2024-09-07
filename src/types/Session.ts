export interface Session {
    id: number;
    title: string;
    latest_run: string;  // Using ISO string format for date-time
    session_count: number;
}
