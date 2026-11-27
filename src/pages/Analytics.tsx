import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsStats } from "@/components/analytics/AnalyticsStats";
import { PredictiveCard } from "@/components/analytics";
import { MainLayout } from "@/components/layout/MainLayout";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function Analytics() {
    const analytics = useAnalytics();

    return (
        <MainLayout>
            <div className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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

                {analytics.erro && (
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
                                    Falha ao carregar analytics
                                </p>
                                <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
                                    {analytics.erro}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={analytics.reload}
                            className="nd-btn-outline-pill shrink-0"
                        >
                            <RotateCcw className="w-4 h-4" aria-hidden="true" />
                            Tentar novamente
                        </button>
                    </div>
                )}

                {analytics.loading ? (
                    <div className="space-y-6" aria-label="Carregando painel analítico">
                        <div className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[var(--nd-border)]">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="px-5 py-4 space-y-2.5">
                                    <div className="nd-skeleton h-3.5 w-20 rounded-md" />
                                    <div className="nd-skeleton h-7 w-14 rounded-md" />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6 space-y-4">
                                <div className="nd-skeleton h-5 w-44 rounded-md" />
                                <div className="nd-skeleton h-56 w-full rounded-xl" />
                            </div>
                            <div className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6 space-y-4">
                                <div className="nd-skeleton h-5 w-44 rounded-md" />
                                <div className="nd-skeleton h-56 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <AnalyticsStats metrics={analytics.metrics} />
                        <AnalyticsDashboard
                            trendData={analytics.trendData}
                            patientAnalytics={analytics.patientAnalytics}
                            metrics={analytics.metrics}
                            periodInDays={analytics.periodInDays}
                            riskAlerts={analytics.riskAlerts}
                        />
                        <PredictiveCard insights={analytics.predictiveInsights} />
                    </>
                )}
            </div>
        </MainLayout>
    );
}
