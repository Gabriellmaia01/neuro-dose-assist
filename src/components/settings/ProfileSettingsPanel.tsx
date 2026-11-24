import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/lib/firestore";
import { Loader2, Save, User } from "lucide-react";

export function ProfileSettingsPanel({
    profile,
    setProfile,
    saving,
    onSave,
}: {
    profile: UserProfile;
    setProfile: (profile: UserProfile) => void;
    saving: boolean;
    onSave: () => void;
}) {
    return (
        <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
                <h2 className="font-display font-semibold text-lg">
                    Informações do Perfil
                </h2>
                <p className="text-sm text-muted-foreground">
                    Atualize suas informações pessoais
                </p>
            </div>

            <Separator />

            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-neuro-gradient flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                    <Button variant="outline" size="sm" disabled>
                        Alterar Foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Em breve
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                        value={profile.fullName}
                        onChange={(event) =>
                            setProfile({ ...profile, fullName: event.target.value })
                        }
                        placeholder="Seu nome completo"
                    />
                </div>
                <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                        type="email"
                        value={profile.email}
                        onChange={(event) =>
                            setProfile({ ...profile, email: event.target.value })
                        }
                        placeholder="seu@email.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Input
                        value={profile.specialty}
                        onChange={(event) =>
                            setProfile({ ...profile, specialty: event.target.value })
                        }
                        placeholder="Ex: Psiquiatria"
                    />
                </div>
                <div className="space-y-2">
                    <Label>CRM</Label>
                    <Input
                        value={profile.crm}
                        onChange={(event) =>
                            setProfile({ ...profile, crm: event.target.value })
                        }
                        placeholder="Ex: 123456-SP"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                        value={profile.phone}
                        onChange={(event) =>
                            setProfile({ ...profile, phone: event.target.value })
                        }
                        placeholder="(11) 98765-4321"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                        value={profile.language}
                        onValueChange={(value) =>
                            setProfile({ ...profile, language: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    variant="neuro"
                    onClick={onSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
