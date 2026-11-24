import { describe, expect, it, vi } from "vitest";
import { calcularDadosGrafico } from "@/lib/calculadoraGrafico";
import { formatarPacientesRecentes } from "@/lib/formatadorPacientes";
import { formatarUltimaDose } from "@/lib/formatadorUltimaDose";
import type { DoseRecord } from "@/lib/doses";

const horarioLocalDeTeste = new Date(2026, 10, 9, 6).toISOString();

const criarDose = (overrides: Partial<DoseRecord> = {}): DoseRecord => ({
  patientId: "patient-1",
  medicationId: "med-1",
  doseAmount: "20",
  time: "09:00",
  indication: "Tratamento",
  subjectiveState: { mood: 4, energy: 7, sleep: 8, effects: "" },
  analysis: {
    recommendation: "Manter",
    riskAssessment: [],
    efficacyPrediction: 80,
    postDoseInsights: [],
  },
  timestamp: horarioLocalDeTeste,
  createdAt: horarioLocalDeTeste,
  ...overrides,
});

describe("Formatadores e dados do dashboard", () => {
  it("gera sete dias e calcula médias diárias de eficácia e dose", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-09T12:00:00.000Z"));

    try {
      const resultado = calcularDadosGrafico([
        criarDose({ doseAmount: "20", analysis: { recommendation: "", riskAssessment: [], efficacyPrediction: 70, postDoseInsights: [] } }),
        criarDose({ doseAmount: "30", analysis: { recommendation: "", riskAssessment: [], efficacyPrediction: 90, postDoseInsights: [] } }),
        criarDose({
          timestamp: "2026-11-08T09:00:00.000Z",
          analysis: { recommendation: "", riskAssessment: [], efficacyPrediction: 0, postDoseInsights: [] },
          subjectiveState: { mood: 3, energy: 6, sleep: 7, effects: "" },
        }),
      ]);

      expect(resultado).toHaveLength(7);
      expect(resultado[6]).toEqual({ data: "09/11", eficacia: 80, dose: 25 });
      expect(resultado[5]).toEqual({ data: "08/11", eficacia: 60, dose: 20 });
      expect(resultado.slice(0, 5).every((dia) => dia.eficacia === 0 && dia.dose === 0)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("formata até três pacientes, incluindo valores ausentes e paciente sem dose", () => {
    const pacientes = [1, 2, 3, 4].map((n) => ({
      id: `patient-${n}`,
      name: `Paciente ${n}`,
      age: n === 1 ? 0 : 30 + n,
      gender: "Outro" as const,
      condition: "Condição",
    }));

    const resultado = formatarPacientesRecentes(
      pacientes,
      [
        criarDose({
          patientId: "patient-1",
          medicationId: "med-1",
          doseAmount: "25",
          analysis: { recommendation: "", riskAssessment: [], efficacyPrediction: 75, postDoseInsights: [] },
        }),
      ],
      [{ id: "med-1", name: "Medicamento" }]
    );

    expect(resultado).toHaveLength(3);
    expect(resultado[0]).toMatchObject({
      id: "patient-1",
      age: 0,
      lastDose: "06:00",
      medication: "Medicamento 25mg",
      efficacy: 75,
    });
    expect(resultado[1]).toMatchObject({
      medication: "Sem registro",
      lastDose: "N/A",
      efficacy: 0,
    });
  });

  it("formata a última dose ou retorna null quando não há registro", () => {
    expect(formatarUltimaDose([], [])).toBeNull();
    expect(formatarUltimaDose([criarDose()], [])).toMatchObject({
      medication: "Desconhecido",
      dose: "20mg",
      time: "06:00",
      efficacy: 80,
      riskLevel: "low",
    });
  });
});
