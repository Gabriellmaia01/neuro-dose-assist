import { type DoseRecord } from "@/lib/doses";
import { type UltimaDose } from "@/lib/tiposPainel";
import { format, isToday } from "date-fns";

/**
 * Formata a data/hora da última aplicação com clareza temporal:
 * hoje exibe "HH:mm"; dias anteriores exibem "dd/MM · HH:mm".
 */
function formatarHorarioClinico(timestamp: string): string {
  const data = new Date(timestamp);
  if (Number.isNaN(data.getTime())) return "—";
  return isToday(data) ? format(data, "HH:mm") : format(data, "dd/MM · HH:mm");
}

/**
 * Formata a última dose registrada para exibição no card do painel.
 * Retorna null se não houver doses.
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
    time: formatarHorarioClinico(ultimaDose.timestamp),
    efficacy: ultimaDose.analysis?.efficacyPrediction || 0,
    riskLevel: "low",
  };
}
