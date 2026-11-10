import { cn } from "@/lib/utils";

/**
 * Barra de progresso visual das 3 etapas do formulário.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas stepper visual
 *  - Segregação de Interfaces (I): recebe somente `etapaAtual`
 */

interface PropriedadesBarraProgresso {
  etapaAtual: number;
}

const NOMES_ETAPAS: Record<number, string> = {
  1: "Informações da Dose",
  2: "Estado Subjetivo",
  3: "Confirmação & IA",
};

export function BarraProgressoEtapas({ etapaAtual }: PropriedadesBarraProgresso) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Etapa {etapaAtual} de 3
          </p>
          <p className="font-display font-semibold text-base truncate">
            {NOMES_ETAPAS[etapaAtual]}
          </p>
        </div>
        <ol className="flex items-center gap-2" aria-label="Progresso">
          {[1, 2, 3].map((s) => (
            <li key={s} className="flex items-center">
              <div
                aria-current={etapaAtual === s ? "step" : undefined}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
                  "transition-[background-color,color,box-shadow] duration-200",
                  etapaAtual >= s
                    ? "bg-neuro-gradient text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-10 sm:w-14 h-0.5 mx-2 rounded-full",
                    etapaAtual > s ? "bg-primary" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
