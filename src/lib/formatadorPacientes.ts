import { type Patient } from "@/lib/patients";
import { type DoseRecord } from "@/lib/doses";
import { type PacienteRecente } from "@/lib/tiposPainel";
import { format } from "date-fns";

/**
 * Formata os 3 pacientes mais recentes para exibição no painel.
 * Função pura — sem efeitos colaterais.
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
        ? format(new Date(ultimaDosePaciente.timestamp), "HH:mm")
        : "N/A",
      medication: medicamento
        ? `${medicamento.name} ${ultimaDosePaciente?.doseAmount}mg`
        : "Sem registro",
      efficacy: ultimaDosePaciente?.analysis?.efficacyPrediction || 0,
      photoURL: p.photoURL,
    };
  });
}
