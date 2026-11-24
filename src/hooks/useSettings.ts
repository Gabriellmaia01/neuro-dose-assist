import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
    getUserSettings,
    updateAISettings,
    updateNotificationSettings,
    updateUserProfile,
    type AISettings,
    type NotificationSettings,
    type UserProfile,
} from "@/lib/firestore";

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
    email: true,
    push: true,
    alerts: true,
    recommendations: true,
    reports: false,
};

const DEFAULT_AI_SETTINGS: AISettings = {
    autoAnalysis: true,
    riskAlerts: true,
    recommendations: true,
    confidence: "high",
};

export function useSettings() {
    const { user, updatePassword } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        fullName: "",
        email: "",
        specialty: "",
        crm: "",
        phone: "",
        language: "pt-BR",
    });
    const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
    const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const settings = await getUserSettings(user.uid);

                if (settings) {
                    if (settings.profile) {
                        setProfile({
                            fullName: settings.profile.fullName || "",
                            email: settings.profile.email || user.email || "",
                            specialty: settings.profile.specialty || "",
                            crm: settings.profile.crm || "",
                            phone: settings.profile.phone || "",
                            language: settings.profile.language || "pt-BR",
                        });
                    }

                    if (settings.notifications) {
                        setNotifications(settings.notifications);
                    }

                    if (settings.ai) {
                        setAiSettings(settings.ai);
                    }
                } else {
                    setProfile({
                        fullName: user.displayName || "",
                        email: user.email || "",
                        specialty: "",
                        crm: "",
                        phone: "",
                        language: "pt-BR",
                    });
                }
            } catch (error: unknown) {
                console.error("Erro ao carregar configurações:", error);

                const errorCode =
                    typeof error === "object" &&
                    error !== null &&
                    "code" in error &&
                    typeof error.code === "string"
                        ? error.code
                        : "";
                const isPermissionError = errorCode.includes("permission") || errorCode.includes("PERMISSION");

                if (!isPermissionError) {
                    toast({
                        title: "Erro ao carregar configurações",
                        description: "Não foi possível carregar suas configurações. Usando valores padrão.",
                        variant: "destructive",
                    });
                }

                setProfile({
                    fullName: user.displayName || "",
                    email: user.email || "",
                    specialty: "",
                    crm: "",
                    phone: "",
                    language: "pt-BR",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            setSaving(true);
            await updateUserProfile(user.uid, profile);
            toast({
                title: "Perfil atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast({
                title: "Erro ao salvar perfil",
                description: "Não foi possível salvar suas informações.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationChange = async (
        key: keyof NotificationSettings,
        value: boolean
    ) => {
        if (!user) return;

        const updated = { ...notifications, [key]: value };
        setNotifications(updated);

        try {
            await updateNotificationSettings(user.uid, updated);
        } catch (error) {
            console.error("Erro ao salvar notificações:", error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar as configurações de notificação.",
                variant: "destructive",
            });
            setNotifications(notifications);
        }
    };

    const handleAISettingChange = async (
        key: keyof AISettings,
        value: boolean | string
    ) => {
        if (!user) return;

        const updated = { ...aiSettings, [key]: value };
        setAiSettings(updated);

        try {
            await updateAISettings(user.uid, updated as AISettings);
        } catch (error) {
            console.error("Erro ao salvar configurações de IA:", error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar as configurações de IA.",
                variant: "destructive",
            });
            setAiSettings(aiSettings);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Senhas não coincidem",
                description: "A nova senha e a confirmação devem ser iguais.",
                variant: "destructive",
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast({
                title: "Senha muito curta",
                description: "A senha deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        try {
            setChangingPassword(true);
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            // Erro já tratado no contexto.
        } finally {
            setChangingPassword(false);
        }
    };

    return {
        loading,
        saving,
        profile,
        setProfile,
        notifications,
        aiSettings,
        passwordData,
        setPasswordData,
        changingPassword,
        handleSaveProfile,
        handleNotificationChange,
        handleAISettingChange,
        handleChangePassword,
    };
}
