import { ref, push, set, get, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { logActivity } from "@/lib/activityLog";
import type { DoseRecord } from "@/lib/doses";
import type { IDoseService } from "../contracts/domain.types";
import type { UserAuditInfo } from "../contracts/common.types";

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

  async getDoses(userId: string): Promise<DoseRecord[]> {
    try {
      const dosesRef = ref(realtimeDb, `users/${userId}/doses`);
      const snapshot = await get(dosesRef);

      if (snapshot.exists()) {
        const dosesData = snapshot.val();
        return Object.values(dosesData).sort((a: any, b: any) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }) as DoseRecord[];
      }
      return [];
    } catch (error) {
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
