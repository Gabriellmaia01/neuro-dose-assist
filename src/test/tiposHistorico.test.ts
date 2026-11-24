import { describe, expect, it } from "vitest";
import {
  configuracaoAcao,
  configuracaoEntidade,
  configuracaoTipoRegistro,
  formatadorDataHoraCurto,
  formatadorDataHoraLongo,
  formatadorHoraCurto,
  inferirTipoRegistro,
  type ItemHistorico,
} from "@/lib/tiposHistorico";

const itemBase: ItemHistorico = {
  patientId: "patient-1",
  medicationId: "med-1",
  doseAmount: "10",
  time: "09:00",
  indication: "Tratamento",
  subjectiveState: { mood: 5, energy: 5, sleep: 5, effects: "" },
  analysis: {
    recommendation: "",
    riskAssessment: [],
    efficacyPrediction: 80,
    postDoseInsights: [],
  },
  timestamp: "2026-11-09T09:00:00.000Z",
  createdAt: "2026-11-09T09:00:00.000Z",
  patientName: "Paciente",
  medicationName: "Medicamento",
  displayType: "dose",
};

describe("Configurações e classificação do histórico", () => {
  it("expõe configuração para cada tipo de registro, ação e entidade", () => {
    expect(Object.keys(configuracaoTipoRegistro)).toEqual([
      "dose",
      "symptom",
      "recommendation",
      "alert",
    ]);
    expect(configuracaoAcao.create.label).toBe("Cadastrou");
    expect(configuracaoAcao.update.label).toBe("Atualizou");
    expect(configuracaoAcao.delete.label).toBe("Removeu");
    expect(configuracaoEntidade.patient.label).toBe("Paciente");
    expect(configuracaoEntidade.clinic_member.label).toBe("Membro");
  });

  it("classifica prioridade de risco, sintoma, recomendação e dose", () => {
    expect(
      inferirTipoRegistro(
        {
          ...itemBase,
          analysis: {
            ...itemBase.analysis,
            riskAssessment: [{ category: "Teste", level: "Alto", description: "" }],
          },
        },
        "all"
      )
    ).toBe("alert");
    expect(
      inferirTipoRegistro(
        {
          ...itemBase,
          subjectiveState: { ...itemBase.subjectiveState, mood: 2 },
        },
        "all"
      )
    ).toBe("symptom");
    expect(
      inferirTipoRegistro(
        {
          ...itemBase,
          analysis: { ...itemBase.analysis, recommendation: "Revisar" },
        },
        "all"
      )
    ).toBe("recommendation");
    expect(inferirTipoRegistro(itemBase, "all")).toBe("dose");
    expect(inferirTipoRegistro(itemBase, "symptom")).toBe("symptom");
  });

  it("fornece formatadores de data e hora em português", () => {
    const data = new Date("2026-11-09T09:00:00.000Z");
    expect(formatadorDataHoraCurto.format(data)).toContain("/");
    expect(formatadorDataHoraLongo.format(data)).toContain("segunda-feira");
    expect(formatadorHoraCurto.format(data)).toBeTruthy();
  });
});
