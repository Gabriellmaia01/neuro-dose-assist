import { describe, it, expect } from "vitest";
import {
  calculateAdherenceRate,
  calculateTrendData,
  identifyRiskPatterns,
  aggregateMetrics,
  generatePredictiveInsights,
} from "@/lib/analytics";
import type { DoseRecord } from "@/lib/doses";
import type { Patient } from "@/lib/patients";
import type { Medication } from "@/lib/medications";
import { subDays } from "date-fns";

describe("Lógica de Domínio: Análise Clínica e Preditiva (analytics.ts)", () => {
  const mockPaciente: Patient = {
    id: "p-test-1",
    name: "Maria Silva",
    age: 42,
    gender: "Feminino",
    condition: "Enxaqueca refratária",
  };

  const mockMedicamento: Medication = {
    id: "m-test-1",
    name: "Topiramato",
    brandName: "Topamax",
    activeIngredient: "Topiramato",
    therapeuticClass: "Anticonvulsivante",
    form: "Comprimido",
    minDose: 25,
    maxDose: 200,
    unit: "mg",
  };

  describe("calculateAdherenceRate", () => {
    it("deve retornar 0 quando não houver doses registradas", () => {
      expect(calculateAdherenceRate([])).toBe(0);
    });

    it("deve calcular a adesão com base nos dias com doses registradas", () => {
      const agora = new Date();
      const doses: DoseRecord[] = [
        {
          id: "d1",
          patientId: "p-test-1",
          medicationId: "m-test-1",
          doseAmount: "50",
          time: "08:00",
          indication: "Enxaqueca",
          subjectiveState: { mood: 4, energy: 4 },
          analysis: {
            efficacyPrediction: 85,
            confidenceScore: 90,
            sideEffectRisk: "low",
            reasoning: "OK",
            suggestedAdjustments: "Manter",
            riskFactors: [],
          },
          timestamp: subDays(agora, 1).toISOString(),
          createdAt: subDays(agora, 1).toISOString(),
        },
        {
          id: "d2",
          patientId: "p-test-1",
          medicationId: "m-test-1",
          doseAmount: "50",
          time: "08:00",
          indication: "Enxaqueca",
          subjectiveState: { mood: 4, energy: 4 },
          analysis: {
            efficacyPrediction: 85,
            confidenceScore: 90,
            sideEffectRisk: "low",
            reasoning: "OK",
            suggestedAdjustments: "Manter",
            riskFactors: [],
          },
          timestamp: subDays(agora, 2).toISOString(),
          createdAt: subDays(agora, 2).toISOString(),
        },
      ];

      const taxa = calculateAdherenceRate(doses, 10);
      expect(taxa).toBeGreaterThan(0);
      expect(taxa).toBeLessThanOrEqual(100);
    });
  });

  describe("identifyRiskPatterns", () => {
    it("deve identificar padrão de baixa eficácia persistente (>=3 doses com eficácia < 60%)", () => {
      const agora = new Date();
      const dosesBaixaEficacia: DoseRecord[] = Array.from({ length: 4 }).map((_, i) => ({
        id: `d-${i}`,
        patientId: "p-test-1",
        medicationId: "m-test-1",
        doseAmount: "25",
        time: "09:00",
        indication: "Dor",
        subjectiveState: { mood: 3, energy: 3 },
        analysis: {
          efficacyPrediction: 40,
          confidenceScore: 80,
          sideEffectRisk: "low",
          reasoning: "Eficácia baixa persistente",
          suggestedAdjustments: "Revisar",
          riskFactors: [],
        },
        timestamp: subDays(agora, i).toISOString(),
        createdAt: subDays(agora, i).toISOString(),
      }));

      const alertas = identifyRiskPatterns(dosesBaixaEficacia, [mockPaciente]);
      const alertaEficacia = alertas.find((a) => a.type === "low_efficacy");
      expect(alertaEficacia).toBeDefined();
      expect(alertaEficacia?.patientName).toBe("Maria Silva");
    });
  });

  describe("aggregateMetrics", () => {
    it("deve retornar métricas coerentes para lista vazia", () => {
      const metricas = aggregateMetrics([], []);
      expect(metricas.totalDoses).toBe(0);
      expect(metricas.totalPatients).toBe(0);
      expect(metricas.avgEfficacy).toBe(0);
      expect(metricas.trendDirection).toBe("stable");
    });
  });

  describe("generatePredictiveInsights", () => {
    it("deve gerar previsões com 7 dias de previsão e score de risco delimitado", () => {
      const agora = new Date();
      const doses: DoseRecord[] = [
        {
          id: "d1",
          patientId: "p-test-1",
          medicationId: "m-test-1",
          doseAmount: "50",
          time: "08:00",
          indication: "Enxaqueca",
          subjectiveState: { mood: 4, energy: 4 },
          analysis: {
            efficacyPrediction: 85,
            confidenceScore: 90,
            sideEffectRisk: "low",
            reasoning: "Bom",
            suggestedAdjustments: "Manter",
            riskFactors: [],
          },
          timestamp: agora.toISOString(),
          createdAt: agora.toISOString(),
        },
      ];

      const insights = generatePredictiveInsights("p-test-1", doses, [mockMedicamento]);
      expect(insights.weeklyForecast).toHaveLength(7);
      expect(insights.riskScore).toBeGreaterThanOrEqual(0);
      expect(insights.riskScore).toBeLessThanOrEqual(100);
      expect(insights.adherencePrediction).toBeGreaterThanOrEqual(0);
    });
  });
});

