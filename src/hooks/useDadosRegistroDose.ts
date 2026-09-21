import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications, Medication } from "@/lib/medications";
import { getUserSettings } from "@/lib/firestore";
import { type ConfidenceLevel } from "@/services/aiService";
import { toast } from "@/hooks/use-toast";

/**
 * Hook responsável por carregar dados necessários para o registro de dose.
 * Princípio SOLID: Responsabilidade Única (S) — apenas carregamento de dados.
 */

export interface DadosRegistroDose {
  pacientes: Patient[];
  medicamentos: Medication[];
  carregandoDados: boolean;
  nivelConfianca: ConfidenceLevel;
}

export function useDadosRegistroDose(): DadosRegistroDose {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();

  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medication[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [nivelConfianca, setNivelConfianca] = useState<ConfidenceLevel>("high");

  useEffect(() => {
    async function carregarDados() {
      if (!user || !effectiveUserId) return;
      try {
        const [dadosPacientes, dadosMedicamentos] = await Promise.all([
          getPatients(effectiveUserId),
          getMedications(effectiveUserId),
        ]);
        setPacientes(dadosPacientes);
        setMedicamentos(dadosMedicamentos);

        // Carregar nível de confiança da IA das configurações
        try {
          const configuracoes = await getUserSettings(user.uid);
          if (configuracoes?.ai?.confidence) {
            setNivelConfianca(configuracoes.ai.confidence);
          }
        } catch {
          // Usar padrão 'high' se não conseguir carregar
        }
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar pacientes ou medicamentos.",
          variant: "destructive",
        });
      } finally {
        setCarregandoDados(false);
      }
    }
    carregarDados();
  }, [user, effectiveUserId]);

  return { pacientes, medicamentos, carregandoDados, nivelConfianca };
}
