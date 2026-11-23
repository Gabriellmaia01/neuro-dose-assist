import { describe, it, expect } from "vitest";
import {
  STANDARD_NEURO_FORMULARY,
  getMissingStandardMedications,
} from "@/services/standardFormulary";

describe("Bulário Padrão de Neuropsicofármacos (standardFormulary.ts)", () => {
  it("deve possuir ao menos 15 fármacos essenciais com faixas posológicas e meia-vida válidas", () => {
    expect(STANDARD_NEURO_FORMULARY.length).toBeGreaterThanOrEqual(15);

    for (const med of STANDARD_NEURO_FORMULARY) {
      expect(med.name.length).toBeGreaterThan(2);
      expect(med.activeIngredient.length).toBeGreaterThan(2);
      expect(med.minDose).toBeGreaterThan(0);
      expect(med.maxDose).toBeGreaterThan(med.minDose);
      expect(med.halfLifeHours).toBeGreaterThan(0);
    }
  });

  it("deve retornar apenas os medicamentos ainda ausentes no catálogo (importação idempotente)", () => {
    const jaCadastrados = [
      { name: "sertralina", activeIngredient: "Cloridrato de Sertralina" },
      { name: "Carbonato de Litio", activeIngredient: "Carbonato de Lítio" },
    ];

    const faltantes = getMissingStandardMedications(jaCadastrados);

    expect(faltantes).toHaveLength(STANDARD_NEURO_FORMULARY.length - 2);
    expect(faltantes.some((m) => m.name === "Sertralina")).toBe(false);
    expect(faltantes.some((m) => m.name === "Carbonato de Lítio")).toBe(false);
  });

  it("deve retornar lista vazia quando todo o bulário padrão já tiver sido importado", () => {
    const faltantes = getMissingStandardMedications(STANDARD_NEURO_FORMULARY);
    expect(faltantes).toEqual([]);
  });
});
