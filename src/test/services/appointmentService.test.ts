import { beforeEach, describe, expect, it, vi } from "vitest";
import { FirebaseAppointmentService } from "@/services/firebase/appointmentService";
import * as firestore from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("@/lib/activityLog", () => ({ logActivity: vi.fn().mockResolvedValue("log-1") }));

const consulta = {
  patientId: "patient-1",
  patientName: "Paciente",
  date: "2026-11-10",
  time: "09:00",
  duration: 30,
  type: "Consulta" as const,
  status: "Agendada" as const,
  notes: "",
};

const snapshot = (items: Array<{ id: string; data: Record<string, unknown> }>) => ({
  empty: items.length === 0,
  forEach: (callback: (doc: { id: string; data: () => Record<string, unknown> }) => void) =>
    items.forEach((item) => callback({ id: item.id, data: () => item.data })),
});

describe("FirebaseAppointmentService", () => {
  let service: FirebaseAppointmentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseAppointmentService();
    vi.mocked(firestore.collection).mockReturnValue("appointments-ref" as never);
    vi.mocked(firestore.doc).mockReturnValue("appointment-ref" as never);
    vi.mocked(firestore.query).mockReturnValue("query-ref" as never);
    vi.mocked(firestore.addDoc).mockResolvedValue({ id: "appointment-new" } as never);
    vi.mocked(firestore.updateDoc).mockResolvedValue();
    vi.mocked(firestore.deleteDoc).mockResolvedValue();
  });

  it("cria e atualiza consultas registrando as atividades", async () => {
    await expect(service.saveAppointment(consulta, "user-1")).resolves.toBe("appointment-new");
    expect(firestore.addDoc).toHaveBeenCalledWith(
      "appointments-ref",
      expect.objectContaining({ patientName: "Paciente", createdBy: "user-1", notes: null })
    );

    await expect(
      service.saveAppointment({ ...consulta, id: "appointment-1", notes: "Retorno" }, "user-1", {
        name: "Profissional",
      })
    ).resolves.toBe("appointment-1");
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      "appointment-ref",
      expect.objectContaining({ notes: "Retorno" })
    );
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
  });

  it("ordena consultas por data e horário e trata resultado vazio ou erro", async () => {
    vi.mocked(firestore.getDocs)
      .mockResolvedValueOnce(
        snapshot([
          { id: "later", data: { ...consulta, date: "2026-11-11", time: "08:00" } },
          { id: "earlier-time", data: { ...consulta, date: "2026-11-10", time: "11:00" } },
          { id: "earlier", data: { ...consulta, date: "2026-11-10", time: "08:00" } },
        ]) as never
      )
      .mockResolvedValueOnce(snapshot([]) as never)
      .mockRejectedValueOnce(new Error("offline"));

    await expect(service.getAppointments("user-1")).resolves.toMatchObject([
      { id: "earlier" },
      { id: "earlier-time" },
      { id: "later" },
    ]);
    await expect(service.getAppointments("user-1")).resolves.toEqual([]);
    await expect(service.getAppointments("user-1")).resolves.toEqual([]);
  });

  it("retorna consultas por data, paciente e consultas futuras não canceladas", async () => {
    const records = [
      { id: "confirmed", data: { ...consulta, status: "Confirmada" } },
      { id: "cancelled", data: { ...consulta, status: "Cancelada" } },
      { id: "done", data: { ...consulta, status: "Concluída" } },
    ];
    vi.mocked(firestore.getDocs)
      .mockResolvedValueOnce(snapshot([records[0]]) as never)
      .mockResolvedValueOnce(snapshot([records[0]]) as never)
      .mockResolvedValueOnce(snapshot(records) as never)
      .mockRejectedValueOnce(new Error("offline"))
      .mockRejectedValueOnce(new Error("offline"));

    await expect(service.getAppointmentsByDate("user-1", consulta.date)).resolves.toMatchObject([
      { id: "confirmed" },
    ]);
    await expect(service.getPatientAppointments("user-1", "patient-1")).resolves.toMatchObject([
      { id: "confirmed" },
    ]);
    await expect(service.getUpcomingAppointments("user-1")).resolves.toMatchObject([
      { id: "confirmed" },
    ]);
    await expect(service.getAppointmentsByDate("user-1", consulta.date)).resolves.toEqual([]);
    await expect(service.getPatientAppointments("user-1", "patient-1")).resolves.toEqual([]);
  });

  it("atualiza status, exclui consulta e propaga erros de escrita", async () => {
    await expect(
      service.updateAppointmentStatus("appointment-1", "Confirmada", "user-1")
    ).resolves.toBeUndefined();
    await expect(
      service.deleteAppointment("appointment-1", "user-1", undefined, { email: "u@example.com" })
    ).resolves.toBeUndefined();

    vi.mocked(firestore.updateDoc).mockRejectedValueOnce(new Error("offline"));
    await expect(
      service.updateAppointmentStatus("appointment-1", "Cancelada", "user-1")
    ).rejects.toThrow("offline");
    vi.mocked(firestore.deleteDoc).mockRejectedValueOnce(new Error("offline"));
    await expect(service.deleteAppointment("appointment-1", "user-1")).rejects.toThrow("offline");
    vi.mocked(firestore.addDoc).mockRejectedValueOnce(new Error("offline"));
    await expect(service.saveAppointment(consulta, "user-1")).rejects.toThrow("offline");
  });
});
