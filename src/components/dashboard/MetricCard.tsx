import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

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
 * MetricCard - Cartão de Métrica de Alta Precisão (Swiss Clinical Minimalist).
 * Padrão Awwwards: Tipografia contrastante, indicador de tendência cirúrgico e micro-interação.
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      accentBorder: "group-hover:border-teal-500/40",
      accentLine: "from-teal-400 to-transparent",
      iconBg: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    },
    success: {
      accentBorder: "group-hover:border-emerald-500/40",
      accentLine: "from-emerald-400 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    warning: {
      accentBorder: "group-hover:border-amber-500/40",
      accentLine: "from-amber-400 to-transparent",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    danger: {
      accentBorder: "group-hover:border-rose-500/40",
      accentLine: "from-rose-400 to-transparent",
      iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    },
  };

  const styles = variantStyles[variant];

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 shadow-sm hover:shadow-lg group",
        styles.accentBorder,
        className
      )}
    >
      {/* Linha superior de acento com gradiente no hover */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          styles.accentLine
        )}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        {/* Cabeçalho do Card: Rótulo e Ícone */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground truncate">
            {title}
          </span>
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
              styles.iconBg
            )}
          >
            {icon}
          </div>
        </div>

        {/* Valor Principal Tipográfico */}
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {/* Rodapé com Tendência em Telemetria */}
        {trend && (
          <div className="pt-2 border-t border-border/40 dark:border-slate-800/60 flex items-center gap-1.5 text-[11px] font-mono">
            {TrendIcon && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold",
                  trend.value > 0
                    ? "text-emerald-500 dark:text-emerald-400"
                    : trend.value < 0
                      ? "text-rose-500 dark:text-rose-400"
                      : "text-muted-foreground"
                )}
              >
                <TrendIcon className="w-3.5 h-3.5" />
                {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
              </span>
            )}
            <span className="text-muted-foreground/70 truncate">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
