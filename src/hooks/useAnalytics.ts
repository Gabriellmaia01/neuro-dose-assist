import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getDoses, type DoseRecord } from "@/lib/doses";
import { getMedications, type Medication } from "@/lib/medications";
import { getPatients, type Patient } from "@/lib/patients";
import {
    aggregateMetrics,
    calculateTrendData,
    generatePredictiveInsights,
    getPatientInsights,
    identifyRiskPatterns,
} from "@/lib/analytics";

export function useAnalytics() {
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();
    const [doses, setDoses] = useState<DoseRecord[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState("all");
    const [periodInDays, setPeriodInDays] = useState("30");

    const loadData = useCallback(async (showRefresh = false) => {
        if (!user || !effectiveUserId) return;

        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [doseData, patientData, medicationData] = await Promise.all([
                getDoses(effectiveUserId),
                getPatients(effectiveUserId),
                getMedications(effectiveUserId)
            ]);

            setDoses(doseData || []);
            setPatients(patientData || []);
            setMedications(medicationData || []);
        } catch (error) {
            console.error("Erro ao carregar dados de analytics:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, effectiveUserId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredDoses = useMemo(() => {
        if (selectedPatient === "all") return doses;
        return doses.filter((dose) => dose.patientId === selectedPatient);
    }, [doses, selectedPatient]);

    const metrics = useMemo(
        () => aggregateMetrics(filteredDoses, patients),
        [filteredDoses, patients]
    );

    const trendData = useMemo(
        () => calculateTrendData(filteredDoses, parseInt(periodInDays)),
        [filteredDoses, periodInDays]
    );

    const riskAlerts = useMemo(
        () => identifyRiskPatterns(filteredDoses, patients),
        [filteredDoses, patients]
    );

    const patientAnalytics = useMemo(() => {
        const patientsWithDoses = new Set(doses.map((dose) => dose.patientId));
        return patients
            .filter((patient) => patient.id && patientsWithDoses.has(patient.id))
            .map((patient) => getPatientInsights(patient.id!, patient.name, doses));
    }, [doses, patients]);

    const predictiveInsights = useMemo(
        () => generatePredictiveInsights(
            selectedPatient === "all" ? null : selectedPatient,
            filteredDoses,
            medications
        ),
        [filteredDoses, medications, selectedPatient]
    );

    const reload = () => loadData(true);

    return {
        patients,
        loading,
        refreshing,
        reload,
        selectedPatient,
        setSelectedPatient,
        periodInDays,
        setPeriodInDays,
        metrics,
        trendData,
        riskAlerts,
        patientAnalytics,
        predictiveInsights,
    };
}
