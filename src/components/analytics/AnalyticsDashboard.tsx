import { AdherenceChart, PatientInsights, RiskIndicators, TrendAnalysis } from "@/components/analytics";
import type {
    AnalyticsMetrics,
    PatientAnalytics,
    RiskAlert,
    TrendDataPoint,
} from "@/lib/analytics";
import { Activity } from "lucide-react";

function AdherencePanel({
    metrics,
    periodInDays,
    riskAlerts,
}: {
    metrics: AnalyticsMetrics;
    periodInDays: string;
    riskAlerts: RiskAlert[];
}) {
    return (
        <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">Taxa de Adesão</h3>
                </div>
                <div className="flex justify-center py-4">
                    <AdherenceChart
                        value={metrics.adherenceRate}
                        size="lg"
                        trend={metrics.trendDirection}
                    />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                    Baseado nos últimos {periodInDays} dias
                </p>
            </div>
            <RiskIndicators alerts={riskAlerts} maxVisible={4} />
        </div>
    );
}

export function AnalyticsDashboard({
    trendData,
    patientAnalytics,
    metrics,
    periodInDays,
    riskAlerts,
}: {
    trendData: TrendDataPoint[];
    patientAnalytics: PatientAnalytics[];
    metrics: AnalyticsMetrics;
    periodInDays: string;
    riskAlerts: RiskAlert[];
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <TrendAnalysis data={trendData} height={280} />
                <PatientInsights analytics={patientAnalytics} />
            </div>
            <AdherencePanel
                metrics={metrics}
                periodInDays={periodInDays}
                riskAlerts={riskAlerts}
            />
        </div>
    );
}
