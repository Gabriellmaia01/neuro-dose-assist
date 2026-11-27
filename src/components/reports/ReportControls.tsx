import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Patient } from "@/lib/patients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    FileSpreadsheet,
    FileType,
    Loader2,
} from "lucide-react";

export function ReportControls({
    patients,
    selectedPatient,
    onPatientChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    periodoInvalido = false,
    includeCharts,
    onIncludeChartsChange,
    includeRecommendations,
    onIncludeRecommendationsChange,
    isGenerating,
    loading,
    totalDoses,
    onGenerate,
}: {
    patients: Patient[];
    selectedPatient: string;
    onPatientChange: (value: string) => void;
    startDate: Date | undefined;
    onStartDateChange: (date: Date | undefined) => void;
    endDate: Date | undefined;
    onEndDateChange: (date: Date | undefined) => void;
    periodoInvalido?: boolean;
    includeCharts: boolean;
    onIncludeChartsChange: (include: boolean) => void;
    includeRecommendations: boolean;
    onIncludeRecommendationsChange: (include: boolean) => void;
    isGenerating: boolean;
    loading: boolean;
    totalDoses: number;
    onGenerate: (format: "pdf" | "csv") => void;
}) {
    const hasDates = Boolean(startDate || endDate);

    return (
        <aside
            aria-label="Parâmetros e exportação do relatório"
            className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-5 sm:p-6 divide-y divide-[var(--nd-border)]"
        >
            {/* Recorte clínico */}
            <div className="pb-5 space-y-4">
                <div>
                    <h2 className="text-[16px] font-semibold text-[var(--nd-text)]">
                        Parâmetros do Relatório
                    </h2>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
                        Defina o paciente e o período antes de exportar.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="report-patient"
                        className="text-[12px] font-medium text-[var(--nd-text-secondary)]"
                    >
                        Paciente
                    </Label>
                    <Select value={selectedPatient} onValueChange={onPatientChange}>
                        <SelectTrigger
                            id="report-patient"
                            className="h-10 bg-[var(--nd-surface)] border-[var(--nd-border-input)]"
                        >
                            <SelectValue placeholder="Todos os pacientes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os pacientes</SelectItem>
                            {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id || ""}>
                                    {patient.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                            Período
                        </span>
                        {hasDates && (
                            <button
                                type="button"
                                onClick={() => {
                                    onStartDateChange(undefined);
                                    onEndDateChange(undefined);
                                }}
                                className="text-[12px] font-medium text-[var(--nd-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nd-accent)] rounded"
                            >
                                Limpar datas
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label
                                htmlFor="report-start-date"
                                className="text-[11px] font-medium text-[var(--nd-text-secondary)]"
                            >
                                Data inicial
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="report-start-date"
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left h-10 bg-[var(--nd-surface)] border-[var(--nd-border-input)] font-normal nd-tabular"
                                    >
                                        <CalendarIcon
                                            className="w-4 h-4 mr-2 shrink-0 text-[var(--nd-icon)]"
                                            aria-hidden="true"
                                        />
                                        {startDate ? format(startDate, "dd/MM/yyyy") : "Início"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={onStartDateChange}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="report-end-date"
                                className="text-[11px] font-medium text-[var(--nd-text-secondary)]"
                            >
                                Data final
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="report-end-date"
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left h-10 bg-[var(--nd-surface)] border-[var(--nd-border-input)] font-normal nd-tabular"
                                    >
                                        <CalendarIcon
                                            className="w-4 h-4 mr-2 shrink-0 text-[var(--nd-icon)]"
                                            aria-hidden="true"
                                        />
                                        {endDate ? format(endDate, "dd/MM/yyyy") : "Fim"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={onEndDateChange}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {periodoInvalido && (
                        <p className="text-[12px] text-[var(--nd-warning)]" role="status">
                            A data inicial está posterior à final; o intervalo foi ajustado automaticamente na prévia.
                        </p>
                    )}
                </div>
            </div>

            {/* Seções incluídas */}
            <div className="py-5 space-y-3">
                <h3 className="text-[13px] font-semibold text-[var(--nd-text)]">
                    Seções do documento
                </h3>
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                        <Checkbox
                            id="report-include-charts"
                            checked={includeCharts}
                            onCheckedChange={(checked) => onIncludeChartsChange(!!checked)}
                        />
                        <Label
                            htmlFor="report-include-charts"
                            className="text-[13px] font-normal text-[var(--nd-text)] cursor-pointer"
                        >
                            Curva de evolução da eficácia
                        </Label>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Checkbox
                            id="report-include-recommendations"
                            checked={includeRecommendations}
                            onCheckedChange={(checked) => onIncludeRecommendationsChange(!!checked)}
                        />
                        <Label
                            htmlFor="report-include-recommendations"
                            className="text-[13px] font-normal text-[var(--nd-text)] cursor-pointer"
                        >
                            Notas e recomendações clínicas
                        </Label>
                    </div>
                </div>
            </div>

            {/* Ações de exportação */}
            <div className="pt-5 space-y-2.5">
                <button
                    type="button"
                    className="nd-btn-primary-pill w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onGenerate("pdf")}
                    disabled={isGenerating || loading || totalDoses === 0}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            Gerando documento…
                        </>
                    ) : (
                        <>
                            <FileType className="w-4 h-4" aria-hidden="true" />
                            Exportar PDF ({totalDoses})
                        </>
                    )}
                </button>

                <button
                    type="button"
                    className="nd-btn-outline-pill w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onGenerate("csv")}
                    disabled={isGenerating || loading || totalDoses === 0}
                >
                    <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                    Exportar CSV (UTF-8)
                </button>

                {!loading && totalDoses === 0 && (
                    <p className="text-[12px] text-[var(--nd-text-secondary)] text-center pt-1">
                        Nenhum registro no recorte para exportação.
                    </p>
                )}
            </div>
        </aside>
    );
}
