import { useState, useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    X,
    MoreHorizontal,
    Edit,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getPatients, type Patient } from "@/lib/patients";
import {
    saveAppointment,
    getAppointments,
    deleteAppointment,
    updateAppointmentStatus,
    type Appointment,
    type AppointmentType,
    type AppointmentStatus,
} from "@/lib/appointments";
import { toast } from "@/hooks/use-toast";


// =============================================================================
// CONSTANTES
// =============================================================================

const ESTILOS_TIPO_CONSULTA: Record<AppointmentType, string> = {
    Consulta: "bg-primary/10 text-primary border-primary/20",
    Retorno: "bg-info/10 text-info border-info/20",
    Exame: "bg-warning/10 text-warning border-warning/20",
    Outro: "bg-muted text-muted-foreground border-muted",
};

const ESTILOS_STATUS_CONSULTA: Record<AppointmentStatus, string> = {
    Agendada: "bg-muted text-muted-foreground",
    Confirmada: "bg-info/10 text-info",
    Concluída: "bg-success/10 text-success",
    Cancelada: "bg-destructive/10 text-destructive",
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];


// =============================================================================
// INTERFACES — Segregação de Interface (I do SOLID)
// Cada interface representa um contrato enxuto e específico.
// =============================================================================

/** Dados do formulário de agendamento */
interface DadosFormulario {
    patientId: string;
    date: string;
    time: string;
    duration: string;
    type: AppointmentType;
    notes: string;
}

/** Estado do diálogo de agendamento */
interface EstadoDialogo {
    aberto: boolean;
    salvando: boolean;
    consultaEditando: Appointment | null;
}

/** Estado do calendário (mês atual e data selecionada) */
interface EstadoCalendario {
    dataAtual: Date;
    dataSelecionada: string | null;
}

/** Props do componente de cabeçalho */
interface PropsCabecalho {
    aoClicarHoje: () => void;
    dialogoAberto: boolean;
    aoMudarDialogo: (aberto: boolean) => void;
    aoClicarNovaConsulta: () => void;
    consultaEditando: Appointment | null;
    dadosFormulario: DadosFormulario;
    aoAtualizarFormulario: (dados: Partial<DadosFormulario>) => void;
    pacientes: Patient[];
    salvando: boolean;
    aoSalvar: () => void;
    aoFecharDialogo: () => void;
}

/** Props do componente de célula do calendário */
interface PropsCelulaDia {
    dia: number;
    consultasDoDia: Appointment[];
    selecionado: boolean;
    ehHoje: boolean;
    ehPassado: boolean;
    aoClicar: (dia: number) => void;
}

/** Props do card de consulta individual */
interface PropsCartaoConsulta {
    consulta: Appointment;
    aoMudarStatus: (id: string, status: AppointmentStatus) => void;
    aoEditar: (consulta: Appointment) => void;
    aoExcluir: (id: string) => void;
}

/** Props do painel lateral de consultas do dia */
interface PropsPainelDia {
    dataSelecionada: string | null;
    consultas: Appointment[];
    ehDataPassada: boolean;
    aoClicarAgendar: () => void;
    aoMudarStatus: (id: string, status: AppointmentStatus) => void;
    aoEditar: (consulta: Appointment) => void;
    aoExcluir: (id: string) => void;
}


// =============================================================================
// FUNÇÕES UTILITÁRIAS — Responsabilidade Única (S do SOLID)
// Cada função tem uma única razão para existir.
// =============================================================================

/** Converte horário "HH:mm" para total de minutos desde meia-noite */
function horarioParaMinutos(horario: string): number {
    const [h, m] = horario.split(":").map(Number);
    return h * 60 + m;
}

/** Formata dia em string de data ISO (YYYY-MM-DD) */
function formatarDataISO(dataAtual: Date, dia: number): string {
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const diaStr = String(dia).padStart(2, "0");
    return `${ano}-${mes}-${diaStr}`;
}

/** Verifica se um dia é hoje */
function verificarSeEhHoje(dataAtual: Date, dia: number): boolean {
    const hoje = new Date();
    return (
        dia === hoje.getDate() &&
        dataAtual.getMonth() === hoje.getMonth() &&
        dataAtual.getFullYear() === hoje.getFullYear()
    );
}

