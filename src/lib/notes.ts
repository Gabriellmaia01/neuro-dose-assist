import { noteService } from "@/services/firebase/noteService";
import { springNoteService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";

const activeService = () => (isSpringApiEnabled() ? springNoteService : noteService);

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
  return activeService().saveNote(note, userId);
}

export function getPatientNotes(userId: string, patientId: string): Promise<PatientNote[]> {
  return activeService().getPatientNotes(userId, patientId);
}

export function getAllNotes(userId: string): Promise<PatientNote[]> {
  return activeService().getAllNotes(userId);
}

export function deleteNote(noteId: string, userId: string): Promise<void> {
  return activeService().deleteNote(noteId, userId);
}
