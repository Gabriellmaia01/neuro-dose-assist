import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  setSpringTokenResolver,
  SpringApiError,
  springAppointmentService,
  springClinicService,
  springDoseService,
  springMedicationService,
  springNoteService,
  springPatientService,
  springUserSettingsService,
} from "@/services/spring";

describe("Serviços Spring Boot REST (paridade de contratos)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    setSpringTokenResolver(async () => "firebase-jwt-token-123");
  });

  afterEach(() => {
    setSpringTokenResolver(null);
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("anexa Authorization Bearer com o Firebase ID Token e cria paciente", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ id: "pat-uuid-1" }),
    });

    const id = await springPatientService.savePatient(
      {
        name: "Lucas Silva",
        age: 24,
        gender: "Masculino",
        condition: "TDAH",
      },
      "workspace-owner-1",
      { name: "Dra. Ana", email: "ana@neurodose.com" }
    );

    expect(id).toBe("pat-uuid-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/workspaces/workspace-owner-1/patients");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer firebase-jwt-token-123");
    expect(JSON.parse(init.body)).toMatchObject({
      name: "Lucas Silva",
      auditUserName: "Dra. Ana",
    });
  });

  it("envia filtros de consulta em doses, próximas consultas e retorna null em 404 de medicamento", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([]),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ code: "not-found", message: "Não encontrado" }),
      });

    await springDoseService.getDoses("ws-1", { patientId: "p-1", limit: 10 });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/workspaces/ws-1/doses?patientId=p-1&limit=10");

    await springAppointmentService.getUpcomingAppointments("ws-1");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/workspaces/ws-1/appointments?upcoming=true");

    const med = await springMedicationService.getMedicationById("inexistente", "ws-1");
    expect(med).toBeNull();
  });

  it("propaga SpringApiError com status e code em falhas e trata 204 em settings/notas/clínica", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ effectiveUserId: "clinic-owner-9" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () =>
          JSON.stringify({
            code: "permission-denied",
            message: "Sem permissão para acessar este workspace clínico",
          }),
      });

    await springUserSettingsService.updateUserProfile("u-1", { fullName: "Dr. João" });
    const effective = await springClinicService.getEffectiveUserId("u-1");
    expect(effective).toBe("clinic-owner-9");

    await springNoteService.deleteNote("note-1", "clinic-owner-9");

    await expect(
      springMedicationService.saveMedication(
        {
          name: "Ritalina",
          brandName: "Novartis",
          activeIngredient: "Metilfenidato",
          therapeuticClass: "Estimulante",
          form: "Comprimido",
          minDose: 5,
          maxDose: 20,
          unit: "mg",
        },
        "outro-workspace"
      )
    ).rejects.toBeInstanceOf(SpringApiError);
  });
});
