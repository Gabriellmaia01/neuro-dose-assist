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
import type { Medication } from "@/lib/medications";
import type { Patient } from "@/lib/patients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    Download,
    FileSpreadsheet,
    FileText,
    FileType,
    Loader2,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypes } from "./reportTypes";

export function ReportControls({
    selectedReport,
    onReportChange,
    patients,
    selectedPatient,
    onPatientChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    includeCharts,
    onIncludeChartsChange,
    includeRecommendations,
    onIncludeRecommendationsChange,
    isGenerating,
    loading,
    onGenerate,
}: {
    selectedReport: string;
    onReportChange: (value: string) => void;
    patients: Patient[];
    selectedPatient: string;
    onPatientChange: (value: string) => void;
    startDate: Date | undefined;
    onStartDateChange: (date: Date | undefined) => void;
    endDate: Date | undefined;
    onEndDateChange: (date: Date | undefined) => void;
    includeCharts: boolean;
    onIncludeChartsChange: (include: boolean) => void;
    includeRecommendations: boolean;
    onIncludeRecommendationsChange: (include: boolean) => void;
    isGenerating: boolean;
    loading: boolean;
    onGenerate: (format: "pdf" | "csv") => void;
}) {
    return (
        <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-display font-semibold text-lg">Tipo de Relatório</h2>
                </div>
                <div className="space-y-3">
                    {reportTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => onReportChange(type.id)}
                            className={cn(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                selectedReport === type.id
                                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                        selectedReport === type.id
                                            ? "bg-primary/20 text-primary shadow-sm"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    <type.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{type.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-info" />
                    </div>
                    <h2 className="font-display font-semibold text-lg">Filtros</h2>
                </div>
                <div className="space-y-5">
                    <div className="space-y-2.5">
                        <Label className="flex items-center gap-2 text-sm font-semibold">
                            <User className="w-4 h-4 text-primary" />
                            Paciente
                        </Label>
                        <Select value={selectedPatient} onValueChange={onPatientChange}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecionar paciente" />
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

                    <div className="space-y-2.5">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            Período
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left h-11">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {startDate ? format(startDate, "dd/MM/yy") : "Início"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={onStartDateChange}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left h-11">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
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

                    <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opções</p>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id="charts"
                                    checked={includeCharts}
                                    onCheckedChange={(checked) => onIncludeChartsChange(!!checked)}
                                />
                                <Label htmlFor="charts" className="text-sm cursor-pointer flex-1">
                                    Incluir gráficos e visualizações
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id="recommendations"
                                    checked={includeRecommendations}
                                    onCheckedChange={(checked) => onIncludeRecommendationsChange(!!checked)}
                                />
                                <Label htmlFor="recommendations" className="text-sm cursor-pointer flex-1">
                                    Incluir recomendações da IA
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <Download className="w-4 h-4 text-success" />
                    </div>
                    <h2 className="font-display font-semibold text-lg">Exportar</h2>
                </div>
                <div className="space-y-3">
                    <Button
                        variant="neuro"
                        className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                        onClick={() => onGenerate("pdf")}
                        disabled={isGenerating || loading}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <FileType className="w-5 h-5 mr-2" />
                                Gerar PDF
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/50 transition-all"
                        onClick={() => onGenerate("csv")}
                        disabled={isGenerating || loading}
                    >
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        Exportar CSV
                    </Button>
                </div>
            </div>
        </div>
    );
}
