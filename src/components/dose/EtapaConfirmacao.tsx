import { Patient } from "@/lib/patients";
import { Medication } from "@/lib/medications";

/**
 * Etapa 3 — Confirmação e prévia antes de enviar para análise IA.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas resumo de confirmação
 *  - Segregação de Interfaces (I): recebe somente dados para exibição
 */

const EMOJIS_HUMOR = ["😞", "😔", "😐", "🙂", "😊"];

interface PropriedadesConfirmacao {
  pacienteSelecionado: Patient | undefined;
  medicamentoSelecionado: Medication | undefined;
  quantidadeDose: string;
  horarioDose: string;
  humor: number[];
  energia: number[];
  sono: number[];
  usarEscalasClinicas?: boolean;
  phq2Score?: number;
  gad2Score?: number;
  cgiSeverity?: number;
}

export function EtapaConfirmacao({
  pacienteSelecionado,
  medicamentoSelecionado,
  quantidadeDose,
  horarioDose,
  humor,
  energia,
  sono,
  usarEscalasClinicas,
  phq2Score,
  gad2Score,
  cgiSeverity,
}: PropriedadesConfirmacao) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="pb-4 border-b border-[var(--nd-border)]">
        <h2 className="text-[18px] font-semibold text-[var(--nd-text)]">
          Confirmação e Análise Clínica
        </h2>
        <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
          Revise os dados antes de registrar e calcular a resposta esperada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados da Dose */}
        <div className="space-y-4 p-4 rounded-xl bg-muted/30">
          <h3 className="font-medium text-sm text-muted-foreground">
            Dados da Dose
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paciente</span>
              <span className="font-medium">
                {pacienteSelecionado?.name || "Não selecionado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medicamento</span>
              <span className="font-medium">
                {medicamentoSelecionado?.name || "Não selecionado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dose</span>
              <span className="font-medium tabular-nums">{quantidadeDose || "-"} mg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-medium">{horarioDose}</span>
            </div>
          </div>
        </div>

        {/* Estado Subjetivo */}
        <div className="space-y-4 p-4 rounded-xl bg-muted/30">
          <h3 className="font-medium text-sm text-muted-foreground">
            Estado Subjetivo
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Humor</span>
              <span className="text-xl" aria-hidden="true">
                {EMOJIS_HUMOR[humor[0] - 1]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energia</span>
              <span className="font-medium tabular-nums">{energia[0]}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sono</span>
              <span className="font-medium tabular-nums">{sono[0]}/10</span>
            </div>
            {usarEscalasClinicas && (
              <>
                <div className="flex justify-between pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">PHQ-2 / GAD-2</span>
                  <span className="font-medium tabular-nums">
                    {phq2Score ?? 0}/6 • {gad2Score ?? 0}/6
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGI-S</span>
                  <span className="font-medium tabular-nums">{cgiSeverity ?? 1}/7</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Aviso de análise clínica */}
      <div className="pt-4 border-t border-[var(--nd-border)]">
        <p className="text-[13px] font-semibold text-[var(--nd-primary)]">
          Avaliação automatizada pós-dose
        </p>
        <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1 max-w-[65ch]">
          Ao confirmar, os dados serão processados para estimar a eficácia esperada e sinalizar possíveis alertas clínicos.
        </p>
      </div>
    </div>
  );
}
