import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Appointment, AppointmentStatus } from "@/lib/appointments";
import { Calendar as CalendarIcon, Check, Clock, Edit, MoreHorizontal, Trash2, X } from "lucide-react";

const ESTILOS_TIPO_CONSULTA: Record<Appointment["type"], string> = {
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

interface PropsAcoesConsulta {
    aoMudarStatus: (id: string, status: AppointmentStatus) => void;
    aoEditar: (consulta: Appointment) => void;
    aoExcluir: (id: string) => void;
}

function MenuAcoesConsulta({
    consulta,
    aoMudarStatus,
    aoEditar,
    aoExcluir,
}: PropsAcoesConsulta & { consulta: Appointment }) {
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

function CartaoConsulta({
    consulta,
    aoMudarStatus,
    aoEditar,
    aoExcluir,
}: PropsAcoesConsulta & { consulta: Appointment }) {
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

function EstadoVazioSemSelecao() {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Clique em um dia para ver as consultas</p>
        </div>
    );
}

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

export function AppointmentDayPanel({
    dataSelecionada,
    consultas,
    ehDataPassada,
    aoClicarAgendar,
    aoMudarStatus,
    aoEditar,
    aoExcluir,
}: {
    dataSelecionada: string | null;
    consultas: Appointment[];
    ehDataPassada: boolean;
    aoClicarAgendar: () => void;
} & PropsAcoesConsulta) {
    const consultasOrdenadas = useMemo(() => {
        if (!dataSelecionada) return [];
        return consultas
            .filter(c => c.date === dataSelecionada)
            .sort((a, b) => a.time.localeCompare(b.time))
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
import { useMemo } from "react";
