import { MainLayout } from "@/components/layout/MainLayout";
import { ReportControls } from "@/components/reports/ReportControls";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ReportStatsBar } from "@/components/reports/ReportStatsBar";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { generateReportCSV, generateReportPDF } from "@/lib/reportExports";
import { useReports } from "@/hooks/useReports";
import { reportTypes } from "@/components/reports/reportTypes";
import { toast } from "@/hooks/use-toast";

export default function Reports() {
    const report = useReports();

    const handleGenerate = (formatType: "pdf" | "csv") => {
        if (report.isGenerating || report.totalDoses === 0) return;
        report.setIsGenerating(true);

        try {
            const data = {
                selectedPatient: report.selectedPatient,
                reportTitle:
                    reportTypes.find((type) => type.id === report.selectedReport)?.title ||
                    "Relatório Clínico",
                startDate: report.startDate,
                endDate: report.endDate,
                patients: report.patients,
                medications: report.filteredMedications,
                filteredDoses: report.filteredDoses,
                totalDoses: report.totalDoses,
                avgEfficacy: report.avgEfficacy,
                avgMood: report.avgMood,
                avgEnergy: report.avgEnergy,
                lowMoodCount: report.lowMoodCount,
                includeRecommendations: report.includeRecommendations,
                recommendations: report.recommendations,
            };
            if (formatType === "csv") {
                generateReportCSV(data);
                toast({
                    title: "CSV exportado",
                    description: `${report.totalDoses} registro(s) exportado(s) em UTF-8.`,
                });
            } else {
                generateReportPDF(data);
                toast({
                    title: "PDF gerado",
                    description: `Relatório clínico baixado com ${report.totalDoses} registro(s).`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao gerar relatório",
                description: "Não foi possível gerar o arquivo. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            report.setIsGenerating(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 pb-10">
                <header>
                    <h1 className="font-display text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--nd-text)] text-balance">
                        Relatórios Clínicos
                    </h1>
                    <p className="text-[14px] text-[var(--nd-text-secondary)] mt-1.5 max-w-[60ch]">
                        Consolide a evolução terapêutica por paciente e período para emissão em PDF ou planilha CSV.
                    </p>
                </header>

                {report.erro && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-[var(--nd-error)]/30 bg-[var(--nd-error-soft)]/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle
                                className="w-5 h-5 text-[var(--nd-error)] shrink-0 mt-0.5"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="text-[14px] font-semibold text-[var(--nd-text)]">
                                    Falha ao carregar os dados do relatório
                                </p>
                                <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
                                    {report.erro}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={report.recarregar}
                            className="nd-btn-outline-pill shrink-0"
                        >
                            <RotateCcw className="w-4 h-4" aria-hidden="true" />
                            Tentar novamente
                        </button>
                    </div>
                )}

                <ReportStatsBar
                    totalDoses={report.totalDoses}
                    avgEfficacy={report.avgEfficacy}
                    uniqueMedications={report.uniqueMedications}
                    lowMoodCount={report.lowMoodCount}
                    loading={report.loading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-4">
                        <ReportControls
                            patients={report.patients}
                            selectedPatient={report.selectedPatient}
                            onPatientChange={report.setSelectedPatient}
                            startDate={report.startDate}
                            onStartDateChange={report.setStartDate}
                            endDate={report.endDate}
                            onEndDateChange={report.setEndDate}
                            periodoInvalido={report.periodoInvalido}
                            includeCharts={report.includeCharts}
                            onIncludeChartsChange={report.setIncludeCharts}
                            includeRecommendations={report.includeRecommendations}
                            onIncludeRecommendationsChange={report.setIncludeRecommendations}
                            isGenerating={report.isGenerating}
                            loading={report.loading}
                            totalDoses={report.totalDoses}
                            onGenerate={handleGenerate}
                        />
                    </div>
                    <div className="lg:col-span-8">
                        <ReportPreview
                            loading={report.loading}
                            selectedPatient={report.selectedPatient}
                            patients={report.patients}
                            startDate={report.startDate}
                            endDate={report.endDate}
                            totalDoses={report.totalDoses}
                            avgEfficacy={report.avgEfficacy}
                            avgMood={report.avgMood}
                            avgEnergy={report.avgEnergy}
                            chartData={report.chartData}
                            includeCharts={report.includeCharts}
                            includeRecommendations={report.includeRecommendations}
                            recommendations={report.recommendations}
                            medications={report.filteredMedications}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
