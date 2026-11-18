import { Users, Pill, Activity, Brain } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { type EstatisticasPainel } from "@/lib/tiposPainel";
import { motion } from "framer-motion";

interface PropriedadesGradeMetricas {
  estatisticas: EstatisticasPainel;
}

/**
 * GradeMetricas - Grade dos 4 cartões de métricas do painel com animação escalonada.
 * Padrão Awwwards: Entrada suave escalonada e responsividade fluida.
 */
export function GradeMetricas({ estatisticas }: PropriedadesGradeMetricas) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      <motion.div variants={item}>
        <MetricCard
          title="Pacientes Ativos"
          value={estatisticas.pacientesAtivos.toString()}
          subtitle={
            estatisticas.pacientesAtivosNovos > 0
              ? `+${estatisticas.pacientesAtivosNovos} novos (30d)`
              : "Sem novos cadastros"
          }
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
          trend={{ value: estatisticas.tendenciaPacientes, label: "vs. mês anterior" }}
          variant="default"
        />
      </motion.div>

      <motion.div variants={item}>
        <MetricCard
          title="Doses Registradas"
          value={estatisticas.dosesUltimos7Dias.toString()}
          subtitle="Últimos 7 dias"
          icon={<Pill className="w-4 h-4 sm:w-5 sm:h-5" />}
          trend={{ value: estatisticas.tendenciaDoses, label: "vs. semana ant." }}
          variant="success"
        />
      </motion.div>

      <motion.div variants={item}>
        <MetricCard
          title="Eficácia Média"
          value={`${estatisticas.eficaciaMedia}%`}
          subtitle="Índice clínico geral"
          icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
          trend={{ value: estatisticas.tendenciaEficacia, label: "vs. semana ant." }}
          variant="default"
        />
      </motion.div>

      <motion.div variants={item}>
        <MetricCard
          title="Inferências IA"
          value={estatisticas.inferenciasIA.toString()}
          subtitle="Total processado"
          icon={<Brain className="w-4 h-4 sm:w-5 sm:h-5" />}
          trend={{ value: estatisticas.tendenciaIA, label: "vs. semana ant." }}
          variant="warning"
        />
      </motion.div>
    </motion.div>
  );
}
