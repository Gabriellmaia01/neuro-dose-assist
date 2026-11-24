import { Bell, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { NotificationSettings } from "@/lib/firestore";

export function NotificationSettingsPanel({
    notifications,
    onChange,
}: {
    notifications: NotificationSettings;
    onChange: (key: keyof NotificationSettings, value: boolean) => void;
}) {
    return (
        <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
                <h2 className="font-display font-semibold text-lg">
                    Preferências de Notificação
                </h2>
                <p className="text-sm text-muted-foreground">
                    Configure como você deseja receber notificações
                </p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Notificações por E-mail</p>
                            <p className="text-sm text-muted-foreground">
                                Receber atualizações por e-mail
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => onChange("email", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Notificações Push</p>
                            <p className="text-sm text-muted-foreground">
                                Receber notificações no navegador
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => onChange("push", checked)}
                    />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Alertas de Eficácia</p>
                        <p className="text-sm text-muted-foreground">
                            Notificar quando eficácia cair abaixo do esperado
                        </p>
                    </div>
                    <Switch
                        checked={notifications.alerts}
                        onCheckedChange={(checked) => onChange("alerts", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Recomendações da IA</p>
                        <p className="text-sm text-muted-foreground">
                            Notificar sobre novas recomendações de ajuste
                        </p>
                    </div>
                    <Switch
                        checked={notifications.recommendations}
                        onCheckedChange={(checked) => onChange("recommendations", checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Relatórios Semanais</p>
                        <p className="text-sm text-muted-foreground">
                            Receber resumo semanal por e-mail
                        </p>
                    </div>
                    <Switch
                        checked={notifications.reports}
                        onCheckedChange={(checked) => onChange("reports", checked)}
                    />
                </div>
            </div>
        </div>
    );
}
