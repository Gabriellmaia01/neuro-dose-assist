import { describe, it, expect } from "vitest";
import {
  checkInteractions,
  resolvePatientActiveMedications,
  checkPatientAllergyConflict,
  type CatalogMedicationLike,
} from "@/services/drugInteractions";

describe("Prescrições por Paciente, Interações e Alergias (drugInteractions.ts)", () => {
  const catalogoClinica: CatalogMedicationLike[] = [
    {
      id: "med-sertralina",
      name: "Sertralina",
      brandName: "Zoloft",
      activeIngredient: "Sertralina",
      therapeuticClass: "Antidepressivo ISRS",
    },
    {
      id: "med-tranil",
      name: "Tranilcipromina",
      brandName: "Parnate",
      activeIngredient: "Tranilcipromina",
      therapeuticClass: "IMAO",
    },
    {
      id: "med-litio",
      name: "Carbonato de Lítio",
      brandName: "Carbolitium",
      activeIngredient: "Carbonato de Lítio",
      therapeuticClass: "Estabilizador de Humor",
    },
  ];

  it("NÃO deve gerar falso positivo usando medicamentos do catálogo que o paciente não toma", () => {
    const paciente = {
      activeMedicationIds: ["med-sertralina"],
      currentMedications: "",
    };

    const listaPaciente = resolvePatientActiveMedications(
      paciente,
      catalogoClinica,
      catalogoClinica[0] // administrando Sertralina
    );

    expect(listaPaciente).toHaveLength(1);
    expect(listaPaciente[0].name).toBe("Sertralina");
    expect(checkInteractions(listaPaciente)).toHaveLength(0);
  });

  it("deve detectar interação grave quando o paciente usa IMAO ativo e recebe dose de ISRS", () => {
    const paciente = {
      activeMedicationIds: ["med-tranil"],
    };

    const listaPaciente = resolvePatientActiveMedications(
      paciente,
      catalogoClinica,
      catalogoClinica[0] // administrando Sertralina
    );

    const alertas = checkInteractions(listaPaciente);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].severity).toBe("grave");
  });

  it("deve detectar interação entre fármaco do catálogo (Lítio) e co-medicação em texto livre (Ibuprofeno / AINE)", () => {
    const paciente = {
      activeMedicationIds: ["med-litio"],
      currentMedications: "Ibuprofeno 400mg",
    };

    const listaPaciente = resolvePatientActiveMedications(paciente, catalogoClinica);
    const alertas = checkInteractions(listaPaciente);

    expect(alertas.some((a) => a.severity === "grave")).toBe(true);
  });

  it("deve detectar conflito de alergia/sensibilidade com princípio ativo ou nome comercial", () => {
    const conflito = checkPatientAllergyConflict(
      "Dipirona, Sertralina",
      catalogoClinica[0]
    );
    expect(conflito).not.toBeNull();
    expect(conflito?.matchedAllergy).toBe("Sertralina");

    const semConflito = checkPatientAllergyConflict(
      "Penicilina, Dipirona",
      catalogoClinica[0]
    );
    expect(semConflito).toBeNull();
  });
});
