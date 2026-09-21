import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getDoses } from "@/lib/doses";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications } from "@/lib/medications";
import { getActivityLogs, ActivityLog } from "@/lib/activityLog";
import { ItemHistorico } from "@/lib/tiposHistorico";
import { toast } from "@/hooks/use-toast";

/**
 * Hook responsável por carregar e enriquecer dados do histórico.
 * Princípio SOLID: Responsabilidade Única (S) — apenas carregamento e transformação de dados.
 */

export interface DadosHistorico {
  itensHistorico: ItemHistorico[];
  pacientes: Patient[];
  logsAtividade: ActivityLog[];
  carregando: boolean;
}

export function useDadosHistorico(): DadosHistorico {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();

  const [itensHistorico, setItensHistorico] = useState<ItemHistorico[]>([]);
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [logsAtividade, setLogsAtividade] = useState<ActivityLog[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      if (!user || !effectiveUserId) return;
      try {
        setCarregando(true);
        const [dadosDoses, dadosPacientes, dadosMedicamentos, dadosLogs] =
          await Promise.all([
            getDoses(effectiveUserId),
            getPatients(effectiveUserId),
            getMedications(effectiveUserId),
            getActivityLogs(effectiveUserId),
          ]);

        setPacientes(dadosPacientes);
        setLogsAtividade(dadosLogs);

        // Enriquecer doses com nomes de paciente e medicamento
        const itensEnriquecidos: ItemHistorico[] = dadosDoses.map((dose) => {
          const paciente = dadosPacientes.find((p) => p.id === dose.patientId);
          const medicamento = dadosMedicamentos.find(
            (m) => m.id === dose.medicationId
          );

          return {
            ...dose,
            patientName: paciente ? paciente.name : "Paciente Removido",
            medicationName: medicamento
              ? medicamento.name
              : "Medicamento Removido",
            displayType: "dose",
          };
        });

        setItensHistorico(itensEnriquecidos);
      } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível buscar os dados.",
          variant: "destructive",
        });
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, [user, effectiveUserId]);

  return { itensHistorico, pacientes, logsAtividade, carregando };
}
