import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { Patient } from "@/lib/patients";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Loader2, Plus, Upload, User } from "lucide-react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

type PatientFormData = {
    name: string;
    age: string;
    gender: "Masculino" | "Feminino" | "Outro" | "";
    condition: string;
    clinicalHistory: string;
    allergies: string;
    currentMedications: string;
};

export function PatientFormDialog({
    open,
    onOpenChange,
    onReset,
    editingPatient,
    formData,
    setFormData,
    photoFile,
    photoPreview,
    onPhotoChange,
    saving,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReset: () => void;
    editingPatient: Patient | null;
    formData: PatientFormData;
    setFormData: Dispatch<SetStateAction<PatientFormData>>;
    photoFile: File | null;
    photoPreview: string | null;
    onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
                <Button variant="neuro" onClick={onReset} className="h-11">
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
                                    onChange={onPhotoChange}
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
                                onChange={(event) => {
                                    const value = event.target.value;
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
                            placeholder="Liste sensibilidades conhecidas…"
                            value={formData.allergies}
                            onChange={(event) => {
                                const value = event.target.value;
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
                            onChange={(event) =>
                                setFormData({ ...formData, currentMedications: event.target.value })
                            }
                        />
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
                    <Button variant="neuro" onClick={onSave} disabled={saving}>
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
