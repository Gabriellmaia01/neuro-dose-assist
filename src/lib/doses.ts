import { doseService } from "@/services/firebase/doseService";
import { springDoseService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";
import type { AnalysisResult, SubjectiveState } from "@/services/aiService";
import type { UserAuditInfo } from "@/services/contracts/common.types";
import type { DoseQueryOptions } from "@/services/contracts/domain.types";

const activeService = () => (isSpringApiEnabled() ? springDoseService : doseService);

export type { DoseQueryOptions };

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
  return activeService().saveDose(dose, userId, doseInfo, userInfo);
}

export function getDoses(
  userId: string,
  options?: DoseQueryOptions
): Promise<DoseRecord[]> {
  return activeService().getDoses(userId, options);
}

export function deleteDose(
  doseId: string,
  userId: string,
  doseName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return activeService().deleteDose(doseId, userId, doseName, userInfo);
}
