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
import { useFormulariosClinica } from "@/hooks/useClinicManagement";
import type { Clinic, MemberRole } from "@/lib/clinics";
import { Loader2, Mail, Plus, Trash2, Users } from "lucide-react";
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

    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {email[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{name || email.split("@")[0]}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className={ESTILOS_FUNCAO[role]}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {ROTULOS_FUNCAO[role]}
                </Badge>
                {isOwner && role !== "owner" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemove(uid)}
                    >
                        <Trash2 className="w-4 h-4" />
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
                <Button variant="neuro" size="sm">
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
                    <Button variant="neuro" onClick={onSend} disabled={saving || !email.trim()}>
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
                            key={index}
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

export function ExistingClinicSection({
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
        <>
            <ClinicInfoCard clinic={clinic} isOwner={isOwner} />
            <ClinicTeamCard
                clinic={clinic}
                isOwner={isOwner}
                forms={forms}
                onSendInvite={onSendInvite}
                onRemoveMember={onRemoveMember}
            />
        </>
    );
}
