import { AISettingsPanel } from "@/components/settings/AISettingsPanel";
import { NotificationSettingsPanel } from "@/components/settings/NotificationSettingsPanel";
import { ProfileSettingsPanel } from "@/components/settings/ProfileSettingsPanel";
import { SecuritySettingsPanel } from "@/components/settings/SecuritySettingsPanel";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/useSettings";
import { Bell, Brain, Loader2, Lock, User } from "lucide-react";

export default function Settings() {
    const settings = useSettings();

    if (settings.loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">
                        Configurações
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie suas preferências e configurações do sistema
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="profile">
                            <User className="w-4 h-4 mr-2" />
                            Perfil
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <Lock className="w-4 h-4 mr-2" />
                            Segurança
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="w-4 h-4 mr-2" />
                            Notificações
                        </TabsTrigger>
                        <TabsTrigger value="ai">
                            <Brain className="w-4 h-4 mr-2" />
                            IA
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <ProfileSettingsPanel
                            profile={settings.profile}
                            setProfile={settings.setProfile}
                            saving={settings.saving}
                            onSave={settings.handleSaveProfile}
                        />
                    </TabsContent>

                    <TabsContent value="security">
                        <SecuritySettingsPanel
                            passwordData={settings.passwordData}
                            setPasswordData={settings.setPasswordData}
                            changingPassword={settings.changingPassword}
                            onChangePassword={settings.handleChangePassword}
                        />
                    </TabsContent>

                    <TabsContent value="notifications">
                        <NotificationSettingsPanel
                            notifications={settings.notifications}
                            onChange={settings.handleNotificationChange}
                        />
                    </TabsContent>

                    <TabsContent value="ai">
                        <AISettingsPanel
                            settings={settings.aiSettings}
                            onChange={settings.handleAISettingChange}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
