import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Clinic, ClinicInvite } from "@/lib/clinics";
import { Building2, Check, Crown, Loader2, Plus, User, UserPlus, X } from "lucide-react";
import { ESTILOS_FUNCAO, ROTULOS_FUNCAO } from "./clinicPresentation";

export function ClinicLoadingIndicator() {
    return (
        <div className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--nd-primary)]" aria-hidden="true" />
            <span className="text-[14px] text-[var(--nd-text-secondary)]">Carregando dados da clínica…</span>
        </div>
    );
}

export function ClinicHeader() {
    return (
        <header>
            <h1 className="font-display text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--nd-text)] text-balance">
                Clínica
            </h1>
            <p className="text-[14px] text-[var(--nd-text-secondary)] mt-1.5">
                Gerencie equipe, funções de acesso e convites de colaboradores.
            </p>
        </header>
    );
}

export function PendingClinicInvite({
    invite,
    saving,
    onAccept,
    onDecline,
}: {
    invite: ClinicInvite;
    saving: boolean;
    onAccept: () => void;
    onDecline: () => void;
}) {
    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <UserPlus className="w-5 h-5" />
                    Convite Recebido
                </CardTitle>
                <CardDescription>
                    Você foi convidado para participar de uma clínica
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div>
                        <p className="font-semibold text-lg">{invite.clinicName}</p>
                        <p className="text-sm text-muted-foreground">
                            Função: {ROTULOS_FUNCAO[invite.role]}
                        </p>
                        {invite.invitedByName && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Convidado por: {invite.invitedByName}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={onDecline}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Recusar
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={onAccept}
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-1" />
                            )}
                            Aceitar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CreateClinicDialog({
    open,
    onOpenChange,
    clinicName,
    onClinicNameChange,
    saving,
    onCreate,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinicName: string;
    onClinicNameChange: (name: string) => void;
    saving: boolean;
    onCreate: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Clínica
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Nova Clínica</DialogTitle>
                    <DialogDescription>
                        Digite o nome da sua clínica ou consultório
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="clinic-name">Nome da Clínica</Label>
                    <Input
                        id="clinic-name"
                        placeholder="Ex: Clínica Neurológica São Paulo"
                        value={clinicName}
                        onChange={(e) => onClinicNameChange(e.target.value)}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="default"
                        onClick={onCreate}
                        disabled={saving || !clinicName.trim()}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Criando...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Clínica
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function NoClinicState({
    dialogOpen,
    onDialogChange,
    clinicName,
    onClinicNameChange,
    saving,
    onCreate,
}: {
    dialogOpen: boolean;
    onDialogChange: (open: boolean) => void;
    clinicName: string;
    onClinicNameChange: (name: string) => void;
    saving: boolean;
    onCreate: () => void;
}) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Você ainda não tem uma clínica</h3>
                <p className="text-muted-foreground mb-6">
                    Crie sua clínica para começar a gerenciar sua equipe
                </p>
                <CreateClinicDialog
                    open={dialogOpen}
                    onOpenChange={onDialogChange}
                    clinicName={clinicName}
                    onClinicNameChange={onClinicNameChange}
                    saving={saving}
                    onCreate={onCreate}
                />
            </CardContent>
        </Card>
    );
}

export function ClinicInfoCard({ clinic, isOwner }: { clinic: Clinic; isOwner: boolean }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">{clinic.name}</CardTitle>
                        <CardDescription>
                            Criada em {clinic.createdAt && new Date(clinic.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                    </div>
                    {isOwner ? (
                        <Badge variant="outline" className={ESTILOS_FUNCAO.owner}>
                            <Crown className="w-3 h-3 mr-1" />
                            Proprietário
                        </Badge>
                    ) : (
                        <Badge variant="outline" className={ESTILOS_FUNCAO.member}>
                            <User className="w-3 h-3 mr-1" />
                            Membro
                        </Badge>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
}
