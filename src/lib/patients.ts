import { patientService } from "@/services/firebase/patientService";
import { springPatientService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";
import type { UserAuditInfo } from "@/services/contracts/common.types";

const activeService = () => (isSpringApiEnabled() ? springPatientService : patientService);

export interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: "Masculino" | "Feminino" | "Outro";
  condition: string;
  clinicalHistory?: string;
  allergies?: string;
  activeMedicationIds?: string[];
  currentMedications?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function savePatient(
  patient: Patient,
  userId: string,
  userInfo?: UserAuditInfo
): Promise<string> {
  return activeService().savePatient(patient, userId, userInfo);
}

export function updatePatient(
  patientId: string,
  patient: Partial<Patient>,
  userId: string
): Promise<void> {
  return activeService().updatePatient(patientId, patient, userId);
}

export function getPatients(userId: string): Promise<Patient[]> {
  return activeService().getPatients(userId);
}

export function getPatientById(
  patientId: string,
  userId: string
): Promise<Patient | null> {
  return activeService().getPatientById(patientId, userId);
}

export function deletePatient(
  patientId: string,
  userId: string,
  patientName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return activeService().deletePatient(patientId, userId, patientName, userInfo);
}
