import { springRequest, SpringApiError } from "./httpClient";
import { sendInviteEmail, generateInviteLink } from "@/lib/email";
import type { Patient } from "@/lib/patients";
import type { Medication } from "@/lib/medications";
import type { DoseRecord } from "@/lib/doses";
import type { Appointment, AppointmentStatus } from "@/lib/appointments";
import type { PatientNote } from "@/lib/notes";
import type {
  Clinic,
  ClinicInvite,
  ClinicMember,
  ClinicMembership,
  MemberRole,
} from "@/lib/clinics";
import type {
  ActivityAction,
  ActivityLog,
  EntityType,
  LogActivityParams,
} from "@/lib/activityLog";
import type {
  AISettings,
  NotificationSettings,
  UserProfile,
  UserSettings,
} from "@/lib/firestore";
import type { UserAuditInfo } from "../contracts/common.types";
import type {
  DoseQueryOptions,
  IActivityLogService,
  IAppointmentService,
  IClinicService,
  IDoseService,
  IMedicationService,
  INoteService,
  IPatientService,
  IUserSettingsService,
} from "../contracts/domain.types";

export class SpringPatientService implements IPatientService {
  async getPatients(userId: string): Promise<Patient[]> {
    try {
      return (await springRequest<Patient[]>(`/workspaces/${encodeURIComponent(userId)}/patients`)) ?? [];
    } catch (error) {
      console.warn("Erro ao buscar pacientes na API Spring:", error);
      return [];
    }
  }

  async getPatientById(patientId: string, userId: string): Promise<Patient | null> {
    try {
      return await springRequest<Patient>(
        `/workspaces/${encodeURIComponent(userId)}/patients/${encodeURIComponent(patientId)}`
      );
    } catch (error) {
      if (error instanceof SpringApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async savePatient(patient: Patient, userId: string, userInfo?: UserAuditInfo): Promise<string> {
    const payload = {
      ...patient,
      auditUserName: userInfo?.name,
      auditUserEmail: userInfo?.email,
    };

    if (patient.id) {
      const res = await springRequest<{ id: string }>(
        `/workspaces/${encodeURIComponent(userId)}/patients/${encodeURIComponent(patient.id)}`,
        { method: "PUT", body: payload }
      );
      return res.id;
    }

    const res = await springRequest<{ id: string }>(
      `/workspaces/${encodeURIComponent(userId)}/patients`,
      { method: "POST", body: payload }
    );
    return res.id;
  }

  async updatePatient(patientId: string, patient: Partial<Patient>, userId: string): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/patients/${encodeURIComponent(patientId)}`,
      { method: "PATCH", body: patient }
    );
  }

  async deletePatient(
    patientId: string,
    userId: string,
    patientName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/patients/${encodeURIComponent(patientId)}`,
      {
        method: "DELETE",
        query: {
          patientName,
          auditUserName: userInfo?.name,
          auditUserEmail: userInfo?.email,
        },
      }
    );
  }
}

export class SpringMedicationService implements IMedicationService {
  async getMedications(userId: string): Promise<Medication[]> {
    return (await springRequest<Medication[]>(`/workspaces/${encodeURIComponent(userId)}/medications`)) ?? [];
  }

  async getMedicationById(medicationId: string, userId: string): Promise<Medication | null> {
    try {
      return await springRequest<Medication>(
        `/workspaces/${encodeURIComponent(userId)}/medications/${encodeURIComponent(medicationId)}`
      );
    } catch (error) {
      if (error instanceof SpringApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async saveMedication(medication: Medication, userId: string, userInfo?: UserAuditInfo): Promise<string> {
    const payload = {
      ...medication,
      auditUserName: userInfo?.name,
      auditUserEmail: userInfo?.email,
    };

    if (medication.id) {
      const res = await springRequest<{ id: string }>(
        `/workspaces/${encodeURIComponent(userId)}/medications/${encodeURIComponent(medication.id)}`,
        { method: "PUT", body: payload }
      );
      return res.id;
    }

    const res = await springRequest<{ id: string }>(
      `/workspaces/${encodeURIComponent(userId)}/medications`,
      { method: "POST", body: payload }
    );
    return res.id;
  }

  async updateMedication(medicationId: string, medication: Partial<Medication>, userId: string): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/medications/${encodeURIComponent(medicationId)}`,
      { method: "PATCH", body: medication }
    );
  }

  async deleteMedication(
    medicationId: string,
    userId: string,
    medicationName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/medications/${encodeURIComponent(medicationId)}`,
      {
        method: "DELETE",
        query: {
          medicationName,
          auditUserName: userInfo?.name,
          auditUserEmail: userInfo?.email,
        },
      }
    );
  }
}

export class SpringDoseService implements IDoseService {
  async getDoses(userId: string, options?: DoseQueryOptions): Promise<DoseRecord[]> {
    return (
      (await springRequest<DoseRecord[]>(`/workspaces/${encodeURIComponent(userId)}/doses`, {
        query: {
          patientId: options?.patientId,
          limit: options?.limit,
        },
      })) ?? []
    );
  }

