export interface Note {
    id: number;
    title: string;
    text: string;
    language: string;
    labels: string;
    favorite: boolean;
    gist_sync: boolean;
    date: string;
}

export interface EditorSettings {
    editor_font: string;
    editor_font_size: number;
    editor_theme: string;
    vim_mode: boolean;
}