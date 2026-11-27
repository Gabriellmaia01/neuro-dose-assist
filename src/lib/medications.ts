import { medicationService } from "@/services/firebase/medicationService";
import { springMedicationService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";
import type { UserAuditInfo } from "@/services/contracts/common.types";

const activeService = () => (isSpringApiEnabled() ? springMedicationService : medicationService);

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
  halfLifeHours?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function saveMedication(
  medication: Medication,
  userId: string,
  userInfo?: UserAuditInfo
): Promise<string> {
  return activeService().saveMedication(medication, userId, userInfo);
}

export function getMedications(userId: string): Promise<Medication[]> {
  return activeService().getMedications(userId);
}

export function getMedicationById(
  medicationId: string,
  userId: string
): Promise<Medication | null> {
  return activeService().getMedicationById(medicationId, userId);
}

export function updateMedication(
  medicationId: string,
  medication: Partial<Medication>,
  userId: string
): Promise<void> {
  return activeService().updateMedication(medicationId, medication, userId);
}

export function deleteMedication(
  medicationId: string,
  userId: string,
  medicationName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return activeService().deleteMedication(medicationId, userId, medicationName, userInfo);
}
