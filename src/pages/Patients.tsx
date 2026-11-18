import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
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
  Upload,
  Loader2,
  Image as ImageIcon,
  Moon,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import {
  savePatient,
  uploadPatientPhoto,
  getPatients,
  deletePatient,
  type Patient,
} from "@/lib/patients";
import { toast } from "@/hooks/use-toast";

const statusStyles = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  monitoring: { label: "Monitorando", className: "bg-warning/10 text-warning border-warning/20" },
  critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Patients() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // Modal de visualização
  const [patients, setPatients] = useState<Patient[]>([]);
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
    currentMedications: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Carregar pacientes do Firebase
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
      currentMedications: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingPatient(null); // Resetar edição
  };

  // Preencher formulário para edição
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
    setPhotoFile(null); // Resetar arquivo novo, manter preview atual
    setIsDialogOpen(true);
  };

  // Abrir visualização
  const handleViewClick = (patient: Patient) => {
    setViewingPatient(patient);
    setIsViewDialogOpen(true);
  };

  // Handle file change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

      const patientData: Patient = {
        id: editingPatient?.id, // Manter ID se for edição
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as "Masculino" | "Feminino" | "Outro",
        condition: formData.condition,
        clinicalHistory: formData.clinicalHistory || undefined,
        allergies: formData.allergies || undefined,
        currentMedications: formData.currentMedications || undefined,
        photoURL: editingPatient?.photoURL // Manter foto antiga se não houver nova
      };
      console.log("Dados do paciente:", patientData);

      // Salvar (upsert)
      console.log("Chamando savePatient...");
      const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
      const patientId = await savePatient(patientData, effectiveUserId, userInfo);
      console.log("Paciente salvo com ID:", patientId);

      if (photoFile && patientId) {
        try {
          console.log("Iniciando upload da foto...");
          const photoURL = await uploadPatientPhoto(photoFile, effectiveUserId, patientId);
          console.log("Foto enviada, atualizando URL...");
          // Atualizar com nova foto
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
                  {/* Upload de Foto */}
                  <div className="space-y-2">
                    <Label htmlFor="photo-upload">Foto do Paciente</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {photoPreview ? (
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={photoPreview} alt="Foto do paciente" />
                            <AvatarFallback>
                              <User className="w-10 h-10" aria-hidden="true" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          id="photo-upload"
                          name="photoUpload"
                        />
                        <Label
                          htmlFor="photo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
                        >
                          <Upload className="w-4 h-4" aria-hidden="true" />
                          {photoFile ? "Alterar Foto" : "Adicionar Foto"}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG ou GIF. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

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
                  <div className="space-y-2">
                    <Label htmlFor="patient-current-meds">Medicamentos em Uso</Label>
                    <Textarea
                      id="patient-current-meds"
                      name="patientCurrentMedications"
                      autoComplete="off"
                      placeholder="Liste os medicamentos atuais…"
                      rows={2}
                      value={formData.currentMedications}
                      onChange={(e) =>
                        setFormData({ ...formData, currentMedications: e.target.value })
                      }
                    />
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
                    <AvatarImage src={viewingPatient?.photoURL} alt={viewingPatient?.name || "Paciente"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {viewingPatient?.name?.[0]}
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
          <div className="rounded-xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-4 shadow-sm">
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

          <div className="rounded-xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-4 shadow-sm">
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

          <div className="rounded-xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-4 shadow-sm">
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

          <div className="rounded-xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-4 shadow-sm">
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
        <div className="rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm">
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
          <div className="rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-teal-400" aria-hidden="true" />
            <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Carregando prontuários...</span>
          </div>
        ) : (
          <div className="rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30 dark:bg-slate-950/40">
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
                            <AvatarImage src={patient.photoURL} alt={patient.name} />
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