/** Verifica se um dia já passou */
function verificarSeEhPassado(dataAtual: Date, dia: number): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVerificar = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
    return dataVerificar < hoje;
}

/** Gera o array de dias do calendário (com nulls para espaços antes do dia 1) */
function gerarDiasCalendario(dataAtual: Date): (number | null)[] {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diaSemanaInicial = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();

    const dias: (number | null)[] = [];

    for (let i = 0; i < diaSemanaInicial; i++) {
        dias.push(null);
    }

    for (let i = 1; i <= totalDias; i++) {
        dias.push(i);
    }

    return dias;
}

/**
 * Verifica conflito de horário entre uma nova consulta e as existentes.
 * Retorna a consulta conflitante ou null.
 */
function verificarConflitoHorario(
    consultas: Appointment[],
    data: string,
    horario: string,
    duracao: number,
    idExcluir?: string
): Appointment | null {
    const novoInicio = horarioParaMinutos(horario);
    const novoFim = novoInicio + duracao;

    return consultas.find(c => {
        if (idExcluir && c.id === idExcluir) return false;
        if (c.status === "Cancelada" || c.status === "Concluída") return false;
        if (c.date !== data) return false;

        const inicioExistente = horarioParaMinutos(c.time);
        const fimExistente = inicioExistente + (c.duration || 30);

        return novoInicio < fimExistente && novoFim > inicioExistente;
    }) || null;
}

/** Valida se a data/hora selecionada não está no passado */
function validarDataHoraFutura(data: string, horario: string): boolean {
    const agora = new Date();
    const [ano, mes, dia] = data.split("-").map(Number);
    const [horas, minutos] = horario.split(":").map(Number);
    const dataHoraSelecionada = new Date(ano, mes - 1, dia, horas, minutos);
    return dataHoraSelecionada >= agora;
}


// =============================================================================
// HOOKS CUSTOMIZADOS — Inversão de Dependência (D do SOLID)
// A página depende de abstrações (hooks) e não de implementações concretas.
// =============================================================================

/**
 * Hook: useDadosAgenda
 * Responsabilidade Única (S): carregar consultas e pacientes do backend.
 */
function useDadosAgenda() {
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();

    const [consultas, setConsultas] = useState<Appointment[]>([]);
    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarDados = async () => {
            if (!user || !effectiveUserId) return;

            try {
                setCarregando(true);
                const [dadosConsultas, dadosPacientes] = await Promise.all([
                    getAppointments(effectiveUserId),
                    getPatients(effectiveUserId),
                ]);
                setConsultas(dadosConsultas);
                setPacientes(dadosPacientes);
            } catch (erro) {
                console.error("Erro ao carregar dados:", erro);
                toast({
                    title: "Erro ao carregar dados",
                    description: "Não foi possível carregar a agenda.",
                    variant: "destructive",
                });
            } finally {
                setCarregando(false);
            }
        };

        carregarDados();
    }, [user, effectiveUserId]);

    const recarregar = async () => {
        if (!effectiveUserId) return;
        const atualizadas = await getAppointments(effectiveUserId);
        setConsultas(atualizadas);
    };

    return { consultas, pacientes, carregando, recarregar, user, effectiveUserId };
}

/**
 * Hook: useCalendario
 * Responsabilidade Única (S): controlar navegação e estado do calendário.
 */
function useCalendario() {
    const [dataAtual, setDataAtual] = useState(new Date());
    const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

    const diasCalendario = useMemo(() => gerarDiasCalendario(dataAtual), [dataAtual]);

    const irMesAnterior = () => {
        setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1));
    };

    const irProximoMes = () => {
        setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1));
    };

    const irParaHoje = () => {
        setDataAtual(new Date());
        setDataSelecionada(new Date().toISOString().split("T")[0]);
    };

    const selecionarDia = (dia: number) => {
        setDataSelecionada(formatarDataISO(dataAtual, dia));
    };

    const ehDataSelecionadaPassada = useMemo(() => {
        if (!dataSelecionada) return false;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const selecionada = new Date(dataSelecionada + "T00:00:00");
        return selecionada < hoje;
    }, [dataSelecionada]);

    return {
        dataAtual,
        dataSelecionada,
        diasCalendario,
        irMesAnterior,
        irProximoMes,
        irParaHoje,
        selecionarDia,
        ehDataSelecionadaPassada,
    };
}

