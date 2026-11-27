import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  footerLabel?: string;
  href?: string;
  featured?: boolean;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

/**
 * MetricCard - Cartão KPI institucional com heading semântico <h2>, linha de base alinhada e alto contraste.
 */
export function MetricCard({
  title,
  value,
  subtitle,
  footerLabel,
  href,
  featured = false,
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

  const formattedTrend = trend
    ? trend.value > 0
      ? `+${trend.value}%`
      : `${trend.value}%`
    : "";

  const trendBadgeClass = featured
    ? "bg-[var(--nd-dark-surface)] text-[var(--nd-dark-text)] border-[var(--nd-dark-border)]"
    : trend && trend.value > 0
      ? "bg-[var(--nd-success-bg)] text-[var(--nd-success)] border-[var(--nd-success)]/20"
      : trend && trend.value < 0
        ? "bg-[var(--nd-error-bg)] text-[var(--nd-error)] border-[var(--nd-error)]/20"
        : "bg-[var(--nd-muted)] text-[var(--nd-label)] border-[var(--nd-border)]";

  return (
    <div
      className={cn(
        featured ? "nd-card-hero" : "nd-card",
        "relative overflow-hidden p-5 flex flex-col h-full",
        className
      )}
    >
      {/* Cabeçalho semântico: <h2> + botão circular ArrowUpRight */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <h2
          className={cn(
            "text-[15px] font-medium leading-snug truncate",
            featured ? "text-[var(--nd-surface)]" : "text-[var(--nd-text)]"
          )}
        >
          {title}
        </h2>

        {href ? (
          <Link
            to={href}
            aria-label={`Abrir ${title}`}
            className={cn(
              featured ? "nd-circle-action-hero" : "nd-circle-action",
              "shrink-0"
            )}
          >
            <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              featured ? "nd-circle-action-hero" : "nd-circle-action",
              "shrink-0 pointer-events-none"
            )}
          >
            <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
          </span>
        )}
      </div>

      {/* Número principal tabular ancorado no mesmo eixo horizontal */}
      <div className="relative z-10 mt-3 mb-4">
        <div
          className={cn(
            "text-[38px] font-semibold leading-[1.08] tracking-[-0.03em] nd-tabular",
            featured ? "text-[var(--nd-surface)]" : "text-[var(--nd-text)]"
          )}
        >
          {value}
        </div>
        {subtitle && (
          <p
            className={cn(
              "mt-1 text-[12px] font-normal truncate",
              featured ? "text-[var(--nd-dark-text)]" : "text-[var(--nd-text-secondary)]"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Rodapé alinhado na base com variação percentual ou status clínico */}
      {trend ? (
        <div className="relative z-10 mt-auto flex items-center gap-2 text-[12px] nd-tabular">
          {TrendIcon && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium shrink-0",
                trendBadgeClass
              )}
            >
              <TrendIcon className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
              <span>{formattedTrend}</span>
            </span>
          )}
          <span
            className={cn(
              "truncate",
              featured ? "text-[var(--nd-dark-text)]" : "text-[var(--nd-text-secondary)]"
            )}
          >
            {trend.label}
          </span>
        </div>
      ) : footerLabel ? (
        <div className="relative z-10 mt-auto flex items-center gap-2 text-[12px]">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[var(--nd-border)] bg-[var(--nd-muted)] text-[var(--nd-label)] font-medium truncate">
            {footerLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
