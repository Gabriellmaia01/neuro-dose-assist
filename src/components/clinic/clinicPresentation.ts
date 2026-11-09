import { Crown, Shield, User } from "lucide-react";
import type { MemberRole } from "@/lib/clinics";

export const ICONES_FUNCAO: Record<MemberRole, typeof Crown> = {
    owner: Crown,
    admin: Shield,
    member: User,
};

export const ROTULOS_FUNCAO: Record<MemberRole, string> = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
};

export const ESTILOS_FUNCAO: Record<MemberRole, string> = {
    owner: "bg-warning/10 text-warning border-warning/20",
    admin: "bg-primary/10 text-primary border-primary/20",
    member: "bg-muted text-muted-foreground",
};
