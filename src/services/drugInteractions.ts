/**
 * Serviço de Detecção de Interações Medicamentosas
 * 
 * Verifica interações entre medicamentos baseado em classes terapêuticas
 * e princípios ativos, com foco em medicamentos neuropsiquiátricos.
 */

export type SeverityLevel = 'grave' | 'moderado' | 'leve';

export interface DrugInteraction {
    id: string;
    classA: string;
    classB: string;
    severity: SeverityLevel;
    description: string;
    recommendation: string;
}

export interface InteractionAlert {
    id: string;
    severity: SeverityLevel;
    medicationA: string;
    medicationB: string;
    description: string;
    recommendation: string;
}

// Banco de interações conhecidas para medicamentos neuropsiquiátricos
const INTERACTION_DATABASE: DrugInteraction[] = [
    // Interações GRAVES
    {
        id: 'imao-isrs',
        classA: 'IMAO',
        classB: 'Antidepressivo ISRS',
        severity: 'grave',
        description: 'Risco de síndrome serotoninérgica potencialmente fatal',
        recommendation: 'Contraindicada. Aguardar pelo menos 2 semanas entre uso de IMAO e ISRS.',
    },
    {
        id: 'imao-irsn',
        classA: 'IMAO',
        classB: 'Antidepressivo IRSN',
        severity: 'grave',
        description: 'Risco de síndrome serotoninérgica potencialmente fatal',
        recommendation: 'Contraindicada. Aguardar pelo menos 2 semanas entre uso de IMAO e IRSN.',
    },
    {
        id: 'benzo-opioid',
        classA: 'Benzodiazepínico',
        classB: 'Opioide',
        severity: 'grave',
        description: 'Risco aumentado de depressão respiratória, sedação profunda e morte',
        recommendation: 'Evitar combinação. Se necessário, usar doses mínimas com monitoramento.',
    },
    {
        id: 'stimulant-imao',
        classA: 'Psicoestimulante',
        classB: 'IMAO',
        severity: 'grave',
        description: 'Risco de crise hipertensiva grave',
        recommendation: 'Contraindicada. Não usar concomitantemente.',
    },
    {
        id: 'lithium-nsaid',
        classA: 'Estabilizador de Humor',
        classB: 'AINE',
        severity: 'grave',
        description: 'AINES podem aumentar níveis séricos de lítio causando toxicidade',
        recommendation: 'Monitorar níveis de lítio. Preferir paracetamol para dor.',
    },

    // Interações MODERADAS
    {
        id: 'antipsychotic-anticholinergic',
        classA: 'Antipsicótico Atípico',
        classB: 'Anticolinérgico',
        severity: 'moderado',
        description: 'Potencialização de efeitos anticolinérgicos (boca seca, constipação, confusão)',
        recommendation: 'Usar com cautela em idosos. Monitorar efeitos adversos.',
    },
    {
        id: 'benzo-alcohol',
        classA: 'Benzodiazepínico',
        classB: 'Álcool',
        severity: 'moderado',
        description: 'Aumento de sedação e depressão do SNC',
        recommendation: 'Orientar paciente a evitar álcool durante tratamento.',
    },
    {
        id: 'isrs-triptano',
        classA: 'Antidepressivo ISRS',
        classB: 'Triptano',
        severity: 'moderado',
        description: 'Risco potencial de síndrome serotoninérgica',
        recommendation: 'Monitorar sintomas. Usar dose mais baixa de triptano.',
    },
    {
        id: 'stimulant-antihypertensive',
        classA: 'Psicoestimulante',
        classB: 'Anti-hipertensivo',
        severity: 'moderado',
        description: 'Psicoestimulantes podem reduzir eficácia de anti-hipertensivos',
        recommendation: 'Monitorar pressão arterial regularmente.',
    },
    {
        id: 'antipsychotic-diabetes',
        classA: 'Antipsicótico Atípico',
        classB: 'Antidiabético',
        severity: 'moderado',
        description: 'Antipsicóticos atípicos podem causar hiperglicemia',
        recommendation: 'Monitorar glicemia. Ajustar dose de antidiabético se necessário.',
    },

    // Interações LEVES
    {
        id: 'isrs-nsaid',
        classA: 'Antidepressivo ISRS',
        classB: 'AINE',
        severity: 'leve',
        description: 'Aumento leve do risco de sangramento gastrointestinal',
        recommendation: 'Considerar uso de protetor gástrico se uso prolongado.',
    },
    {
        id: 'benzo-caffeine',
        classA: 'Benzodiazepínico',
        classB: 'Cafeína',
        severity: 'leve',
        description: 'Cafeína pode reduzir efeito sedativo dos benzodiazepínicos',
        recommendation: 'Orientar sobre consumo moderado de cafeína.',
    },
];

