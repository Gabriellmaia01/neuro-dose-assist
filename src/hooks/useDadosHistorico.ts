import { useCallback, useEffect, useState } from "react";
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
  erro: string | null;
  recarregar: () => void;
}

export function useDadosHistorico(): DadosHistorico {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();

  const [itensHistorico, setItensHistorico] = useState<ItemHistorico[]>([]);
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [logsAtividade, setLogsAtividade] = useState<ActivityLog[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  useEffect(() => {
    if (!user || !effectiveUserId) {
      setCarregando(false);
      return;
    }

    let cancelado = false;

    async function buscarDados() {
      try {
        setCarregando(true);
        setErro(null);
        const [dadosDoses, dadosPacientes, dadosMedicamentos, dadosLogs] =
          await Promise.all([
            getDoses(effectiveUserId),
            getPatients(effectiveUserId),
            getMedications(effectiveUserId),
            getActivityLogs(effectiveUserId),
          ]);

        if (cancelado) return;

        setPacientes(dadosPacientes);
        setLogsAtividade(dadosLogs);

        const mapaPacientes = new Map(
          dadosPacientes
            .filter((p): p is Patient & { id: string } => Boolean(p.id))
            .map((p) => [p.id, p.name])
        );
        const mapaMedicamentos = new Map(
          dadosMedicamentos
            .filter((m): m is typeof m & { id: string } => Boolean(m.id))
            .map((m) => [m.id, m.name])
        );

        // Enriquecer doses com nomes de paciente e medicamento em O(N + M)
        const itensEnriquecidos: ItemHistorico[] = dadosDoses.map((dose) => ({
          ...dose,
          patientName: mapaPacientes.get(dose.patientId) ?? "Paciente Removido",
          medicationName:
            mapaMedicamentos.get(dose.medicationId) ?? "Medicamento Removido",
          displayType: "dose",
        }));

        setItensHistorico(itensEnriquecidos);
      } catch (err) {
        if (cancelado) return;
        console.error("Erro ao buscar histórico:", err);
        setErro("Não foi possível carregar o histórico clínico. Tente novamente.");
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível buscar os dados.",
          variant: "destructive",
        });
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    buscarDados();

    return () => {
      cancelado = true;
    };
  }, [user, effectiveUserId, tentativa]);

  return {
    itensHistorico,
    pacientes,
    logsAtividade,
    carregando,
    erro,
    recarregar,
  };
}
