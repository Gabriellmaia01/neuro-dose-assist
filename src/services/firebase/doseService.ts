import {
  ref,
  push,
  set,
  get,
  remove,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { logActivity } from "@/lib/activityLog";
import type { DoseRecord } from "@/lib/doses";
import type { DoseQueryOptions, IDoseService } from "../contracts/domain.types";
import type { UserAuditInfo } from "../contracts/common.types";

function sortDosesDescending(dosesData: Record<string, DoseRecord>): DoseRecord[] {
  return Object.entries(dosesData)
    .map(([key, value]) => ({
      ...value,
      id: value.id || key,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function isMissingIndexError(error: unknown): boolean {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message || "")
      : String(error || "");
  return message.toLowerCase().includes("index not defined");
}

export class FirebaseDoseService implements IDoseService {
  async saveDose(
    dose: DoseRecord,
    userId: string,
    doseInfo?: { patientName?: string; medicationName?: string },
    userInfo?: UserAuditInfo
  ): Promise<string> {
    try {
      const dosesRef = ref(realtimeDb, `users/${userId}/doses`);
      const newDoseRef = push(dosesRef);

      const doseData = {
        ...dose,
        id: newDoseRef.key,
        createdAt: new Date().toISOString(),
      };

      await set(newDoseRef, doseData);
      const newId = newDoseRef.key || "";

      await logActivity({
        action: "create",
        entityType: "dose",
        entityId: newId,
        entityName: `${doseInfo?.medicationName || "Medicamento"} ${dose.doseAmount}mg - ${doseInfo?.patientName || "Paciente"}`,
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });

      return newId;
    } catch (error) {
      console.error("Erro ao salvar dose:", error);
      throw error;
    }
  }

  async getDoses(userId: string, options?: DoseQueryOptions): Promise<DoseRecord[]> {
    const dosesRef = ref(realtimeDb, `users/${userId}/doses`);
    const limit =
      typeof options?.limit === "number" && options.limit > 0
        ? Math.floor(options.limit)
        : undefined;
    const patientId = options?.patientId?.trim() || undefined;

    const buildQueryRef = () => {
      if (patientId) {
        return query(dosesRef, orderByChild("patientId"), equalTo(patientId));
      }
      if (limit) {
        return query(dosesRef, orderByChild("timestamp"), limitToLast(limit));
      }
      return dosesRef;
    };

    try {
      const snapshot = await get(buildQueryRef());

      if (!snapshot.exists()) {
        return [];
      }

      const sorted = sortDosesDescending(snapshot.val() as Record<string, DoseRecord>);
      return limit ? sorted.slice(0, limit) : sorted;
    } catch (error) {
      if ((patientId || limit) && isMissingIndexError(error)) {
        console.warn(
          '[Doses] Índice não definido no Firebase RTDB (configure ".indexOn": ["timestamp", "patientId"]). Aplicando fallback em memória.'
        );
        const fallbackSnapshot = await get(dosesRef);
        if (!fallbackSnapshot.exists()) {
          return [];
        }

        let sorted = sortDosesDescending(fallbackSnapshot.val() as Record<string, DoseRecord>);
        if (patientId) {
          sorted = sorted.filter((d) => d.patientId === patientId);
        }
        return limit ? sorted.slice(0, limit) : sorted;
      }

      console.error("Erro ao buscar doses:", error);
      throw error;
    }
  }

  async deleteDose(
    doseId: string,
    userId: string,
    doseName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    try {
      const doseRef = ref(realtimeDb, `users/${userId}/doses/${doseId}`);
      await remove(doseRef);

      await logActivity({
        action: "delete",
        entityType: "dose",
        entityId: doseId,
        entityName: doseName || "Dose",
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });
    } catch (error) {
      console.error("Erro ao deletar dose:", error);
      throw error;
    }
  }
}

export const doseService = new FirebaseDoseService();
