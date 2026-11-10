import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PostDoseInsightCard } from "@/components/dashboard/PostDoseInsightCard";
import { Clock } from "lucide-react";
import { ItemHistorico, formatadorDataHoraLongo } from "@/lib/tiposHistorico";

/**
 * Modal com detalhes completos de um registro selecionado.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas exibição de detalhes em modal
 *  - Segregação de Interfaces (I): recebe item selecionado e callback de fechar
 */

interface PropriedadesDialogo {
  itemSelecionado: ItemHistorico | null;
  onFechar: () => void;
}

export function DialogoDetalhesRegistro({
  itemSelecionado,
  onFechar,
}: PropriedadesDialogo) {
  return (
    <Dialog
      open={!!itemSelecionado}
      onOpenChange={(aberto) => !aberto && onFechar()}
    >
      <DialogContent className="max-w-2xl">
        {itemSelecionado && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />
                Detalhes do Registro
              </DialogTitle>
              <DialogDescription>
                {formatadorDataHoraLongo.format(
                  new Date(itemSelecionado.timestamp)
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Paciente e Medicamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Paciente
                </p>
                <p className="mt-1 font-semibold">
                  {itemSelecionado.patientName}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Medicamento & Dose
                </p>
                <p className="mt-1 font-semibold">
                  {itemSelecionado.medicationName} •{" "}
                  <span className="tabular-nums">
                    {itemSelecionado.doseAmount}mg
                  </span>
                </p>
              </div>
            </div>

            {/* Estado Subjetivo */}
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Estado Subjetivo
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {typeof itemSelecionado.subjectiveState?.mood === "number" && (
                  <Badge variant="outline" className="bg-secondary/50">
                    Humor:{" "}
                    <span className="ml-1 font-semibold tabular-nums">
                      {itemSelecionado.subjectiveState.mood}/5
                    </span>
                  </Badge>
                )}
                {typeof itemSelecionado.subjectiveState?.energy ===
                  "number" && (
                  <Badge variant="outline" className="bg-secondary/50">
                    Energia:{" "}
                    <span className="ml-1 font-semibold tabular-nums">
                      {itemSelecionado.subjectiveState.energy}/5
                    </span>
                  </Badge>
                )}
                {typeof itemSelecionado.subjectiveState?.sleep === "number" && (
                  <Badge variant="outline" className="bg-secondary/50">
                    Sono:{" "}
                    <span className="ml-1 font-semibold tabular-nums">
                      {itemSelecionado.subjectiveState.sleep}/5
                    </span>
                  </Badge>
                )}
              </div>
              {itemSelecionado.subjectiveState?.effects && (
                <p className="mt-3 text-sm text-muted-foreground break-words">
                  <span className="font-semibold text-foreground/80">
                    Efeitos:
                  </span>{" "}
                  {itemSelecionado.subjectiveState.effects}
                </p>
              )}
            </div>

            {/* Análise */}
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Análise
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {typeof itemSelecionado.analysis?.efficacyPrediction ===
                  "number" && (
                  <Badge
                    variant="outline"
                    className="bg-success/10 text-success border-success/20"
                  >
                    Eficácia prevista:{" "}
                    <span className="ml-1 font-semibold tabular-nums">
                      {itemSelecionado.analysis.efficacyPrediction}%
                    </span>
                  </Badge>
                )}
              </div>
              {itemSelecionado.analysis?.recommendation && (
                <p className="mt-3 text-sm break-words">
                  <span className="font-semibold">Recomendação:</span>{" "}
                  {itemSelecionado.analysis.recommendation}
                </p>
              )}
              {itemSelecionado.analysis?.riskAssessment?.length ? (
                <div className="mt-3">
                  <p className="text-sm font-semibold">Risco</p>
                  <ul className="mt-2 space-y-2">
                    {itemSelecionado.analysis.riskAssessment.map((r, idx) => (
                      <li
                        key={`${r.category}-${idx}`}
                        className="text-sm text-muted-foreground break-words"
                      >
                        <span className="font-semibold text-foreground/80">
                          {r.category}:
                        </span>{" "}
                        {r.level} — {r.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Insights Pós-Dose da IA */}
            {itemSelecionado.analysis?.postDoseInsights &&
              itemSelecionado.analysis.postDoseInsights.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                  <PostDoseInsightCard
                    insights={itemSelecionado.analysis.postDoseInsights}
                    compact
                  />
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
