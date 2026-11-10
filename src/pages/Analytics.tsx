import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsStats } from "@/components/analytics/AnalyticsStats";
import { PredictiveCard } from "@/components/analytics";
import { MainLayout } from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function Analytics() {
    const analytics = useAnalytics();

    if (analytics.loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Carregando analytics...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <AnalyticsHeader />
                    <AnalyticsFilters
                        patients={analytics.patients}
                        selectedPatient={analytics.selectedPatient}
                        onPatientChange={analytics.setSelectedPatient}
                        periodInDays={analytics.periodInDays}
                        onPeriodChange={analytics.setPeriodInDays}
                        refreshing={analytics.refreshing}
                        onReload={analytics.reload}
                    />
                </div>
                <AnalyticsStats metrics={analytics.metrics} />
                <AnalyticsDashboard
                    trendData={analytics.trendData}
                    patientAnalytics={analytics.patientAnalytics}
                    metrics={analytics.metrics}
                    periodInDays={analytics.periodInDays}
                    riskAlerts={analytics.riskAlerts}
                />
                <PredictiveCard insights={analytics.predictiveInsights} />
            </div>
        </MainLayout>
    );
}
