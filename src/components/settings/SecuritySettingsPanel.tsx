import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Key, Loader2, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

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
}: {
    passwordData: PasswordData;
    setPasswordData: Dispatch<SetStateAction<PasswordData>>;
    changingPassword: boolean;
    onChangePassword: () => void;
}) {
    return (
        <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-6">
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
                        <Label>Senha Atual</Label>
                        <Input
                            type="password"
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
                        <Label>Nova Senha</Label>
                        <Input
                            type="password"
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
                        <Label>Confirmar Nova Senha</Label>
                        <Input
                            type="password"
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
                        variant="neuro"
                        onClick={onChangePassword}
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
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-6">
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
