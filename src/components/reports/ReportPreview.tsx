import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { Button } from "@/components/ui/button";
import type { Medication } from "@/lib/medications";
import type { Patient } from "@/lib/patients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, Brain, Download, Loader2, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportMedicationList } from "./ReportMedicationList";
import { ReportRecommendations } from "./ReportRecommendations";
import { reportTypes } from "./reportTypes";

type ChartPoint = {
    date: string;
    efficacy: number;
    dose: number;
};

export function ReportPreview({
    loading,
    selectedReport,
    selectedPatient,
    patients,
    totalDoses,
    avgEfficacy,
    avgMood,
    avgEnergy,
    chartData,
    includeCharts,
    includeRecommendations,
    medications,
    onDownload,
}: {
    loading: boolean;
    selectedReport: string;
    selectedPatient: string;
    patients: Patient[];
    totalDoses: number;
    avgEfficacy: number;
    avgMood: number;
    avgEnergy: number;
    chartData: ChartPoint[];
    includeCharts: boolean;
    includeRecommendations: boolean;
    medications: Medication[];
    onDownload: () => void;
}) {
    return (
        <div className="glass-card rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                    <h2 className="font-display font-semibold text-xl mb-1">
                        Prévia do Relatório
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Visualize como o relatório será gerado
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    className="gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download
                </Button>
            </div>

            <div className="border-2 border-border rounded-2xl p-8 bg-gradient-to-br from-background to-muted/20 shadow-inner">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <span className="text-muted-foreground font-medium">Carregando dados...</span>
                    </div>
                ) : (
                    <>
                        <div className="text-center pb-8 border-b-2 border-border mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-neuro-gradient flex items-center justify-center mx-auto mb-5 shadow-lg">
                                <Brain className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <h3 className="font-display text-2xl font-bold mb-2">NeuroDose Assist</h3>
                            <p className="text-base text-muted-foreground font-medium">
                                {reportTypes.find((report) => report.id === selectedReport)?.title}
                            </p>
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-sm text-muted-foreground">
                                    Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                                {selectedPatient !== "all" && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Paciente: {patients.find((patient) => patient.id === selectedPatient)?.name || "N/A"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Resumo Executivo
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Pill className="w-4 h-4 text-primary" />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Doses</p>
                                    </div>
                                    <p className="text-3xl font-display font-bold text-primary">{totalDoses}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Registradas</p>
                                </div>
                                <div className={cn(
                                    "bg-gradient-to-br rounded-xl p-5 border",
                                    avgEfficacy > 70
                                        ? "from-success/10 to-success/5 border-success/20"
                                        : avgEfficacy > 50
                                            ? "from-warning/10 to-warning/5 border-warning/20"
                                            : "from-destructive/10 to-destructive/5 border-destructive/20"
                                )}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className={cn(
                                            "w-4 h-4",
                                            avgEfficacy > 70 ? "text-success" : avgEfficacy > 50 ? "text-warning" : "text-destructive"
                                        )} />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Eficácia</p>
                                    </div>
                                    <p className={cn(
                                        "text-3xl font-display font-bold",
                                        avgEfficacy > 70 ? "text-success" : avgEfficacy > 50 ? "text-warning" : "text-destructive"
                                    )}>
                                        {avgEfficacy}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Média geral</p>
                                </div>
                                <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-xl p-5 border border-info/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="w-4 h-4 text-info" />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Humor</p>
                                    </div>
                                    <p className="text-3xl font-display font-bold text-info">{avgMood}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Média (1-10)</p>
                                </div>
                                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-5 border border-accent/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-accent" />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Energia</p>
                                    </div>
                                    <p className="text-3xl font-display font-bold text-accent">{avgEnergy}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Média (1-10)</p>
                                </div>
                            </div>
                        </div>

                        {includeCharts && chartData.length > 0 && (
                            <div className="mb-8">
                                <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Evolução da Eficácia
                                </h4>
                                <EfficacyChart data={chartData} className="border-0 p-0 bg-transparent shadow-none" />
                            </div>
                        )}

                        {includeCharts && chartData.length === 0 && (
                            <div className="mb-8 text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl bg-muted/20">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Nenhum dado suficiente para gráficos</p>
                                <p className="text-sm mt-1">no período selecionado.</p>
                            </div>
                        )}

                        {includeRecommendations && (
                            <ReportRecommendations
                                totalDoses={totalDoses}
                                avgEfficacy={avgEfficacy}
                                avgMood={avgMood}
                            />
                        )}

                        {(selectedReport === "medications" || selectedReport === "complete") && (
                            <ReportMedicationList medications={medications} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
