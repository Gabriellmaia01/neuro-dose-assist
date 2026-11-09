import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  UserSettings,
  UserProfile,
  NotificationSettings,
  AISettings,
} from "@/lib/firestore";
import type { IUserSettingsService } from "../contracts/domain.types";

export class FirebaseUserSettingsService implements IUserSettingsService {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data() as UserSettings;
      }
      return null;
    } catch (error: any) {
      const errorCode = error?.code || "";
      if (errorCode.includes("permission") || errorCode.includes("PERMISSION")) {
        console.warn("Firestore não configurado ou sem permissões. Usando valores padrão.");
        return null;
      }
      console.error("Erro ao carregar configurações:", error);
      throw error;
    }
  }

  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          ...settings,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userDocRef, {
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          profile,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userDocRef, {
          profile,
          notifications: {
            email: true,
            push: true,
            alerts: true,
            recommendations: true,
            reports: false,
          },
          ai: {
            autoAnalysis: true,
            riskAlerts: true,
            recommendations: true,
            confidence: "high",
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  }

  async updateNotificationSettings(
    userId: string,
    notifications: NotificationSettings
  ): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          notifications,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userDocRef, {
          profile: {},
          notifications,
          ai: {
            autoAnalysis: true,
            riskAlerts: true,
            recommendations: true,
            confidence: "high",
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error);
      throw error;
    }
  }

  async updateAISettings(userId: string, ai: AISettings): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          ai,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userDocRef, {
          profile: {},
          notifications: {
            email: true,
            push: true,
            alerts: true,
            recommendations: true,
            reports: false,
          },
          ai,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar configurações de IA:", error);
      throw error;
    }
  }
}

export const userSettingsService = new FirebaseUserSettingsService();