// Mapeamento de nomes alternativos para classes padrão (incluindo co-medicações clínicas gerais)
const CLASS_ALIASES: Record<string, string[]> = {
    'Antidepressivo ISRS': ['ISRS', 'Sertralina', 'Fluoxetina', 'Paroxetina', 'Escitalopram', 'Citalopram', 'Fluvoxamina'],
    'Antidepressivo IRSN': ['IRSN', 'Venlafaxina', 'Duloxetina', 'Desvenlafaxina'],
    'Psicoestimulante': ['Estimulante', 'Metilfenidato', 'Anfetamina', 'Lisdexanfetamina', 'Ritalina', 'Venvanse', 'Concerta'],
    'Benzodiazepínico': ['Benzo', 'Diazepam', 'Clonazepam', 'Alprazolam', 'Lorazepam', 'Midazolam', 'Bromazepam', 'Rivotril'],
    'Antipsicótico Atípico': ['Antipsicótico', 'Risperidona', 'Quetiapina', 'Olanzapina', 'Aripiprazol', 'Clozapina', 'Ziprasidona', 'Lurasidona'],
    'Estabilizador de Humor': ['Estabilizador', 'Lítio', 'Carbonato de Lítio', 'Ácido Valproico', 'Valproato', 'Divalproato', 'Carbamazepina', 'Lamotrigina'],
    'IMAO': ['Inibidor da MAO', 'Fenelzina', 'Tranilcipromina', 'Selegilina', 'Moclobemida'],
    'AINE': ['Anti-inflamatório', 'Ibuprofeno', 'Diclofenaco', 'Naproxeno', 'Cetoprofeno', 'Nimesulida', 'Meloxicam', 'Celecoxibe'],
    'Opioide': ['Tramadol', 'Codeína', 'Morfina', 'Oxicodona', 'Metadona', 'Fentanil'],
    'Triptano': ['Sumatriptano', 'Rizatriptano', 'Zolmitriptano', 'Naratriptano'],
    'Anti-hipertensivo': ['Losartana', 'Enalapril', 'Captopril', 'Anlodipino', 'Atenolol', 'Propranolol', 'Hidroclorotiazida'],
    'Antidiabético': ['Metformina', 'Glibenclamida', 'Gliclazida', 'Insulina', 'Empagliflozina', 'Dapagliflozina'],
    'Anticolinérgico': ['Biperideno', 'Amitriptilina', 'Nortriptilina', 'Prometazina', 'Escopolamina'],
    'Álcool': ['Etanol', 'Bebida alcoólica'],
    'Cafeína': ['Café', 'Energético'],
};

/**
 * Normaliza o nome da classe terapêutica para o padrão do banco
 */
function normalizeClass(className: string): string {
    const normalized = className.toLowerCase().trim();

    for (const [standardClass, aliases] of Object.entries(CLASS_ALIASES)) {
        if (standardClass.toLowerCase() === normalized) {
            return standardClass;
        }
        if (aliases.some(alias => alias.toLowerCase() === normalized)) {
            return standardClass;
        }
    }

    return className;
}

/**
 * Verifica se há interação entre duas classes de medicamentos
 */
function findInteraction(classA: string, classB: string): DrugInteraction | null {
    const normalizedA = normalizeClass(classA);
    const normalizedB = normalizeClass(classB);

    return INTERACTION_DATABASE.find(interaction =>
        (interaction.classA === normalizedA && interaction.classB === normalizedB) ||
        (interaction.classA === normalizedB && interaction.classB === normalizedA)
    ) || null;
}

export interface MedicationForCheck {
    id?: string;
    name: string;
    therapeuticClass: string;
    activeIngredient?: string;
}

