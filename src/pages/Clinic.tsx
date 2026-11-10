import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Building2,
    Plus,
    Users,
    Mail,
    Crown,
    Shield,
    User,
    Loader2,
    Trash2,
    Check,
    X,
    UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import {
    createClinic,
    getUserClinic,
    sendClinicInvite,
    acceptClinicInvite,
    getInviteById,
    removeClinicMember,
    type Clinic,
    type ClinicInvite,
    type MemberRole,
} from "@/lib/clinics";
import { toast } from "@/hooks/use-toast";


// =============================================================================
// CONSTANTES — Mapeamentos de estilo e rótulos
// =============================================================================

const ICONES_FUNCAO: Record<MemberRole, React.ElementType> = {
    owner: Crown,
    admin: Shield,
    member: User,
};

const ROTULOS_FUNCAO: Record<MemberRole, string> = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
};

const ESTILOS_FUNCAO: Record<MemberRole, string> = {
    owner: "bg-warning/10 text-warning border-warning/20",
    admin: "bg-primary/10 text-primary border-primary/20",
    member: "bg-muted text-muted-foreground",
};


// =============================================================================
// INTERFACES — Segregação de Interface (I do SOLID)
// =============================================================================

/** Dados do formulário de criação de clínica */
interface DadosFormularioCriacao {
    nomeClinica: string;
}

/** Dados do formulário de convite */
interface DadosFormularioConvite {
    email: string;
    funcao: MemberRole;
}

/** Props de um membro da equipe */
interface PropsCartaoMembro {
    email: string;
    nome?: string;
    funcao: MemberRole;
    uid: string;
    ehProprietario: boolean;
    aoRemover: (uid: string) => void;
}

/** Props do banner de convite pendente */
interface PropsBannerConvite {
    convite: ClinicInvite;
    salvando: boolean;
    aoAceitar: () => void;
    aoRecusar: () => void;
}

/** Props do card de informações da clínica */
interface PropsInfoClinica {
    clinica: Clinic;
    ehProprietario: boolean;
}


// =============================================================================
// HOOKS CUSTOMIZADOS — Inversão de Dependência (D do SOLID)
// =============================================================================

/**
 * Hook: useDadosClinica
 * Responsabilidade Única (S): carregar e gerenciar dados da clínica.
 */
function useDadosClinica() {
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

/**
 * Hook: useConviteUrl
 * Responsabilidade Única (S): processar convites recebidos via URL.
 */
function useConviteUrl(user: any) {
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
    }, [searchParams, user]);

    const limparConvite = () => {
        setConvitePendente(null);
        setSearchParams({});
    };

    const obterIdClinicaUrl = () => searchParams.get("clinic");

    return { convitePendente, carregandoConvite, limparConvite, obterIdClinicaUrl };
}

/**
 * Hook: useAcoesClinica
 * Responsabilidade Única (S): operações de negócio — criar clínica, convidar, aceitar, remover.
 */
