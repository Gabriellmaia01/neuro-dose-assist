import { Brain, ShieldCheck } from "lucide-react";

/**
 * LogoMobileLogin - Cabeçalho responsivo exibido em dispositivos móveis.
 * Estilo Minimalista Suíço: Tipografia estruturada, badge técnico e indicador cirúrgico.
 */
export function LogoMobileLogin() {
  return (
    <div className="lg:hidden text-center mb-8">
      {/* Badge Técnico Superior */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] font-mono mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span>NEURO-DOSE // AMBIENTE CLÍNICO</span>
      </div>

      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
          <Brain className="w-6 h-6 text-teal-400" />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">
            NeuroDose <span className="text-teal-400 text-sm font-normal">Assist</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            Decisão Farmacológica Inteligente
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          LGPD Compliant
        </span>
        <span>•</span>
        <span>IA Validada</span>
      </div>
    </div>
  );
}