/**
 * Verifica interações entre uma lista de medicamentos
 * @param medications Lista de medicamentos para verificar
 * @returns Lista de alertas de interação encontrados
 */
export function checkInteractions(medications: MedicationForCheck[]): InteractionAlert[] {
    const alerts: InteractionAlert[] = [];

    if (medications.length < 2) {
        return alerts;
    }

    // Verificar cada par de medicamentos
    for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
            const medA = medications[i];
            const medB = medications[j];

            // Verificar por classe terapêutica
            const interaction = findInteraction(medA.therapeuticClass, medB.therapeuticClass);

            if (interaction) {
                alerts.push({
                    id: `${medA.id || medA.name}-${medB.id || medB.name}`,
                    severity: interaction.severity,
                    medicationA: medA.name,
                    medicationB: medB.name,
                    description: interaction.description,
                    recommendation: interaction.recommendation,
                });
            }

            // Verificar por princípio ativo (caso exista)
            if (medA.activeIngredient && medB.activeIngredient) {
                const ingredientInteraction = findInteraction(medA.activeIngredient, medB.activeIngredient);

                if (ingredientInteraction && !alerts.find(a =>
                    a.medicationA === medA.name && a.medicationB === medB.name
                )) {
                    alerts.push({
                        id: `${medA.id || medA.name}-${medB.id || medB.name}-ingredient`,
                        severity: ingredientInteraction.severity,
                        medicationA: medA.name,
                        medicationB: medB.name,
                        description: ingredientInteraction.description,
                        recommendation: ingredientInteraction.recommendation,
                    });
                }
            }
        }
    }

    // Ordenar por severidade (grave primeiro)
    const severityOrder: Record<SeverityLevel, number> = { grave: 0, moderado: 1, leve: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts;
}

/**
 * Verifica interação de um novo medicamento com a lista existente
 * @param newMedication Novo medicamento a ser adicionado
 * @param existingMedications Medicamentos já em uso
 * @returns Lista de alertas de interação
 */
export function checkNewMedicationInteraction(
    newMedication: MedicationForCheck,
    existingMedications: MedicationForCheck[]
): InteractionAlert[] {
    return checkInteractions([newMedication, ...existingMedications])
        .filter(alert =>
            alert.medicationA === newMedication.name ||
            alert.medicationB === newMedication.name
        );
}

/**
 * Retorna a cor CSS apropriada para o nível de severidade
 */
export function getSeverityColor(severity: SeverityLevel): {
    bg: string;
    text: string;
    border: string;
} {
    switch (severity) {
        case 'grave':
            return {
                bg: 'bg-destructive/10',
                text: 'text-destructive',
                border: 'border-destructive/20',
            };
        case 'moderado':
            return {
                bg: 'bg-warning/10',
                text: 'text-warning',
                border: 'border-warning/20',
            };
        case 'leve':
            return {
                bg: 'bg-info/10',
                text: 'text-info',
                border: 'border-info/20',
            };
    }
}

/**
 * Retorna o label em português para o nível de severidade
 */
export function getSeverityLabel(severity: SeverityLevel): string {
    switch (severity) {
        case 'grave':
            return 'Grave';
        case 'moderado':
            return 'Moderado';
        case 'leve':
            return 'Leve';
    }
}

export interface CatalogMedicationLike {
    id?: string;
    name: string;
    brandName?: string;
    therapeuticClass: string;
    activeIngredient?: string;
}

export interface PatientMedicationProfile {
    activeMedicationIds?: string[];
    currentMedications?: string;
    allergies?: string;
}

export interface AllergyConflictAlert {
    matchedAllergy: string;
    medicationName: string;
    description: string;
}

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Infere classe terapêutica a partir de nome livre (ex.: "Ibuprofeno" -> "AINE")
 * usando o dicionário CLASS_ALIASES, permitindo detectar interações com co-medicações externas.
 */
function inferClassFromMedicationName(rawName: string): string {
    const cleaned = normalizeText(rawName).replace(/\b\d+\s*(mg|mcg|ml|g|gotas)\b/gi, '').trim();

    for (const [standardClass, aliases] of Object.entries(CLASS_ALIASES)) {
        if (normalizeText(standardClass) === cleaned) {
            return standardClass;
        }
        if (aliases.some((alias) => cleaned.includes(normalizeText(alias)) || normalizeText(alias).includes(cleaned))) {
            return standardClass;
        }
    }

    return rawName.trim();
}