  async saveDose(
    dose: DoseRecord,
    userId: string,
    doseInfo?: { patientName?: string; medicationName?: string },
    userInfo?: UserAuditInfo
  ): Promise<string> {
    const res = await springRequest<{ id: string }>(
      `/workspaces/${encodeURIComponent(userId)}/doses`,
      {
        method: "POST",
        body: {
          ...dose,
          patientName: doseInfo?.patientName,
          medicationName: doseInfo?.medicationName,
          auditUserName: userInfo?.name,
          auditUserEmail: userInfo?.email,
        },
      }
    );
    return res.id;
  }

  async deleteDose(
    doseId: string,
    userId: string,
    doseName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/doses/${encodeURIComponent(doseId)}`,
      {
        method: "DELETE",
        query: {
          doseName,
          auditUserName: userInfo?.name,
          auditUserEmail: userInfo?.email,
        },
      }
    );
  }
}

export class SpringAppointmentService implements IAppointmentService {
  async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      return (await springRequest<Appointment[]>(`/workspaces/${encodeURIComponent(userId)}/appointments`)) ?? [];
    } catch (error) {
      console.error("Erro ao buscar consultas na API Spring:", error);
      return [];
    }
  }

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    try {
      return (
        (await springRequest<Appointment[]>(`/workspaces/${encodeURIComponent(userId)}/appointments`, {
          query: { upcoming: true },
        })) ?? []
      );
    } catch (error) {
      console.error("Erro ao buscar próximas consultas na API Spring:", error);
      return [];
    }
  }

  async getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]> {
    try {
      return (
        (await springRequest<Appointment[]>(`/workspaces/${encodeURIComponent(userId)}/appointments`, {
          query: { date },
        })) ?? []
      );
    } catch (error) {
      console.error("Erro ao buscar consultas por data na API Spring:", error);
      return [];
    }
  }

  async getPatientAppointments(userId: string, patientId: string): Promise<Appointment[]> {
    try {
      return (
        (await springRequest<Appointment[]>(`/workspaces/${encodeURIComponent(userId)}/appointments`, {
          query: { patientId },
        })) ?? []
      );
    } catch (error) {
      console.error("Erro ao buscar consultas do paciente na API Spring:", error);
      return [];
    }
  }

  async saveAppointment(
    appointment: Appointment,
    userId: string,
    userInfo?: UserAuditInfo
  ): Promise<string> {
    const payload = {
      ...appointment,
      auditUserName: userInfo?.name,
      auditUserEmail: userInfo?.email,
    };

    if (appointment.id) {
      const res = await springRequest<{ id: string }>(
        `/workspaces/${encodeURIComponent(userId)}/appointments/${encodeURIComponent(appointment.id)}`,
        { method: "PUT", body: payload }
      );
      return res.id;
    }

    const res = await springRequest<{ id: string }>(
      `/workspaces/${encodeURIComponent(userId)}/appointments`,
      { method: "POST", body: payload }
    );
    return res.id;
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    userId: string
  ): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/appointments/${encodeURIComponent(appointmentId)}/status`,
      { method: "PATCH", body: { status } }
    );
  }

