import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

/**
 * MetricCard - Cartão de indicador clínico (KPI).
 * Superfície branca neutra, números tabulares em 28px e variação com ícone e texto.
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: MetricCardProps) {
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  const trendColorClass = trend
    ? trend.value > 0
      ? "text-[var(--nd-success)]"
      : trend.value < 0
        ? "text-[var(--nd-error)]"
        : "text-[var(--nd-text-secondary)]"
    : "";

  const formattedTrend = trend
    ? trend.value > 0
      ? `+${trend.value}%`
      : `${trend.value}%`
    : "";

  return (
    <div className={cn("nd-card p-5 flex flex-col justify-between h-full", className)}>
      <div>
        {/* Rótulo 13px sentence case + ícone fino neutro (sem caixinha colorida) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-[var(--nd-text-secondary)] truncate">
            {title}
          </span>
          <span className="text-[var(--nd-icon)] shrink-0" aria-hidden="true">
            {icon}
          </span>
        </div>

        {/* Número de destaque 28px peso 600 com tabular-nums */}
        <div className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--nd-text)] nd-tabular">
          {value}
        </div>

        {/* Descrição 13px cor secundária */}
        {subtitle && (
          <p className="mt-1 text-[13px] font-normal text-[var(--nd-text-secondary)] truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Linha de variação no rodapé com divisória fina */}
      {trend && (
        <div className="mt-4 pt-3 border-t border-[var(--nd-border)] flex items-center gap-1.5 text-[12px] nd-tabular">
          {TrendIcon && (
            <span className={cn("inline-flex items-center gap-1 font-medium shrink-0", trendColorClass)}>
              <TrendIcon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>{formattedTrend}</span>
            </span>
          )}
          <span className="text-[var(--nd-text-secondary)] truncate">
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
