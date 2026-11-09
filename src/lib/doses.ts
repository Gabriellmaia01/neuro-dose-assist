import { doseService } from "@/services/firebase/doseService";
import type { AnalysisResult, SubjectiveState } from "@/services/aiService";
import type { UserAuditInfo } from "@/services/contracts/common.types";

export interface DoseRecord {
  id?: string;
  patientId: string;
  medicationId: string;
  doseAmount: string;
  time: string;
  indication: string;
  subjectiveState: SubjectiveState;
  analysis: AnalysisResult;
  timestamp: string;
  createdAt: string;
}

export function saveDose(
  dose: DoseRecord,
  userId: string,
  doseInfo?: { patientName?: string; medicationName?: string },
  userInfo?: UserAuditInfo
): Promise<string> {
  return doseService.saveDose(dose, userId, doseInfo, userInfo);
}

export function getDoses(userId: string): Promise<DoseRecord[]> {
  return doseService.getDoses(userId);
}

export function deleteDose(
  doseId: string,
  userId: string,
  doseName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return doseService.deleteDose(doseId, userId, doseName, userInfo);
}
