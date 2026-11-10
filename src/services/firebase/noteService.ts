import { ref, push, set, get, remove, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import type { PatientNote } from "@/lib/notes";
import type { INoteService } from "../contracts/domain.types";

function removeUndefinedFields(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export class FirebaseNoteService implements INoteService {
  async saveNote(note: PatientNote, userId: string): Promise<string> {
    try {
      if (note.id) {
        const noteRef = ref(realtimeDb, `users/${userId}/notes/${note.id}`);
        const updateData = removeUndefinedFields({
          title: note.title,
          content: note.content,
          category: note.category,
          updatedAt: new Date().toISOString(),
        });
        await update(noteRef, updateData);
        return note.id;
      } else {
        const notesRef = ref(realtimeDb, `users/${userId}/notes`);
        const newNoteRef = push(notesRef);
        const noteData = removeUndefinedFields({
          patientId: note.patientId,
          title: note.title,
          content: note.content,
          category: note.category,
          createdAt: new Date().toISOString(),
          createdBy: userId,
        });
        await set(newNoteRef, noteData);
        return newNoteRef.key!;
      }
    } catch (error) {
      console.error("Error saving note:", error);
      throw error;
    }
  }

  async getPatientNotes(userId: string, patientId: string): Promise<PatientNote[]> {
    try {
      const notesRef = ref(realtimeDb, `users/${userId}/notes`);
      const snapshot = await get(notesRef);

      if (!snapshot.exists()) {
        return [];
      }

      const notesData = snapshot.val();
      const notes: PatientNote[] = [];

      for (const key of Object.keys(notesData)) {
        if (notesData[key].patientId === patientId) {
          notes.push({
            id: key,
            ...notesData[key],
          });
        }
      }

      notes.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return notes;
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
  }

  async getAllNotes(userId: string): Promise<PatientNote[]> {
    try {
      const notesRef = ref(realtimeDb, `users/${userId}/notes`);
      const snapshot = await get(notesRef);

      if (!snapshot.exists()) {
        return [];
      }

      const notesData = snapshot.val();
      const notes: PatientNote[] = [];

      for (const key of Object.keys(notesData)) {
        notes.push({
          id: key,
          ...notesData[key],
        });
      }

      notes.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return notes;
    } catch (error) {
      console.error("Error fetching all notes:", error);
      return [];
    }
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    try {
      const noteRef = ref(realtimeDb, `users/${userId}/notes/${noteId}`);
      await remove(noteRef);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }
}

export const noteService = new FirebaseNoteService();
