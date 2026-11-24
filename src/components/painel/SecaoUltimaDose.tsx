import { Pill } from "lucide-react";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";
import { type UltimaDose } from "@/lib/tiposPainel";

interface PropriedadesSecaoUltimaDose {
  ultimaDose: UltimaDose | null;
}

/**
 * Seção da última dose do painel, com estado vazio sóbrio.
 * Responsabilidade única: renderizar a última dose ou o placeholder vazio.
 */
export function SecaoUltimaDose({ ultimaDose }: PropriedadesSecaoUltimaDose) {
  if (!ultimaDose) {
    return (
      <section
        aria-label="Última aplicação"
        className="nd-card p-6 h-full flex flex-col justify-between"
      >
        <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">
          Última aplicação
        </p>
        <div className="my-auto py-8 flex flex-col items-center justify-center text-center">
          <Pill
            className="w-6 h-6 text-[var(--nd-icon)] mb-3"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-[14px] font-medium text-[var(--nd-text)]">
            Nenhuma dose registrada
          </p>
          <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1">
            Registre a primeira dose para visualizar os detalhes aqui.
          </p>
        </div>
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
