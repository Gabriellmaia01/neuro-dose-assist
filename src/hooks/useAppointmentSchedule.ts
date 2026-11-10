import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { toast } from "@/hooks/use-toast";
import {
    deleteAppointment,
    getAppointments,
    saveAppointment,
    updateAppointmentStatus,
    type Appointment,
    type AppointmentStatus,
    type AppointmentType,
} from "@/lib/appointments";
import { gerarDiasCalendario, formatarDataISO, verificarConflitoHorario, validarDataHoraFutura } from "@/lib/appointmentCalendar";
import { getPatients, type Patient } from "@/lib/patients";

export interface DadosFormulario {
    patientId: string;
    date: string;
    time: string;
    duration: string;
    type: AppointmentType;
    notes: string;
}

export function useDadosAgenda() {
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

export function useCalendario() {
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

export function useFormularioConsulta(dataSelecionada: string | null) {
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

export function useAcoesConsulta(
    consultas: Appointment[],
    pacientes: Patient[],
    formulario: ReturnType<typeof useFormularioConsulta>,
    recarregar: () => Promise<void>,
    user: ReturnType<typeof useAuth>["user"],
    effectiveUserId: string | undefined
) {
    const { dadosFormulario, consultaEditando, setSalvando, setDialogoAberto, resetarFormulario } = formulario;

    const salvarConsulta = async () => {
        if (!user) return;

        if (!dadosFormulario.patientId || !dadosFormulario.date || !dadosFormulario.time) {
            toast({
                title: "Campos obrigatórios",
                description: "Selecione paciente, data e horário.",
                variant: "destructive",
            });
            return;
        }

        if (!validarDataHoraFutura(dadosFormulario.date, dadosFormulario.time)) {
            toast({
                title: "Horário inválido",
                description: "Não é possível agendar consultas em horários que já passaram.",
                variant: "destructive",
            });
            return;
        }

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
