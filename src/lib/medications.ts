import { medicationService } from "@/services/firebase/medicationService";
import type { UserAuditInfo } from "@/services/contracts/common.types";

export interface Medication {
  id?: string;
  name: string;
  brandName: string;
  activeIngredient: string;
  therapeuticClass: string;
  form: string;
  minDose: number;
  maxDose: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function saveMedication(
  medication: Medication,
  userId: string,
  userInfo?: UserAuditInfo
): Promise<string> {
  return medicationService.saveMedication(medication, userId, userInfo);
}

export function getMedications(userId: string): Promise<Medication[]> {
  return medicationService.getMedications(userId);
}

export function getMedicationById(
  medicationId: string,
  userId: string
): Promise<Medication | null> {
  return medicationService.getMedicationById(medicationId, userId);
}

export function updateMedication(
  medicationId: string,
  medication: Partial<Medication>,
  userId: string
): Promise<void> {
  return medicationService.updateMedication(medicationId, medication, userId);
}

export function deleteMedication(
  medicationId: string,
  userId: string,
  medicationName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return medicationService.deleteMedication(medicationId, userId, medicationName, userInfo);
}
