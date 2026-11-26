import { Pill, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";
import { type UltimaDose } from "@/lib/tiposPainel";

interface PropriedadesSecaoUltimaDose {
  ultimaDose: UltimaDose | null;
}

/**
 * Seção da última dose do painel em estilo bento escuro (azul-marinho/teal clínico).
 */
export function SecaoUltimaDose({ ultimaDose }: PropriedadesSecaoUltimaDose) {
  if (!ultimaDose) {
    return (
      <section
        aria-label="Última aplicação"
        className="nd-card-hero relative overflow-hidden p-6 h-full flex flex-col justify-between"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 280 220"
          className="pointer-events-none absolute inset-0 w-full h-full opacity-25"
          preserveAspectRatio="none"
        >
          <path
            d="M-20 175 C 45 110, 140 215, 300 95"
            fill="none"
            stroke="var(--nd-dark-accent-soft)"
            strokeWidth="1.5"
          />
          <path
            d="M-20 198 C 60 135, 165 232, 300 128"
            fill="none"
            stroke="var(--nd-dark-title-accent)"
            strokeWidth="1.2"
          />
        </svg>

        <p className="relative z-10 text-[13px] font-medium text-white/80">
          Última aplicação
        </p>

        <div className="relative z-10 my-5 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
            <Pill
              className="w-5 h-5 text-white"
              strokeWidth={1.65}
              aria-hidden="true"
            />
          </div>
          <p className="text-[18px] font-semibold text-white leading-snug">
            Nenhuma dose registrada
          </p>
          <p className="text-[13px] text-white/90 leading-relaxed">
            Inicie o registro para acompanhar eficácia e risco em tempo real.
          </p>
        </div>

        <Link
          to="/dose"
          className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-11 rounded-full bg-white text-[var(--nd-primary-deep)] text-[14px] font-semibold hover:bg-[var(--nd-accent-soft)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
