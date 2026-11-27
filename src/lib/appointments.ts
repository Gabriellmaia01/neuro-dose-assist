import { appointmentService } from "@/services/firebase/appointmentService";
import { springAppointmentService } from "@/services/spring/domainServices";
import { isSpringApiEnabled } from "@/services/provider";
import type { UserAuditInfo } from "@/services/contracts/common.types";

const activeService = () => (isSpringApiEnabled() ? springAppointmentService : appointmentService);

export type AppointmentType = "Consulta" | "Retorno" | "Exame" | "Outro";
export type AppointmentStatus = "Agendada" | "Confirmada" | "Concluída" | "Cancelada";

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function saveAppointment(
  appointment: Appointment,
  userId: string,
  userInfo?: UserAuditInfo
): Promise<string> {
  return activeService().saveAppointment(appointment, userId, userInfo);
}

export function getAppointments(userId: string): Promise<Appointment[]> {
  return activeService().getAppointments(userId);
}

export function getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]> {
  return activeService().getAppointmentsByDate(userId, date);
}

export function getPatientAppointments(userId: string, patientId: string): Promise<Appointment[]> {
  return activeService().getPatientAppointments(userId, patientId);
}

export function getUpcomingAppointments(userId: string): Promise<Appointment[]> {
  return activeService().getUpcomingAppointments(userId);
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  userId: string
): Promise<void> {
  return activeService().updateAppointmentStatus(appointmentId, status, userId);
}

export function deleteAppointment(
  appointmentId: string,
  userId: string,
  appointmentName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return activeService().deleteAppointment(appointmentId, userId, appointmentName, userInfo);
}
