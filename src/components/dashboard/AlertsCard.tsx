import { AlertTriangle, TrendingDown, Clock, Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  time: string;
}

interface AlertsCardProps {
  alerts: Alert[];
  className?: string;
}

/**
 * AlertsCard - Central de Alertas e Sinais Vitais Clínicos (Swiss Minimalist).
 * Padrão Awwwards: Indicadores de risco pontuais, tipografia clínica e visual limpo.
 */
export function AlertsCard({ alerts, className }: AlertsCardProps) {
  const navigate = useNavigate();

  const typeStyles = {
    warning: {
      border: "border-l-amber-500",
      iconBg: "bg-amber-500/10 text-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    danger: {
      border: "border-l-rose-500",
      iconBg: "bg-rose-500/10 text-rose-400",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    info: {
      border: "border-l-cyan-500",
      iconBg: "bg-cyan-500/10 text-cyan-400",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
  };

  const dangerCount = alerts.filter((a) => a.type === "danger").length;

  return (
    <div
      className={cn(
        "rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-5 sm:p-6 shadow-sm",
        className
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Alertas Farmacológicos
            </h3>
            <p className="text-xs text-muted-foreground">
              {dangerCount > 0 ? `${dangerCount} alerta(s) de alta prioridade` : "Parâmetros dentro da normalidade"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border",
            dangerCount > 0
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
              : "bg-teal-500/10 text-teal-400 border-teal-500/30"
          )}
        >
          {alerts.length} NOTIF
        </span>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-2.5">
        {alerts.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground border border-dashed border-border/60 rounded-xl">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Nenhum evento adverso</p>
            <p className="text-xs text-muted-foreground mt-1">Todos os parâmetros neurológicos estão estáveis.</p>
          </div>
        ) : (
          alerts.slice(0, 3).map((alert) => {
            const styles = typeStyles[alert.type];
            return (
              <motion.div
                key={alert.id}
                whileHover={{ x: 2 }}
                onClick={() => navigate("/history")}
                className={cn(
                  "p-3 rounded-xl border border-l-4 border-border/40 dark:border-slate-800/60 transition-all duration-200 cursor-pointer",
                  "bg-muted/20 hover:bg-muted/40 dark:bg-slate-950/40 dark:hover:bg-slate-950/80",
                  styles.border
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {alert.description}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {alert.time}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
