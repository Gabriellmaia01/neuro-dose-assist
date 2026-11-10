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

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
          currentMedications: patient.currentMedications,
          updatedAt: new Date().toISOString(),
        });

        if (patient.photoURL) {
          updateData.photoURL = patient.photoURL;
        }

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
          currentMedications: patient.currentMedications,
          photoURL: patient.photoURL,
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

  async uploadPatientPhoto(
    file: File,
    _userId: string,
    patientId: string
  ): Promise<string> {
    try {
      const base64Image = await compressImage(file);
      const storageKey = `p_img_${patientId}`;
      try {
        localStorage.setItem(storageKey, base64Image);
      } catch (e) {
        console.error("Storage cheio ou erro:", e);
        throw new Error("Limite de armazenamento local excedido. Tente uma imagem menor.");
      }
      return "local_cache";
    } catch (error) {
      console.error("Erro ao salvar foto localmente:", error);
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
      const updateData = {
        ...patient,
        updatedAt: new Date().toISOString(),
      };
      await set(patientRef, updateData);
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
          const p = { id: key, ...patientsData[key] };
          if (p.photoURL === "local_cache") {
            const cachedImg = localStorage.getItem(`p_img_${key}`);
            p.photoURL = cachedImg || null;
          }
          return p;
        }) as Patient[];
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
        const p = { id: patientId, ...snapshot.val() } as Patient;
        if (p.photoURL === "local_cache") {
          const cachedImg = localStorage.getItem(`p_img_${patientId}`);
          if (cachedImg) p.photoURL = cachedImg;
        }
        return p;
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
      localStorage.removeItem(`p_img_${patientId}`);

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