/**
 * Monta a lista deduplicada de medicamentos EXCLUSIVAMENTE em uso pelo paciente selecionado
 * somada ao medicamento da dose atual (nunca o catálogo inteiro da clínica).
 */
export function resolvePatientActiveMedications(
    patient: PatientMedicationProfile | undefined,
    catalogMedications: CatalogMedicationLike[],
    currentDoseMedication?: CatalogMedicationLike
): MedicationForCheck[] {
    const resolved: MedicationForCheck[] = [];
    const seenKeys = new Set<string>();

    const addUnique = (med: MedicationForCheck) => {
        const key = med.id ? `id:${med.id}` : `name:${normalizeText(med.name)}`;
        const nameKey = `name:${normalizeText(med.name)}`;
        if (seenKeys.has(key) || seenKeys.has(nameKey)) return;
        seenKeys.add(key);
        seenKeys.add(nameKey);
        resolved.push(med);
    };

    if (currentDoseMedication) {
        addUnique({
            id: currentDoseMedication.id,
            name: currentDoseMedication.name,
            therapeuticClass: currentDoseMedication.therapeuticClass,
            activeIngredient: currentDoseMedication.activeIngredient,
        });
    }

    if (!patient) {
        return resolved;
    }

    // 1. Vínculo estruturado por IDs (activeMedicationIds)
    if (patient.activeMedicationIds && patient.activeMedicationIds.length > 0) {
        for (const medId of patient.activeMedicationIds) {
            const found = catalogMedications.find((m) => m.id === medId);
            if (found) {
                addUnique({
                    id: found.id,
                    name: found.name,
                    therapeuticClass: found.therapeuticClass,
                    activeIngredient: found.activeIngredient,
                });
            }
        }
    }

    // 2. Fallback / complemento para nomes em texto livre (retrocompatibilidade e co-medicações gerais)
    if (patient.currentMedications) {
        const terms = patient.currentMedications
            .split(/[,;\n]+/)
            .map((t) => t.trim())
            .filter((t) => t.length >= 2);

        for (const term of terms) {
            const normTerm = normalizeText(term);
            const matchedCatalog = catalogMedications.find(
                (m) =>
                    normalizeText(m.name) === normTerm ||
                    (m.brandName && normalizeText(m.brandName) === normTerm) ||
                    (m.activeIngredient && normalizeText(m.activeIngredient) === normTerm)
            );

            if (matchedCatalog) {
                addUnique({
                    id: matchedCatalog.id,
                    name: matchedCatalog.name,
                    therapeuticClass: matchedCatalog.therapeuticClass,
                    activeIngredient: matchedCatalog.activeIngredient,
                });
            } else {
                addUnique({
                    name: term,
                    therapeuticClass: inferClassFromMedicationName(term),
                });
            }
        }
    }

    return resolved;
}

/**
 * Verifica conflito direto entre alergias/sensibilidades registradas no prontuário
 * e o medicamento prescrito/administrado.
 */
export function checkPatientAllergyConflict(
    allergiesText: string | undefined,
    medication: CatalogMedicationLike | undefined
): AllergyConflictAlert | null {
    if (!allergiesText || !medication) return null;

    const allergyTerms = allergiesText
        .split(/[,;\n]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 3);

    if (allergyTerms.length === 0) return null;

    const medTargets = [
        medication.name,
        medication.brandName,
        medication.activeIngredient,
        medication.therapeuticClass,
    ]
        .filter((v): v is string => Boolean(v))
        .map(normalizeText);

    for (const rawAllergy of allergyTerms) {
        const normAllergy = normalizeText(rawAllergy);
        const hasMatch = medTargets.some(
            (target) => target.includes(normAllergy) || normAllergy.includes(target)
        );

        if (hasMatch) {
            return {
                matchedAllergy: rawAllergy,
                medicationName: medication.name,
                description: `Paciente possui alergia/sensibilidade registrada a "${rawAllergy}", incompatível com ${medication.name} (${medication.activeIngredient || medication.therapeuticClass}).`,
            };
        }
    }

    return null;
}
