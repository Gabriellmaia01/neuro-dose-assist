import { Brain, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { AISettings } from "@/lib/firestore";

export function AISettingsPanel({
    settings,
    onChange,
}: {
    settings: AISettings;
    onChange: (key: keyof AISettings, value: boolean | string) => void;
}) {
    return (
        <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
                <h2 className="font-display font-semibold text-lg">
                    Configurações de IA
                </h2>
                <p className="text-sm text-muted-foreground">
                    Personalize o comportamento do módulo de Inteligência
                    Artificial
                </p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neuro-gradient flex items-center justify-center">
                            <Brain className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">Análise Automática</p>
                            <p className="text-sm text-muted-foreground">
                                Executar inferência automaticamente ao registrar dose
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={settings.autoAnalysis}
                        onCheckedChange={(checked) => onChange("autoAnalysis", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Alertas de Risco</p>
                        <p className="text-sm text-muted-foreground">
                            Gerar alertas quando IA detectar riscos potenciais
                        </p>
                    </div>
                    <Switch
                        checked={settings.riskAlerts}
                        onCheckedChange={(checked) => onChange("riskAlerts", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Recomendações Proativas</p>
                        <p className="text-sm text-muted-foreground">
                            Permitir que IA sugira ajustes de dose automaticamente
                        </p>
                    </div>
                    <Switch
                        checked={settings.recommendations}
                        onCheckedChange={(checked) => onChange("recommendations", checked)}
                    />
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label>Nível de Confiança Mínimo</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                        Mostrar apenas recomendações acima deste nível de confiança
                    </p>
                    <Select
                        value={settings.confidence}
                        onValueChange={(value) => onChange("confidence", value)}
                    >
                        <SelectTrigger className="max-w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Baixo (60%+)</SelectItem>
                            <SelectItem value="medium">Médio (75%+)</SelectItem>
                            <SelectItem value="high">Alto (90%+)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            Sobre a IA do NeuroDose
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        O módulo de IA utiliza modelos ONNX otimizados para prever
                        eficácia de medicamentos. Todas as inferências são
                        executadas localmente, garantindo privacidade dos dados
                        clínicos.
                    </p>
                </div>
            </div>
        </div>
    );
}
