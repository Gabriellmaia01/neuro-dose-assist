import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Key, Loader2, Trash2 } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

type PasswordData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export function SecuritySettingsPanel({
    passwordData,
    setPasswordData,
    changingPassword,
    onChangePassword,
    userEmail,
}: {
    passwordData: PasswordData;
    setPasswordData: Dispatch<SetStateAction<PasswordData>>;
    changingPassword: boolean;
    onChangePassword: () => void;
    userEmail?: string;
}) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!changingPassword) {
            onChangePassword();
        }
    };

    return (
        <div className="space-y-6">
            <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="nd-card p-6 space-y-6"
            >
                {/* Âncora oculta de usuário para conter a heurística de autofill do navegador dentro deste formulário */}
                <input
                    type="email"
                    name="username"
                    autoComplete="username"
                    value={userEmail || ""}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                />

                <div>
                    <h2 className="font-display font-semibold text-lg">
                        Alterar Senha
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Mantenha sua conta segura com uma senha forte
                    </p>
                </div>

                <Separator />

                <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="settings-current-password">Senha Atual</Label>
                        <Input
                            id="settings-current-password"
                            name="currentPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={passwordData.currentPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    currentPassword: event.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="settings-new-password">Nova Senha</Label>
                        <Input
                            id="settings-new-password"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={passwordData.newPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    newPassword: event.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="settings-confirm-password">Confirmar Nova Senha</Label>
                        <Input
                            id="settings-confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    confirmPassword: event.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="default"
                        disabled={changingPassword}
                    >
                        {changingPassword ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Atualizando...
                            </>
                        ) : (
                            <>
                                <Key className="w-4 h-4 mr-2" />
                                Atualizar Senha
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="nd-card p-6 space-y-6">
                <div>
                    <h2 className="font-display font-semibold text-lg text-destructive">
                        Zona de Perigo
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Ações irreversíveis para sua conta
                    </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Excluir Conta</p>
                        <p className="text-sm text-muted-foreground">
                            Esta ação é permanente e não pode ser desfeita
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Conta
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá
                                    permanentemente sua conta e removerá seus dados de
                                    nossos servidores.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
