import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  deleteMedication,
  getMedications,
  saveMedication,
  type Medication,
} from "@/lib/medications";
import { formMap, therapeuticClassMap } from "@/lib/medicationCatalog";
import { checkInteractions } from "@/services/drugInteractions";

export interface MedicationFormData {
  name: string;
  brandName: string;
  activeIngredient: string;
  therapeuticClass: string;
  form: string;
  minDose: string;
  maxDose: string;
  unit: string;
}

const EMPTY_FORM: MedicationFormData = {
  name: "",
  brandName: "",
  activeIngredient: "",
  therapeuticClass: "",
  form: "",
  minDose: "",
  maxDose: "",
  unit: "mg",
};

export function useMedications() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingMedication, setViewingMedication] = useState<Medication | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [formData, setFormData] = useState<MedicationFormData>(EMPTY_FORM);

  const interactionAlerts = useMemo(() => {
    if (medications.length < 2) return [];
    const alerts = checkInteractions(medications);
    return alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  }, [medications, dismissedAlerts]);

  useEffect(() => {
    const loadMedications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const medicationsData = await getMedications(user.uid);
        setMedications(medicationsData);
      } catch (error: unknown) {
        console.error("Erro ao carregar medicamentos:", error);

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
            title: "Erro ao carregar medicamentos",
            description: "Não foi possível carregar a lista de medicamentos.",
            variant: "destructive",
          });
        }

        setMedications([]);
      } finally {
        setLoading(false);
      }
    };

    loadMedications();
  }, [user]);

  const toggleClass = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClasses.length === 0 ||
      selectedClasses.includes(med.therapeuticClass);
    return matchesSearch && matchesClass;
  });

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (medication: Medication) => {
    setEditingId(medication.id || null);
    const therapeuticClassKey = Object.keys(therapeuticClassMap).find(
      key => therapeuticClassMap[key] === medication.therapeuticClass
    ) || medication.therapeuticClass;
    const formKey = Object.keys(formMap).find(
      key => formMap[key] === medication.form
    ) || medication.form;

    setFormData({
      name: medication.name,
      brandName: medication.brandName,
      activeIngredient: medication.activeIngredient,
      therapeuticClass: therapeuticClassKey,
      form: formKey,
      minDose: medication.minDose.toString(),
      maxDose: medication.maxDose.toString(),
      unit: medication.unit,
    });
    setIsDialogOpen(true);
  };

  const handleView = (medication: Medication) => setViewingMedication(medication);

  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication);
    setIsDeleteOpen(true);
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const confirmDelete = async () => {
    if (!user || !medicationToDelete?.id) return;

    try {
      const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
      await deleteMedication(medicationToDelete.id, user.uid, medicationToDelete.name, userInfo);
      toast({
        title: "Medicamento excluído",
        description: "O medicamento foi removido com sucesso.",
      });
      setMedications(medications.filter(m => m.id !== medicationToDelete.id));
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o medicamento.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setMedicationToDelete(null);
    }
  };

  const handleSaveMedication = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar medicamentos.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.name ||
      !formData.brandName ||
      !formData.activeIngredient ||
      !formData.therapeuticClass ||
      !formData.form ||
      !formData.minDose ||
      !formData.maxDose ||
      !formData.unit
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = medications.some(
      med =>
        med.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        med.id !== editingId
    );

    if (isDuplicate) {
      toast({
        title: "Medicamento já cadastrado",
        description: `O medicamento "${formData.name}" já existe no catálogo.`,
        variant: "destructive",
      });
      return;
    }

    const minDose = parseFloat(formData.minDose);
    const maxDose = parseFloat(formData.maxDose);

    if (isNaN(minDose) || isNaN(maxDose)) {
      toast({
        title: "Doses inválidas",
        description: "As doses devem ser números válidos.",
        variant: "destructive",
      });
      return;
    }

    if (minDose < 0 || maxDose < 0) {
      toast({
        title: "Doses inválidas",
        description: "As doses não podem ser negativas.",
        variant: "destructive",
      });
      return;
    }

    if (minDose >= maxDose) {
      toast({
        title: "Doses inválidas",
        description: "A dose mínima deve ser menor que a dose máxima.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const medicationData: Medication = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name,
        brandName: formData.brandName,
        activeIngredient: formData.activeIngredient,
        therapeuticClass: therapeuticClassMap[formData.therapeuticClass] || formData.therapeuticClass,
        form: formMap[formData.form] || formData.form,
        minDose,
        maxDose,
        unit: formData.unit,
      };

      const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
      await saveMedication(medicationData, user.uid, userInfo);
      toast({
        title: editingId ? "Medicamento atualizado!" : "Medicamento cadastrado!",
        description: `${formData.name} foi ${editingId ? "atualizado" : "cadastrado"} com sucesso.`,
      });

      const medicationsData = await getMedications(user.uid);
      setMedications(medicationsData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Erro ao salvar medicamento:", error);

      const errorObj = (typeof error === "object" && error !== null ? error : {}) as Record<string, unknown>;
      const code = typeof errorObj.code === "string" ? errorObj.code : "";
      const message = typeof errorObj.message === "string" ? errorObj.message : "";
      let errorMessage = "Não foi possível cadastrar o medicamento. Tente novamente.";

      if (message) {
        errorMessage = message;
      } else if (code) {
        if (code.includes("permission")) {
          errorMessage = "Permissão negada. Verifique as regras do Realtime Database no Firebase Console.";
        } else if (code.includes("database")) {
          errorMessage = "Realtime Database não está configurado. Configure no Firebase Console.";
        }
      }

      toast({
        title: "Erro ao salvar medicamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    medications,
    loading,
    saving,
    editingId,
    viewingMedication,
    setViewingMedication,
    isDeleteOpen,
    setIsDeleteOpen,
    medicationToDelete,
    isFilterOpen,
    setIsFilterOpen,
    selectedClasses,
    setSelectedClasses,
    formData,
    setFormData,
    interactionAlerts,
    handleDismissAlert,
    toggleClass,
    filteredMedications,
    resetForm,
    handleEdit,
    handleView,
    handleDelete,
    confirmDelete,
    handleSaveMedication,
  };
}
