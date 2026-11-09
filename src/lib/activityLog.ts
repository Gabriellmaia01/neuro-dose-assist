import { activityLogService } from "@/services/firebase/activityLogService";

export type ActivityAction = 'create' | 'update' | 'delete';
export type EntityType = 'patient' | 'medication' | 'appointment' | 'dose' | 'invite' | 'clinic_member';

export interface ActivityLog {
  id?: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
}

export function logActivity(params: LogActivityParams): Promise<string | null> {
  return activityLogService.logActivity(params);
}

export function getActivityLogs(userId: string, limit: number = 100): Promise<ActivityLog[]> {
  return activityLogService.getActivityLogs(userId, limit);
}

export function getActivityLogsByEntity(
  userId: string,
  entityType: EntityType,
  limit: number = 50
): Promise<ActivityLog[]> {
  return activityLogService.getActivityLogsByEntity(userId, entityType, limit);
}

export function getActivityLogsByAction(
  userId: string,
  action: ActivityAction,
  limit: number = 50
): Promise<ActivityLog[]> {
  return activityLogService.getActivityLogsByAction(userId, action, limit);
}