function useAcoesClinica(
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
        } catch (erro: any) {
            console.error("Erro ao aceitar convite:", erro);
            toast({
                title: "Erro ao aceitar convite",
                description: erro?.message || "Tente novamente.",
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

/**
 * Hook: useFormulariosClinica
 * Responsabilidade Única (S): gerenciar estado dos formulários (criação e convite).
 */
function useFormulariosClinica() {
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


// =============================================================================
// COMPONENTES PUROS — Responsabilidade Única (S) + Aberto/Fechado (O)
// =============================================================================

/** Indicador de carregamento */
function IndicadorCarregamento() {
    return (
        <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Carregando...</span>
        </div>
    );
}

/** Cabeçalho da página */
function Cabecalho() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                        Clínica
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie sua equipe e colaboradores
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Banner de convite pendente recebido via URL */
function BannerConvitePendente({ convite, salvando, aoAceitar, aoRecusar }: PropsBannerConvite) {
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
                        <p className="font-semibold text-lg">{convite.clinicName}</p>
                        <p className="text-sm text-muted-foreground">
                            Função: {ROTULOS_FUNCAO[convite.role]}
                        </p>
                        {convite.invitedByName && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Convidado por: {convite.invitedByName}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={aoRecusar}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Recusar
                        </Button>
                        <Button
                            size="sm"
                            variant="neuro"
                            onClick={aoAceitar}
                            disabled={salvando}
                        >
                            {salvando ? (
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

/** Estado vazio — nenhuma clínica encontrada */
function EstadoSemClinica({
    dialogoAberto,
    aoMudarDialogo,
    nomeClinica,
    aoMudarNome,
    salvando,
    aoCriar,
}: {
    dialogoAberto: boolean;
    aoMudarDialogo: (aberto: boolean) => void;
    nomeClinica: string;
    aoMudarNome: (nome: string) => void;
    salvando: boolean;
    aoCriar: () => void;
}) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Você ainda não tem uma clínica</h3>
                <p className="text-muted-foreground mb-6">
                    Crie sua clínica para começar a gerenciar sua equipe
                </p>

                <DialogoCriarClinica
                    aberto={dialogoAberto}
                    aoMudar={aoMudarDialogo}
                    nomeClinica={nomeClinica}
                    aoMudarNome={aoMudarNome}
                    salvando={salvando}
                    aoCriar={aoCriar}
                />
            </CardContent>
        </Card>
    );
}

/** Diálogo para criar nova clínica */
function DialogoCriarClinica({
    aberto,
    aoMudar,
    nomeClinica,
    aoMudarNome,
    salvando,
    aoCriar,
}: {
    aberto: boolean;
    aoMudar: (aberto: boolean) => void;
    nomeClinica: string;
    aoMudarNome: (nome: string) => void;
    salvando: boolean;
    aoCriar: () => void;
}) {
    return (
        <Dialog open={aberto} onOpenChange={aoMudar}>
            <DialogTrigger asChild>
                <Button variant="neuro">
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
                        value={nomeClinica}
                        onChange={(e) => aoMudarNome(e.target.value)}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => aoMudar(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="neuro"
                        onClick={aoCriar}
                        disabled={salvando || !nomeClinica.trim()}
                    >
                        {salvando ? (
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

/** Card com informações da clínica (nome, data de criação, badge do proprietário) */
function CardInfoClinica({ clinica, ehProprietario }: PropsInfoClinica) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">{clinica.name}</CardTitle>
                        <CardDescription>
                            Criada em {clinica.createdAt && new Date(clinica.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                    </div>
                    {ehProprietario ? (
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

/** Card de um membro individual da equipe */
function CartaoMembro({ email, nome, funcao, uid, ehProprietario, aoRemover }: PropsCartaoMembro) {
    const IconeFuncao = ICONES_FUNCAO[funcao];

    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {email[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{nome || email.split("@")[0]}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className={ESTILOS_FUNCAO[funcao]}>
                    <IconeFuncao className="w-3 h-3 mr-1" />
                    {ROTULOS_FUNCAO[funcao]}
                </Badge>
                {ehProprietario && funcao !== "owner" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => aoRemover(uid)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

/** Diálogo para enviar convite a um novo membro */
function DialogoConvidarMembro({
    aberto,
    aoMudar,
    email,
    aoMudarEmail,
    funcao,
    aoMudarFuncao,
    salvando,
    aoEnviar,
}: {
    aberto: boolean;
    aoMudar: (aberto: boolean) => void;
    email: string;
    aoMudarEmail: (email: string) => void;
    funcao: MemberRole;
    aoMudarFuncao: (funcao: MemberRole) => void;
    salvando: boolean;
    aoEnviar: () => void;
}) {
    return (
        <Dialog open={aberto} onOpenChange={aoMudar}>
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
                            onChange={(e) => aoMudarEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invite-role">Função</Label>
                        <Select
                            value={funcao}
                            onValueChange={(value) => aoMudarFuncao(value as MemberRole)}
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
                    <Button variant="outline" onClick={() => aoMudar(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="neuro"
                        onClick={aoEnviar}
                        disabled={salvando || !email.trim()}
                    >
                        {salvando ? (
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

/** Card da equipe com lista de membros e botão de convidar */
function CardEquipe({
    clinica,
    ehProprietario,
    formularios,
    aoEnviarConvite,
    aoRemoverMembro,
}: {
    clinica: Clinic;
    ehProprietario: boolean;
    formularios: ReturnType<typeof useFormulariosClinica>;
    aoEnviarConvite: () => void;
    aoRemoverMembro: (uid: string) => void;
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
                            {clinica.members.length} membro{clinica.members.length !== 1 && "s"}
                        </CardDescription>
                    </div>

                    {ehProprietario && (
                        <DialogoConvidarMembro
                            aberto={formularios.dialogoConviteAberto}
                            aoMudar={formularios.setDialogoConviteAberto}
                            email={formularios.emailConvite}
                            aoMudarEmail={formularios.setEmailConvite}
                            funcao={formularios.funcaoConvite}
                            aoMudarFuncao={formularios.setFuncaoConvite}
                            salvando={false}
                            aoEnviar={aoEnviarConvite}
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {clinica.members.map((membro, indice) => (
                        <CartaoMembro
                            key={indice}
                            email={membro.email}
                            nome={membro.name}
                            funcao={membro.role}
                            uid={membro.uid}
                            ehProprietario={ehProprietario}
                            aoRemover={aoRemoverMembro}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/** Seção completa quando a clínica existe */
function SecaoClinicaExistente({
    clinica,
    ehProprietario,
    formularios,
    aoEnviarConvite,
    aoRemoverMembro,
}: {
    clinica: Clinic;
    ehProprietario: boolean;
    formularios: ReturnType<typeof useFormulariosClinica>;
    aoEnviarConvite: () => void;
    aoRemoverMembro: (uid: string) => void;
}) {
    return (
        <>
            <CardInfoClinica clinica={clinica} ehProprietario={ehProprietario} />
            <CardEquipe
                clinica={clinica}
                ehProprietario={ehProprietario}
                formularios={formularios}
                aoEnviarConvite={aoEnviarConvite}
                aoRemoverMembro={aoRemoverMembro}
            />
        </>
    );
}


// =============================================================================
// COMPONENTE PRINCIPAL — Composição via Inversão de Dependência (D do SOLID)
// =============================================================================

export default function ClinicPage() {
    const dados = useDadosClinica();
    const conviteUrl = useConviteUrl(dados.user);
    const formularios = useFormulariosClinica();
    const acoes = useAcoesClinica(dados, conviteUrl);

    const aoClicarCriar = async () => {
        await acoes.criarClinica(formularios.nomeClinica);
        formularios.resetarFormularioCriacao();
    };

    const aoClicarEnviarConvite = async () => {
        if (!dados.clinica?.id) return;
        await acoes.enviarConvite(
            dados.clinica.id,
            dados.clinica.name,
            formularios.emailConvite,
            formularios.funcaoConvite
        );
        formularios.resetarFormularioConvite();
    };

    const aoRemoverMembro = (uid: string) => {
        if (!dados.clinica?.id) return;
        acoes.removerMembro(dados.clinica.id, uid);
    };

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                <Cabecalho />

                {dados.carregando || conviteUrl.carregandoConvite ? (
                    <IndicadorCarregamento />
                ) : (
                    <>
                        {/* Convite Pendente via URL */}
                        {conviteUrl.convitePendente && (
                            <BannerConvitePendente
                                convite={conviteUrl.convitePendente}
                                salvando={dados.salvando}
                                aoAceitar={acoes.aceitarConviteUrl}
                                aoRecusar={acoes.recusarConviteUrl}
                            />
                        )}

                        {/* Sem Clínica */}
                        {!dados.clinica && !conviteUrl.convitePendente && (
                            <EstadoSemClinica
                                dialogoAberto={formularios.dialogoCriacaoAberto}
                                aoMudarDialogo={formularios.setDialogoCriacaoAberto}
                                nomeClinica={formularios.nomeClinica}
                                aoMudarNome={formularios.setNomeClinica}
                                salvando={dados.salvando}
                                aoCriar={aoClicarCriar}
                            />
                        )}

                        {/* Clínica Existente */}
                        {dados.clinica && (
                            <SecaoClinicaExistente
                                clinica={dados.clinica}
                                ehProprietario={dados.ehProprietario}
                                formularios={formularios}
                                aoEnviarConvite={aoClicarEnviarConvite}
                                aoRemoverMembro={aoRemoverMembro}
                            />
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
