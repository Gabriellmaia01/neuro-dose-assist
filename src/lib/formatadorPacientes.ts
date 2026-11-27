import { type Patient } from "@/lib/patients";
import { type DoseRecord } from "@/lib/doses";
import { type PacienteRecente } from "@/lib/tiposPainel";
import { format, isToday } from "date-fns";

function formatarHorarioPaciente(timestamp: string): string {
  const data = new Date(timestamp);
  if (Number.isNaN(data.getTime())) return "N/A";
  return isToday(data) ? format(data, "HH:mm") : format(data, "dd/MM · HH:mm");
}

/**
 * Formata os 3 pacientes mais recentes para exibição no painel.
 * Inclui data quando a última aplicação ocorreu em dia anterior.
 */
export function formatarPacientesRecentes(
  pacientes: Patient[],
  doses: DoseRecord[],
  medicamentos: any[]
): PacienteRecente[] {
  return pacientes.slice(0, 3).map((p) => {
    const dosesPaciente = doses.filter((d) => d.patientId === p.id);
    const ultimaDosePaciente =
      dosesPaciente.length > 0 ? dosesPaciente[0] : null;
    const medicamento = medicamentos.find(
      (m) => m.id === ultimaDosePaciente?.medicationId
    );

    return {
      id: p.id || "",
      name: p.name,
      age: p.age || 0,
      lastDose: ultimaDosePaciente
        ? formatarHorarioPaciente(ultimaDosePaciente.timestamp)
        : "N/A",
      medication: medicamento
        ? `${medicamento.name} ${ultimaDosePaciente?.doseAmount}mg`
        : "Sem registro",
      efficacy: ultimaDosePaciente?.analysis?.efficacyPrediction || 0,
    };
  });
}
