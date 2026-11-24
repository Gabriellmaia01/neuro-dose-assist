import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    formatarDataISO,
    DIAS_SEMANA,
    MESES,
    verificarSeEhHoje,
    verificarSeEhPassado,
} from "@/lib/appointmentCalendar";
import type { Appointment } from "@/lib/appointments";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function CelulaDia({
    dia,
    consultasDoDia,
    selecionado,
    ehHoje,
    ehPassado,
    aoClicar,
}: {
    dia: number;
    consultasDoDia: Appointment[];
    selecionado: boolean;
    ehHoje: boolean;
    ehPassado: boolean;
    aoClicar: (dia: number) => void;
}) {
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
            <span className={cn("text-sm font-medium", selecionado && "text-primary-foreground")}>
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

export function AppointmentCalendar({
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
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map(dia => (
                    <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {dia}
                    </div>
                ))}
            </div>
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
