import { type DoseRecord } from "@/lib/doses";
import { type Alerta } from "@/lib/tiposPainel";

/**
 * Gera alertas automáticos baseados nos dados da última dose.
 * Função pura — sem efeitos colaterais.
 */
export function gerarAlertas(doses: DoseRecord[]): Alerta[] {
  if (doses.length === 0) {
    return [
      {
        id: "0",
        type: "info",
        title: "Bem-vindo",
        description: "Registre sua primeira dose para ver alertas.",
        time: "Agora",
      },
    ];
  }

  const ultimaDose = doses[0];
  const alertas: Alerta[] = [];

  if (ultimaDose.subjectiveState?.mood < 4) {
    alertas.push({
      id: "alert-1",
      type: "warning",
      title: "Humor Baixo Detectado",
      description: `Paciente relatou humor nível ${ultimaDose.subjectiveState.mood}. Monitorar.`,
      time: "Recente",
    });
  }

  if (
    ultimaDose.analysis?.efficacyPrediction &&
    ultimaDose.analysis.efficacyPrediction < 60
  ) {
    alertas.push({
      id: "alert-2",
      type: "danger",
      title: "Baixa Eficácia Estimada",
      description: "Última dose teve eficácia inferior a 60%.",
      time: "Recente",
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      id: "info-1",
      type: "info",
      title: "Monitoramento Ativo",
      description: "Nenhum alerta crítico detectado nas últimas doses.",
      time: "Agora",
    });
  }

  return alertas;
}
