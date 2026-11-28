import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import { PostDoseInsightCard } from "@/components/dashboard/PostDoseInsightCard";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/services/aiService";

/**
 * Painel de resultado pós-registro de dose.
 * Layout editorial em bento plano (sem cards aninhados), alinhado à linguagem clínica do sistema.
 */

interface PropriedadesResultado {
  resultadoAnalise: AnalysisResult;
  onNovoRegistro: () => void;
}

const RISK_STYLES: Record<string, { dot: string; text: string }> = {
  Baixo: {
    dot: "bg-[var(--nd-success)]",
    text: "text-[var(--nd-success)]",
  },
  Médio: {
    dot: "bg-[var(--nd-warning)]",
    text: "text-[var(--nd-warning)]",
  },
  Alto: {
    dot: "bg-[var(--nd-danger)]",
    text: "text-[var(--nd-danger)]",
  },
};

export function ResultadoAnalise({ resultadoAnalise, onNovoRegistro }: PropriedadesResultado) {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Cabeçalho editorial de confirmação + ações rápidas */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-2">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--nd-success)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Registro salvo no prontuário</span>
          </div>
          <h2 className="font-display text-[24px] sm:text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--nd-text)] mt-1.5">
            Dose Registrada com Sucesso
          </h2>
          <p className="text-[14px] text-[var(--nd-text-secondary)] mt-1">
            Síntese farmacológica e pontos de vigilância clínica calculados para esta administração.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" onClick={onNovoRegistro} className="h-11">
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Novo Registro
          </Button>
          <Button asChild variant="default" className="h-11">
            <Link to="/history">
              Ver Histórico
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Bento principal: Eficácia (5 cols) + Conduta & Risco (7 cols) — nível único, zero nested cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section
          aria-label="Eficácia prevista"
          className="lg:col-span-5 nd-card p-6 sm:p-7 flex flex-col justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nd-text-secondary)]">
              Eficácia Prevista
            </p>
            <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1">
              Estimativa baseada na posologia, histórico e estado subjetivo informado.
            </p>
          </div>

          <div className="py-6 flex justify-center">
            <EfficacyRing value={resultadoAnalise.efficacyPrediction || 0} size="lg" />
          </div>

          <div className="pt-4 border-t border-[var(--nd-border)] flex items-center justify-between text-[12px] text-[var(--nd-text-secondary)]">
            <span>Modelo clínico determinístico</span>
            <span className="font-medium text-[var(--nd-text)] tabular-nums">
              {resultadoAnalise.efficacyPrediction || 0}% de aderência esperada
            </span>
          </div>
        </section>

        <section
          aria-label="Conduta e avaliação de risco"
          className="lg:col-span-7 nd-card p-6 sm:p-7 flex flex-col justify-between gap-6"
        >
          {/* Conduta recomendada (editorial com filete lateral, sem caixa aninhada) */}
          <div className="border-l-2 border-[var(--nd-primary)] pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nd-primary)]">
              Conduta Recomendada
            </p>
            <p className="text-[15px] leading-relaxed text-[var(--nd-text)] font-medium mt-1.5">
              {resultadoAnalise.recommendation}
            </p>
          </div>

          {/* Avaliação de risco em linhas tabulares com divisória fina */}
          <div className="pt-5 border-t border-[var(--nd-border)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nd-text-secondary)] mb-3">
              Avaliação de Risco Clínico
            </p>
            <ul className="divide-y divide-[var(--nd-border)]">
              {resultadoAnalise.riskAssessment.map((risco, indice) => {
                const style = RISK_STYLES[risco.level] ?? RISK_STYLES.Baixo;
                return (
                  <li
                    key={indice}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[var(--nd-text)] leading-snug">
                        {risco.category}
                      </p>
                      <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5 leading-relaxed">
                        {risco.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[12px] font-semibold shrink-0 mt-0.5",
                        style.text
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", style.dot)} aria-hidden="true" />
                      {risco.level}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      {/* Orientações pós-dose em card próprio de nível único (com linhas editoriais sem nested cards) */}
      {resultadoAnalise.postDoseInsights && resultadoAnalise.postDoseInsights.length > 0 && (
        <section aria-label="Orientações pós-dose" className="nd-card p-6 sm:p-7">
          <PostDoseInsightCard insights={resultadoAnalise.postDoseInsights} />
        </section>
      )}
    </div>
  );
}
