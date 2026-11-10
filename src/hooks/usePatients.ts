import { useEffect, useState, type ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { toast } from "@/hooks/use-toast";
import {
    deletePatient,
    getPatients,
    savePatient,
    uploadPatientPhoto,
    type Patient,
} from "@/lib/patients";

type PatientFormData = {
    name: string;
    age: string;
    gender: "Masculino" | "Feminino" | "Outro" | "";
    condition: string;
    clinicalHistory: string;
    allergies: string;
    currentMedications: string;
};

const EMPTY_FORM: PatientFormData = {
    name: "",
    age: "",
    gender: "",
    condition: "",
    clinicalHistory: "",
    allergies: "",
    currentMedications: "",
};

export function usePatients() {
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<PatientFormData>(EMPTY_FORM);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        const loadPatients = async () => {
            if (!user || !effectiveUserId) return;

            try {
                setLoading(true);
                const patientsData = await getPatients(effectiveUserId);
                setPatients(patientsData);
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
        setFormData({ ...EMPTY_FORM });
        setPhotoFile(null);
        setPhotoPreview(null);
        setEditingPatient(null);
    };

    const handleEditClick = (patient: Patient) => {
        setEditingPatient(patient);
        setFormData({
            name: patient.name,
            age: patient.age.toString(),
            gender: patient.gender,
            condition: patient.condition,
            clinicalHistory: patient.clinicalHistory || "",
            allergies: patient.allergies || "",
            currentMedications: patient.currentMedications || "",
        });
        setPhotoPreview(patient.photoURL || null);
        setPhotoFile(null);
        setIsDialogOpen(true);
    };

    const handleViewClick = (patient: Patient) => {
        setViewingPatient(patient);
        setIsViewDialogOpen(true);
    };

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Arquivo inválido",
                    description: "Por favor, selecione uma imagem.",
                    variant: "destructive",
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Arquivo muito grande",
                    description: "A imagem deve ter no máximo 5MB.",
                    variant: "destructive",
                });
                return;
            }

            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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

            const patientData: Patient = {
                id: editingPatient?.id,
                name: formData.name,
                age: parseInt(formData.age),
                gender: formData.gender as "Masculino" | "Feminino" | "Outro",
                condition: formData.condition,
                clinicalHistory: formData.clinicalHistory || undefined,
                allergies: formData.allergies || undefined,
                currentMedications: formData.currentMedications || undefined,
                photoURL: editingPatient?.photoURL
            };
            console.log("Dados do paciente:", patientData);

            console.log("Chamando savePatient...");
            const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
            const patientId = await savePatient(patientData, effectiveUserId, userInfo);
            console.log("Paciente salvo com ID:", patientId);

            if (photoFile && patientId) {
                try {
                    console.log("Iniciando upload da foto...");
                    const photoURL = await uploadPatientPhoto(photoFile, effectiveUserId, patientId);
                    console.log("Foto enviada, atualizando URL...");
                    await savePatient({ ...patientData, id: patientId, photoURL }, effectiveUserId, userInfo);
                    console.log("URL da foto salva no banco.");
                } catch (error) {
                    console.error("Erro ao fazer upload da foto:", error);
                    toast({
                        title: "Aviso",
                        description: "Paciente salvo, mas erro ao atualizar foto (verifique o console).",
                    });
                }
            }

            toast({
                title: editingPatient ? "Paciente atualizado!" : "Paciente cadastrado!",
                description: `${formData.name} foi ${editingPatient ? 'atualizado' : 'criado'} com sucesso.`,
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
        loading,
        saving,
        editingPatient,
        viewingPatient,
        formData,
        setFormData,
        photoFile,
        photoPreview,
        filteredPatients,
        resetForm,
        handleEditClick,
        handleViewClick,
        handlePhotoChange,
        handleSavePatient,
        handleDeletePatient,
    };
}
