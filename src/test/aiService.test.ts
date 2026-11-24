import { describe, it, expect } from "vitest";
import {
  analyzeDose,
  calculateDeterministicEfficacy,
  type DoseData,
  type SubjectiveState,
  type MedicationContext,
} from "@/services/aiService";

describe("Motor Determinístico de Análise Clínica (aiService.ts)", () => {
  const doseBase: DoseData = {
    patientId: "pac-1",
    medicationId: "med-1",
    dose: "50",
    time: "08:00",
    indication: "Transtorno depressivo",
  };

  const estadoBom: SubjectiveState = {
    mood: 4,
    energy: 8,
    sleep: 8,
    effects: "",
  };

  const medSertralina: MedicationContext = {
    name: "Sertralina",
    brandName: "Zoloft",
    activeIngredient: "Sertralina",
    therapeuticClass: "Antidepressivo ISRS",
    minDose: 50,
    maxDose: 200,
    unit: "mg",
  };

  it("deve produzir exatamente o mesmo resultado em múltiplas execuções idênticas (determinismo total)", async () => {
    const execucoes = await Promise.all([
      analyzeDose(doseBase, estadoBom, medSertralina),
      analyzeDose(doseBase, estadoBom, medSertralina),
      analyzeDose(doseBase, estadoBom, medSertralina),
    ]);

    expect(execucoes[0]).toEqual(execucoes[1]);
    expect(execucoes[1]).toEqual(execucoes[2]);
  });

  it("deve penalizar a eficácia prevista quando a dose estiver fora da faixa terapêutica", () => {
    const dentroFaixa = calculateDeterministicEfficacy(
      estadoBom,
      { ...doseBase, dose: "100" },
      medSertralina
    );
    const subTerapeutica = calculateDeterministicEfficacy(
      estadoBom,
      { ...doseBase, dose: "25" },
      medSertralina
    );
    const supraTerapeutica = calculateDeterministicEfficacy(
      estadoBom,
      { ...doseBase, dose: "300" },
      medSertralina
    );

    expect(dentroFaixa).toBeGreaterThan(subTerapeutica);
    expect(dentroFaixa).toBeGreaterThan(supraTerapeutica);
  });

  it("deve refletir piora clínica quando humor, energia e sono são baixos", () => {
    const eficaciaAlta = calculateDeterministicEfficacy(
      { mood: 5, energy: 9, sleep: 9, effects: "" },
      doseBase,
      medSertralina
    );
    const eficaciaBaixa = calculateDeterministicEfficacy(
      { mood: 1, energy: 2, sleep: 2, effects: "Sonolência intensa" },
      doseBase,
      medSertralina
    );

    expect(eficaciaAlta).toBeGreaterThan(eficaciaBaixa);
    expect(eficaciaBaixa).toBeGreaterThanOrEqual(10);
    expect(eficaciaAlta).toBeLessThanOrEqual(99);
  });

  it("deve alertar horário inadequado para psicoestimulante administrado à noite", async () => {
    const metilfenidato: MedicationContext = {
      name: "Metilfenidato",
      brandName: "Ritalina",
      activeIngredient: "Metilfenidato",
      therapeuticClass: "Psicoestimulante",
      minDose: 10,
      maxDose: 60,
      unit: "mg",
    };

    const resultadoNoite = await analyzeDose(
      { ...doseBase, dose: "20", time: "21:30" },
      estadoBom,
      metilfenidato
    );

    const temAlertaHorario = resultadoNoite.postDoseInsights.some((i) =>
      i.title.includes("Horário não ideal")
    );
    expect(temAlertaHorario).toBe(true);
  });

  it("deve emitir alerta de risco Alto quando o paciente tiver alergia registrada ao medicamento", async () => {
    const resultadoAlergia = await analyzeDose(
      doseBase,
      estadoBom,
      medSertralina,
      [],
      "high",
      "Dipirona, Sertralina"
    );

    expect(
      resultadoAlergia.riskAssessment.some(
        (r) => r.category === "Alergia / Hipersensibilidade" && r.level === "Alto"
      )
    ).toBe(true);
    expect(resultadoAlergia.recommendation).toContain("Conflito de alergia detectado");
  });

  it("deve incorporar escalas clínicas padronizadas (PHQ-2 >= 3, GAD-2 >= 3 e CGI-S >= 5) na análise de risco e eficácia", async () => {
    const semEscalas = await analyzeDose(doseBase, estadoBom, medSertralina);
    const comEscalasPositivas = await analyzeDose(
      doseBase,
      {
        ...estadoBom,
        phq2Score: 5,
        gad2Score: 4,
        cgiSeverity: 6,
      },
      medSertralina
    );

    expect(comEscalasPositivas.efficacyPrediction).toBeLessThan(
      semEscalas.efficacyPrediction
    );
    expect(
      comEscalasPositivas.riskAssessment.some((r) =>
        r.category.includes("PHQ-2")
      )
    ).toBe(true);
    expect(
      comEscalasPositivas.riskAssessment.some((r) =>
        r.category.includes("GAD-2")
      )
    ).toBe(true);
    expect(
      comEscalasPositivas.riskAssessment.some((r) =>
        r.category.includes("CGI-S")
      )
    ).toBe(true);
  });
});
