import { ref, push, set, get, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { logActivity } from "@/lib/activityLog";
import type { Medication } from "@/lib/medications";
import type { IMedicationService } from "../contracts/domain.types";
import type { UserAuditInfo } from "../contracts/common.types";

function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned as Partial<T>;
}

export class FirebaseMedicationService implements IMedicationService {
  async saveMedication(
    medication: Medication,
    userId: string,
    userInfo?: UserAuditInfo
  ): Promise<string> {
    try {
      if (medication.id) {
        const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medication.id}`);
        const updateData = removeUndefinedFields({
          name: medication.name,
          brandName: medication.brandName,
          activeIngredient: medication.activeIngredient,
          therapeuticClass: medication.therapeuticClass,
          form: medication.form,
          minDose: medication.minDose,
          maxDose: medication.maxDose,
          unit: medication.unit,
          updatedAt: new Date().toISOString(),
        });
        await set(medicationRef, updateData);

        await logActivity({
          action: "update",
          entityType: "medication",
          entityId: medication.id,
          entityName: medication.name,
          userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });

        return medication.id;
      } else {
        const medicationsRef = ref(realtimeDb, `users/${userId}/medications`);
        const newMedicationRef = push(medicationsRef);

        const medicationData = removeUndefinedFields({
          name: medication.name,
          brandName: medication.brandName,
          activeIngredient: medication.activeIngredient,
          therapeuticClass: medication.therapeuticClass,
          form: medication.form,
          minDose: medication.minDose,
          maxDose: medication.maxDose,
          unit: medication.unit,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
        });

        await set(newMedicationRef, medicationData);
        const newId = newMedicationRef.key || "";

        await logActivity({
          action: "create",
          entityType: "medication",
          entityId: newId,
          entityName: medication.name,
          userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });

        return newId;
      }
    } catch (error: any) {
      console.error("Erro ao salvar medicamento:", error);
      const errorCode = error?.code || "";
      const errorMessage = error?.message || "";

      if (errorCode.includes("permission") || errorMessage.includes("permission")) {
        throw new Error("Permissão negada. Verifique as regras do Realtime Database no Firebase Console.");
      }

      if (errorCode.includes("database") || errorMessage.includes("database")) {
        throw new Error("Realtime Database não está configurado. Configure no Firebase Console.");
      }

      throw error;
    }
  }

  async getMedications(userId: string): Promise<Medication[]> {
    try {
      const medicationsRef = ref(realtimeDb, `users/${userId}/medications`);
      const snapshot = await get(medicationsRef);

      if (snapshot.exists()) {
        const medicationsData = snapshot.val();
        return Object.keys(medicationsData).map((key) => ({
          id: key,
          ...medicationsData[key],
        })) as Medication[];
      }

      return [];
    } catch (error: any) {
      const errorCode = error?.code || "";
      const errorMessage = error?.message || "";

      if (
        errorCode.includes("permission") ||
        errorCode.includes("PERMISSION") ||
        errorMessage.includes("permission") ||
        errorCode.includes("database") ||
        errorMessage.includes("database")
      ) {
        console.warn("Realtime Database não configurado ou sem permissões. Retornando lista vazia.");
        return [];
      }

      console.error("Erro ao buscar medicamentos:", error);
      throw error;
    }
  }

  async getMedicationById(
    medicationId: string,
    userId: string
  ): Promise<Medication | null> {
    try {
      const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medicationId}`);
      const snapshot = await get(medicationRef);

      if (snapshot.exists()) {
        return {
          id: medicationId,
          ...snapshot.val(),
        } as Medication;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar medicamento:", error);
      throw error;
    }
  }

  async updateMedication(
    medicationId: string,
    medication: Partial<Medication>,
    userId: string
  ): Promise<void> {
    try {
      const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medicationId}`);
      const updateData = removeUndefinedFields({
        ...medication,
        updatedAt: new Date().toISOString(),
      });
      await set(medicationRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error);
      throw error;
    }
  }

  async deleteMedication(
    medicationId: string,
    userId: string,
    medicationName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    try {
      const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medicationId}`);
      await remove(medicationRef);

      await logActivity({
        action: "delete",
        entityType: "medication",
        entityId: medicationId,
        entityName: medicationName || "Medicamento",
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
      throw error;
    }
  }
}

export const medicationService = new FirebaseMedicationService();
