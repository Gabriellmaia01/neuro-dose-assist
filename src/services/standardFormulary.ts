import type { Medication } from "@/lib/medications";

export type StandardMedicationTemplate = Omit<
  Medication,
  "id" | "createdAt" | "updatedAt" | "createdBy"
>;

/**
 * Bulário padrão de referência para neurologia e neuropsiquiatria (faixas usuais em adultos e meia-vida plasmática média).
 */
export const STANDARD_NEURO_FORMULARY: StandardMedicationTemplate[] = [
  {
    name: "Sertralina",
    brandName: "Zoloft",
    activeIngredient: "Cloridrato de Sertralina",
    therapeuticClass: "Antidepressivo ISRS",
    form: "Comprimido",
    minDose: 50,
    maxDose: 200,
    unit: "mg",
    halfLifeHours: 26,
  },
  {
    name: "Escitalopram",
    brandName: "Lexapro",
    activeIngredient: "Oxalato de Escitalopram",
    therapeuticClass: "Antidepressivo ISRS",
    form: "Comprimido",
    minDose: 10,
    maxDose: 20,
    unit: "mg",
    halfLifeHours: 30,
  },
  {
    name: "Fluoxetina",
    brandName: "Prozac",
    activeIngredient: "Cloridrato de Fluoxetina",
    therapeuticClass: "Antidepressivo ISRS",
    form: "Cápsula",
    minDose: 20,
    maxDose: 80,
    unit: "mg",
    halfLifeHours: 96,
  },
  {
    name: "Venlafaxina",
    brandName: "Efexor XR",
    activeIngredient: "Cloridrato de Venlafaxina",
    therapeuticClass: "Antidepressivo IRSN",
    form: "Cápsula",
    minDose: 75,
    maxDose: 225,
    unit: "mg",
    halfLifeHours: 11,
  },
  {
    name: "Duloxetina",
    brandName: "Cymbalta",
    activeIngredient: "Cloridrato de Duloxetina",
    therapeuticClass: "Antidepressivo IRSN",
    form: "Cápsula",
    minDose: 30,
    maxDose: 120,
    unit: "mg",
    halfLifeHours: 12,
  },
  {
    name: "Desvenlafaxina",
    brandName: "Pristiq",
    activeIngredient: "Succinato de Desvenlafaxina",
    therapeuticClass: "Antidepressivo IRSN",
    form: "Comprimido",
    minDose: 50,
    maxDose: 100,
    unit: "mg",
    halfLifeHours: 11,
  },
  {
    name: "Metilfenidato",
    brandName: "Ritalina",
    activeIngredient: "Cloridrato de Metilfenidato",
    therapeuticClass: "Psicoestimulante",
    form: "Comprimido",
    minDose: 10,
    maxDose: 60,
    unit: "mg",
    halfLifeHours: 3,
  },
  {
    name: "Lisdexanfetamina",
    brandName: "Venvanse",
    activeIngredient: "Dimesilato de Lisdexanfetamina",
    therapeuticClass: "Psicoestimulante",
    form: "Cápsula",
    minDose: 30,
    maxDose: 70,
    unit: "mg",
    halfLifeHours: 11,
  },
  {
    name: "Quetiapina",
    brandName: "Seroquel",
    activeIngredient: "Fumarato de Quetiapina",
    therapeuticClass: "Antipsicótico Atípico",
    form: "Comprimido",
    minDose: 25,
    maxDose: 800,
    unit: "mg",
    halfLifeHours: 7,
  },
  {
    name: "Risperidona",
    brandName: "Risperdal",
    activeIngredient: "Risperidona",
    therapeuticClass: "Antipsicótico Atípico",
    form: "Comprimido",
    minDose: 1,
    maxDose: 6,
    unit: "mg",
    halfLifeHours: 20,
  },
  {
    name: "Aripiprazol",
    brandName: "Abilify",
    activeIngredient: "Aripiprazol",
    therapeuticClass: "Antipsicótico Atípico",
    form: "Comprimido",
    minDose: 5,
    maxDose: 30,
    unit: "mg",
    halfLifeHours: 75,
  },
  {
    name: "Lamotrigina",
    brandName: "Lamictal",
    activeIngredient: "Lamotrigina",
    therapeuticClass: "Estabilizador de Humor",
    form: "Comprimido",
    minDose: 25,
    maxDose: 400,
    unit: "mg",
    halfLifeHours: 29,
  },
  {
    name: "Carbonato de Lítio",
    brandName: "Carbolitium",
    activeIngredient: "Carbonato de Lítio",
    therapeuticClass: "Estabilizador de Humor",
    form: "Comprimido",
    minDose: 300,
    maxDose: 1800,
    unit: "mg",
    halfLifeHours: 24,
  },
  {
    name: "Valproato de Sódio",
    brandName: "Depakote",
    activeIngredient: "Divalproato de Sódio",
    therapeuticClass: "Estabilizador de Humor",
    form: "Comprimido",
    minDose: 250,
    maxDose: 2000,
    unit: "mg",
    halfLifeHours: 14,
  },
  {
    name: "Topiramato",
    brandName: "Topamax",
    activeIngredient: "Topiramato",
    therapeuticClass: "Estabilizador de Humor",
    form: "Comprimido",
    minDose: 25,
    maxDose: 400,
    unit: "mg",
    halfLifeHours: 21,
  },
  {
    name: "Clonazepam",
    brandName: "Rivotril",
    activeIngredient: "Clonazepam",
    therapeuticClass: "Benzodiazepínico",
    form: "Comprimido",
    minDose: 0.5,
    maxDose: 6,
    unit: "mg",
    halfLifeHours: 35,
  },
];

function normalizeKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Retorna apenas os medicamentos do bulário padrão que ainda não constam no catálogo da clínica.
 */
export function getMissingStandardMedications(
  existingMedications: Pick<Medication, "name" | "activeIngredient">[]
): StandardMedicationTemplate[] {
  const existingNames = new Set(
    existingMedications.map((m) => normalizeKey(m.name))
  );

  return STANDARD_NEURO_FORMULARY.filter(
    (template) => !existingNames.has(normalizeKey(template.name))
  );
}
