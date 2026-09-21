import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import { PostDoseInsightCard } from "@/components/dashboard/PostDoseInsightCard";
import { Brain, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/services/aiService";

/**
 * Card de resultado exibido após a análise IA.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas exibição de resultado
 *  - Segregação de Interfaces (I): recebe resultado e callbacks
 */

interface PropriedadesResultado {
  resultadoAnalise: AnalysisResult;
  onNovoRegistro: () => void;
}

export function ResultadoAnalise({ resultadoAnalise, onNovoRegistro }: PropriedadesResultado) {
  return (
    <div className="glass-card rounded-2xl p-8 animate-fade-up">
      {/* Cabeçalho de sucesso */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" aria-hidden="true" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">
          Dose Registrada com Sucesso
        </h2>
        <p className="text-muted-foreground">
          A análise de IA foi concluída
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Eficácia Prevista */}
        <div className="text-center p-6 rounded-xl bg-muted/30">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Eficácia Prevista
          </h3>
          <div className="flex justify-center mb-4">
            <EfficacyRing value={resultadoAnalise.efficacyPrediction || 0} size="lg" />
          </div>
          <p className="text-sm text-muted-foreground">
            Baseado no histórico do paciente e condições atuais
          </p>
        </div>

        {/* Avaliação de Risco */}
        <div className="p-6 rounded-xl bg-muted/30">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Avaliação de Risco
          </h3>
          <div className="space-y-4">
            {resultadoAnalise.riskAssessment.map((risco, indice) => (
              <div
                key={indice}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  risco.level === "Baixo"
                    ? "bg-success/10 border-success/20"
                    : risco.level === "Médio"
                    ? "bg-warning/10 border-warning/20"
                    : "bg-destructive/10 border-destructive/20"
                )}
              >
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{risco.category}</span>
                  <span className="text-xs text-muted-foreground">{risco.description}</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium ml-2",
                    risco.level === "Baixo"
                      ? "text-success"
                      : risco.level === "Médio"
                      ? "text-warning"
                      : "text-destructive"
                  )}
                >
                  {risco.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recomendação da IA */}
      <div className="mt-6 p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-medium text-sm mb-1">
              Recomendação da IA
            </h4>
            <p className="text-sm text-muted-foreground">
              {resultadoAnalise.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Insights Pós-Dose */}
      {resultadoAnalise.postDoseInsights && resultadoAnalise.postDoseInsights.length > 0 && (
        <div className="mt-6">
          <PostDoseInsightCard insights={resultadoAnalise.postDoseInsights} />
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={onNovoRegistro}>
          Novo Registro
        </Button>
        <Button asChild variant="neuro">
          <Link to="/history">Ver Histórico</Link>
        </Button>
      </div>
    </div>
  );
}
