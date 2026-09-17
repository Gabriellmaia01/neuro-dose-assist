import { type DoseRecord } from "@/lib/doses";
import { type UltimaDose } from "@/lib/tiposPainel";
import { format } from "date-fns";

/**
 * Formata a última dose registrada para exibição no card do painel.
 * Retorna null se não houver doses.
 * Função pura — sem efeitos colaterais.
 */
export function formatarUltimaDose(
  doses: DoseRecord[],
  medicamentos: any[]
): UltimaDose | null {
  if (doses.length === 0) return null;

  const ultimaDose = doses[0];
  const medicamento = medicamentos.find(
    (m) => m.id === ultimaDose.medicationId
  );

  return {
    medication: medicamento ? medicamento.name : "Desconhecido",
    dose: `${ultimaDose.doseAmount}mg`,
    time: format(new Date(ultimaDose.timestamp), "HH:mm"),
    efficacy: ultimaDose.analysis?.efficacyPrediction || 0,
    riskLevel: "low",
  };
}
