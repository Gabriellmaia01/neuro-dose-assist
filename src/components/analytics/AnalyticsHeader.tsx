import { LineChart } from "lucide-react";

export function AnalyticsHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-lg">
                <LineChart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                    Analytics Avançado
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Insights preditivos e análise inteligente do tratamento
                </p>
            </div>
        </div>
    );
}
