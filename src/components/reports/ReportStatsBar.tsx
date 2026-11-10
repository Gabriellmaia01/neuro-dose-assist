import { Activity, Brain, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportStatsBar({
    totalDoses,
    avgEfficacy,
    uniqueMedications,
    lowMoodCount,
}: {
    totalDoses: number;
    avgEfficacy: number;
    uniqueMedications: number;
    lowMoodCount: number;
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total de Doses</p>
                        <p className="text-2xl font-display font-bold mt-1">{totalDoses}</p>
                    </div>
                    <Pill className="w-8 h-8 text-primary/60" />
                </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eficácia Média</p>
                        <p className={cn(
                            "text-2xl font-display font-bold mt-1",
                            avgEfficacy > 70 ? "text-success" : avgEfficacy > 50 ? "text-warning" : "text-destructive"
                        )}>
                            {avgEfficacy}%
                        </p>
                    </div>
                    <Activity className="w-8 h-8 text-success/60" />
                </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medicamentos</p>
                        <p className="text-2xl font-display font-bold mt-1">{uniqueMedications}</p>
                    </div>
                    <Brain className="w-8 h-8 text-info/60" />
                </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertas</p>
                        <p className="text-2xl font-display font-bold mt-1 text-warning">{lowMoodCount}</p>
                    </div>
                    <Activity className="w-8 h-8 text-warning/60" />
                </div>
            </div>
        </div>
    );
}
