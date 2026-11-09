import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logActivity } from "@/lib/activityLog";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "@/lib/appointments";
import type { IAppointmentService } from "../contracts/domain.types";
import type { UserAuditInfo } from "../contracts/common.types";

export class FirebaseAppointmentService implements IAppointmentService {
  async saveAppointment(
    appointment: Appointment,
    userId: string,
    userInfo?: UserAuditInfo
  ): Promise<string> {
    try {
      const appointmentsRef = collection(db, "users", userId, "appointments");

      if (appointment.id) {
        const appointmentDoc = doc(db, "users", userId, "appointments", appointment.id);
        await updateDoc(appointmentDoc, {
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes || null,
          updatedAt: new Date().toISOString(),
        });

        await logActivity({
          action: "update",
          entityType: "appointment",
          entityId: appointment.id,
          entityName: `${appointment.type} - ${appointment.patientName}`,
          userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });

        return appointment.id;
      } else {
        const docRef = await addDoc(appointmentsRef, {
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes || null,
          createdAt: new Date().toISOString(),
          createdBy: userId,
        });

        await logActivity({
          action: "create",
          entityType: "appointment",
          entityId: docRef.id,
          entityName: `${appointment.type} - ${appointment.patientName}`,
          userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
        });

        return docRef.id;
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      throw error;
    }
  }

  async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(db, "users", userId, "appointments");
      const q = query(appointmentsRef, orderBy("date", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }

      const appointments: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        appointments.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Appointment);
      });

      appointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
        return dateTimeA - dateTimeB;
      });

      return appointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  }

  async getAppointmentsByDate(userId: string, date: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(db, "users", userId, "appointments");
      const q = query(appointmentsRef, where("date", "==", date), orderBy("time", "asc"));
      const snapshot = await getDocs(q);

      const appointments: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        appointments.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Appointment);
      });

      return appointments;
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      return [];
    }
  }

  async getPatientAppointments(userId: string, patientId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(db, "users", userId, "appointments");
      const q = query(appointmentsRef, where("patientId", "==", patientId), orderBy("date", "asc"));
      const snapshot = await getDocs(q);

      const appointments: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        appointments.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Appointment);
      });

      return appointments;
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      return [];
    }
  }

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const appointmentsRef = collection(db, "users", userId, "appointments");
      const q = query(
        appointmentsRef,
        where("date", ">=", today),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);

      const appointments: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Appointment;
        if (data.status !== "Cancelada" && data.status !== "Concluída") {
          appointments.push({
            id: docSnap.id,
            ...data,
          });
        }
      });

      return appointments;
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      return [];
    }
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    userId: string
  ): Promise<void> {
    try {
      const appointmentDoc = doc(db, "users", userId, "appointments", appointmentId);
      await updateDoc(appointmentDoc, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  }

  async deleteAppointment(
    appointmentId: string,
    userId: string,
    appointmentName?: string,
    userInfo?: UserAuditInfo
  ): Promise<void> {
    try {
      const appointmentDoc = doc(db, "users", userId, "appointments", appointmentId);
      await deleteDoc(appointmentDoc);

      await logActivity({
        action: "delete",
        entityType: "appointment",
        entityId: appointmentId,
        entityName: appointmentName || "Consulta",
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }
}

export const appointmentService = new FirebaseAppointmentService();
