export interface Note {
    id: string;
    title: string;
    text: string;
    date: string;
    favorite: boolean;
    labels: string;
    language: string;
    created_at: string;  // Using ISO string format for date-time
    updated_at: string;  // Using ISO string format for date-time
}

