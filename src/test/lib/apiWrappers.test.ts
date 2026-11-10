import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteAppointment,
  getAppointments,
  getAppointmentsByDate,
  getPatientAppointments,
  getUpcomingAppointments,
  saveAppointment,
  updateAppointmentStatus,
} from "@/lib/appointments";
import {
  getActivityLogs,
  getActivityLogsByAction,
  getActivityLogsByEntity,
  logActivity,
} from "@/lib/activityLog";
import {
  deleteDose,
  getDoses,
  saveDose,
} from "@/lib/doses";
import {
  getAllNotes,
  getPatientNotes,
  saveNote,
  deleteNote,
} from "@/lib/notes";
import {
  deleteMedication,
  getMedicationById,
  getMedications,
  saveMedication,
  updateMedication,
} from "@/lib/medications";
import {
  deletePatient,
  getPatientById,
  getPatients,
  savePatient,
  updatePatient,
  uploadPatientPhoto,
} from "@/lib/patients";
import {
  getUserSettings,
  saveUserSettings,
  updateAISettings,
  updateNotificationSettings,
  updateUserProfile,
} from "@/lib/firestore";

const serviceMocks = vi.hoisted(() => ({
  appointments: {
    saveAppointment: vi.fn(),
    getAppointments: vi.fn(),
    getAppointmentsByDate: vi.fn(),
    getPatientAppointments: vi.fn(),
    getUpcomingAppointments: vi.fn(),
    updateAppointmentStatus: vi.fn(),
    deleteAppointment: vi.fn(),
  },
  activityLog: {
    logActivity: vi.fn(),
    getActivityLogs: vi.fn(),
    getActivityLogsByEntity: vi.fn(),
    getActivityLogsByAction: vi.fn(),
  },
  doses: { saveDose: vi.fn(), getDoses: vi.fn(), deleteDose: vi.fn() },
  notes: {
    saveNote: vi.fn(),
    getPatientNotes: vi.fn(),
    getAllNotes: vi.fn(),
    deleteNote: vi.fn(),
  },
  medications: {
    saveMedication: vi.fn(),
    getMedications: vi.fn(),
    getMedicationById: vi.fn(),
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
  },
  patients: {
    savePatient: vi.fn(),
    uploadPatientPhoto: vi.fn(),
    updatePatient: vi.fn(),
    getPatients: vi.fn(),
    getPatientById: vi.fn(),
    deletePatient: vi.fn(),
  },
  userSettings: {
    getUserSettings: vi.fn(),
    saveUserSettings: vi.fn(),
    updateUserProfile: vi.fn(),
    updateNotificationSettings: vi.fn(),
    updateAISettings: vi.fn(),
  },
}));

vi.mock("@/services/firebase/appointmentService", () => ({
  appointmentService: serviceMocks.appointments,
}));
vi.mock("@/services/firebase/activityLogService", () => ({
  activityLogService: serviceMocks.activityLog,
}));
vi.mock("@/services/firebase/doseService", () => ({ doseService: serviceMocks.doses }));
vi.mock("@/services/firebase/noteService", () => ({ noteService: serviceMocks.notes }));
vi.mock("@/services/firebase/medicationService", () => ({
  medicationService: serviceMocks.medications,
}));
vi.mock("@/services/firebase/patientService", () => ({
  patientService: serviceMocks.patients,
}));
vi.mock("@/services/firebase/userSettingsService", () => ({
  userSettingsService: serviceMocks.userSettings,
}));

