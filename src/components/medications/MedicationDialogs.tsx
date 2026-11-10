import { Badge } from "@/components/ui/badge";
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
import type { Medication } from "@/lib/medications";
import { therapeuticClassColors } from "@/lib/medicationCatalog";
import type { MedicationFormData } from "@/hooks/useMedications";
import { Loader2, Pill, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function MedicationFormDialog({
  open,
  onOpenChange,
  editingId,
  formData,
  setFormData,
  saving,
  onSave,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: MedicationFormData;
  setFormData: Dispatch<SetStateAction<MedicationFormData>>;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
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
        <Button variant="neuro" className="h-11">
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Novo Medicamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingId ? "Editar Medicamento" : "Cadastrar Medicamento"}
          </DialogTitle>
          <DialogDescription>
            {editingId ? "Atualize os dados do medicamento." : "Adicione um novo medicamento ao catálogo."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Nome Genérico *</Label>
              <Input
                id="med-name"
                name="medName"
                autoComplete="off"
                placeholder="Ex.: Metilfenidato…"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-brand">Nome Comercial *</Label>
              <Input
                id="med-brand"
                name="medBrand"
                autoComplete="off"
                placeholder="Ex.: Ritalina…"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="med-active">Princípio Ativo *</Label>
            <Input
              id="med-active"
              name="medActiveIngredient"
              autoComplete="off"
              placeholder="Ex.: Cloridrato de metilfenidato…"
              value={formData.activeIngredient}
              onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-class">Classe Terapêutica *</Label>
              <Select
                value={formData.therapeuticClass}
                onValueChange={(value) => setFormData({ ...formData, therapeuticClass: value })}
              >
                <SelectTrigger id="med-class" className="h-11">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stimulant">Psicoestimulante</SelectItem>
                  <SelectItem value="antidepressant-irsn">Antidepressivo IRSN</SelectItem>
                  <SelectItem value="antidepressant-isrs">Antidepressivo ISRS</SelectItem>
                  <SelectItem value="antipsychotic">Antipsicótico Atípico</SelectItem>
                  <SelectItem value="stabilizer">Estabilizador de Humor</SelectItem>
                  <SelectItem value="benzo">Benzodiazepínico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-form">Forma Farmacêutica *</Label>
              <Select
                value={formData.form}
                onValueChange={(value) => setFormData({ ...formData, form: value })}
              >
                <SelectTrigger id="med-form" className="h-11">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tablet">Comprimido</SelectItem>
                  <SelectItem value="capsule">Cápsula</SelectItem>
                  <SelectItem value="solution">Solução</SelectItem>
                  <SelectItem value="injection">Injetável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-min">Dose Mínima *</Label>
              <Input
                id="med-min"
                name="medMinDose"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoComplete="off"
                placeholder="Ex.: 5…"
                value={formData.minDose}
                onChange={(e) => setFormData({ ...formData, minDose: e.target.value })}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                className="h-11 tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-max">Dose Máxima *</Label>
              <Input
                id="med-max"
                name="medMaxDose"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoComplete="off"
                placeholder="Ex.: 60…"
                value={formData.maxDose}
                onChange={(e) => setFormData({ ...formData, maxDose: e.target.value })}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                className="h-11 tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-unit">Unidade *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger id="med-unit" className="h-11">
                  <SelectValue placeholder="mg" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="mcg">mcg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onReset();
            }}
            disabled={saving}
            className="h-11"
          >
            Cancelar
          </Button>
          <Button variant="neuro" onClick={onSave} disabled={saving} className="h-11">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Salvando…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                {editingId ? "Atualizar" : "Cadastrar"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MedicationDetailsDialog({
  medication,
  onClose,
}: {
  medication: Medication | null;
  onClose: () => void;
}) {
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
  return (
    <Dialog open={!!medication} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-display">Detalhes do Medicamento</DialogTitle>
        </DialogHeader>
        {medication && (
          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">{medication.name}</h3>
                <p className="text-muted-foreground">{medication.brandName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Princípio Ativo</Label>
                <p className="font-medium">{medication.activeIngredient}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Classe Terapêutica</Label>
                <Badge variant="outline" className={therapeuticClassColors[medication.therapeuticClass]}>
                  {medication.therapeuticClass}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Forma Farmacêutica</Label>
                <p className="font-medium">{medication.form}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Dosagem</Label>
                <p className="font-medium">
                  {medication.minDose} - {medication.maxDose} {medication.unit}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t text-sm text-muted-foreground flex justify-between">
              <span>ID: {medication.id}</span>
              <span>
                Cadastrado em: {medication.createdAt ? dateFormatter.format(new Date(medication.createdAt)) : "—"}
              </span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose} className="h-11">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MedicationDeleteDialog({
  open,
  onOpenChange,
  medication,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Medicamento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o medicamento <strong>{medication?.name}</strong>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="h-11">
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
