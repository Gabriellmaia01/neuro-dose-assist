import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Medication } from "@/lib/medications";
import { therapeuticClassColors } from "@/lib/medicationCatalog";
import { Beaker, Edit, Eye, MoreHorizontal, Pill, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MedicationCard({
  medication,
  dateFormatter,
  onView,
  onEdit,
  onDelete,
}: {
  medication: Medication;
  dateFormatter: Intl.DateTimeFormat;
  onView: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-5 sm:p-6",
        "transition-colors duration-150 hover:border-[var(--nd-border-hover)]"
      )}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto 240px",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-[var(--nd-text)] truncate">
            {medication.name}
          </h3>
          <p className="text-[13px] text-[var(--nd-text-secondary)] truncate mt-0.5">
            {medication.brandName}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Ações para ${medication.name}`}>
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(medication)}>
              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(medication)}>
              <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(medication)}>
              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground line-clamp-2 break-words">
            {medication.activeIngredient}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            therapeuticClassColors[medication.therapeuticClass] || "bg-muted"
          )}
        >
          {medication.therapeuticClass}
        </Badge>
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Forma</span>
            <span className="font-medium">{medication.form}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dose</span>
            <span className="font-medium tabular-nums">
              {medication.minDose} - {medication.maxDose} {medication.unit}
            </span>
          </div>
          {medication.halfLifeHours !== undefined && medication.halfLifeHours !== null && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meia-vida (t½)</span>
              <span className="font-medium tabular-nums">{medication.halfLifeHours} h</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cadastrado em</span>
            <span className="font-medium tabular-nums">
              {medication.createdAt ? dateFormatter.format(new Date(medication.createdAt)) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
