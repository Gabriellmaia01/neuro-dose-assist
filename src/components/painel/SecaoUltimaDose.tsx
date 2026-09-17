import { Pill } from "lucide-react";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";
import { type UltimaDose } from "@/lib/tiposPainel";

interface PropriedadesSecaoUltimaDose {
  ultimaDose: UltimaDose | null;
}

/**
 * Seção da última dose do painel, com estado vazio.
 * Responsabilidade única: renderizar a última dose ou o placeholder vazio.
 */
export function SecaoUltimaDose({ ultimaDose }: PropriedadesSecaoUltimaDose) {
  if (!ultimaDose) {
    return (
      <div className="p-6 rounded-2xl glass-card border border-border/50 text-center text-muted-foreground">
        <Pill className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Nenhuma dose registrada</p>
        <p className="text-sm mt-1">Registre a primeira dose para visualizar.</p>
      </div>
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
