import { MainLayout } from "@/components/layout/MainLayout";
import {
    AppointmentActionsBar,
    AppointmentHeader,
    AppointmentLoadingIndicator,
} from "@/components/appointments/AppointmentControls";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppointmentDayPanel } from "@/components/appointments/AppointmentDayPanel";
import {
    useAcoesConsulta,
    useCalendario,
    useDadosAgenda,
    useFormularioConsulta,
} from "@/hooks/useAppointmentSchedule";
import type { Appointment } from "@/lib/appointments";

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
            <AppointmentCalendar
                dataAtual={calendario.dataAtual}
                diasCalendario={calendario.diasCalendario}
                dataSelecionada={calendario.dataSelecionada}
                consultas={consultas}
                aoSelecionarDia={calendario.selecionarDia}
                aoIrAnterior={calendario.irMesAnterior}
                aoIrProximo={calendario.irProximoMes}
            />

            <AppointmentDayPanel
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
                    <AppointmentHeader />
                    <AppointmentActionsBar
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
                    <AppointmentLoadingIndicator />
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
