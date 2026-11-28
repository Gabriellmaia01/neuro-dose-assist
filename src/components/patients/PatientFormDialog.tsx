import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PatientFormData } from "@/hooks/usePatients";
import type { Medication } from "@/lib/medications";
import type { Patient } from "@/lib/patients";
import type { InteractionAlert } from "@/services/drugInteractions";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Loader2, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function PatientFormDialog({
    open,
    onOpenChange,
    onReset,
    editingPatient,
    formData,
    setFormData,
    catalogMedications,
    activePatientInteractions,
    onToggleMedication,
    saving,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReset: () => void;
    editingPatient: Patient | null;
    formData: PatientFormData;
    setFormData: Dispatch<SetStateAction<PatientFormData>>;
    catalogMedications: Medication[];
    activePatientInteractions: InteractionAlert[];
    onToggleMedication: (medicationId: string) => void;
    saving: boolean;
    onSave: () => void;
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) onReset();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="default" onClick={onReset} className="h-11">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Novo Paciente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        {editingPatient ? "Editar Paciente" : "Cadastrar Paciente"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingPatient ? "Atualize os dados do paciente" : "Preencha os dados do novo paciente"}
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
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (/^[a-zA-ZÀ-ÿ\s'-]*$/.test(value)) {
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
                                onChange={(event) =>
                                    setFormData({ ...formData, age: event.target.value })
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
                                onChange={(event) =>
                                    setFormData({ ...formData, condition: event.target.value })
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
                            onChange={(event) =>
                                setFormData({ ...formData, clinicalHistory: event.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient-allergies">Sensibilidades / Alergias</Label>
                        <Input
                            id="patient-allergies"
                            name="patientAllergies"
                            autoComplete="off"
                            placeholder="Ex.: Dipirona 500 mg, Corante INS 102…"
                            value={formData.allergies}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (/^[a-zA-ZÀ-ÿ0-9\s,.;:/()%+-]*$/.test(value)) {
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
                                            onClick={() => onToggleMedication(med.id!)}
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
                                onChange={(event) =>
                                    setFormData({ ...formData, currentMedications: event.target.value })
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
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                        className="h-11"
                    >
                        Cancelar
                    </Button>
                    <Button variant="default" onClick={onSave} disabled={saving}>
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
    );
}
