import { type Patient } from "@/lib/patients";
import { type DoseRecord } from "@/lib/doses";
import { type EstatisticasPainel } from "@/lib/tiposPainel";
import { subDays, isAfter } from "date-fns";

/**
 * Calcula a eficácia média de uma lista de doses.
 */
function calcularEficaciaMedia(doses: DoseRecord[]): number {
  let total = 0;
  let contagem = 0;

  doses.forEach((d) => {
    const eficacia =
      d.analysis?.efficacyPrediction ||
      (d.subjectiveState?.energy || 0) * 10;
    if (eficacia) {
      total += eficacia;
      contagem++;
    }
  });

  return contagem > 0 ? Math.round(total / contagem) : 0;
}

/**
 * Calcula a tendência percentual entre dois valores.
 * Retorna 0 se não houver dados anteriores e nem atuais.
 */
function calcularTendencia(atual: number, anterior: number): number {
  if (anterior > 0) {
    return Math.round(((atual - anterior) / anterior) * 100);
  }
  return atual > 0 ? 100 : 0;
}

/**
 * Calcula todas as estatísticas do painel a partir dos dados brutos.
 * Função pura — sem efeitos colaterais.
 */
export function calcularEstatisticasPainel(
  pacientes: Patient[],
  doses: DoseRecord[]
): EstatisticasPainel {
  const agora = new Date();
  const seteDiasAtras = subDays(agora, 7);
  const quatorzeDiasAtras = subDays(agora, 14);
  const trintaDiasAtras = subDays(agora, 30);
  const sessentaDiasAtras = subDays(agora, 60);

  // Pacientes ativos — tendência: últimos 30 dias vs 30 dias anteriores
  const totalPacientes = pacientes.length;
  const pacientesUltimos30 = pacientes.filter(
    (p) => p.createdAt && isAfter(new Date(p.createdAt), trintaDiasAtras)
  ).length;
  const pacientesAnterior30 = pacientes.filter((p) => {
    if (!p.createdAt) return false;
    const data = new Date(p.createdAt);
    return isAfter(data, sessentaDiasAtras) && !isAfter(data, trintaDiasAtras);
  }).length;
  const tendenciaPacientes = calcularTendencia(
    pacientesUltimos30,
    pacientesAnterior30
  );

  // Doses últimos 7 dias vs 7 dias anteriores
  const dosesRecentes = doses.filter((d) =>
    isAfter(new Date(d.timestamp), seteDiasAtras)
  );
  const dosesAnteriores = doses.filter((d) => {
    const data = new Date(d.timestamp);
    return isAfter(data, quatorzeDiasAtras) && !isAfter(data, seteDiasAtras);
  });
  const tendenciaDoses = calcularTendencia(
    dosesRecentes.length,
    dosesAnteriores.length
  );

  // Eficácia média — geral + tendência (últimos 7 vs anteriores 7)
  const eficaciaGeral = calcularEficaciaMedia(doses);
  const eficaciaRecente = calcularEficaciaMedia(dosesRecentes);
  const eficaciaAnterior = calcularEficaciaMedia(dosesAnteriores);
  const tendenciaEficacia = calcularTendencia(eficaciaRecente, eficaciaAnterior);

  // Inferências IA — tendência (últimos 7 vs anteriores 7)
  const totalInferenciasIA = doses.filter((d) => d.analysis).length;
  const iaRecente = dosesRecentes.filter((d) => d.analysis).length;
  const iaAnterior = dosesAnteriores.filter((d) => d.analysis).length;
  const tendenciaIA = calcularTendencia(iaRecente, iaAnterior);

  return {
    pacientesAtivos: totalPacientes,
    pacientesAtivosNovos: pacientesUltimos30,
    tendenciaPacientes,
    dosesUltimos7Dias: dosesRecentes.length,
    tendenciaDoses,
    eficaciaMedia: eficaciaGeral,
    tendenciaEficacia,
    inferenciasIA: totalInferenciasIA,
    tendenciaIA,
  };
}
