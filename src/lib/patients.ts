import { patientService } from "@/services/firebase/patientService";
import type { UserAuditInfo } from "@/services/contracts/common.types";

export interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: "Masculino" | "Feminino" | "Outro";
  condition: string;
  clinicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function savePatient(
  patient: Patient,
  userId: string,
  userInfo?: UserAuditInfo
): Promise<string> {
  return patientService.savePatient(patient, userId, userInfo);
}

export function uploadPatientPhoto(
  file: File,
  userId: string,
  patientId: string
): Promise<string> {
  return patientService.uploadPatientPhoto(file, userId, patientId);
}

export function updatePatient(
  patientId: string,
  patient: Partial<Patient>,
  userId: string
): Promise<void> {
  return patientService.updatePatient(patientId, patient, userId);
}

export function getPatients(userId: string): Promise<Patient[]> {
  return patientService.getPatients(userId);
}

export function getPatientById(
  patientId: string,
  userId: string
): Promise<Patient | null> {
  return patientService.getPatientById(patientId, userId);
}

export function deletePatient(
  patientId: string,
  userId: string,
  patientName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return patientService.deletePatient(patientId, userId, patientName, userInfo);
}