  async deleteAppointment(
    appointmentId: string,
    userId: string,
    appointmentName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/appointments/${encodeURIComponent(appointmentId)}`,
      {
        method: "DELETE",
        query: {
          appointmentName,
          auditUserName: userInfo?.name,
          auditUserEmail: userInfo?.email,
        },
      }
    );
  }
}

export class SpringNoteService implements INoteService {
  async getAllNotes(userId: string): Promise<PatientNote[]> {
    try {
      return (await springRequest<PatientNote[]>(`/workspaces/${encodeURIComponent(userId)}/notes`)) ?? [];
    } catch (error) {
      console.error("Erro ao buscar notas na API Spring:", error);
      return [];
    }
  }

  async getPatientNotes(userId: string, patientId: string): Promise<PatientNote[]> {
    try {
      return (
        (await springRequest<PatientNote[]>(`/workspaces/${encodeURIComponent(userId)}/notes`, {
          query: { patientId },
        })) ?? []
      );
    } catch (error) {
      console.error("Erro ao buscar notas do paciente na API Spring:", error);
      return [];
    }
  }

  async saveNote(note: PatientNote, userId: string): Promise<string> {
    if (note.id) {
      const res = await springRequest<{ id: string }>(
        `/workspaces/${encodeURIComponent(userId)}/notes/${encodeURIComponent(note.id)}`,
        { method: "PUT", body: note }
      );
      return res.id;
    }
    const res = await springRequest<{ id: string }>(
      `/workspaces/${encodeURIComponent(userId)}/notes`,
      { method: "POST", body: note }
    );
    return res.id;
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    await springRequest<void>(
      `/workspaces/${encodeURIComponent(userId)}/notes/${encodeURIComponent(noteId)}`,
      { method: "DELETE" }
    );
  }
}

export class SpringClinicService implements IClinicService {
  async createClinic(name: string, _ownerId: string, ownerEmail: string): Promise<string> {
    const res = await springRequest<{ id: string }>("/clinics", {
      method: "POST",
      body: { name, ownerEmail },
    });
    return res.id;
  }

  async getUserClinic(userId: string): Promise<Clinic | null> {
    try {
      return await springRequest<Clinic | null>(`/users/${encodeURIComponent(userId)}/clinic`);
    } catch (error) {
      console.error("Erro ao carregar clínica na API Spring:", error);
      return null;
    }
  }

  async getClinicMembership(userId: string): Promise<ClinicMembership | null> {
    try {
      return await springRequest<ClinicMembership | null>(
        `/users/${encodeURIComponent(userId)}/clinic-membership`
      );
    } catch (error) {
      console.error("Erro ao carregar vínculo de clínica na API Spring:", error);
      return null;
    }
  }

  async getEffectiveUserId(userId: string): Promise<string> {
    try {
      const res = await springRequest<{ effectiveUserId: string }>(
        `/users/${encodeURIComponent(userId)}/effective-workspace`
      );
      return res?.effectiveUserId || userId;
    } catch (error) {
      console.error("Erro ao resolver workspace efetivo na API Spring:", error);
      return userId;
    }
  }

  async updateClinic(clinicId: string, data: Partial<Clinic>): Promise<void> {
    await springRequest<void>(`/clinics/${encodeURIComponent(clinicId)}`, {
      method: "PATCH",
      body: data,
    });
  }

  async getClinicMembers(clinicOwnerId: string): Promise<ClinicMember[]> {
    try {
      return (await springRequest<ClinicMember[]>(`/clinics/${encodeURIComponent(clinicOwnerId)}/members`)) ?? [];
    } catch (error) {
      console.error("Erro ao listar membros da clínica na API Spring:", error);
      return [];
    }
  }

  async addClinicMember(
    clinicOwnerId: string,
    memberEmail: string,
    memberName: string,
    role: MemberRole
  ): Promise<void> {
    await springRequest<void>(`/clinics/${encodeURIComponent(clinicOwnerId)}/members`, {
      method: "POST",
      body: { email: memberEmail, name: memberName, role },
    });
  }

  async removeClinicMember(clinicOwnerId: string, memberUid: string): Promise<void> {
    await springRequest<void>(
      `/clinics/${encodeURIComponent(clinicOwnerId)}/members/${encodeURIComponent(memberUid)}`,
      { method: "DELETE" }
    );
  }

  async sendClinicInvite(
    clinicId: string,
    clinicName: string,
    email: string,
    role: MemberRole,
    _invitedBy: string,
    invitedByName?: string
  ): Promise<{ inviteId: string; emailSent: boolean }> {
    const res = await springRequest<{ inviteId: string }>(
      `/clinics/${encodeURIComponent(clinicId)}/invites`,
      {
        method: "POST",
        body: { clinicName, email: email.toLowerCase(), role, invitedByName },
      }
    );

    const inviteLink = generateInviteLink(res.inviteId, clinicId);
    const emailSent = await sendInviteEmail({
      toEmail: email.toLowerCase(),
      clinicName,
      senderName: invitedByName || "Um usuário",
      role,
      inviteLink,
    });

    return { inviteId: res.inviteId, emailSent };
  }

  async getInviteById(clinicId: string, inviteId: string): Promise<ClinicInvite | null> {
    try {
      return await springRequest<ClinicInvite>(
        `/clinics/${encodeURIComponent(clinicId)}/invites/${encodeURIComponent(inviteId)}`,
        { skipAuth: true }
      );
    } catch (error) {
      if (error instanceof SpringApiError && error.status === 404) {
        return null;
      }
      return null;
    }
  }

  async getPendingInvitesFromClinic(clinicId: string, email: string): Promise<ClinicInvite[]> {
    try {
      return (
        (await springRequest<ClinicInvite[]>(`/clinics/${encodeURIComponent(clinicId)}/invites`, {
          query: { email: email.toLowerCase() },
        })) ?? []
      );
    } catch (error) {
      return [];
    }
  }

  async getClinicPendingInvites(clinicId: string): Promise<ClinicInvite[]> {
    try {
      return (
        (await springRequest<ClinicInvite[]>(`/clinics/${encodeURIComponent(clinicId)}/invites`)) ?? []
      );
    } catch (error) {
      return [];
    }
  }

  async getMyPendingInvites(): Promise<ClinicInvite[]> {
    try {
      return (await springRequest<ClinicInvite[]>("/invites/pending")) ?? [];
    } catch (error) {
      return [];
    }
  }

  async acceptClinicInvite(
    inviteId: string,
    clinicId: string,
    _userId: string,
    userEmail: string,
    userName?: string
  ): Promise<void> {
    await springRequest<void>(
      `/clinics/${encodeURIComponent(clinicId)}/invites/${encodeURIComponent(inviteId)}/accept`,
      {
        method: "POST",
        body: { userEmail, userName },
      }
    );
  }
}

export class SpringActivityLogService implements IActivityLogService {
  async logActivity(params: LogActivityParams): Promise<string | null> {
    try {
      const res = await springRequest<{ id: string }>(
        `/workspaces/${encodeURIComponent(params.userId)}/activity-logs`,
        {
          method: "POST",
          body: params,
        }
      );
      return res?.id ?? null;
    } catch (error) {
      console.error("[ActivityLog] Erro ao registrar atividade na API Spring:", error);
      return null;
    }
  }

  async getActivityLogs(userId: string, limit = 100): Promise<ActivityLog[]> {
    try {
      return (
        (await springRequest<ActivityLog[]>(
          `/workspaces/${encodeURIComponent(userId)}/activity-logs`,
          { query: { limit } }
        )) ?? []
      );
    } catch (error) {
      return [];
    }
  }

  async getActivityLogsByEntity(
    userId: string,
    entityType: EntityType,
    limit = 50
  ): Promise<ActivityLog[]> {
    try {
      return (
        (await springRequest<ActivityLog[]>(
          `/workspaces/${encodeURIComponent(userId)}/activity-logs`,
          { query: { entityType, limit } }
        )) ?? []
      );
    } catch (error) {
      return [];
    }
  }

  async getActivityLogsByAction(
    userId: string,
    action: ActivityAction,
    limit = 50
  ): Promise<ActivityLog[]> {
    try {
      return (
        (await springRequest<ActivityLog[]>(
          `/workspaces/${encodeURIComponent(userId)}/activity-logs`,
          { query: { action, limit } }
        )) ?? []
      );
    } catch (error) {
      return [];
    }
  }
}

export class SpringUserSettingsService implements IUserSettingsService {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return springRequest<UserSettings | null>(`/users/${encodeURIComponent(userId)}/settings`);
  }

  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    await springRequest<void>(`/users/${encodeURIComponent(userId)}/settings`, {
      method: "PUT",
      body: settings,
    });
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    await springRequest<void>(`/users/${encodeURIComponent(userId)}/settings/profile`, {
      method: "PATCH",
      body: profile,
    });
  }

  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    await springRequest<void>(`/users/${encodeURIComponent(userId)}/settings/notifications`, {
      method: "PATCH",
      body: settings,
    });
  }

  async updateAISettings(userId: string, settings: Partial<AISettings>): Promise<void> {
    await springRequest<void>(`/users/${encodeURIComponent(userId)}/settings/ai`, {
      method: "PATCH",
      body: settings,
    });
  }
}

export const springPatientService = new SpringPatientService();
export const springMedicationService = new SpringMedicationService();
export const springDoseService = new SpringDoseService();
export const springAppointmentService = new SpringAppointmentService();
export const springNoteService = new SpringNoteService();
export const springClinicService = new SpringClinicService();
export const springActivityLogService = new SpringActivityLogService();
export const springUserSettingsService = new SpringUserSettingsService();
