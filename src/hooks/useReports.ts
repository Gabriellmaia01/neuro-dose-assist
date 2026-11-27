import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getDoses, type DoseRecord } from "@/lib/doses";
import { getMedications, type Medication } from "@/lib/medications";
import { getPatients, type Patient } from "@/lib/patients";
import {
    buildReportRecommendations,
    type ReportRecommendationItem,
} from "@/lib/reportExports";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export { buildReportRecommendations, type ReportRecommendationItem };

export function useReports() {
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedPatient, setSelectedPatient] = useState("all");
    const [selectedReport, setSelectedReport] = useState("complete");
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeRecommendations, setIncludeRecommendations] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [doses, setDoses] = useState<DoseRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);

    const recarregar = useCallback(() => {
        setTentativa((atual) => atual + 1);
    }, []);

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            if (!user || !effectiveUserId) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                if (mounted) {
                    setLoading(true);
                    setErro(null);
                }
                const [dosesData, medicationsData, patientsData] = await Promise.all([
                    getDoses(effectiveUserId),
                    getMedications(effectiveUserId),
                    getPatients(effectiveUserId),
                ]);

                if (mounted) {
                    setDoses(dosesData || []);
                    setMedications(medicationsData || []);
                    setPatients(patientsData || []);
                }
            } catch (error) {
                console.error("Failed to load report data:", error);
                if (mounted) {
                    setErro("Não foi possível carregar os dados clínicos para o relatório. Tente novamente.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadData();
        return () => {
            mounted = false;
        };
    }, [user, effectiveUserId, tentativa]);

    const periodoInvalido = Boolean(
        startDate && endDate && startOfDay(startDate) > endOfDay(endDate)
    );

    const filteredDoses = useMemo(() => {
        const rangeStart = startDate && endDate && startOfDay(startDate) > endOfDay(endDate)
            ? startOfDay(endDate)
            : startDate
            ? startOfDay(startDate)
            : undefined;
        const rangeEnd = startDate && endDate && startOfDay(startDate) > endOfDay(endDate)
            ? endOfDay(startDate)
            : endDate
            ? endOfDay(endDate)
            : undefined;

        return doses.filter((dose) => {
            if (!dose) return false;
            const doseDate = new Date(dose.timestamp);

            if (rangeStart && rangeEnd) {
                if (!isWithinInterval(doseDate, { start: rangeStart, end: rangeEnd })) {
                    return false;
                }
            } else if (rangeStart) {
                if (doseDate < rangeStart) return false;
            } else if (rangeEnd) {
                if (doseDate > rangeEnd) return false;
            }

            if (selectedPatient && selectedPatient !== "all" && dose.patientId !== selectedPatient) {
                return false;
            }

            return true;
        });
    }, [doses, startDate, endDate, selectedPatient]);

    const {
        totalDoses,
        avgEfficacy,
        avgMood,
        avgEnergy,
        lowMoodCount,
        uniqueMedications,
        filteredMedications,
        chartData,
        recommendations,
    } = useMemo(() => {
        const total = filteredDoses.length;

        const efficacyAvg = total > 0
            ? Math.round(
                filteredDoses.reduce((acc, dose) => {
                    const efficacy =
                        typeof dose?.analysis?.efficacyPrediction === "number"
                            ? dose.analysis.efficacyPrediction
                            : (dose?.subjectiveState?.energy || 0) * 10;
                    return acc + efficacy;
                }, 0) / total
            )
            : 0;

        const moodValues = filteredDoses
            .map((dose) => dose?.subjectiveState?.mood)
            .filter((value): value is number => typeof value === "number" && value > 0);
        const moodAvg = moodValues.length > 0
            ? Math.round((moodValues.reduce((acc, val) => acc + val, 0) / moodValues.length) * 10) / 10
            : 0;

        const energyValues = filteredDoses
            .map((dose) => dose?.subjectiveState?.energy)
            .filter((value): value is number => typeof value === "number");
        const energyAvg = energyValues.length > 0
            ? Math.round((energyValues.reduce((acc, val) => acc + val, 0) / energyValues.length) * 10) / 10
            : 0;

        // Escala clínica oficial de Humor é 1–5 (alerta em <= 2), calculado estritamente sobre filteredDoses
        const lowMood = filteredDoses.filter(
            (dose) =>
                typeof dose?.subjectiveState?.mood === "number" &&
                dose.subjectiveState.mood <= 2
        ).length;

        const usedMedicationIds = new Set(
            filteredDoses.map((dose) => dose.medicationId).filter(Boolean)
        );
        const scopedMedications =
            usedMedicationIds.size > 0
                ? medications.filter((med) => med.id && usedMedicationIds.has(med.id))
                : selectedPatient === "all" && !startDate && !endDate
                ? medications
                : [];

        const orderedChartPoints = [...filteredDoses]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .slice(-50)
            .map((dose) => ({
                date: format(new Date(dose.timestamp), "dd/MM"),
                efficacy:
                    typeof dose?.analysis?.efficacyPrediction === "number"
                        ? dose.analysis.efficacyPrediction
                        : (dose?.subjectiveState?.energy || 0) * 10,
                dose: parseFloat(String(dose?.doseAmount ?? "0").replace(",", ".")) || 0,
            }));

        const recs = buildReportRecommendations({
            totalDoses: total,
            avgEfficacy: efficacyAvg,
            avgMood: moodAvg,
            lowMoodCount: lowMood,
        });

        return {
            totalDoses: total,
            avgEfficacy: efficacyAvg,
            avgMood: moodAvg,
            avgEnergy: energyAvg,
            lowMoodCount: lowMood,
            uniqueMedications: usedMedicationIds.size,
            filteredMedications: scopedMedications,
            chartData: orderedChartPoints,
            recommendations: recs,
        };
    }, [filteredDoses, medications, selectedPatient, startDate, endDate]);

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        periodoInvalido,
        selectedPatient,
        setSelectedPatient,
        selectedReport,
        setSelectedReport,
        includeCharts,
        setIncludeCharts,
        includeRecommendations,
        setIncludeRecommendations,
        isGenerating,
        setIsGenerating,
        doses,
        medications,
        filteredMedications,
        patients,
        loading,
        erro,
        recarregar,
        filteredDoses,
        totalDoses,
        avgEfficacy,
        chartData,
        uniqueMedications,
        avgMood,
        avgEnergy,
        lowMoodCount,
        recommendations,
    };
}
