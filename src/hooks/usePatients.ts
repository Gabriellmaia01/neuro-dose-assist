import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { toast } from "@/hooks/use-toast";
import {
    deletePatient,
    getPatients,
    savePatient,
    type Patient,
} from "@/lib/patients";
import { getMedications, type Medication } from "@/lib/medications";
import {
    checkInteractions,
    resolvePatientActiveMedications,
} from "@/services/drugInteractions";

export type PatientFormData = {
    name: string;
    age: string;
    gender: "Masculino" | "Feminino" | "Outro" | "";
    condition: string;
    clinicalHistory: string;
    allergies: string;
    activeMedicationIds: string[];
    currentMedications: string;
};

const EMPTY_FORM: PatientFormData = {
    name: "",
    age: "",
    gender: "",
    condition: "",
    clinicalHistory: "",
    allergies: "",
    activeMedicationIds: [],
    currentMedications: "",
};

export function usePatients() {
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [catalogMedications, setCatalogMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<PatientFormData>(EMPTY_FORM);

    useEffect(() => {
        const loadPatients = async () => {
            if (!user || !effectiveUserId) return;

            try {
                setLoading(true);
                const [patientsData, medicationsData] = await Promise.all([
                    getPatients(effectiveUserId),
                    getMedications(effectiveUserId).catch(() => [] as Medication[]),
                ]);
                setPatients(patientsData);
                setCatalogMedications(medicationsData);
            } catch (error: unknown) {
                console.error("Erro ao carregar pacientes:", error);

                const errorObj = (typeof error === "object" && error !== null ? error : {}) as Record<string, unknown>;
                const errorCode = typeof errorObj.code === "string" ? errorObj.code : "";
                const errorMessage = typeof errorObj.message === "string" ? errorObj.message : "";
                const isPermissionError =
                    errorCode.includes("permission") ||
                    errorCode.includes("PERMISSION") ||
                    errorMessage.includes("permission") ||
                    errorCode.includes("database") ||
                    errorMessage.includes("database");

                if (!isPermissionError) {
                    toast({
                        title: "Erro ao carregar pacientes",
                        description: "Não foi possível carregar a lista de pacientes.",
                        variant: "destructive",
                    });
                }
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, [user, effectiveUserId]);

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ ...EMPTY_FORM, activeMedicationIds: [] });
        setEditingPatient(null);
    };

    const toggleActiveMedication = (medicationId: string) => {
        setFormData((prev) => {
            const exists = prev.activeMedicationIds.includes(medicationId);
            const nextIds = exists
                ? prev.activeMedicationIds.filter((id) => id !== medicationId)
                : [...prev.activeMedicationIds, medicationId];
            return { ...prev, activeMedicationIds: nextIds };
        });
    };

    const activePatientInteractions = checkInteractions(
        resolvePatientActiveMedications(
            {
                activeMedicationIds: formData.activeMedicationIds,
                currentMedications: formData.currentMedications,
            },
            catalogMedications
        )
    );

    const handleEditClick = (patient: Patient) => {
        setEditingPatient(patient);

        const existingIds = new Set<string>(patient.activeMedicationIds || []);
        const remainingExtraMeds: string[] = [];

        if (patient.currentMedications) {
            const terms = patient.currentMedications
                .split(",")
                .map((term) => term.trim())
                .filter(Boolean);

            for (const term of terms) {
                const matched = catalogMedications.find(
                    (med) => med.id && med.name.toLowerCase() === term.toLowerCase()
                );
                if (matched?.id) {
                    existingIds.add(matched.id);
                } else {
                    remainingExtraMeds.push(term);
                }
            }
        }

        setFormData({
            name: patient.name,
            age: patient.age.toString(),
            gender: patient.gender,
            condition: patient.condition,
            clinicalHistory: patient.clinicalHistory || "",
            allergies: patient.allergies || "",
            activeMedicationIds: Array.from(existingIds),
            currentMedications: remainingExtraMeds.join(", "),
        });
        setIsDialogOpen(true);
    };

    const handleViewClick = (patient: Patient) => {
        setViewingPatient(patient);
        setIsViewDialogOpen(true);
    };

    const handleSavePatient = async () => {
        if (!user) {
            toast({
                title: "Erro",
                description: "Você precisa estar logado para cadastrar pacientes.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.name || !formData.age || !formData.gender || !formData.condition) {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);

            const selectedCatalogNames = catalogMedications
                .filter((med) => med.id && formData.activeMedicationIds.includes(med.id))
                .map((med) => med.name);

            const extraMeds = formData.currentMedications
                .split(",")
                .map((term) => term.trim())
                .filter(
                    (term) =>
                        Boolean(term) &&
                        !selectedCatalogNames.some(
                            (name) => name.toLowerCase() === term.toLowerCase()
                        )
                );

            const combinedMedicationsSummary = [...selectedCatalogNames, ...extraMeds].join(", ");

            const patientData: Patient = {
                id: editingPatient?.id,
                name: formData.name,
                age: parseInt(formData.age),
                gender: formData.gender as "Masculino" | "Feminino" | "Outro",
                condition: formData.condition,
                clinicalHistory: formData.clinicalHistory || undefined,
                allergies: formData.allergies || undefined,
                activeMedicationIds:
                    formData.activeMedicationIds.length > 0
                        ? formData.activeMedicationIds
                        : undefined,
                currentMedications: combinedMedicationsSummary || undefined,
            };

            const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
            await savePatient(patientData, effectiveUserId, userInfo);

            toast({
                title: editingPatient ? "Paciente atualizado!" : "Paciente cadastrado!",
                description: `${formData.name} foi ${editingPatient ? "atualizado" : "criado"} com sucesso.`,
            });

            const patientsData = await getPatients(effectiveUserId);
            setPatients(patientsData);
            setIsDialogOpen(false);
            resetForm();
        } catch (error: unknown) {
            console.error("Erro ao salvar paciente:", error);
            const errorObj = (typeof error === "object" && error !== null ? error : {}) as Record<string, unknown>;
            const message = typeof errorObj.message === "string" ? errorObj.message : "";
            toast({
                title: "Erro ao salvar",
                description: message || "Não foi possível salvar os dados.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePatient = async (patientId: string) => {
        if (!user) return;

        if (!confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            const patientToDelete = patients.find((patient) => patient.id === patientId);
            const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
            await deletePatient(patientId, effectiveUserId, patientToDelete?.name, userInfo);
            toast({
                title: "Paciente excluído",
                description: "O paciente foi excluído com sucesso.",
            });

            const patientsData = await getPatients(effectiveUserId);
            setPatients(patientsData);
        } catch (error) {
            console.error("Erro ao deletar paciente:", error);
            toast({
                title: "Erro ao excluir",
                description: "Não foi possível excluir o paciente.",
                variant: "destructive",
            });
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        isDialogOpen,
        setIsDialogOpen,
        isViewDialogOpen,
        setIsViewDialogOpen,
        patients,
        catalogMedications,
        loading,
        saving,
        editingPatient,
        viewingPatient,
        formData,
        setFormData,
        filteredPatients,
        activePatientInteractions,
        toggleActiveMedication,
        resetForm,
        handleEditClick,
        handleViewClick,
        handleSavePatient,
        handleDeletePatient,
    };
}
