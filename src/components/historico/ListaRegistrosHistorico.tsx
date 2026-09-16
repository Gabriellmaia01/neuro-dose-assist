import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  ItemHistorico,
  configuracaoTipoRegistro,
  formatadorDataHoraCurto,
  formatadorHoraCurto,
  inferirTipoRegistro,
} from "@/lib/tiposHistorico";

/**
 * Lista de registros do histórico (cards clicáveis).
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas renderização da lista
 *  - Segregação de Interfaces (I): recebe itens filtrados e callback de seleção
 */

interface PropriedadesListaRegistros {
  itens: ItemHistorico[];
  carregando: boolean;
  abaAtiva: string;
  onItemSelecionado: (item: ItemHistorico) => void;
}

export function ListaRegistrosHistorico({
  itens,
  carregando,
  abaAtiva,
  onItemSelecionado,
}: PropriedadesListaRegistros) {
  if (carregando) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-muted-foreground font-medium">
          Carregando histórico…
        </span>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="font-display font-semibold text-lg">
          Nenhum registro encontrado
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste os filtros ou registre uma nova dose para começar.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {itens.map((item) => {
        const tipoInferido = inferirTipoRegistro(item, abaAtiva);
        const config = configuracaoTipoRegistro[tipoInferido] || configuracaoTipoRegistro.dose;
        const Icon = config.icon;

        const temRisco = !!item.analysis?.riskAssessment?.some(
          (r) => r.level !== "Baixo"
        );

        const dt = new Date(item.timestamp);
        const rotuloHora = formatadorHoraCurto.format(dt);
        const rotuloDataHora = formatadorDataHoraCurto.format(dt);

        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onItemSelecionado(item)}
              className={cn(
                "w-full text-left glass-card rounded-2xl p-5 transition-[transform,box-shadow,background-color] duration-200 hover:shadow-md hover:bg-card/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label={`Abrir detalhes do registro de ${item.patientName} em ${rotuloDataHora}`}
              style={{ contentVisibility: "auto" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    config.color
                  )}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", config.color)}
                    >
                      {config.label}
                    </Badge>
                    <span className="text-sm font-semibold truncate">
                      {item.patientName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {rotuloHora}
                    </span>
                  </div>

                  <p className="font-medium mt-1 truncate">
                    {item.medicationName}{" "}
                    <span className="text-muted-foreground font-semibold">
                      •
                    </span>{" "}
                    <span className="font-semibold tabular-nums">
                      {item.doseAmount}mg
                    </span>
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {item.subjectiveState?.effects && (
                      <p className="line-clamp-2 break-words">
                        "{item.subjectiveState.effects}"
                      </p>
                    )}
                    {item.analysis?.recommendation && (
                      <p className="text-xs line-clamp-2 break-words">
                        <span className="font-semibold text-foreground/80">
                          Recomendação:
                        </span>{" "}
                        {item.analysis.recommendation}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      {rotuloDataHora}
                    </div>
                    {typeof item.subjectiveState?.mood === "number" && (
                      <Badge variant="outline" className="bg-secondary/50">
                        Humor:{" "}
                        <span className="ml-1 font-semibold tabular-nums">
                          {item.subjectiveState.mood}/5
                        </span>
                      </Badge>
                    )}
                    {typeof item.subjectiveState?.energy === "number" && (
                      <Badge variant="outline" className="bg-secondary/50">
                        Energia:{" "}
                        <span className="ml-1 font-semibold tabular-nums">
                          {item.subjectiveState.energy}/5
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {typeof item.analysis?.efficacyPrediction === "number" && (
                    <EfficacyRing
                      value={item.analysis.efficacyPrediction}
                      size="sm"
                      showLabel={false}
                    />
                  )}

                  {temRisco && (
                    <Badge
                      variant="outline"
                      className="bg-warning/10 text-warning border-warning/20 hidden sm:inline-flex"
                    >
                      Risco
                    </Badge>
                  )}
                  {item.analysis?.postDoseInsights &&
                    item.analysis.postDoseInsights.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 hidden sm:inline-flex"
                      >
                        <Sparkles
                          className="w-3 h-3 mr-1"
                          aria-hidden="true"
                        />
                        {item.analysis.postDoseInsights.length} insights
                      </Badge>
                    )}
                  <ChevronRight
                    className="w-5 h-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
