import { Activity, Brain } from "lucide-react";

export function ReportRecommendations({
    totalDoses,
    avgEfficacy,
    avgMood,
}: {
    totalDoses: number;
    avgEfficacy: number;
    avgMood: number;
}) {
    return (
        <div className="mb-8">
            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Recomendações da IA
            </h4>
            <div className="space-y-3">
                <div className="p-4 rounded-xl bg-success/10 border-2 border-success/20 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Activity className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-success mb-1">Análise de Dados Reais</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Baseado em {totalDoses} registros analisados. Continue registrando doses para obter insights mais precisos e recomendações personalizadas.
                            </p>
                        </div>
                    </div>
                </div>
                {avgEfficacy < 60 && totalDoses > 5 && (
                    <div className="p-4 rounded-xl bg-warning/10 border-2 border-warning/20 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Activity className="w-4 h-4 text-warning" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-warning mb-1">Atenção à Eficácia</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    A eficácia média está abaixo de 60%. Considere revisar os horários das doses, ajustar a dosagem ou consultar um profissional de saúde.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {avgMood < 5 && totalDoses > 3 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Activity className="w-4 h-4 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-destructive mb-1">Monitoramento de Humor</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    O humor médio está abaixo do ideal. Recomenda-se acompanhamento próximo e possível ajuste no tratamento.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
