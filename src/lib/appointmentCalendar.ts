import type { Appointment } from "@/lib/appointments";

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function horarioParaMinutos(horario: string): number {
    const [h, m] = horario.split(":").map(Number);
    return h * 60 + m;
}

export function formatarDataISO(dataAtual: Date, dia: number): string {
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const diaStr = String(dia).padStart(2, "0");
    return `${ano}-${mes}-${diaStr}`;
}

export function verificarSeEhHoje(dataAtual: Date, dia: number): boolean {
    const hoje = new Date();
    return (
        dia === hoje.getDate() &&
        dataAtual.getMonth() === hoje.getMonth() &&
        dataAtual.getFullYear() === hoje.getFullYear()
    );
}

export function verificarSeEhPassado(dataAtual: Date, dia: number): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVerificar = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
    return dataVerificar < hoje;
}

export function gerarDiasCalendario(dataAtual: Date): (number | null)[] {
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

export function verificarConflitoHorario(
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

export function validarDataHoraFutura(data: string, horario: string): boolean {
    const agora = new Date();
    const [ano, mes, dia] = data.split("-").map(Number);
    const [horas, minutos] = horario.split(":").map(Number);
    const dataHoraSelecionada = new Date(ano, mes - 1, dia, horas, minutos);
    return dataHoraSelecionada >= agora;
}
