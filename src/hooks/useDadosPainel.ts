import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getPatients } from "@/lib/patients";
import { getDoses } from "@/lib/doses";
import { getMedications } from "@/lib/medications";
import { getUpcomingAppointments } from "@/lib/appointments";
import { calcularEstatisticasPainel } from "@/lib/calculadoraEstatisticas";
import { calcularDadosGrafico } from "@/lib/calculadoraGrafico";
import { formatarPacientesRecentes } from "@/lib/formatadorPacientes";
import { formatarUltimaDose } from "@/lib/formatadorUltimaDose";
import { gerarAlertas } from "@/lib/geradorAlertas";
import {
  type DadosPainel,
  type EstatisticasPainel,
  type ServicosPainel,
} from "@/lib/tiposPainel";

/** Valores iniciais das estatísticas do painel. */
const estatisticasIniciais: EstatisticasPainel = {
  pacientesAtivos: 0,
  pacientesAtivosNovos: 0,
  tendenciaPacientes: 0,
  dosesUltimos7Dias: 0,
  tendenciaDoses: 0,
  eficaciaMedia: 0,
  tendenciaEficacia: 0,
  inferenciasIA: 0,
  tendenciaIA: 0,
};

/**
 * Serviços padrão — implementações concretas do Firebase.
 * Podem ser substituídos via parâmetro para testes (DIP).
 */
const servicosPadrao: ServicosPainel = {
  buscarPacientes: getPatients,
  buscarDoses: getDoses,
  buscarMedicamentos: getMedications,
  buscarConsultas: getUpcomingAppointments,
};

/**
 * Hook que orquestra o carregamento e processamento de todos os dados do painel.
 * Aplica Inversão de Dependência (DIP): recebe os serviços como parâmetro opcional.
 * Aplica Responsabilidade Única (SRP): delega cálculos para utilitários especializados.
 */
export function useDadosPainel(
  servicos: ServicosPainel = servicosPadrao
): DadosPainel {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState<Omit<DadosPainel, "carregando">>({
    estatisticas: estatisticasIniciais,
    dadosGrafico: [],
    pacientesRecentes: [],
    ultimaDose: null,
    alertas: [],
    consultas: [],
  });

  useEffect(() => {
    async function carregarDadosPainel() {
      if (!user || !effectiveUserId) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);

        // Busca paralela de todos os dados (DIP — usa serviços injetados)
        const [pacientes, doses, medicamentos, consultas] = await Promise.all([
          servicos.buscarPacientes(effectiveUserId),
          servicos.buscarDoses(effectiveUserId),
          servicos.buscarMedicamentos(effectiveUserId),
          servicos.buscarConsultas(effectiveUserId),
        ]);

        // Delega processamento para utilitários especializados (SRP)
        const estatisticas = calcularEstatisticasPainel(
          pacientes || [],
          doses || []
        );
        const dadosGrafico = calcularDadosGrafico(doses || []);
        const pacientesRecentes = formatarPacientesRecentes(
          pacientes || [],
          doses || [],
          medicamentos || []
        );
        const ultimaDose = formatarUltimaDose(
          doses || [],
          medicamentos || []
        );
        const alertas = gerarAlertas(doses || []);

        setDados({
          estatisticas,
          dadosGrafico,
          pacientesRecentes,
          ultimaDose,
          alertas,
          consultas: consultas || [],
        });
      } catch (erro) {
        console.error("Falha ao carregar dados do painel:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosPainel();
  }, [user, effectiveUserId]);

  return {
    carregando,
    ...dados,
  };
}
