import { ref, push, set, get, remove, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { logActivity } from "@/lib/activityLog";
import type { Patient } from "@/lib/patients";
import type { IPatientService } from "../contracts/domain.types";
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

export class FirebasePatientService implements IPatientService {
  async savePatient(
    patient: Patient,
    userId: string,
    userInfo?: UserAuditInfo
  ): Promise<string> {
    try {
      if (patient.id) {
        const patientRef = ref(realtimeDb, `users/${userId}/patients/${patient.id}`);
        const updateData = removeUndefinedFields({
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          condition: patient.condition,
          clinicalHistory: patient.clinicalHistory,
          allergies: patient.allergies,
          activeMedicationIds: patient.activeMedicationIds,
          currentMedications: patient.currentMedications,
          updatedAt: new Date().toISOString(),
        });

        await update(patientRef, updateData);

        await logActivity({
          action: "update",
          entityType: "patient",
          entityId: patient.id,
          entityName: patient.name,
          userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });

        return patient.id;
      } else {
        const patientsRef = ref(realtimeDb, `users/${userId}/patients`);
        const newPatientRef = push(patientsRef);

        const patientData = removeUndefinedFields({
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          condition: patient.condition,
          clinicalHistory: patient.clinicalHistory,
          allergies: patient.allergies,
          activeMedicationIds: patient.activeMedicationIds,
          currentMedications: patient.currentMedications,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: userId,
        });

        await set(newPatientRef, patientData);
        const newId = newPatientRef.key || "";

        await logActivity({
          action: "create",
          entityType: "patient",
          entityId: newId,
          entityName: patient.name,
          userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });

        return newId;
      }
    } catch (error: any) {
      console.error("Erro ao salvar paciente:", error);
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

  async updatePatient(
    patientId: string,
    patient: Partial<Patient>,
    userId: string
  ): Promise<void> {
    try {
      const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
      const { id: _ignoredId, ...patientFields } = patient;
      const updateData = removeUndefinedFields({
        ...patientFields,
        updatedAt: new Date().toISOString(),
      });
      await update(patientRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
      throw error;
    }
  }

  async getPatients(userId: string): Promise<Patient[]> {
    try {
      const patientsRef = ref(realtimeDb, `users/${userId}/patients`);
      const snapshot = await get(patientsRef);

      if (snapshot.exists()) {
        const patientsData = snapshot.val();
        const patients = Object.keys(patientsData).map((key) => {
          const { photoURL: _legacyPhoto, ...rest } = patientsData[key] || {};
          return { id: key, ...rest } as Patient;
        });
        return patients;
      }

      return [];
    } catch (error: any) {
      console.warn("Erro ao buscar pacientes:", error);
      return [];
    }
  }

  async getPatientById(
    patientId: string,
    userId: string
  ): Promise<Patient | null> {
    try {
      const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        const { photoURL: _legacyPhoto, ...rest } = snapshot.val() || {};
        return { id: patientId, ...rest } as Patient;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      throw error;
    }
  }

  async deletePatient(
    patientId: string,
    userId: string,
    patientName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    try {
      const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
      await remove(patientRef);

      await logActivity({
        action: "delete",
        entityType: "patient",
        entityId: patientId,
        entityName: patientName || "Paciente",
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
      throw error;
    }
  }
}

export const patientService = new FirebasePatientService();
