// noteModel.ts
export interface Note {
    id: number;
    title: string;
    content: string;
    createdAt: string;  // or Date if you plan to convert it in your code
    updatedAt: string;
}
