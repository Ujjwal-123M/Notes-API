import { Note } from '../notes/note.entity';

export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export function toNoteResponse(note: Note, includePinned = false): NoteResponse {
  const response: NoteResponse = {
    id: note.id,
    title: note.title,
    content: note.content,
    created_at: note.createdAt.toISOString(),
    updated_at: note.updatedAt.toISOString(),
  };

  if (includePinned) {
    response.pinned = note.pinned;
  }

  return response;
}
