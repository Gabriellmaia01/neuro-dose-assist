import { ref, push, set, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import type {
  ActivityLog,
  LogActivityParams,
  EntityType,
  ActivityAction,
} from "@/lib/activityLog";
import type { IActivityLogService } from "../contracts/domain.types";

function generateDescription(action: ActivityAction, entityType: EntityType, entityName: string): string {
  const entityLabels: Record<EntityType, string> = {
    patient: "paciente",
    medication: "medicamento",
    appointment: "consulta",
    dose: "dose",
    invite: "convite",
    clinic_member: "membro da clínica",
  };

  const actionLabels: Record<ActivityAction, string> = {
    create: "cadastrou",
    update: "atualizou",
    delete: "removeu",
  };

  const entity = entityLabels[entityType] || entityType;
  const actionLabel = actionLabels[action] || action;

  return `${actionLabel} ${entity}: ${entityName}`;
}

export class FirebaseActivityLogService implements IActivityLogService {
  async logActivity(params: LogActivityParams): Promise<string | null> {
    const { action, entityType, entityId, entityName, userId, userName, userEmail, metadata } = params;

    try {
      const logsRef = ref(realtimeDb, `users/${userId}/activityLogs`);
      const newLogRef = push(logsRef);

      const logData: Omit<ActivityLog, "id"> = {
        action,
        entityType,
        entityId,
        entityName,
        description: generateDescription(action, entityType, entityName),
        userId,
        userName: userName || "Usuário",
        userEmail: userEmail || "",
        timestamp: new Date().toISOString(),
        ...(metadata && { metadata }),
      };

      await set(newLogRef, logData);
      console.log(`[ActivityLog] ${logData.description}`);
      return newLogRef.key;
    } catch (error) {
      console.error("[ActivityLog] Erro ao registrar atividade:", error);
      return null;
    }
  }

  async getActivityLogs(userId: string, limit: number = 100): Promise<ActivityLog[]> {
    try {
      const logsRef = ref(realtimeDb, `users/${userId}/activityLogs`);
      const snapshot = await get(logsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const logsData = snapshot.val();
      const logs: ActivityLog[] = Object.keys(logsData).map((key) => ({
        id: key,
        ...logsData[key],
      }));

      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return logs.slice(0, limit);
    } catch (error: any) {
      if (error?.code === "PERMISSION_DENIED" || error?.message?.includes("Permission denied")) {
        console.warn("[ActivityLog] Sem permissão para ler logs. Configure as regras do Firebase Realtime Database.");
      } else {
        console.error("[ActivityLog] Erro ao buscar logs:", error);
      }
      return [];
    }
  }

  async getActivityLogsByEntity(
    userId: string,
    entityType: EntityType,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const allLogs = await this.getActivityLogs(userId, 500);
    return allLogs.filter((log) => log.entityType === entityType).slice(0, limit);
  }

  async getActivityLogsByAction(
    userId: string,
    action: ActivityAction,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const allLogs = await this.getActivityLogs(userId, 500);
    return allLogs.filter((log) => log.action === action).slice(0, limit);
  }
}

export const activityLogService = new FirebaseActivityLogService();
