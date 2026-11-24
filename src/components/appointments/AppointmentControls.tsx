import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@/lib/patients";
import type { Appointment, AppointmentType } from "@/lib/appointments";
import type { DadosFormulario } from "@/hooks/useAppointmentSchedule";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";

export function AppointmentLoadingIndicator() {
    return (
        <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Carregando agenda...</span>
        </div>
    );
}

export function AppointmentHeader() {
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

function AppointmentForm({
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

function AppointmentDialog({
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
                <AppointmentForm
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

export function AppointmentActionsBar({
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
}: {
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
}) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={aoClicarHoje}>
                Hoje
            </Button>
            <AppointmentDialog
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
