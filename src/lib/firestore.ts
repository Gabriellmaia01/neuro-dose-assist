import { userSettingsService } from "@/services/firebase/userSettingsService";

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
  return userSettingsService.getUserSettings(userId);
}

export function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  return userSettingsService.saveUserSettings(userId, settings);
}

export function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  return userSettingsService.updateUserProfile(userId, profile);
}

export function updateNotificationSettings(
  userId: string,
  notifications: NotificationSettings
): Promise<void> {
  return userSettingsService.updateNotificationSettings(userId, notifications);
}

export function updateAISettings(
  userId: string,
  ai: AISettings
): Promise<void> {
  return userSettingsService.updateAISettings(userId, ai);
}
