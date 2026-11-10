import { MainLayout } from "@/components/layout/MainLayout";
import { useDadosRegistroDose } from "@/hooks/useDadosRegistroDose";
import { useFormularioDose } from "@/hooks/useFormularioDose";
import { useEnvioDose } from "@/hooks/useEnvioDose";
import {
  verificarDoseAcimaLimite,
  verificarDoseAbaixoLimite,
  podeContinuarEtapa1,
} from "@/lib/validacaoDose";

// Componentes de apresentação (Princípio S — Responsabilidade Única)
import { CabecalhoRegistroDose } from "@/components/dose/CabecalhoRegistroDose";
import { BarraProgressoEtapas } from "@/components/dose/BarraProgressoEtapas";
import { EtapaInformacoesDose } from "@/components/dose/EtapaInformacoesDose";
import { EtapaEstadoSubjetivo } from "@/components/dose/EtapaEstadoSubjetivo";
import { EtapaConfirmacao } from "@/components/dose/EtapaConfirmacao";
import { PainelResumoLateral } from "@/components/dose/PainelResumoLateral";
import { ResultadoAnalise } from "@/components/dose/ResultadoAnalise";
import { NavegacaoEtapas } from "@/components/dose/NavegacaoEtapas";

/**
 * Página de Registro de Dose — Orquestradora.
 *
 * Princípios SOLID aplicados:
 *  - S (Responsabilidade Única): cada hook e componente tem uma única responsabilidade
 *  - O (Aberto/Fechado): novas etapas ou validações não exigem alterar este componente
 *  - L (Substituição de Liskov): interfaces bem definidas permitem trocar implementações
 *  - I (Segregação de Interfaces): cada componente recebe apenas os props que precisa
 *  - D (Inversão de Dependência): este componente depende de abstrações (hooks), não de serviços concretos
 */
export default function DoseRegister() {
  // ── Dados (D — Inversão de Dependência) ──────────────────────────────────
  const { pacientes, medicamentos, carregandoDados, nivelConfianca } =
    useDadosRegistroDose();

  // ── Formulário (S — Responsabilidade Única) ───────────────────────────────
  const formulario = useFormularioDose();

  // ── Derivações ────────────────────────────────────────────────────────────
  const pacienteSelecionado = pacientes.find(
    (p) => p.id === formulario.pacienteIdSelecionado
  );
  const medicamentoSelecionado = medicamentos.find(
    (m) => m.id === formulario.medicamentoIdSelecionado
  );

  const doseAcimaLimite = verificarDoseAcimaLimite(
    formulario.quantidadeDose,
    medicamentoSelecionado
  );
  const doseAbaixoLimite = verificarDoseAbaixoLimite(
    formulario.quantidadeDose,
    medicamentoSelecionado
  );
  const podeContinuar = podeContinuarEtapa1(
    formulario.pacienteIdSelecionado,
    formulario.medicamentoIdSelecionado,
    formulario.quantidadeDose,
    formulario.formaAdministracao,
    formulario.horarioDose,
    formulario.indicacao,
    doseAcimaLimite,
    doseAbaixoLimite
  );

  // ── Envio (D — Inversão de Dependência) ───────────────────────────────────
  const { analisando, resultadoAnalise, mostrarResultado, enviarDose, novoRegistro } =
    useEnvioDose({
      pacienteIdSelecionado: formulario.pacienteIdSelecionado,
      medicamentoIdSelecionado: formulario.medicamentoIdSelecionado,
      quantidadeDose: formulario.quantidadeDose,
      horarioDose: formulario.horarioDose,
      indicacao: formulario.indicacao,
      humor: formulario.humor,
      energia: formulario.energia,
      sono: formulario.sono,
      efeitos: formulario.efeitos,
      pacienteSelecionado,
      medicamentoSelecionado,
      todosMedicamentos: medicamentos,
      nivelConfianca,
    });

  // ── Handlers de navegação ─────────────────────────────────────────────────
  const handleNovoRegistro = () => {
    formulario.reiniciarFormulario();
    novoRegistro();
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-8">
        <CabecalhoRegistroDose />
        <BarraProgressoEtapas etapaAtual={formulario.etapa} />

        {!mostrarResultado ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulário principal */}
            <div className="lg:col-span-8 glass-card rounded-2xl p-6 sm:p-8">
              {formulario.etapa === 1 && (
                <EtapaInformacoesDose
                  pacientes={pacientes}
                  medicamentos={medicamentos}
                  carregandoDados={carregandoDados}
                  pacienteIdSelecionado={formulario.pacienteIdSelecionado}
                  onPacienteChange={formulario.setPacienteIdSelecionado}
                  medicamentoIdSelecionado={formulario.medicamentoIdSelecionado}
                  onMedicamentoChange={formulario.setMedicamentoIdSelecionado}
                  quantidadeDose={formulario.quantidadeDose}
                  onQuantidadeDoseChange={formulario.setQuantidadeDose}
                  formaAdministracao={formulario.formaAdministracao}
                  onFormaAdministracaoChange={formulario.setFormaAdministracao}
                  horarioDose={formulario.horarioDose}
                  onHorarioDoseChange={formulario.setHorarioDose}
                  indicacao={formulario.indicacao}
                  onIndicacaoChange={formulario.setIndicacao}
                  doseAcimaLimite={doseAcimaLimite}
                  doseAbaixoLimite={doseAbaixoLimite}
                  medicamentoSelecionado={medicamentoSelecionado}
                />
              )}

              {formulario.etapa === 2 && (
                <EtapaEstadoSubjetivo
                  humor={formulario.humor}
                  onHumorChange={formulario.setHumor}
                  energia={formulario.energia}
                  onEnergiaChange={formulario.setEnergia}
                  sono={formulario.sono}
                  onSonoChange={formulario.setSono}
                  efeitos={formulario.efeitos}
                  onEfeitosChange={formulario.setEfeitos}
                />
              )}

              {formulario.etapa === 3 && (
                <EtapaConfirmacao
                  pacienteSelecionado={pacienteSelecionado}
                  medicamentoSelecionado={medicamentoSelecionado}
                  quantidadeDose={formulario.quantidadeDose}
                  horarioDose={formulario.horarioDose}
                  humor={formulario.humor}
                  energia={formulario.energia}
                  sono={formulario.sono}
                />
              )}

              <NavegacaoEtapas
                etapa={formulario.etapa}
                onVoltar={() => formulario.setEtapa(Math.max(1, formulario.etapa - 1))}
                onContinuar={() => formulario.setEtapa(formulario.etapa + 1)}
                onEnviar={enviarDose}
                podeContinuar={formulario.etapa === 1 ? podeContinuar : true}
                analisando={analisando}
              />
            </div>

            {/* Sidebar */}
            <PainelResumoLateral
              pacienteSelecionado={pacienteSelecionado}
              medicamentoSelecionado={medicamentoSelecionado}
              quantidadeDose={formulario.quantidadeDose}
              horarioDose={formulario.horarioDose}
              indicacao={formulario.indicacao}
              carregandoDados={carregandoDados}
              pacientes={pacientes}
              medicamentos={medicamentos}
            />
          </div>
        ) : (
          resultadoAnalise && (
            <ResultadoAnalise
              resultadoAnalise={resultadoAnalise}
              onNovoRegistro={handleNovoRegistro}
            />
          )
        )}
      </div>
    </MainLayout>
  );
}
