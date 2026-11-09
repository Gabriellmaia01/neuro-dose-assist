import { describe, it, expect } from "vitest";
import { calcularEstatisticasPainel } from "@/lib/calculadoraEstatisticas";
import type { Patient } from "@/lib/patients";
import type { DoseRecord } from "@/lib/doses";
import { subDays } from "date-fns";

describe("Lógica de Domínio: Calculadora de Estatísticas do Painel", () => {
  it("deve retornar zeros quando listas de pacientes e doses estiverem vazias", () => {
    const stats = calcularEstatisticasPainel([], []);
    expect(stats.pacientesAtivos).toBe(0);
    expect(stats.pacientesAtivosNovos).toBe(0);
    expect(stats.tendenciaPacientes).toBe(0);
    expect(stats.dosesUltimos7Dias).toBe(0);
    expect(stats.tendenciaDoses).toBe(0);
    expect(stats.eficaciaMedia).toBe(0);
    expect(stats.tendenciaEficacia).toBe(0);
    expect(stats.inferenciasIA).toBe(0);
    expect(stats.tendenciaIA).toBe(0);
  });

  it("deve calcular corretamente pacientes ativos e novas admissões em 30 dias", () => {
    const agora = new Date();
    const pacientes: Patient[] = [
      {
        id: "p1",
        name: "Paciente Recente 1",
        age: 30,
        gender: "Feminino",
        condition: "Enxaqueca",
        createdAt: subDays(agora, 5).toISOString(),
      },
      {
        id: "p2",
        name: "Paciente Recente 2",
        age: 45,
        gender: "Masculino",
        condition: "Dor neuropática",
        createdAt: subDays(agora, 15).toISOString(),
      },
      {
        id: "p3",
        name: "Paciente Antigo",
        age: 60,
        gender: "Outro",
        condition: "Espasticidade",
        createdAt: subDays(agora, 90).toISOString(),
      },
    ];

    const stats = calcularEstatisticasPainel(pacientes, []);
    expect(stats.pacientesAtivos).toBe(3);
    expect(stats.pacientesAtivosNovos).toBe(2);
  });

  it("deve calcular doses dos últimos 7 dias e média ponderada de eficácia", () => {
    const agora = new Date();
    const doses: DoseRecord[] = [
      {
        id: "d1",
        patientId: "p1",
        medicationId: "m1",
        doseAmount: "25",
        time: "08:00",
        indication: "Dor",
        subjectiveState: { mood: 4, energy: 4 },
        analysis: {
          efficacyPrediction: 80,
          confidenceScore: 90,
          sideEffectRisk: "low",
          reasoning: "Boa resposta",
          suggestedAdjustments: "Manter",
          riskFactors: [],
        },
        timestamp: subDays(agora, 2).toISOString(),
        createdAt: subDays(agora, 2).toISOString(),
      },
      {
        id: "d2",
        patientId: "p1",
        medicationId: "m1",
        doseAmount: "25",
        time: "20:00",
        indication: "Dor",
        subjectiveState: { mood: 3, energy: 3 },
        analysis: {
          efficacyPrediction: 60,
          confidenceScore: 85,
          sideEffectRisk: "low",
          reasoning: "Eficácia moderada",
          suggestedAdjustments: "Manter",
          riskFactors: [],
        },
        timestamp: subDays(agora, 4).toISOString(),
        createdAt: subDays(agora, 4).toISOString(),
      },
      {
        id: "d3",
        patientId: "p1",
        medicationId: "m1",
        doseAmount: "25",
        time: "08:00",
        indication: "Dor",
        subjectiveState: { mood: 2, energy: 2 },
        analysis: {
          efficacyPrediction: 40,
          confidenceScore: 80,
          sideEffectRisk: "medium",
          reasoning: "Eficácia baixa",
          suggestedAdjustments: "Avaliar",
          riskFactors: [],
        },
        timestamp: subDays(agora, 20).toISOString(),
        createdAt: subDays(agora, 20).toISOString(),
      },
    ];

    const stats = calcularEstatisticasPainel([], doses);
    expect(stats.dosesUltimos7Dias).toBe(2);
    expect(stats.inferenciasIA).toBe(3);
    // Eficácia geral: (80 + 60 + 40) / 3 = 60
    expect(stats.eficaciaMedia).toBe(60);
  });
});

