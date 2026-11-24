import { Users, Activity, ShieldCheck } from "lucide-react";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesCabecalhoPainel {
  estatisticas: EstatisticasPainel;
}

/**
 * CabecalhoPainel - Cabeçalho simples e sóbrio da página principal do dashboard.
 * Responsabilidade única: apresentar o título, subtítulo e resumo clínico discreto.
 */
export function CabecalhoPainel({ estatisticas }: PropriedadesCabecalhoPainel) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.2] text-[var(--nd-text)]">
          Centro de Telemetria e Decisão Farmacológica
        </h1>
        <p className="text-[15px] font-normal leading-[1.5] text-[var(--nd-text-secondary)] max-w-2xl">
          Monitoramento preditivo e suporte algorítmico contínuo para dosagens neurológicas de alta precisão.
        </p>
      </div>

      {/* Resumo discreto em texto com ícones finos */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[var(--nd-text-secondary)] nd-tabular shrink-0">
        <span className="inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
          <span>{estatisticas.pacientesAtivos} pacientes</span>
        </span>
        <span aria-hidden="true" className="text-[var(--nd-border-hover)]">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
          <span>{estatisticas.inferenciasIA} inferências</span>
        </span>
        <span aria-hidden="true" className="text-[var(--nd-border-hover)]">·</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
          <span>LGPD/CFM</span>
        </span>
      </div>
    </div>
  );
}
