import { describe, it, expect } from "vitest";
import { gerarAlertas } from "@/lib/geradorAlertas";
import type { DoseRecord } from "@/lib/doses";

describe("Lógica de Domínio: Gerador de Alertas", () => {
  it("deve retornar alerta de boas-vindas quando nenhuma dose for registrada", () => {
    const alertas = gerarAlertas([]);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].type).toBe("info");
    expect(alertas[0].title).toBe("Bem-vindo");
  });

  it("deve gerar alerta de warning quando humor for inferior a 4", () => {
    const doses: DoseRecord[] = [
      {
        id: "d1",
        patientId: "p1",
        medicationId: "m1",
        doseAmount: "20",
        time: "10:00",
        indication: "Dor",
        subjectiveState: { mood: 2, energy: 3 },
        analysis: {
          efficacyPrediction: 75,
          confidenceScore: 85,
          sideEffectRisk: "low",
          reasoning: "Normal",
          suggestedAdjustments: "Nenhum",
          riskFactors: [],
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    const alertas = gerarAlertas(doses);
    const alertaHumor = alertas.find((a) => a.title === "Humor Baixo Detectado");
    expect(alertaHumor).toBeDefined();
    expect(alertaHumor?.type).toBe("warning");
    expect(alertaHumor?.description).toContain("nível 2");
  });

  it("deve gerar alerta de perigo (danger) quando eficácia for inferior a 60%", () => {
    const doses: DoseRecord[] = [
      {
        id: "d1",
        patientId: "p1",
        medicationId: "m1",
        doseAmount: "20",
        time: "10:00",
        indication: "Dor",
        subjectiveState: { mood: 5, energy: 5 },
        analysis: {
          efficacyPrediction: 45,
          confidenceScore: 90,
          sideEffectRisk: "high",
          reasoning: "Baixa resposta",
          suggestedAdjustments: "Trocar medicação",
          riskFactors: [],
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    const alertas = gerarAlertas(doses);
    const alertaEficacia = alertas.find((a) => a.title === "Baixa Eficácia Estimada");
    expect(alertaEficacia).toBeDefined();
    expect(alertaEficacia?.type).toBe("danger");
  });

  it("deve emitir status de monitoramento ativo quando não houver anomalias", () => {
    const doses: DoseRecord[] = [
      {
        id: "d1",
        patientId: "p1",
        medicationId: "m1",
        doseAmount: "20",
        time: "10:00",
        indication: "Dor",
        subjectiveState: { mood: 5, energy: 5 },
        analysis: {
          efficacyPrediction: 90,
          confidenceScore: 95,
          sideEffectRisk: "low",
          reasoning: "Excelente",
          suggestedAdjustments: "Manter",
          riskFactors: [],
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    const alertas = gerarAlertas(doses);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].title).toBe("Monitoramento Ativo");
    expect(alertas[0].type).toBe("info");
  });
});

