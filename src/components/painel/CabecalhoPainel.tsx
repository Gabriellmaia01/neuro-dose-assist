import { FileText, History, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesCabecalhoPainel {
  estatisticas: EstatisticasPainel;
}

/**
 * CabecalhoPainel - Cabeçalho bento do dashboard com título clínico e ações em pílula.
 */
export function CabecalhoPainel({ estatisticas }: PropriedadesCabecalhoPainel) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <h1 className="login-display text-[24px] sm:text-[28px] leading-[1.18] text-[var(--nd-text)]">
          Centro de Telemetria e Decisão Farmacológica
        </h1>
        <p className="text-[14px] sm:text-[15px] font-normal leading-[1.5] text-[var(--nd-text-secondary)]">
          Acompanhe {estatisticas.pacientesAtivos} pacientes ativos, curvas posológicas e alertas clínicos em tempo{"\u00A0"}real.
        </p>
      </div>

      {/* Ações rápidas em pílula (hierarquia primária + secundárias) */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <Link to="/dose" className="nd-btn-primary-pill">
          <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span>Registrar Dose</span>
        </Link>

        <Link to="/history" className="nd-btn-outline-pill">
          <History className="w-4 h-4 text-[var(--nd-primary)]" strokeWidth={1.75} aria-hidden="true" />
          <span>Histórico</span>
        </Link>

        <Link to="/reports" className="nd-btn-outline-pill">
          <FileText className="w-4 h-4 text-[var(--nd-primary)]" strokeWidth={1.75} aria-hidden="true" />
          <span>Relatório</span>
        </Link>
      </div>
    </div>
  );
}