describe("API wrappers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("encaminha cada operação para o serviço Firebase correspondente", async () => {
    const user = { name: "Profissional", email: "u@example.com" };
    const appointment = {
      patientId: "patient-1",
      patientName: "Paciente",
      date: "2026-11-10",
      time: "09:00",
      duration: 30,
      type: "Consulta" as const,
      status: "Agendada" as const,
    };
    const dose = {
      patientId: "patient-1",
      medicationId: "med-1",
      doseAmount: "10 mg",
      time: "09:00",
      indication: "Tratamento",
      subjectiveState: {} as never,
      analysis: {} as never,
      timestamp: "2026-11-10T09:00:00Z",
      createdAt: "2026-11-10T09:00:00Z",
    };
    const medication = {
      name: "Medicamento",
      brandName: "Marca",
      activeIngredient: "Princípio ativo",
      therapeuticClass: "Classe",
      form: "Comprimido",
      minDose: 1,
      maxDose: 2,
      unit: "mg",
    };
    const patient = { name: "Paciente", age: 30, gender: "Outro" as const, condition: "Condição" };
    const settings = { profile: { fullName: "Profissional" } };
    const notifications = {
      email: true,
      push: true,
      alerts: true,
      recommendations: true,
      reports: false,
    };
    const ai = {
      autoAnalysis: true,
      riskAlerts: true,
      recommendations: true,
      confidence: "high" as const,
    };
    const activity = {
      action: "create" as const,
      entityType: "appointment" as const,
      entityId: "item-1",
      entityName: "Consulta",
      userId: "user-1",
    };
    const photo = new File(["photo"], "photo.png");

    await saveAppointment(appointment, "user-1", user);
    await getAppointments("user-1");
    await getAppointmentsByDate("user-1", appointment.date);
    await getPatientAppointments("user-1", "patient-1");
    await getUpcomingAppointments("user-1");
    await updateAppointmentStatus("appointment-1", "Confirmada", "user-1");
    await deleteAppointment("appointment-1", "user-1", "Consulta", user);
    expect(serviceMocks.appointments.saveAppointment).toHaveBeenCalledWith(appointment, "user-1", user);
    expect(serviceMocks.appointments.getAppointmentsByDate).toHaveBeenCalledWith("user-1", appointment.date);
    expect(serviceMocks.appointments.deleteAppointment).toHaveBeenCalledWith("appointment-1", "user-1", "Consulta", user);

    await logActivity(activity);
    await getActivityLogs("user-1", 10);
    await getActivityLogsByEntity("user-1", "appointment", 5);
    await getActivityLogsByAction("user-1", "create", 3);
    expect(serviceMocks.activityLog.logActivity).toHaveBeenCalledWith(activity);
    expect(serviceMocks.activityLog.getActivityLogsByEntity).toHaveBeenCalledWith("user-1", "appointment", 5);

    await saveDose(dose, "user-1", { patientName: "Paciente" }, user);
    await getDoses("user-1");
    await deleteDose("dose-1", "user-1", "Dose", user);
    expect(serviceMocks.doses.saveDose).toHaveBeenCalledWith(dose, "user-1", { patientName: "Paciente" }, user);
    expect(serviceMocks.doses.deleteDose).toHaveBeenCalledWith("dose-1", "user-1", "Dose", user);

    const note = { patientId: "patient-1", title: "Evolução", content: "Texto", category: "Evolução" as const };
    await saveNote(note, "user-1");
    await getPatientNotes("user-1", "patient-1");
    await getAllNotes("user-1");
    await deleteNote("note-1", "user-1");
    expect(serviceMocks.notes.saveNote).toHaveBeenCalledWith(note, "user-1");
    expect(serviceMocks.notes.deleteNote).toHaveBeenCalledWith("note-1", "user-1");

    await saveMedication(medication, "user-1", user);
    await getMedications("user-1");
    await getMedicationById("med-1", "user-1");
    await updateMedication("med-1", { name: "Atualizado" }, "user-1");
    await deleteMedication("med-1", "user-1", "Medicamento", user);
    expect(serviceMocks.medications.saveMedication).toHaveBeenCalledWith(medication, "user-1", user);
    expect(serviceMocks.medications.updateMedication).toHaveBeenCalledWith("med-1", { name: "Atualizado" }, "user-1");

    await savePatient(patient, "user-1", user);
    await uploadPatientPhoto(photo, "user-1", "patient-1");
    await updatePatient("patient-1", { name: "Atualizado" }, "user-1");
    await getPatients("user-1");
    await getPatientById("patient-1", "user-1");
    await deletePatient("patient-1", "user-1", "Paciente", user);
    expect(serviceMocks.patients.uploadPatientPhoto).toHaveBeenCalledWith(photo, "user-1", "patient-1");
    expect(serviceMocks.patients.deletePatient).toHaveBeenCalledWith("patient-1", "user-1", "Paciente", user);

    await getUserSettings("user-1");
    await saveUserSettings("user-1", settings);
    await updateUserProfile("user-1", { fullName: "Profissional" });
    await updateNotificationSettings("user-1", notifications);
    await updateAISettings("user-1", ai);
    expect(serviceMocks.userSettings.saveUserSettings).toHaveBeenCalledWith("user-1", settings);
    expect(serviceMocks.userSettings.updateAISettings).toHaveBeenCalledWith("user-1", ai);
  });
});
