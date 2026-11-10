import { Brain, Sparkles } from "lucide-react";
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
}

export function EtapaConfirmacao({
  pacienteSelecionado,
  medicamentoSelecionado,
  quantidadeDose,
  horarioDose,
  humor,
  energia,
  sono,
}: PropriedadesConfirmacao) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-neuro-gradient flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">
            Confirmação e Análise IA
          </h2>
          <p className="text-sm text-muted-foreground">
            Revise os dados antes de enviar para análise
          </p>
        </div>
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
          </div>
        </div>
      </div>

      {/* Aviso IA */}
      <div className="p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">Análise de IA</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ao confirmar, os dados serão enviados para o módulo de IA que
          irá prever a eficácia esperada e identificar possíveis riscos.
        </p>
      </div>
    </div>
  );
}
