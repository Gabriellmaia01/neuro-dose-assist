import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  Zap,
  Cpu,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

// Lazy load do componente visual
const NeuralBrainScene = lazy(() =>
  import("@/components/3d/NeuralBrainScene").then((m) => ({
    default: m.NeuralBrainScene,
  }))
);

/**
 * LadoHeroLogin - Seção Hero de Apresentação Clínica (Swiss Minimalist / Awwwards Standard)
 * Apresenta a rede neural, métricas de precisão clínica e telemetria do sistema com Framer Motion.
 */
export function LadoHeroLogin() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-slate-950 border-r border-slate-800/60 select-none">
      {/* Grade estrutural de fundo (Swiss Grid) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Marcadores de precisão cirúrgica (Swiss Crosshairs) */}
      <div className="absolute top-6 left-6 font-mono text-[10px] text-slate-500 tracking-widest z-30 flex items-center gap-2">
        <span className="text-teal-400 font-bold">+</span>
        <span>SYS.SPEC // NEURO-DOSE CLINICAL ENCLAVE</span>
      </div>

      <div className="absolute top-6 right-8 font-mono text-[10px] text-slate-500 tracking-widest z-30 flex items-center gap-2">
        <span>LATENCY: 12ms</span>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
        <span className="text-teal-400 font-bold">+</span>
      </div>

      {/* Canvas da Rede Neural Sináptica */}
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-teal-400/50" />
          </div>
        }
      >
        <NeuralBrainScene />
      </Suspense>

      {/* Gradiente de transição para o formulário */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 via-slate-950/70 to-transparent pointer-events-none z-10" />

      {/* Conteúdo Hero Tipográfico com Framer Motion */}
      <div className="relative z-20 flex flex-col justify-between w-full h-full p-12 xl:p-16">
        {/* Espaçador superior para acomodar o cabeçalho técnico */}
        <div className="pt-6" />

        {/* Bloco Central Tipográfico Suíço */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl space-y-6"
        >
          {/* Badge de status clínico */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="font-mono text-xs font-medium tracking-wider uppercase text-slate-300">
              Protocolo IA // Ativo v2.4
            </span>
          </div>

          {/* Título Principal de Impacto Tipográfico */}
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            Precisão Algorítmica na{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-white">
              Neurologia Clínica.
            </span>
          </h1>

          {/* Subtítulo Técnico e Elegante */}
          <p className="text-slate-400 text-base xl:text-lg leading-relaxed max-w-lg font-normal">
            Modelagem farmacocinética e suporte à dosagem em tempo real. Desenvolvido para
            neurologistas que exigem rigor computacional e total conformidade com diretrizes clínicas.
          </p>

          {/* Bento Grid de Telemetria Clínica (3 Cards estilo Awwwards) */}
          <div className="grid grid-cols-3 gap-3.5 pt-4">
            {/* Card 1: Precisão */}
            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(20, 184, 166, 0.4)" }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Eficiência
                </span>
                <Activity className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">99.4%</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Precisão em curvas de dosagem
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Card 2: Latência de Resposta */}
            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(6, 182, 212, 0.4)" }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Latência
                </span>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">&lt;120ms</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Processamento preditivo instantâneo
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Card 3: Segurança de Nível Médico */}
            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(139, 92, 246, 0.4)" }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Conformidade
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">LGPD</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Criptografia e sigilo médico ponta a ponta
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
        </motion.div>

        {/* Rodapé Técnico com Padrões Suíços */}
        <div className="pt-8 border-t border-slate-900 flex items-center justify-between font-mono text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              NEURAL CORE ENGINE
            </span>
            <span>•</span>
            <span>CALIBRAÇÃO BAYESIANA</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-default">
            <span>DOCS CLÍNICAS</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
