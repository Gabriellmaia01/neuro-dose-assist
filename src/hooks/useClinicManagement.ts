import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { toast } from "@/hooks/use-toast";
import {
    acceptClinicInvite,
    createClinic,
    getInviteById,
    getUserClinic,
    removeClinicMember,
    sendClinicInvite,
    type Clinic,
    type ClinicInvite,
    type MemberRole,
} from "@/lib/clinics";
import type { AuthUser } from "@/services/contracts/auth.types";

export function useDadosClinica() {
    const { user } = useAuth();
    const { refreshClinic } = useClinic();

    const [clinica, setClinica] = useState<Clinic | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        const carregarDados = async () => {
            if (!user?.email) return;

            try {
                setCarregando(true);
                const dadosClinica = await getUserClinic(user.uid);
                setClinica(dadosClinica);
            } catch (erro) {
                console.error("Erro ao carregar dados da clínica:", erro);
            } finally {
                setCarregando(false);
            }
        };

        carregarDados();
    }, [user]);

    const recarregar = async () => {
        if (!user) return;
        const atualizada = await getUserClinic(user.uid);
        setClinica(atualizada);
        await refreshClinic();
    };

    const ehProprietario = clinica?.ownerId === user?.uid;

    return { clinica, carregando, salvando, setSalvando, recarregar, user, ehProprietario, refreshClinic };
}

export function useConviteUrl(user: AuthUser | null) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [convitePendente, setConvitePendente] = useState<ClinicInvite | null>(null);
    const [carregandoConvite, setCarregandoConvite] = useState(false);

    useEffect(() => {
        const carregarConvite = async () => {
            const idConvite = searchParams.get("invite");
            const idClinica = searchParams.get("clinic");

            if (!idConvite || !idClinica || !user) return;

            try {
                setCarregandoConvite(true);
                const convite = await getInviteById(idClinica, idConvite);

                if (convite && convite.status === "pending") {
                    setConvitePendente(convite);
                } else if (convite && convite.status === "accepted") {
                    toast({
                        title: "Convite já aceito",
                        description: "Este convite já foi utilizado anteriormente.",
                    });
                    setSearchParams({});
                } else {
                    toast({
                        title: "Convite não encontrado",
                        description: "Este convite pode ter expirado ou sido removido.",
                        variant: "destructive",
                    });
                    setSearchParams({});
                }
            } catch (erro) {
                console.error("Erro ao carregar convite:", erro);
            } finally {
                setCarregandoConvite(false);
            }
        };

        carregarConvite();
    }, [searchParams, setSearchParams, user]);

    const limparConvite = () => {
        setConvitePendente(null);
        setSearchParams({});
    };

    const obterIdClinicaUrl = () => searchParams.get("clinic");

    return { convitePendente, carregandoConvite, limparConvite, obterIdClinicaUrl };
}

export function useAcoesClinica(
    dados: ReturnType<typeof useDadosClinica>,
    conviteUrl: ReturnType<typeof useConviteUrl>
) {
    const { user, setSalvando, recarregar } = dados;

    const criarClinica = async (nome: string) => {
        if (!user?.email || !nome.trim()) return;

        try {
            setSalvando(true);
            await createClinic(nome.trim(), user.uid, user.email);
            toast({
                title: "Clínica criada!",
                description: `${nome} foi criada com sucesso.`,
            });
            await recarregar();
        } catch (erro) {
            console.error("Erro ao criar clínica:", erro);
            toast({ title: "Erro ao criar clínica", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    };

    const enviarConvite = async (clinicaId: string, nomeClinica: string, email: string, funcao: MemberRole) => {
        if (!user || !email.trim()) return;

        if (!email.includes("@")) {
            toast({
                title: "Email inválido",
                description: "O email deve conter @. Verifique e tente novamente.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSalvando(true);
            const resultado = await sendClinicInvite(
                clinicaId,
                nomeClinica,
                email.trim(),
                funcao,
                user.uid,
                user.displayName || user.email || undefined
            );

            if (resultado.emailSent) {
                toast({
                    title: "Convite enviado por email! 📧",
                    description: `Um email de convite foi enviado para ${email}`,
                });
            } else {
                toast({
                    title: "Convite criado!",
                    description: `Convite para ${email} foi salvo. Configure o EmailJS para enviar por email.`,
                });
            }
        } catch (erro) {
            console.error("Erro ao enviar convite:", erro);
            toast({ title: "Erro ao enviar convite", variant: "destructive" });
        } finally {
            setSalvando(false);
        }
    };

    const aceitarConviteUrl = async () => {
        if (!user || !conviteUrl.convitePendente?.id) return;

        const idClinica = conviteUrl.obterIdClinicaUrl();
        if (!idClinica) return;

        try {
            setSalvando(true);
            await acceptClinicInvite(
                conviteUrl.convitePendente.id,
                idClinica,
                user.uid,
                user.email || "",
                user.displayName || undefined
            );
            toast({
                title: "Convite aceito! 🎉",
                description: `Você agora faz parte de ${conviteUrl.convitePendente.clinicName}`,
            });

            conviteUrl.limparConvite();
            await recarregar();
        } catch (erro: unknown) {
            console.error("Erro ao aceitar convite:", erro);
            const message =
                typeof erro === "object" && erro !== null && "message" in erro
                    ? erro.message
                    : undefined;
            toast({
                title: "Erro ao aceitar convite",
                description: typeof message === "string" ? message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    };

    const recusarConviteUrl = () => {
        conviteUrl.limparConvite();
        toast({ title: "Convite recusado" });
    };

    const removerMembro = async (clinicaId: string, uidMembro: string) => {
        if (!confirm("Tem certeza que deseja remover este membro?")) return;

        try {
            await removeClinicMember(clinicaId, uidMembro);
            toast({ title: "Membro removido" });
            await recarregar();
        } catch (erro) {
            console.error("Erro ao remover membro:", erro);
            toast({ title: "Erro ao remover membro", variant: "destructive" });
        }
    };

    return { criarClinica, enviarConvite, aceitarConviteUrl, recusarConviteUrl, removerMembro };
}

export function useFormulariosClinica() {
    const [dialogoCriacaoAberto, setDialogoCriacaoAberto] = useState(false);
    const [dialogoConviteAberto, setDialogoConviteAberto] = useState(false);
    const [nomeClinica, setNomeClinica] = useState("");
    const [emailConvite, setEmailConvite] = useState("");
    const [funcaoConvite, setFuncaoConvite] = useState<MemberRole>("member");

    const resetarFormularioCriacao = () => {
        setNomeClinica("");
        setDialogoCriacaoAberto(false);
    };

    const resetarFormularioConvite = () => {
        setEmailConvite("");
        setFuncaoConvite("member");
        setDialogoConviteAberto(false);
    };

    return {
        dialogoCriacaoAberto,
        setDialogoCriacaoAberto,
        dialogoConviteAberto,
        setDialogoConviteAberto,
        nomeClinica,
        setNomeClinica,
        emailConvite,
        setEmailConvite,
        funcaoConvite,
        setFuncaoConvite,
        resetarFormularioCriacao,
        resetarFormularioConvite,
    };
}
