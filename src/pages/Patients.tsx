import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import {
  Plus,
  Search,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import {
  savePatient,
  getPatients,
  deletePatient,
  type Patient,
} from "@/lib/patients";
import { getMedications, type Medication } from "@/lib/medications";
import {
  checkInteractions,
  resolvePatientActiveMedications,
} from "@/services/drugInteractions";
import { Check, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusStyles = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  monitoring: { label: "Monitorando", className: "bg-warning/10 text-warning border-warning/20" },
  critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Patients() {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // Modal de visualização
  const [patients, setPatients] = useState<Patient[]>([]);
  const [catalogMedications, setCatalogMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null); // Paciente em edição
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null); // Paciente em visualização

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as "Masculino" | "Feminino" | "Outro" | "",
    condition: "",
    clinicalHistory: "",
    allergies: "",
    activeMedicationIds: [] as string[],
    currentMedications: "",
  });

  // Carregar pacientes e catálogo de medicamentos do Firebase
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

  // Filtrar pacientes
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      condition: "",
      clinicalHistory: "",
      allergies: "",
      activeMedicationIds: [],
      currentMedications: "",
    });
    setEditingPatient(null); // Resetar edição
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

  // Alertas de interação em tempo real entre os medicamentos selecionados para o paciente
  const activePatientInteractions = checkInteractions(
    resolvePatientActiveMedications(
      {
        activeMedicationIds: formData.activeMedicationIds,
        currentMedications: formData.currentMedications,
      },
      catalogMedications
    )
  );

  // Preencher formulário para edição (migrando nomes legados quando coincidirem com o catálogo)
  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);

    const existingIds = new Set<string>(patient.activeMedicationIds || []);
    const remainingExtraMeds: string[] = [];

    if (patient.currentMedications) {
      const terms = patient.currentMedications
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      for (const term of terms) {
        const matched = catalogMedications.find(
          (m) => m.id && m.name.toLowerCase() === term.toLowerCase()
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

  // Abrir visualização
  const handleViewClick = (patient: Patient) => {
    setViewingPatient(patient);
    setIsViewDialogOpen(true);
  };

  // Salvar paciente (Criar ou Atualizar)
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
        .filter((m) => m.id && formData.activeMedicationIds.includes(m.id))
        .map((m) => m.name);

      const extraMeds = formData.currentMedications
        .split(",")
        .map((t) => t.trim())
        .filter(
          (t) =>
            Boolean(t) &&
            !selectedCatalogNames.some((n) => n.toLowerCase() === t.toLowerCase())
        );

      const combinedMedicationsSummary = [...selectedCatalogNames, ...extraMeds].join(", ");

      const patientData: Patient = {
        id: editingPatient?.id, // Manter ID se for edição
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as "Masculino" | "Feminino" | "Outro",
        condition: formData.condition,
        clinicalHistory: formData.clinicalHistory || undefined,
        allergies: formData.allergies || undefined,
        activeMedicationIds:
          formData.activeMedicationIds.length > 0 ? formData.activeMedicationIds : undefined,
        currentMedications: combinedMedicationsSummary || undefined,
      };

      const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
      await savePatient(patientData, effectiveUserId, userInfo);

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

  // Deletar paciente
  const handleDeletePatient = async (patientId: string) => {
    if (!user) return;

    if (!confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const patientToDelete = patients.find(p => p.id === patientId);
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

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 select-none">
        {/* Header Cirúrgico Suíço */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[11px] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>REGISTRO CLÍNICO // BANCO DE PACIENTES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Catálogo de Pacientes
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Gestão de prontuários neurológicos, esquemas farmacológicos e acompanhamento terapêutico.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="h-10 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-lg shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                  <Plus className="w-4 h-4 text-slate-950" aria-hidden="true" />
                  <span>Cadastrar Paciente</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-2xl border-border/80 rounded-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold">
                    {editingPatient ? "Atualizar Prontuário" : "Cadastrar Novo Paciente"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {editingPatient ? "Atualize as informações clínicas e prescritivas do paciente." : "Preencha a ficha clínica para inclusão no sistema neural."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-name">Nome Completo *</Label>
                      <Input
                        id="patient-name"
                        name="patientName"
                        autoComplete="name"
                        placeholder="Nome do paciente…"
                        maxLength={60}
                        value={formData.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
                            setFormData({ ...formData, name: value });
                          }
                        }}
                        className="h-11"
                      />
                      <p className={cn(
                        "text-xs",
                        formData.name.length >= 60
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      )}>
                        {formData.name.length}/60 caracteres
                        {formData.name.length >= 60 && " — limite atingido"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-age">Idade *</Label>
                      <Input
                        id="patient-age"
                        name="patientAge"
                        type="number"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Ex.: 32…"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        className="h-11 tabular-nums"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-gender">Gênero *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            gender: value as "Masculino" | "Feminino" | "Outro",
                          })
                        }
                      >
                        <SelectTrigger id="patient-gender" className="h-11">
                          <SelectValue placeholder="Selecione…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-condition">Condição Principal *</Label>
                      <Input
                        id="patient-condition"
                        name="patientCondition"
                        autoComplete="off"
                        placeholder="Ex.: TDAH, depressão…"
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({ ...formData, condition: e.target.value })
                        }
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-history">Histórico Clínico</Label>
                    <Textarea
                      id="patient-history"
                      name="patientClinicalHistory"
                      autoComplete="off"
                      placeholder="Descreva o histórico clínico relevante…"
                      rows={3}
                      value={formData.clinicalHistory}
                      onChange={(e) =>
                        setFormData({ ...formData, clinicalHistory: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-allergies">Sensibilidades / Alergias</Label>
                    <Input
                      id="patient-allergies"
                      name="patientAllergies"
                      autoComplete="off"
                      placeholder="Liste sensibilidades conhecidas…"
                      value={formData.allergies}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-ZÀ-ÿ\s,]*$/.test(value)) {
                          setFormData({ ...formData, allergies: value });
                        }
                      }}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Prescrições Ativas do Catálogo</Label>
                    {catalogMedications.length > 0 ? (
                      <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-muted/20 max-h-40 overflow-y-auto">
                        {catalogMedications.map((med) => {
                          if (!med.id) return null;
                          const isSelected = formData.activeMedicationIds.includes(med.id);
                          return (
                            <button
                              key={med.id}
                              type="button"
                              onClick={() => toggleActiveMedication(med.id!)}
                              aria-pressed={isSelected}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card text-foreground border-border hover:border-primary/50"
                              )}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                              <span>{med.name}</span>
                              <span className={cn("text-[11px]", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                ({med.minDose}–{med.maxDose}{med.unit})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Nenhum medicamento cadastrado no catálogo ainda. Você pode informar co-medicações abaixo.
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="patient-current-meds" className="text-xs text-muted-foreground">
                        Outras Medicações Concomitantes (uso clínico geral, separadas por vírgula)
                      </Label>
                      <Textarea
                        id="patient-current-meds"
                        name="patientCurrentMedications"
                        autoComplete="off"
                        placeholder="Ex.: Losartana, Ibuprofeno, Metformina…"
                        rows={2}
                        value={formData.currentMedications}
                        onChange={(e) =>
                          setFormData({ ...formData, currentMedications: e.target.value })
                        }
                      />
                    </div>

                    {activePatientInteractions.length > 0 && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>
                            {activePatientInteractions.length} interação(ões) detectada(s) neste prontuário
                          </span>
                        </div>
                        {activePatientInteractions.map((inter) => (
                          <p key={inter.id} className="text-xs text-muted-foreground">
                            <strong>{inter.medicationA} + {inter.medicationB}</strong> ({inter.severity}): {inter.description}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={saving}
                    className="h-11"
                  >
                    Cancelar
                  </Button>
                  <Button variant="neuro" onClick={handleSavePatient} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando…
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        {editingPatient ? "Atualizar" : "Cadastrar"}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dialog de Visualização de Perfil */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {viewingPatient?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-display">{viewingPatient?.name}</DialogTitle>
                    <DialogDescription className="text-base text-foreground/80">
                      {viewingPatient?.age} anos • {viewingPatient?.gender}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {viewingPatient && (
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Condição</Label>
                      <p className="font-medium">{viewingPatient.condition}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                      <Badge variant="outline" className="bg-success/5 text-success border-success/20">
                        Ativo
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Medicamentos Atuais</Label>
                    {viewingPatient.currentMedications ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewingPatient.currentMedications.split(',').map((med, i) => (
                          <Badge key={i} variant="secondary">{med.trim()}</Badge>
                        ))}
                      </div>
                    ) : <p className="text-sm text-muted-foreground">-</p>}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Histórico Clínico</Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-sm leading-relaxed">
                      {viewingPatient.clinicalHistory || "Sem histórico registrado."}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Alergias / Sensibilidades</Label>
                    <p className="text-sm">{viewingPatient.allergies || "Nenhuma registrada."}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="h-11">Fechar</Button>
                <Button variant="neuro" onClick={() => {
                  setIsViewDialogOpen(false);
                  if (viewingPatient) handleEditClick(viewingPatient);
                }}>
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  Editar Perfil
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>

        {/* Grid de Métricas do Catálogo (Bento Grid Suíço) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="nd-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total Cadastrado</p>
                <p className="text-2xl font-bold font-mono tracking-tight mt-1 text-foreground">{patients.length}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-teal-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="nd-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Filtrados</p>
                <p className="text-2xl font-bold font-mono tracking-tight mt-1 text-foreground">{filteredPatients.length}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Search className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="nd-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Monitoramento</p>
                <p className="text-2xl font-bold font-mono tracking-tight mt-1 text-emerald-400">Ativo</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Eye className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="nd-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Protocolo</p>
                <p className="text-2xl font-bold font-mono tracking-tight mt-1 text-teal-400">CFM/LGPD</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Filter className="w-4 h-4 text-violet-400" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca Minimalista */}
        <div className="nd-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="patient-search"
                name="patientSearch"
                autoComplete="off"
                placeholder="Filtrar por nome de paciente, prontuário ou identificador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-border/80 text-sm rounded-lg focus:border-teal-400"
              />
            </div>
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 text-xs font-mono uppercase text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
              >
                Limpar Busca
              </Button>
            )}
          </div>
        </div>

        {/* Tabela de Prontuários Cirúrgica */}
        {loading ? (
          <div className="nd-card p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--nd-primary)]" aria-hidden="true" />
            <span className="text-[var(--nd-text-secondary)] text-sm">Carregando prontuários...</span>
          </div>
        ) : (
          <div className="nd-card overflow-hidden">
            <Table>
              <TableHeader className="bg-[var(--nd-bg)]">
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Paciente</TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Condição</TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Medicamentos</TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Cadastro</TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Eficácia</TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum paciente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/40 transition-colors border-border/60">
                      <TableCell onClick={() => handleViewClick(patient)}>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 ring-1 ring-border">
                            <AvatarFallback className="bg-teal-500/10 text-teal-400 font-mono text-xs font-bold">
                              {patient.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{patient.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {patient.age} anos • {patient.gender}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewClick(patient)}>{patient.condition}</TableCell>
                      <TableCell onClick={() => handleViewClick(patient)}>
                        {patient.currentMedications ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.currentMedications.split(",").map((med, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {med.trim()}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.createdAt
                          ? new Date(patient.createdAt).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <EfficacyRing value={85} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles.active.className}>
                          {statusStyles.active.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Ações para ${patient.name}`}>
                              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClick(patient)}>
                              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(patient)}>
                              <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => patient.id && handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout >
  );
}
