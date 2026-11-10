import { appointmentService } from "@/services/firebase/appointmentService";
import type { UserAuditInfo } from "@/services/contracts/common.types";

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
  return appointmentService.saveAppointment(appointment, userId, userInfo);
}

export function getAppointments(userId: string): Promise<Appointment[]> {
  return appointmentService.getAppointments(userId);
}

export function getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]> {
  return appointmentService.getAppointmentsByDate(userId, date);
}

export function getPatientAppointments(userId: string, patientId: string): Promise<Appointment[]> {
  return appointmentService.getPatientAppointments(userId, patientId);
}

export function getUpcomingAppointments(userId: string): Promise<Appointment[]> {
  return appointmentService.getUpcomingAppointments(userId);
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  userId: string
): Promise<void> {
  return appointmentService.updateAppointmentStatus(appointmentId, status, userId);
}

export function deleteAppointment(
  appointmentId: string,
  userId: string,
  appointmentName?: string,
  userInfo?: UserAuditInfo
): Promise<void> {
  return appointmentService.deleteAppointment(appointmentId, userId, appointmentName, userInfo);
}
