import { Suspense, lazy } from "react";
import { Brain, Activity, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

// Lazy load Three.js component to reduce initial bundle size
const NeuralBrainScene = lazy(() =>
  import("@/components/3d/NeuralBrainScene").then((m) => ({
    default: m.NeuralBrainScene,
  }))
);

/**
 * Lado esquerdo da tela de login com hero section, cena 3D e features.
 * Responsabilidade única: renderizar o conteúdo visual explicativo do sistema.
 */
export function LadoHeroLogin() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/80 z-10" />

      {/* 3D Neural Brain Scene */}
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        }
      >
        <NeuralBrainScene />
      </Suspense>

      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center p-12 z-20">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                NeuroDose
              </h1>
              <p className="text-teal-400/80 text-sm font-medium">
                Decisão Clínica IA
              </p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            Transformando
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400">
              decisões médicas
            </span>
          </h2>

          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Sistema inteligente de suporte à decisão clínica para profissionais de
            neurologia. Análise em tempo real com IA.
          </p>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Análise Preditiva
                </p>
                <p className="text-slate-500 text-xs">IA em tempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">100% Seguro</p>
                <p className="text-slate-500 text-xs">LGPD Compliant</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Machine Learning
                </p>
                <p className="text-slate-500 text-xs">Aprendizado contínuo</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Neurologia</p>
                <p className="text-slate-500 text-xs">Especializado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
