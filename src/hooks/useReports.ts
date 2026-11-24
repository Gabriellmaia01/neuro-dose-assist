import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getDoses, type DoseRecord } from "@/lib/doses";
import { getMedications, type Medication } from "@/lib/medications";
import { getPatients, type Patient } from "@/lib/patients";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

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

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            if (!user || !effectiveUserId) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                if (mounted) setLoading(true);
                const [dosesData, medicationsData, patientsData] = await Promise.all([
                    getDoses(effectiveUserId),
                    getMedications(effectiveUserId),
                    getPatients(effectiveUserId)
                ]);

                if (mounted) {
                    setDoses(dosesData || []);
                    setMedications(medicationsData || []);
                    setPatients(patientsData || []);
                }
            } catch (error) {
                console.error("Failed to load report data:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadData();
        return () => {
            mounted = false;
        };
    }, [user, effectiveUserId]);

    const filteredDoses = doses.filter((dose) => {
        if (!dose) return false;
        const doseDate = new Date(dose.timestamp);

        if (startDate && endDate) {
            if (!isWithinInterval(doseDate, { start: startOfDay(startDate), end: endOfDay(endDate) })) {
                return false;
            }
        } else if (startDate) {
            if (doseDate < startOfDay(startDate)) return false;
        }

        if (selectedPatient && selectedPatient !== "all" && dose.patientId !== selectedPatient) {
            return false;
        }

        return true;
    });

    const totalDoses = filteredDoses.length;
    const avgEfficacy = totalDoses > 0
        ? Math.round(filteredDoses.reduce((acc, dose) => {
            const efficacy = dose?.analysis?.efficacyPrediction ||
                ((dose?.subjectiveState?.energy || 0) * 10);
            return acc + (efficacy || 0);
        }, 0) / totalDoses)
        : 0;
    const chartData = filteredDoses
        .slice(0, 50)
        .reverse()
        .map((dose) => ({
            date: format(new Date(dose.timestamp), "dd/MM"),
            efficacy: dose?.analysis?.efficacyPrediction || ((dose?.subjectiveState?.energy || 0) * 10) || 0,
            dose: parseInt(dose?.doseAmount) || 0,
        }));
    const uniqueMedications = new Set(filteredDoses.map((dose) => dose.medicationId)).size;
    const avgMood = totalDoses > 0
        ? Math.round(filteredDoses.reduce((acc, dose) => acc + (dose?.subjectiveState?.mood || 0), 0) / totalDoses * 10) / 10
        : 0;
    const avgEnergy = totalDoses > 0
        ? Math.round(filteredDoses.reduce((acc, dose) => acc + (dose?.subjectiveState?.energy || 0), 0) / totalDoses * 10) / 10
        : 0;
    const lowMoodCount = doses.filter(
        (dose) => dose && dose.subjectiveState && dose.subjectiveState.mood < 5
    ).length || 0;

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
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
        patients,
        loading,
        filteredDoses,
        totalDoses,
        avgEfficacy,
        chartData,
        uniqueMedications,
        avgMood,
        avgEnergy,
        lowMoodCount,
    };
}
