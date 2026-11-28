import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useFormulariosClinica } from "@/hooks/useClinicManagement";
import type { Clinic, ClinicInvite, MemberRole } from "@/lib/clinics";
import { generateInviteLink } from "@/lib/email";
import { Check, Copy, Link2, Loader2, Mail, Plus, Trash2, Users } from "lucide-react";
import { ESTILOS_FUNCAO, ICONES_FUNCAO, ROTULOS_FUNCAO } from "./clinicPresentation";
import { ClinicInfoCard } from "./ClinicOverview";

function ClinicMemberCard({
    email,
    name,
    role,
    uid,
    isOwner,
    onRemove,
}: {
    email: string;
    name?: string;
    role: MemberRole;
    uid: string;
    isOwner: boolean;
    onRemove: (uid: string) => void;
}) {
    const RoleIcon = ICONES_FUNCAO[role];
    const displayName = name || (email ? email.split("@")[0] : "Membro");
    const avatarInitial = (name || email || "M").charAt(0).toUpperCase();

    return (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {avatarInitial}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Badge variant="outline" className={ESTILOS_FUNCAO[role]}>
                    <RoleIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                    {ROTULOS_FUNCAO[role]}
                </Badge>
                {isOwner && role !== "owner" && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 sm:h-10 sm:w-10 text-destructive hover:text-destructive"
                        aria-label={`Remover ${displayName} da clínica`}
                        onClick={() => onRemove(uid)}
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function InviteMemberDialog({
    open,
    onOpenChange,
    email,
    onEmailChange,
    role,
    onRoleChange,
    saving,
    onSend,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    onEmailChange: (email: string) => void;
    role: MemberRole;
    onRoleChange: (role: MemberRole) => void;
    saving: boolean;
    onSend: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Convidar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                    <DialogDescription>
                        Envie um convite para adicionar um novo membro à equipe
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                            id="invite-email"
                            type="email"
                            autoComplete="email"
                            placeholder="email@exemplo.com"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invite-role">Função</Label>
                        <Select
                            value={role}
                            onValueChange={(value) => onRoleChange(value as MemberRole)}
                        >
                            <SelectTrigger id="invite-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="member">Membro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button variant="default" onClick={onSend} disabled={saving || !email.trim()}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar Convite
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ClinicTeamCard({
    clinic,
    isOwner,
    forms,
    onSendInvite,
    onRemoveMember,
}: {
    clinic: Clinic;
    isOwner: boolean;
    forms: ReturnType<typeof useFormulariosClinica>;
    onSendInvite: () => void;
    onRemoveMember: (uid: string) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Equipe
                        </CardTitle>
                        <CardDescription>
                            {clinic.members.length} membro{clinic.members.length !== 1 && "s"}
                        </CardDescription>
                    </div>
                    {isOwner && (
                        <InviteMemberDialog
                            open={forms.dialogoConviteAberto}
                            onOpenChange={forms.setDialogoConviteAberto}
                            email={forms.emailConvite}
                            onEmailChange={forms.setEmailConvite}
                            role={forms.funcaoConvite}
                            onRoleChange={forms.setFuncaoConvite}
                            saving={false}
                            onSend={onSendInvite}
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {clinic.members.map((member, index) => (
                        <ClinicMemberCard
                            key={member.uid || member.email || index}
                            email={member.email}
                            name={member.name}
                            role={member.role}
                            uid={member.uid}
                            isOwner={isOwner}
                            onRemove={onRemoveMember}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function PendingInvitesCard({
    clinicId,
    invites,
}: {
    clinicId: string;
    invites: ClinicInvite[];
}) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (invites.length === 0) return null;

    const handleCopyLink = async (invite: ClinicInvite) => {
        if (!invite.id) return;
        const link = generateInviteLink(invite.id, clinicId);
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(link);
            }
            setCopiedId(invite.id);
            toast({
                title: "Link de convite copiado!",
                description: `Envie o link para ${invite.email} acessar a clínica.`,
            });
            window.setTimeout(() => setCopiedId((prev) => (prev === invite.id ? null : prev)), 2500);
        } catch {
            toast({
                title: "Link de convite",
                description: link,
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Link2 className="w-5 h-5" aria-hidden="true" />
                    Convites Pendentes
                </CardTitle>
                <CardDescription>
                    Compartilhe o link direto ou aguarde o colaborador acessar a página Clínica com o e-mail convidado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {invites.map((invite) => (
                        <div
                            key={invite.id || invite.email}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card"
                        >
                            <div className="min-w-0">
                                <p className="font-medium truncate">{invite.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={ESTILOS_FUNCAO[invite.role]}>
                                        {ROTULOS_FUNCAO[invite.role]}
                                    </Badge>
                                    {invite.createdAt && (
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            Enviado em {new Date(invite.createdAt).toLocaleDateString("pt-BR")}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="shrink-0 h-10"
                                onClick={() => handleCopyLink(invite)}
                            >
                                {copiedId === invite.id ? (
                                    <>
                                        <Check className="w-4 h-4 mr-1.5 text-success" aria-hidden="true" />
                                        Copiado
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />
                                        Copiar link
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ExistingClinicSection({
    clinic,
    isOwner,
    pendingInvites = [],
    forms,
    onSendInvite,
    onRemoveMember,
}: {
    clinic: Clinic;
    isOwner: boolean;
    pendingInvites?: ClinicInvite[];
    forms: ReturnType<typeof useFormulariosClinica>;
    onSendInvite: () => void;
    onRemoveMember: (uid: string) => void;
}) {
    return (
        <>
            <ClinicInfoCard clinic={clinic} isOwner={isOwner} />
            <ClinicTeamCard
                clinic={clinic}
                isOwner={isOwner}
                forms={forms}
                onSendInvite={onSendInvite}
                onRemoveMember={onRemoveMember}
            />
            {isOwner && clinic.id && (
                <PendingInvitesCard clinicId={clinic.id} invites={pendingInvites} />
            )}
        </>
    );
}
