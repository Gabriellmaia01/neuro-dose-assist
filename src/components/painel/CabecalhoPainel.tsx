import { Users, Zap, Activity, Cpu, ShieldCheck } from "lucide-react";
import { type EstatisticasPainel } from "@/lib/tiposPainel";
import { motion } from "framer-motion";

interface PropriedadesCabecalhoPainel {
  estatisticas: EstatisticasPainel;
}

/**
 * CabecalhoPainel - Banner de Telemetria e Controle Clínico (Swiss Minimalist).
 * Apresenta o status operacional do sistema, contadores rápidos e indicadores cirúrgicos.
 */
export function CabecalhoPainel({ estatisticas }: PropriedadesCabecalhoPainel) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 text-white shadow-2xl p-6 sm:p-8 group select-none"
    >
      {/* Grade estrutural de fundo (Swiss Grid) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Luz ambiente sutil nos cantos */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      {/* Marcadores de precisão cirúrgica (Swiss Crosshairs) */}
      <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-500 tracking-widest">
        <span>ESTAÇÃO ATIVA</span>
        <span className="text-teal-400 font-bold">+</span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          {/* Badge de status operacional */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
            </span>
            <span className="tracking-wider uppercase">Ambiente Clínico Homologado v2.4</span>
          </div>

          {/* Título de impacto */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Centro de Telemetria e{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-white">
                Decisão Farmacológica
              </span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
              Monitoramento preditivo e suporte algorítmico contínuo para dosagens neurológicas de alta precisão.
            </p>
          </div>

          {/* Chips de Telemetria Rápida */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">PACIENTES:</span>
              <span className="text-white font-semibold">{estatisticas.pacientesAtivos}</span>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">INFERÊNCIAS IA:</span>
              <span className="text-white font-semibold">{estatisticas.inferenciasIA}</span>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">SEGURANÇA:</span>
              <span className="text-emerald-400 font-semibold">LGPD / CFM</span>
            </div>
          </div>
        </div>

        {/* Card Lateral de Telemetria (Desktop) */}
        <div className="hidden lg:flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-right font-mono">
              <p className="text-xs font-semibold text-white tracking-wider uppercase">
                Motor Bayesiano
              </p>
              <p className="text-[11px] text-teal-400/90 mt-0.5">
                Calibrado • Latência &lt;120ms
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
