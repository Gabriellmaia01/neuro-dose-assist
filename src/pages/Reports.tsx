import { MainLayout } from "@/components/layout/MainLayout";
import { ReportControls } from "@/components/reports/ReportControls";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ReportStatsBar } from "@/components/reports/ReportStatsBar";
import { FileText } from "lucide-react";
import { generateReportCSV, generateReportPDF } from "@/lib/reportExports";
import { useReports } from "@/hooks/useReports";
import { reportTypes } from "@/components/reports/reportTypes";

export default function Reports() {
    const report = useReports();

    const handleGenerate = (formatType: "pdf" | "csv") => {
        if (report.isGenerating) return;
        report.setIsGenerating(true);

        try {
            const data = {
                selectedPatient: report.selectedPatient,
                reportTitle: reportTypes.find((type) => type.id === report.selectedReport)?.title || "Relatório",
                startDate: report.startDate,
                endDate: report.endDate,
                patients: report.patients,
                medications: report.medications,
                filteredDoses: report.filteredDoses,
                totalDoses: report.totalDoses,
                avgEfficacy: report.avgEfficacy,
                lowMoodCount: report.lowMoodCount,
            };
            if (formatType === "csv") {
                generateReportCSV(data);
            } else {
                generateReportPDF(data);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar relatório. Tente novamente.");
        } finally {
            report.setIsGenerating(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                                Relatórios e Análises
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                                Gere relatórios profissionais e exporte dados detalhados para análise
                            </p>
                        </div>
                    </div>
                </div>

                {!report.loading && (
                    <ReportStatsBar
                        totalDoses={report.totalDoses}
                        avgEfficacy={report.avgEfficacy}
                        uniqueMedications={report.uniqueMedications}
                        lowMoodCount={report.lowMoodCount}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <ReportControls
                            selectedReport={report.selectedReport}
                            onReportChange={report.setSelectedReport}
                            patients={report.patients}
                            selectedPatient={report.selectedPatient}
                            onPatientChange={report.setSelectedPatient}
                            startDate={report.startDate}
                            onStartDateChange={report.setStartDate}
                            endDate={report.endDate}
                            onEndDateChange={report.setEndDate}
                            includeCharts={report.includeCharts}
                            onIncludeChartsChange={report.setIncludeCharts}
                            includeRecommendations={report.includeRecommendations}
                            onIncludeRecommendationsChange={report.setIncludeRecommendations}
                            isGenerating={report.isGenerating}
                            loading={report.loading}
                            onGenerate={handleGenerate}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <ReportPreview
                            loading={report.loading}
                            selectedReport={report.selectedReport}
                            selectedPatient={report.selectedPatient}
                            patients={report.patients}
                            totalDoses={report.totalDoses}
                            avgEfficacy={report.avgEfficacy}
                            avgMood={report.avgMood}
                            avgEnergy={report.avgEnergy}
                            chartData={report.chartData}
                            includeCharts={report.includeCharts}
                            includeRecommendations={report.includeRecommendations}
                            medications={report.medications}
                            onDownload={() => handleGenerate("pdf")}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
