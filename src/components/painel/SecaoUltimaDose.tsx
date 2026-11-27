import { Pill, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";
import { type UltimaDose } from "@/lib/tiposPainel";

interface PropriedadesSecaoUltimaDose {
  ultimaDose: UltimaDose | null;
}

/**
 * Seção da última dose do painel em superfície Ink Navy sólida institucional.
 */
export function SecaoUltimaDose({ ultimaDose }: PropriedadesSecaoUltimaDose) {
  if (!ultimaDose) {
    return (
      <section
        aria-label="Última aplicação"
        className="nd-card-hero relative overflow-hidden p-6 h-full flex flex-col justify-between"
      >
        <h2 className="relative z-10 text-[13px] font-medium text-[var(--nd-dark-text)]">
          Última aplicação
        </h2>

        <div className="relative z-10 my-5 space-y-2">
          <div className="w-10 h-10 rounded-full bg-[var(--nd-dark-surface)] border border-[var(--nd-dark-border)] flex items-center justify-center">
            <Pill
              className="w-5 h-5 text-[var(--nd-dark-accent-soft)]"
              strokeWidth={1.65}
              aria-hidden="true"
            />
          </div>
          <p className="text-[18px] font-semibold text-[var(--nd-surface)] leading-snug">
            Nenhuma dose registrada
          </p>
          <p className="text-[13px] text-[var(--nd-dark-text)] leading-relaxed">
            Inicie o registro para acompanhar eficácia e risco em tempo{"\u00A0"}real.
          </p>
        </div>

        <Link
          to="/dose"
          className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-11 rounded-full bg-[var(--nd-surface)] text-[var(--nd-primary-deep)] text-[14px] font-semibold hover:bg-[var(--nd-accent-soft)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-dark-accent-soft)]"
        >
          <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span>Nova aplicação</span>
        </Link>
      </section>
    );
  }

  return (
    <LastDoseCard
      medication={ultimaDose.medication}
      dose={ultimaDose.dose}
      time={ultimaDose.time}
      efficacy={ultimaDose.efficacy}
      riskLevel={ultimaDose.riskLevel}
    />
  );
}
