import { userSettingsService } from "@/services/firebase/userSettingsService";
import { springUserSettingsService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";

const activeService = () => (isSpringApiEnabled() ? springUserSettingsService : userSettingsService);

export interface UserProfile {
  fullName?: string;
  email?: string;
  specialty?: string;
  crm?: string;
  phone?: string;
  language?: string;
  photoURL?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  alerts: boolean;
  recommendations: boolean;
  reports: boolean;
}

export interface AISettings {
  autoAnalysis: boolean;
  riskAlerts: boolean;
  recommendations: boolean;
  confidence: "low" | "medium" | "high";
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  ai: AISettings;
  updatedAt?: unknown;
}

export function getUserSettings(userId: string): Promise<UserSettings | null> {
  return activeService().getUserSettings(userId);
}

export function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  return activeService().saveUserSettings(userId, settings);
}

export function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  return activeService().updateUserProfile(userId, profile);
}

export function updateNotificationSettings(
  userId: string,
  notifications: NotificationSettings
): Promise<void> {
  return activeService().updateNotificationSettings(userId, notifications);
}

export function updateAISettings(
  userId: string,
  ai: AISettings
): Promise<void> {
  return activeService().updateAISettings(userId, ai);
}
