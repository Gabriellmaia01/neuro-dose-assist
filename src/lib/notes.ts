import { noteService } from "@/services/firebase/noteService";

export interface PatientNote {
  id?: string;
  patientId: string;
  title: string;
  content: string;
  category: "Evolução" | "Anamnese" | "Exame" | "Prescrição" | "Outro";
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function saveNote(note: PatientNote, userId: string): Promise<string> {
  return noteService.saveNote(note, userId);
}

export function getPatientNotes(userId: string, patientId: string): Promise<PatientNote[]> {
  return noteService.getPatientNotes(userId, patientId);
}

export function getAllNotes(userId: string): Promise<PatientNote[]> {
  return noteService.getAllNotes(userId);
}

export function deleteNote(noteId: string, userId: string): Promise<void> {
  return noteService.deleteNote(noteId, userId);
}
