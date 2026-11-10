import { type DoseRecord } from "@/lib/doses";
import { type DadosGrafico } from "@/lib/tiposPainel";
import { subDays, format } from "date-fns";

/**
 * Gera os dados do gráfico de eficácia média diária dos últimos 7 dias.
 * Função pura — sem efeitos colaterais.
 */
export function calcularDadosGrafico(doses: DoseRecord[]): DadosGrafico[] {
  const agora = new Date();
  const dadosGrafico: DadosGrafico[] = [];

  for (let i = 6; i >= 0; i--) {
    const dataAlvo = subDays(agora, i);
    const dataFormatada = format(dataAlvo, "dd/MM");

    const dosesDoDia = doses.filter(
      (d) => format(new Date(d.timestamp), "dd/MM") === dataFormatada
    );

    let eficaciaDia = 0;
    let doseDia = 0;

    if (dosesDoDia.length > 0) {
      eficaciaDia =
        dosesDoDia.reduce(
          (acc, d) =>
            acc +
            (d.analysis?.efficacyPrediction ||
              (d.subjectiveState?.energy || 0) * 10 ||
              0),
          0
        ) / dosesDoDia.length;

      doseDia =
        dosesDoDia.reduce(
          (acc, d) => acc + (parseInt(d.doseAmount) || 0),
          0
        ) / dosesDoDia.length;
    }

    dadosGrafico.push({
      data: dataFormatada,
      eficacia: Math.round(eficaciaDia),
      dose: Math.round(doseDia),
    });
  }

  return dadosGrafico;
}