/**
 * Hook: useFormularioConsulta
 * Responsabilidade Única (S): gerenciar estado e ações do formulário de agendamento.
 */
function useFormularioConsulta(dataSelecionada: string | null) {
    const FORMULARIO_VAZIO: DadosFormulario = {
        patientId: "",
        date: "",
        time: "",
        duration: "30",
        type: "Consulta",
        notes: "",
    };

    const [dadosFormulario, setDadosFormulario] = useState<DadosFormulario>(FORMULARIO_VAZIO);
    const [dialogoAberto, setDialogoAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [consultaEditando, setConsultaEditando] = useState<Appointment | null>(null);

    const resetarFormulario = () => {
        setDadosFormulario({ ...FORMULARIO_VAZIO, date: dataSelecionada || "" });
        setConsultaEditando(null);
    };

    const abrirNovaConsulta = () => {
        resetarFormulario();
        if (dataSelecionada) {
            setDadosFormulario(prev => ({ ...prev, date: dataSelecionada }));
        }
        setDialogoAberto(true);
    };

    const abrirEdicao = (consulta: Appointment) => {
        setConsultaEditando(consulta);
        setDadosFormulario({
            patientId: consulta.patientId,
            date: consulta.date,
            time: consulta.time,
            duration: consulta.duration.toString(),
            type: consulta.type,
            notes: consulta.notes || "",
        });
        setDialogoAberto(true);
    };

    const aoMudarDialogo = (aberto: boolean) => {
        setDialogoAberto(aberto);
        if (!aberto) resetarFormulario();
    };

    const atualizarFormulario = (dados: Partial<DadosFormulario>) => {
        setDadosFormulario(prev => ({ ...prev, ...dados }));
    };

    return {
        dadosFormulario,
        atualizarFormulario,
        dialogoAberto,
        setDialogoAberto,
        salvando,
        setSalvando,
        consultaEditando,
        resetarFormulario,
        abrirNovaConsulta,
        abrirEdicao,
        aoMudarDialogo,
    };
}

/**
 * Hook: useAcoesConsulta
 * Responsabilidade Única (S): operações CRUD sobre consultas (salvar, excluir, mudar status).
 */
function useAcoesConsulta(
    consultas: Appointment[],
    pacientes: Patient[],
    formulario: ReturnType<typeof useFormularioConsulta>,
    recarregar: () => Promise<void>,
    user: any,
    effectiveUserId: string | undefined
) {
    const { dadosFormulario, consultaEditando, setSalvando, setDialogoAberto, resetarFormulario } = formulario;

    const salvarConsulta = async () => {
        if (!user) return;

        // Validar campos obrigatórios
        if (!dadosFormulario.patientId || !dadosFormulario.date || !dadosFormulario.time) {
            toast({
                title: "Campos obrigatórios",
                description: "Selecione paciente, data e horário.",
                variant: "destructive",
            });
            return;
        }

        // Validar se não é no passado
        if (!validarDataHoraFutura(dadosFormulario.date, dadosFormulario.time)) {
            toast({
                title: "Horário inválido",
                description: "Não é possível agendar consultas em horários que já passaram.",
                variant: "destructive",
            });
            return;
        }

        // Verificar conflito de horário
        const conflito = verificarConflitoHorario(
            consultas,
            dadosFormulario.date,
            dadosFormulario.time,
            parseInt(dadosFormulario.duration),
            consultaEditando?.id
        );

        if (conflito) {
            toast({
                title: "Conflito de horário",
                description: `Já existe uma consulta com ${conflito.patientName} às ${conflito.time} (${conflito.duration} min) neste horário. Escolha outro horário.`,
                variant: "destructive",
            });
            return;
        }

        try {
            setSalvando(true);
            const paciente = pacientes.find(p => p.id === dadosFormulario.patientId);

            const dadosConsulta: Appointment = {
                id: consultaEditando?.id,
                patientId: dadosFormulario.patientId,
                patientName: paciente?.name || "Paciente",
                date: dadosFormulario.date,
                time: dadosFormulario.time,
                duration: parseInt(dadosFormulario.duration),
                type: dadosFormulario.type,
                status: consultaEditando?.status || "Agendada",
                notes: dadosFormulario.notes || undefined,
            };

            await saveAppointment(dadosConsulta, effectiveUserId!);

            toast({
                title: consultaEditando ? "Consulta atualizada!" : "Consulta agendada!",
                description: `${paciente?.name} - ${dadosFormulario.date} às ${dadosFormulario.time}`,
            });

            await recarregar();
            setDialogoAberto(false);
            resetarFormulario();
        } catch (erro) {
            console.error("Erro ao salvar consulta:", erro);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar a consulta.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    };

    const excluirConsulta = async (idConsulta: string) => {
        if (!user) return;
        if (!confirm("Tem certeza que deseja excluir esta consulta?")) return;

        try {
            await deleteAppointment(idConsulta, effectiveUserId!);
            toast({ title: "Consulta excluída" });
            await recarregar();
        } catch (erro) {
            console.error("Erro ao excluir consulta:", erro);
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    };

    const mudarStatusConsulta = async (idConsulta: string, status: AppointmentStatus) => {
        if (!user) return;

        try {
            await updateAppointmentStatus(idConsulta, status, effectiveUserId!);
            toast({ title: `Status atualizado: ${status}` });
            await recarregar();
        } catch (erro) {
            console.error("Erro ao atualizar status:", erro);
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    };

    return { salvarConsulta, excluirConsulta, mudarStatusConsulta };
}


// =============================================================================
// COMPONENTES PUROS — Responsabilidade Única (S) + Aberto/Fechado (O)
// Cada componente renderiza UMA parte da UI e é extensível via props.
// =============================================================================

/** Indicador de carregamento */
function IndicadorCarregamento() {
    return (
        <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Carregando agenda...</span>
        </div>
    );
}

/** Cabeçalho da página com título */
function Cabecalho() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
                <CalendarIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                    Agenda
                </h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie consultas e compromissos
                </p>
            </div>
        </div>
    );
}

/** Formulário de agendamento dentro do diálogo */
function FormularioConsulta({
    dadosFormulario,
    aoAtualizar,
    pacientes,
}: {
    dadosFormulario: DadosFormulario;
    aoAtualizar: (dados: Partial<DadosFormulario>) => void;
    pacientes: Patient[];
}) {
    return (
        <div className="grid gap-4 py-4">
            {/* Paciente */}
            <div className="space-y-2">
                <Label htmlFor="apt-patient">Paciente *</Label>
                <Select
                    value={dadosFormulario.patientId}
                    onValueChange={(value) => aoAtualizar({ patientId: value })}
                >
                    <SelectTrigger id="apt-patient">
                        <SelectValue placeholder="Selecione o paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                        {pacientes.map(paciente => (
                            <SelectItem key={paciente.id} value={paciente.id!}>
                                {paciente.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="apt-date">Data *</Label>
                    <Input
                        id="apt-date"
                        type="date"
                        value={dadosFormulario.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => aoAtualizar({ date: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apt-time">Horário *</Label>
                    <Input
                        id="apt-time"
                        type="time"
                        value={dadosFormulario.time}
                        onChange={(e) => aoAtualizar({ time: e.target.value })}
                    />
                </div>
            </div>

            {/* Duração e Tipo */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="apt-duration">Duração (min)</Label>
                    <Select
                        value={dadosFormulario.duration}
                        onValueChange={(value) => aoAtualizar({ duration: value })}
                    >
                        <SelectTrigger id="apt-duration">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1h30</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apt-type">Tipo</Label>
                    <Select
                        value={dadosFormulario.type}
                        onValueChange={(value) => aoAtualizar({ type: value as AppointmentType })}
                    >
                        <SelectTrigger id="apt-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Consulta">Consulta</SelectItem>
                            <SelectItem value="Retorno">Retorno</SelectItem>
                            <SelectItem value="Exame">Exame</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="apt-notes">Observações</Label>
                <Textarea
                    id="apt-notes"
                    placeholder="Anotações sobre a consulta..."
                    rows={3}
                    value={dadosFormulario.notes}
                    onChange={(e) => aoAtualizar({ notes: e.target.value })}
                />
            </div>
        </div>
    );
}

/** Diálogo completo de agendamento/edição */
function DialogoAgendamento({
    aberto,
    aoMudar,
    aoClicarNovo,
    consultaEditando,
    dadosFormulario,
    aoAtualizar,
    pacientes,
    salvando,
    aoSalvar,
    aoFechar,
}: {
    aberto: boolean;
    aoMudar: (aberto: boolean) => void;
    aoClicarNovo: () => void;
    consultaEditando: Appointment | null;
    dadosFormulario: DadosFormulario;
    aoAtualizar: (dados: Partial<DadosFormulario>) => void;
    pacientes: Patient[];
    salvando: boolean;
    aoSalvar: () => void;
    aoFechar: () => void;
}) {
    return (
        <Dialog open={aberto} onOpenChange={aoMudar}>
            <DialogTrigger asChild>
                <Button variant="neuro" onClick={aoClicarNovo}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Consulta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        {consultaEditando ? "Editar Consulta" : "Agendar Consulta"}
                    </DialogTitle>
                    <DialogDescription>
                        {consultaEditando ? "Atualize os dados da consulta" : "Preencha os dados para agendar"}
                    </DialogDescription>
                </DialogHeader>

                <FormularioConsulta
                    dadosFormulario={dadosFormulario}
                    aoAtualizar={aoAtualizar}
                    pacientes={pacientes}
                />

                <DialogFooter>
                    <Button variant="outline" onClick={aoFechar} disabled={salvando}>
                        Cancelar
                    </Button>
                    <Button variant="neuro" onClick={aoSalvar} disabled={salvando}>
                        {salvando ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {consultaEditando ? "Atualizar" : "Agendar"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Barra de ações do topo (botão Hoje + diálogo) */
function BarraAcoes({
    aoClicarHoje,
    dialogoAberto,
    aoMudarDialogo,
    aoClicarNovaConsulta,
    consultaEditando,
    dadosFormulario,
    aoAtualizarFormulario,
    pacientes,
    salvando,
    aoSalvar,
    aoFecharDialogo,
}: PropsCabecalho) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={aoClicarHoje}>
                Hoje
            </Button>
            <DialogoAgendamento
                aberto={dialogoAberto}
                aoMudar={aoMudarDialogo}
                aoClicarNovo={aoClicarNovaConsulta}
                consultaEditando={consultaEditando}
                dadosFormulario={dadosFormulario}
                aoAtualizar={aoAtualizarFormulario}
                pacientes={pacientes}
                salvando={salvando}
                aoSalvar={aoSalvar}
                aoFechar={aoFecharDialogo}
            />
        </div>
    );
}

/** Navegação do calendário (mês/ano + setas) */
function NavegacaoCalendario({
    dataAtual,
    aoIrAnterior,
    aoIrProximo,
}: {
    dataAtual: Date;
    aoIrAnterior: () => void;
    aoIrProximo: () => void;
}) {
    return (
        <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">
                {MESES[dataAtual.getMonth()]} {dataAtual.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={aoIrAnterior}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={aoIrProximo}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

/** Célula individual de um dia no calendário */
function CelulaDia({ dia, consultasDoDia, selecionado, ehHoje, ehPassado, aoClicar }: PropsCelulaDia) {
    return (
        <button
            onClick={() => aoClicar(dia)}
            className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                "hover:bg-primary/10",
                ehHoje && "ring-2 ring-primary",
                selecionado && "bg-primary text-primary-foreground hover:bg-primary/90",
                !selecionado && "hover:bg-muted",
                ehPassado && !selecionado && "opacity-40"
            )}
        >
            <span className={cn(
                "text-sm font-medium",
                selecionado && "text-primary-foreground"
            )}>
                {dia}
            </span>
            {consultasDoDia.length > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                    {consultasDoDia.slice(0, 3).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                selecionado ? "bg-primary-foreground" : "bg-primary"
                            )}
                        />
                    ))}
                </div>
            )}
        </button>
    );
}

/** Grade completa do calendário mensal */
function GradeCalendario({
    dataAtual,
    diasCalendario,
    dataSelecionada,
    consultas,
    aoSelecionarDia,
    aoIrAnterior,
    aoIrProximo,
}: {
    dataAtual: Date;
    diasCalendario: (number | null)[];
    dataSelecionada: string | null;
    consultas: Appointment[];
    aoSelecionarDia: (dia: number) => void;
    aoIrAnterior: () => void;
    aoIrProximo: () => void;
}) {
    const obterConsultasDoDia = (dia: number) => {
        const dataStr = formatarDataISO(dataAtual, dia);
        return consultas.filter(c => c.date === dataStr);
    };

    return (
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <NavegacaoCalendario
                dataAtual={dataAtual}
                aoIrAnterior={aoIrAnterior}
                aoIrProximo={aoIrProximo}
            />

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map(dia => (
                    <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {dia}
                    </div>
                ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-1">
                {diasCalendario.map((dia, indice) => {
                    if (dia === null) {
                        return <div key={`vazio-${indice}`} className="aspect-square" />;
                    }

                    const dataStr = formatarDataISO(dataAtual, dia);

                    return (
                        <CelulaDia
                            key={dia}
                            dia={dia}
                            consultasDoDia={obterConsultasDoDia(dia)}
                            selecionado={dataSelecionada === dataStr}
                            ehHoje={verificarSeEhHoje(dataAtual, dia)}
                            ehPassado={verificarSeEhPassado(dataAtual, dia)}
                            aoClicar={aoSelecionarDia}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/** Card individual de uma consulta na lista lateral */
function CartaoConsulta({ consulta, aoMudarStatus, aoEditar, aoExcluir }: PropsCartaoConsulta) {
    return (
        <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Clock className="w-4 h-4 text-primary mb-0.5" />
                        <span className="text-xs font-medium">{consulta.time}</span>
                    </div>
                    <div>
                        <p className="font-medium">{consulta.patientName}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={ESTILOS_TIPO_CONSULTA[consulta.type]}>
                                {consulta.type}
                            </Badge>
                            <Badge className={ESTILOS_STATUS_CONSULTA[consulta.status]}>
                                {consulta.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <MenuAcoesConsulta
                    consulta={consulta}
                    aoMudarStatus={aoMudarStatus}
                    aoEditar={aoEditar}
                    aoExcluir={aoExcluir}
                />
            </div>

            {consulta.notes && (
                <p className="text-sm text-muted-foreground mt-2 pl-15">
                    {consulta.notes}
                </p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
                Duração: {consulta.duration} min
            </p>
        </div>
    );
}

/** Menu dropdown de ações de uma consulta */
function MenuAcoesConsulta({
    consulta,
    aoMudarStatus,
    aoEditar,
    aoExcluir,
}: PropsCartaoConsulta) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => aoMudarStatus(consulta.id!, "Confirmada")}>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aoMudarStatus(consulta.id!, "Concluída")}>
                    <Check className="w-4 h-4 mr-2" />
                    Concluir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aoMudarStatus(consulta.id!, "Cancelada")}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aoEditar(consulta)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => consulta.id && aoExcluir(consulta.id)}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Estado vazio quando nenhuma data está selecionada */
function EstadoVazioSemSelecao() {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Clique em um dia para ver as consultas</p>
        </div>
    );
}

/** Estado vazio quando o dia selecionado não tem consultas */
function EstadoVazioSemConsultas({
    ehDataPassada,
    aoClicarAgendar,
}: {
    ehDataPassada: boolean;
    aoClicarAgendar: () => void;
}) {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma consulta neste dia</p>
            {!ehDataPassada && (
                <Button variant="link" className="mt-2" onClick={aoClicarAgendar}>
                    Agendar consulta
                </Button>
            )}
        </div>
    );
}

/** Painel lateral com as consultas do dia selecionado */
function PainelConsultasDoDia({
    dataSelecionada,
    consultas,
    ehDataPassada,
    aoClicarAgendar,
    aoMudarStatus,
    aoEditar,
    aoExcluir,
}: PropsPainelDia) {
    const consultasOrdenadas = useMemo(() => {
        if (!dataSelecionada) return [];
        return consultas
            .filter(c => c.date === dataSelecionada)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [dataSelecionada, consultas]);

    const tituloData = dataSelecionada
        ? new Date(dataSelecionada + "T00:00:00").toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        })
        : "Selecione um dia";

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">{tituloData}</h3>
            </div>

            {!dataSelecionada ? (
                <EstadoVazioSemSelecao />
            ) : consultasOrdenadas.length > 0 ? (
                <div className="space-y-3">
                    {consultasOrdenadas.map(consulta => (
                        <CartaoConsulta
                            key={consulta.id}
                            consulta={consulta}
                            aoMudarStatus={aoMudarStatus}
                            aoEditar={aoEditar}
                            aoExcluir={aoExcluir}
                        />
                    ))}
                </div>
            ) : (
                <EstadoVazioSemConsultas
                    ehDataPassada={ehDataPassada}
                    aoClicarAgendar={aoClicarAgendar}
                />
            )}
        </div>
    );
}

/** Layout principal: calendário + painel lateral */
function LayoutAgenda({
    calendario,
    consultas,
    formulario,
    acoes,
}: {
    calendario: ReturnType<typeof useCalendario>;
    consultas: Appointment[];
    formulario: ReturnType<typeof useFormularioConsulta>;
    acoes: ReturnType<typeof useAcoesConsulta>;
}) {
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <GradeCalendario
                dataAtual={calendario.dataAtual}
                diasCalendario={calendario.diasCalendario}
                dataSelecionada={calendario.dataSelecionada}
                consultas={consultas}
                aoSelecionarDia={calendario.selecionarDia}
                aoIrAnterior={calendario.irMesAnterior}
                aoIrProximo={calendario.irProximoMes}
            />

            <PainelConsultasDoDia
                dataSelecionada={calendario.dataSelecionada}
                consultas={consultas}
                ehDataPassada={calendario.ehDataSelecionadaPassada}
                aoClicarAgendar={formulario.abrirNovaConsulta}
                aoMudarStatus={acoes.mudarStatusConsulta}
                aoEditar={formulario.abrirEdicao}
                aoExcluir={acoes.excluirConsulta}
            />
        </div>
    );
}


// =============================================================================
// COMPONENTE PRINCIPAL — Composição via Inversão de Dependência (D do SOLID)
// A página é apenas uma composição de hooks e componentes especializados.
// =============================================================================

export default function Appointments() {
    const dados = useDadosAgenda();
    const calendario = useCalendario();
    const formulario = useFormularioConsulta(calendario.dataSelecionada);
    const acoes = useAcoesConsulta(
        dados.consultas,
        dados.pacientes,
        formulario,
        dados.recarregar,
        dados.user,
        dados.effectiveUserId
    );

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                {/* Cabeçalho + Ações */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Cabecalho />
                    <BarraAcoes
                        aoClicarHoje={calendario.irParaHoje}
                        dialogoAberto={formulario.dialogoAberto}
                        aoMudarDialogo={formulario.aoMudarDialogo}
                        aoClicarNovaConsulta={formulario.abrirNovaConsulta}
                        consultaEditando={formulario.consultaEditando}
                        dadosFormulario={formulario.dadosFormulario}
                        aoAtualizarFormulario={formulario.atualizarFormulario}
                        pacientes={dados.pacientes}
                        salvando={formulario.salvando}
                        aoSalvar={acoes.salvarConsulta}
                        aoFecharDialogo={() => formulario.setDialogoAberto(false)}
                    />
                </div>

                {/* Conteúdo Principal */}
                {dados.carregando ? (
                    <IndicadorCarregamento />
                ) : (
                    <LayoutAgenda
                        calendario={calendario}
                        consultas={dados.consultas}
                        formulario={formulario}
                        acoes={acoes}
                    />
                )}
            </div>
        </MainLayout>
    );
}
