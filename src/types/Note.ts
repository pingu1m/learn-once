export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    language: string;
    created_at: string;  // Using ISO string format for date-time
    updated_at: string;  // Using ISO string format for date-time
}

