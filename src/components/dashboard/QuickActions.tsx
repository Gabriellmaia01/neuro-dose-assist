import { Plus, History, FileText, Brain, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * QuickActions - Bloco de Atalhos de Decisão e Ação Rápida (Swiss Clinical Minimalist).
 * Padrão Awwwards: Bento cards interativos com micro-ícones de ação e hover refinado.
 */
export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Registrar Dose",
      description: "Nova entrada farmacológica",
      href: "/dose",
      iconBg: "bg-teal-500/10 text-teal-400 border border-teal-500/30",
      accentBorder: "hover:border-teal-500/40",
      primary: true,
      tag: "NOVO REGISTRO",
    },
    {
      icon: Brain,
      label: "Consultar IA",
      description: "Recomendações preditivas",
      href: "/dose",
      iconBg: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
      accentBorder: "hover:border-violet-500/40",
      primary: false,
      tag: "BAYESIAN ENGINE",
    },
    {
      icon: History,
      label: "Histórico Clínico",
      description: "Consultar logs e posologias",
      href: "/history",
      iconBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      accentBorder: "hover:border-cyan-500/40",
      primary: false,
      tag: "LOG DE EVENTOS",
    },
    {
      icon: FileText,
      label: "Relatório Médico",
      description: "Exportar dossiê em PDF",
      href: "/reports",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      accentBorder: "hover:border-amber-500/40",
      primary: false,
      tag: "DOCS CLÍNICOS",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {actions.map((action, idx) => (
        <motion.div
          key={action.label}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            to={action.href}
            className={cn(
              "block relative h-full overflow-hidden rounded-xl p-4 sm:p-5 transition-all duration-300 group",
              "border backdrop-blur-xl shadow-sm hover:shadow-lg",
              action.primary
                ? "bg-slate-900/90 dark:bg-slate-900/90 border-teal-500/30 text-white"
                : "bg-card/90 dark:bg-slate-900/60 border-border/80 dark:border-slate-800/80 text-foreground",
              action.accentBorder
            )}
          >
            {/* Tag em Monospace no topo */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={cn(
                  "text-[9px] font-mono tracking-widest uppercase",
                  action.primary ? "text-teal-300/90 font-medium" : "text-muted-foreground/70"
                )}
              >
                {action.tag}
              </span>
              <ArrowUpRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                  action.primary ? "text-teal-400" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
            </div>

            {/* Ícone e Títulos */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                  action.iconBg
                )}
              >
                <action.icon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h3
                  className={cn(
                    "text-sm font-semibold tracking-tight truncate",
                    action.primary ? "text-white" : "text-foreground"
                  )}
                >
                  {action.label}
                </h3>
                <p
                  className={cn(
                    "text-xs mt-0.5 truncate",
                    action.primary ? "text-slate-400" : "text-muted-foreground"
                  )}
                >
                  {action.description}
                </p>
              </div>
            </div>

            {/* Borda inferior sutil */}
            {action.primary && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 via-cyan-400 to-transparent" />
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
