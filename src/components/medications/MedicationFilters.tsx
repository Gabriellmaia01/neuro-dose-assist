import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { therapeuticClassMap } from "@/lib/medicationCatalog";
import { Beaker, Check, ChevronDown, Filter, Pill, Search } from "lucide-react";

export function MedicationStats({
  total,
  uniqueClasses,
  filteredTotal,
  filterCount,
}: {
  total: number;
  uniqueClasses: number;
  filteredTotal: number;
  filterCount: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Total</p>
          <Pill className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{total}</p>
      </div>
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Classes</p>
          <Beaker className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{uniqueClasses}</p>
      </div>
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Exibindo</p>
          <Search className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{filteredTotal}</p>
      </div>
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Filtros ativos</p>
          <Filter className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{filterCount}</p>
      </div>
    </div>
  );
}

export function MedicationFilterPanel({
  searchTerm,
  onSearchChange,
  open,
  onOpenChange,
  selectedClasses,
  onToggleClass,
  hasActiveFilters,
  onClear,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClasses: string[];
  onToggleClass: (className: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="nd-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="text-[15px] font-semibold text-[var(--nd-text)]">Busca e Filtros</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-8 space-y-2">
          <Label htmlFor="med-search" className="text-sm font-semibold">Busca</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="med-search"
              name="medSearch"
              autoComplete="off"
              placeholder="Buscar por nome genérico ou comercial…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        <div className="lg:col-span-4 flex items-center gap-2">
          <Collapsible open={open} onOpenChange={onOpenChange} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full h-11 justify-between">
                <span className="inline-flex items-center">
                  <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                  Filtrar por Classe
                </span>
                <ChevronDown
                  className={cn("w-4 h-4 transition-[transform] duration-200", open ? "rotate-180" : "")}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          <Button
            variant="ghost"
            className="h-11"
            onClick={onClear}
            disabled={!hasActiveFilters}
          >
            Limpar
          </Button>
        </div>
      </div>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleContent className="overflow-hidden pt-4">
          <div className="bg-muted/20 p-4 rounded-xl border border-border">
            <p className="text-sm font-medium mb-3">Selecione as classes terapêuticas:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(therapeuticClassMap).map(([key, label]) => {
                const isSelected = selectedClasses.includes(label);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onToggleClass(label)}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                      "transition-[background-color,color,border-color] duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border bg-background hover:bg-muted/50"
                    )}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 mr-1" aria-hidden="true" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
