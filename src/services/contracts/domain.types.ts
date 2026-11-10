import type { Patient } from "@/lib/patients";
import type { Medication } from "@/lib/medications";
import type { DoseRecord } from "@/lib/doses";
import type { Appointment, AppointmentStatus } from "@/lib/appointments";
import type { PatientNote } from "@/lib/notes";
import type { Clinic, ClinicMember, ClinicInvite, ClinicMembership } from "@/lib/clinics";
import type { ActivityLog, LogActivityParams, EntityType, ActivityAction } from "@/lib/activityLog";
import type { UserSettings, UserProfile, NotificationSettings, AISettings } from "@/lib/firestore";
import type { UserAuditInfo } from "./common.types";

export interface IPatientService {
  getPatients(userId: string): Promise<Patient[]>;
  getPatientById(patientId: string, userId: string): Promise<Patient | null>;
  savePatient(patient: Patient, userId: string, userInfo?: UserAuditInfo): Promise<string>;
  updatePatient(patientId: string, patient: Partial<Patient>, userId: string): Promise<void>;
  deletePatient(patientId: string, userId: string, patientName?: string, userInfo?: UserAuditInfo): Promise<void>;
  uploadPatientPhoto(file: File, userId: string, patientId: string): Promise<string>;
}

export interface IMedicationService {
  getMedications(userId: string): Promise<Medication[]>;
  getMedicationById(medicationId: string, userId: string): Promise<Medication | null>;
  saveMedication(medication: Medication, userId: string, userInfo?: UserAuditInfo): Promise<string>;
  updateMedication(medicationId: string, medication: Partial<Medication>, userId: string): Promise<void>;
  deleteMedication(medicationId: string, userId: string, medicationName?: string, userInfo?: UserAuditInfo): Promise<void>;
}

export interface IDoseService {
  getDoses(userId: string): Promise<DoseRecord[]>;
  saveDose(
    dose: DoseRecord,
    userId: string,
    doseInfo?: { patientName?: string; medicationName?: string },
    userInfo?: UserAuditInfo
  ): Promise<string>;
  deleteDose(
    doseId: string,
    userId: string,
    doseName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void>;
}

export interface IAppointmentService {
  getAppointments(userId: string): Promise<Appointment[]>;
  getUpcomingAppointments(userId: string): Promise<Appointment[]>;
  getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]>;
  getPatientAppointments(userId: string, patientId: string): Promise<Appointment[]>;
  saveAppointment(appointment: Appointment, userId: string, userInfo?: UserAuditInfo): Promise<string>;
  updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, userId: string): Promise<void>;
  deleteAppointment(appointmentId: string, userId: string, appointmentName?: string, userInfo?: UserAuditInfo): Promise<void>;
}

export interface INoteService {
  getAllNotes(userId: string): Promise<PatientNote[]>;
  getPatientNotes(userId: string, patientId: string): Promise<PatientNote[]>;
  saveNote(note: PatientNote, userId: string): Promise<string>;
  deleteNote(noteId: string, userId: string): Promise<void>;
}

export interface IClinicService {
  getUserClinic(userId: string): Promise<Clinic | null>;
  createClinic(name: string, ownerId: string, ownerEmail: string): Promise<string>;
  updateClinic(clinicId: string, data: Partial<Clinic>): Promise<void>;
  getClinicMembers(clinicOwnerId: string): Promise<ClinicMember[]>;
  getClinicMembership(userId: string): Promise<ClinicMembership | null>;
  getEffectiveUserId(userId: string): Promise<string>;
  sendClinicInvite(
    clinicId: string,
    clinicName: string,
    email: string,
    role: MemberRole,
    invitedBy: string,
    invitedByName?: string
  ): Promise<{ inviteId: string; emailSent: boolean }>;
  getInviteById(clinicId: string, inviteId: string): Promise<ClinicInvite | null>;
  getPendingInvitesFromClinic(clinicId: string, email: string): Promise<ClinicInvite[]>;
  acceptClinicInvite(inviteId: string, clinicId: string, userId: string, userEmail: string, userName?: string): Promise<void>;
  addClinicMember(clinicOwnerId: string, memberEmail: string, memberName: string, role: MemberRole): Promise<void>;
  removeClinicMember(clinicOwnerId: string, memberUid: string): Promise<void>;
}

export interface IActivityLogService {
  logActivity(params: LogActivityParams): Promise<string | null>;
  getActivityLogs(userId: string, limit?: number): Promise<ActivityLog[]>;
  getActivityLogsByEntity(userId: string, entityType: EntityType, limit?: number): Promise<ActivityLog[]>;
  getActivityLogsByAction(userId: string, action: ActivityAction, limit?: number): Promise<ActivityLog[]>;
}

export interface IUserSettingsService {
  getUserSettings(userId: string): Promise<UserSettings | null>;
  saveUserSettings(userId: string, settings: UserSettings): Promise<void>;
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void>;
  updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<void>;
  updateAISettings(userId: string, settings: Partial<AISettings>): Promise<void>;
}

