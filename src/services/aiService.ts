import { findMedicationInfo, getTimeOfDay, type MedicationClassInfo } from './medicationKnowledge';
import {
    checkInteractions,
    checkPatientAllergyConflict,
    type MedicationForCheck,
} from './drugInteractions';

export interface PostDoseInsight {
    icon: 'clock' | 'food' | 'alert' | 'sleep' | 'activity' | 'check' | 'droplet';
    title: string;
    description: string;
    priority: 'info' | 'warning' | 'success';
}

export interface AnalysisResult {
    recommendation: string;
    riskAssessment: {
        category: string;
        level: string;
        description: string;
    }[];
    efficacyPrediction: number;
    postDoseInsights: PostDoseInsight[];
}

export interface DoseData {
    patientId: string;
    medicationId: string;
    dose: string;
    time: string;
    indication: string;
}

export interface SubjectiveState {
    mood: number; // 1-5
    energy: number; // 0-10
    sleep: number; // 0-10
    effects: string;
}

export interface MedicationContext {
    name: string;
    brandName: string;
    activeIngredient: string;
    therapeuticClass: string;
    minDose: number;
    maxDose: number;
    unit: string;
}

export interface AnalysisInput {
    doseData: DoseData;
    state: SubjectiveState;
    medication?: MedicationContext;
    allMedications?: MedicationForCheck[];
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * Calcula deterministicamente a estimativa de eficácia terapêutica (10% a 99%)
 * com base no estado subjetivo, adequação à janela terapêutica e horário da tomada.
 */
export function calculateDeterministicEfficacy(
    state: SubjectiveState,
    doseData: DoseData,
    medication?: MedicationContext,
    medInfo?: MedicationClassInfo | null
): number {
    const clampedMood = Math.min(5, Math.max(1, state.mood));
    const clampedEnergy = Math.min(10, Math.max(0, state.energy));
    const clampedSleep = Math.min(10, Math.max(0, state.sleep));

    const moodScore = ((clampedMood - 1) / 4) * 100;
    const energyScore = (clampedEnergy / 10) * 100;
    const sleepScore = (clampedSleep / 10) * 100;

    const weightedState = moodScore * 0.45 + energyScore * 0.30 + sleepScore * 0.25;
    let score = 35 + weightedState * 0.58;

    if (medication) {
        const doseValue = parseFloat(doseData.dose);
        if (!isNaN(doseValue) && medication.minDose > 0 && medication.maxDose > 0) {
            if (doseValue < medication.minDose) {
                score -= 8;
            } else if (doseValue > medication.maxDose) {
                score -= 6;
            } else {
                score += 4;
            }
        }
    }

    if (medInfo && doseData.time) {
        const period = getTimeOfDay(doseData.time);
        if (medInfo.timeGuidance.avoid.includes(period)) {
            score -= 5;
        } else if (medInfo.timeGuidance.ideal.includes(period)) {
            score += 2;
        }
    }

    return Math.min(99, Math.max(10, Math.round(score)));
}

/**
 * Seleciona de forma determinística a orientação de monitoramento mais relevante
 * para o contexto clínico atual (sem sorteio aleatório).
 */
function selectMonitoringTip(
    medInfo: MedicationClassInfo,
    doseData: DoseData,
    state: SubjectiveState
): string | null {
    const tips = medInfo.monitoringTips;
    if (!tips || tips.length === 0) return null;

    if (state.sleep < 5) {
        const sleepTip = tips.find((t) => /sono|noite|insônia|sonolência/i.test(t));
        if (sleepTip) return sleepTip;
    }

    if (state.mood < 3) {
        const moodTip = tips.find((t) => /humor|ansiedade|sintoma/i.test(t));
        if (moodTip) return moodTip;
    }

    const period = doseData.time ? getTimeOfDay(doseData.time) : 'manha';
    const indexMap: Record<'manha' | 'tarde' | 'noite', number> = {
        manha: 0,
        tarde: 1,
        noite: 2,
    };

    return tips[indexMap[period] % tips.length];
}

export const analyzeDose = async (
    doseData: DoseData,
    state: SubjectiveState,
    medication?: MedicationContext,
    allMedications?: MedicationForCheck[],
    confidenceLevel: ConfidenceLevel = 'high',
    patientAllergies?: string
): Promise<AnalysisResult> => {
    const { mood, energy, sleep } = state;
    const insights: PostDoseInsight[] = [];

    const medInfo = medication
        ? findMedicationInfo(
              medication.therapeuticClass,
              medication.activeIngredient,
              medication.name
          )
        : null;

    // ── 1. Recomendação baseada no estado subjetivo ──
    let recommendation = "";
    const risks: { category: string; level: string; description: string }[] = [];

    // ── 1.a Verificação prioritária de alergia/sensibilidade do paciente ──
    const allergyConflict = checkPatientAllergyConflict(patientAllergies, medication);
    if (allergyConflict) {
        insights.push({
            icon: 'alert',
            title: `Alerta de alergia: ${allergyConflict.matchedAllergy}`,
            description: `${allergyConflict.description} Suspenda a administração até avaliação médica imediata.`,
            priority: 'warning',
        });
        risks.push({
            category: "Alergia / Hipersensibilidade",
            level: "Alto",
            description: allergyConflict.description,
        });
        recommendation += `ATENÇÃO: Conflito de alergia detectado (${allergyConflict.matchedAllergy}). Revisar prescrição imediatamente. `;
    }

    if (sleep < 5) {
        recommendation += "Considerar ajuste no horário da medicação para não interferir no sono. ";
        risks.push({
            category: "Sono",
            level: "Médio",
            description: "Qualidade do sono baixa pode afetar eficácia.",
        });
    }

    if (mood < 3) {
        recommendation += "Monitorar sintomas depressivos. Se persistir, consultar médico para ajuste de dose. ";
    } else if (mood >= 4) {
        recommendation += "Resposta positiva ao tratamento atual. Manter conduta. ";
    } else {
        recommendation += "Resposta estável. Continuar observação. ";
    }

    if (energy < 4) {
        risks.push({
            category: "Energia",
            level: "Baixo",
            description: "Baixa energia relatada.",
        });
    }

    const efficacyPrediction = calculateDeterministicEfficacy(
        state,
        doseData,
        medication,
        medInfo
    );

    // ── 2. Análise baseada no medicamento ──
    if (medication) {
        if (medInfo) {
            generateMedicationInsights(medInfo, doseData, medication, state, insights);
        }

        const doseValue = parseFloat(doseData.dose);
        if (!isNaN(doseValue) && medication.minDose > 0 && medication.maxDose > 0) {
            if (doseValue < medication.minDose) {
                insights.push({
                    icon: 'alert',
                    title: 'Dose abaixo da faixa terapêutica',
                    description: `A dose de ${doseValue}${medication.unit} está abaixo da faixa mínima (${medication.minDose}–${medication.maxDose}${medication.unit}). Pode ser uma titulação inicial, mas verifique com o médico.`,
                    priority: 'warning',
                });
                risks.push({
                    category: "Dose",
                    level: "Médio",
                    description: `Dose (${doseValue}${medication.unit}) abaixo da faixa terapêutica (${medication.minDose}–${medication.maxDose}${medication.unit}).`,
                });
            } else if (doseValue > medication.maxDose) {
                insights.push({
                    icon: 'alert',
                    title: 'Dose acima da faixa terapêutica',
                    description: `A dose de ${doseValue}${medication.unit} excede a faixa máxima recomendada (${medication.minDose}–${medication.maxDose}${medication.unit}). Confirme com o médico.`,
                    priority: 'warning',
                });
                risks.push({
                    category: "Dose",
                    level: "Médio",
                    description: `Dose (${doseValue}${medication.unit}) acima da faixa terapêutica (${medication.minDose}–${medication.maxDose}${medication.unit}).`,
                });
            } else {
                insights.push({
                    icon: 'check',
                    title: 'Dose dentro da faixa terapêutica',
                    description: `${doseValue}${medication.unit} está dentro da faixa recomendada (${medication.minDose}–${medication.maxDose}${medication.unit}).`,
                    priority: 'success',
                });
            }
        }
    }

    // ── 3. Verificação de interações medicamentosas ──
    if (allMedications && allMedications.length >= 2) {
        const interactions = checkInteractions(allMedications);

        for (const interaction of interactions) {
            const severityMap: Record<string, 'warning' | 'info'> = {
                grave: 'warning',
                moderado: 'warning',
                leve: 'info',
            };

            insights.push({
                icon: 'alert',
                title: `Interação: ${interaction.medicationA} + ${interaction.medicationB}`,
                description: `${interaction.description}. ${interaction.recommendation}`,
                priority: severityMap[interaction.severity] || 'warning',
            });

            risks.push({
                category: `Interação (${interaction.severity})`,
                level: interaction.severity === 'grave' ? 'Alto' : interaction.severity === 'moderado' ? 'Médio' : 'Baixo',
                description: `${interaction.medicationA} × ${interaction.medicationB}: ${interaction.description}`,
            });
        }
    }

    // ── 4. Insights baseados no estado subjetivo + medicamento ──
    if (medication) {
        generateStateBasedInsights(state, medication, insights);
    }

    if (!recommendation) {
        recommendation = "Manter protocolo atual e reavaliar em 7 dias.";
    }

    if (insights.length === 0) {
        insights.push({
            icon: 'check',
            title: 'Registro concluído',
            description: 'Dose registrada com sucesso. Continue monitorando conforme orientação médica.',
            priority: 'success',
        });
    }

    // ── 5. Filtrar insights pelo nível de confiança da análise ──
    const filteredInsights = applyConfidenceFilter(insights, confidenceLevel);

    if (confidenceLevel === 'low') {
        recommendation = recommendation.trim();
        if (recommendation) {
            recommendation += ' ⚠️ Nível de confiança baixo — avalie clinicamente antes de seguir estas sugestões.';
        }
    }

    return {
        recommendation,
        riskAssessment: risks.length > 0
            ? risks
            : [{ category: "Geral", level: "Baixo", description: "Nenhum risco imediato identificado." }],
        efficacyPrediction,
        postDoseInsights: filteredInsights,
    };
};

function applyConfidenceFilter(
    insights: PostDoseInsight[],
    level: ConfidenceLevel
): PostDoseInsight[] {
    if (level === 'high') {
        return insights;
    }

    if (level === 'medium') {
        const warnings = insights.filter(i => i.priority === 'warning');
        const others = insights.filter(i => i.priority !== 'warning').slice(0, 2);
        return [...warnings, ...others].slice(0, 5);
    }

    const critical = insights.filter(i => i.priority === 'warning');
    const result = critical.slice(0, 3);

    if (result.length === 0) {
        result.push({
            icon: 'check',
            title: 'Registro concluído',
            description: 'Dose registrada. Confiança da análise configurada como baixa — consulte orientação clínica para detalhes.',
            priority: 'info',
        });
    }

    return result;
}

function generateMedicationInsights(
    medInfo: MedicationClassInfo,
    doseData: DoseData,
    medication: MedicationContext,
    state: SubjectiveState,
    insights: PostDoseInsight[]
): void {
    const timeOfDay = getTimeOfDay(doseData.time);

    if (medInfo.timeGuidance.avoid.includes(timeOfDay)) {
        insights.push({
            icon: 'clock',
            title: `Horário não ideal para ${medication.name}`,
            description: medInfo.timeGuidance.reason,
            priority: 'warning',
        });
    } else if (medInfo.timeGuidance.ideal.includes(timeOfDay)) {
        insights.push({
            icon: 'clock',
            title: 'Horário adequado',
            description: `Bom horário para ${medication.name}. ${medInfo.timeGuidance.reason}`,
            priority: 'success',
        });
    }

    if (medInfo.foodInteraction === 'com_alimento') {
        insights.push({
            icon: 'food',
            title: 'Tomar com alimento',
            description: medInfo.foodNote,
            priority: 'info',
        });
    } else if (medInfo.foodInteraction === 'sem_alimento') {
        insights.push({
            icon: 'food',
            title: 'Tomar sem alimento',
            description: medInfo.foodNote,
            priority: 'info',
        });
    }

    const relevantTips = medInfo.generalTips.slice(0, 2);
    for (const tip of relevantTips) {
        insights.push(tip);
    }

    const selectedTip = selectMonitoringTip(medInfo, doseData, state);
    if (selectedTip) {
        insights.push({
            icon: 'activity',
            title: 'O que observar agora',
            description: selectedTip,
            priority: 'info',
        });
    }
}

function generateStateBasedInsights(
    state: SubjectiveState,
    medication: MedicationContext,
    insights: PostDoseInsight[]
): void {
    const isStimulant = ['Psicoestimulante', 'Estimulante'].some(
        cls => medication.therapeuticClass.toLowerCase().includes(cls.toLowerCase())
    );
    const isSedating = ['Antipsicótico', 'Benzodiazep'].some(
        cls => medication.therapeuticClass.toLowerCase().includes(cls.toLowerCase())
    );

    if (isStimulant && state.energy < 4) {
        insights.push({
            icon: 'activity',
            title: 'Energia baixa pré-dose',
            description: 'Sua energia está baixa. O estimulante deve ajudar nas próximas horas. Hidrate-se bem.',
            priority: 'info',
        });
    }

    if (isStimulant && state.sleep < 5) {
        insights.push({
            icon: 'sleep',
            title: 'Sono ruim + estimulante',
            description: 'Noite de sono ruim pode intensificar efeitos colaterais do estimulante (irritabilidade, taquicardia). Monitore com atenção.',
            priority: 'warning',
        });
    }

    if (isSedating && state.energy < 3) {
        insights.push({
            icon: 'alert',
            title: 'Cuidado com sedação',
            description: 'A energia já está muito baixa. A medicação sedativa pode causar sedação excessiva. Evite atividades de risco.',
            priority: 'warning',
        });
    }

    if (state.mood <= 2) {
        insights.push({
            icon: 'check',
            title: 'Acompanhamento de humor',
            description: 'Humor reduzido registrado nesta aplicação. Caso persista nos próximos dias, reavalie a conduta clínica.',
            priority: 'info',
        });
    }
}
