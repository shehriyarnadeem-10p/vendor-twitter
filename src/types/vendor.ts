import { NoteFormatted } from "./Note";

export interface Vendor {
    name: string,
    noteId: string,
    Note: NoteFormatted[],
    created: number,
    updated: number,
}