import { type Appointment } from "@/lib/appointments";
import { type Patient } from "@/lib/patients";
import { type DoseRecord } from "@/lib/doses";

/**
 * Estatísticas calculadas do painel principal.
 */
export interface EstatisticasPainel {
  pacientesAtivos: number;
  pacientesAtivosNovos: number;
  tendenciaPacientes: number;
  dosesUltimos7Dias: number;
  tendenciaDoses: number;
  eficaciaMedia: number;
  tendenciaEficacia: number;
  inferenciasIA: number;
  tendenciaIA: number;
}

/**
 * Ponto de dados para o gráfico de eficácia diária.
 */
export interface DadosGrafico {
  data: string;
  eficacia: number;
  dose: number;
}

/**
 * Paciente formatado para exibição na lista recente do painel.
 */
export interface PacienteRecente {
  id: string;
  name: string;
  age: number;
  lastDose: string;
  medication: string;
  efficacy: number;
  photoURL?: string;
}

/**
 * Última dose formatada para exibição no card do painel.
 */
export interface UltimaDose {
  medication: string;
  dose: string;
  time: string;
  efficacy: number;
  riskLevel: "low" | "medium" | "high";
}

/**
 * Alerta gerado automaticamente a partir dos dados de doses.
 */
export interface Alerta {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  time: string;
}

/**
 * Retorno completo do hook useDadosPainel.
 */
export interface DadosPainel {
  carregando: boolean;
  estatisticas: EstatisticasPainel;
  dadosGrafico: DadosGrafico[];
  pacientesRecentes: PacienteRecente[];
  ultimaDose: UltimaDose | null;
  alertas: Alerta[];
  consultas: Appointment[];
}

/**
 * Contrato de serviços injetáveis no hook (DIP — Inversão de Dependência).
 * Permite substituir os serviços concretos por mocks em testes.
 */
export interface ServicosPainel {
  buscarPacientes: (idUsuario: string) => Promise<Patient[]>;
  buscarDoses: (idUsuario: string) => Promise<DoseRecord[]>;
  buscarMedicamentos: (idUsuario: string) => Promise<any[]>;
  buscarConsultas: (idUsuario: string) => Promise<Appointment[]>;
}
