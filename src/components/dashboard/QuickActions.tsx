import { Plus, History, FileText, Brain, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * QuickActions - 4 atalhos rápidos de ação clínica.
 * "Registrar Dose" recebe o único destaque em cor primária (#1B4965); os demais são neutros.
 */
export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Registrar Dose",
      description: "Nova entrada farmacológica",
      href: "/dose",
      primary: true,
    },
    {
      icon: Brain,
      label: "Consultar IA",
      description: "Recomendações preditivas",
      href: "/dose",
      primary: false,
    },
    {
      icon: History,
      label: "Histórico Clínico",
      description: "Consultar logs e posologias",
      href: "/history",
      primary: false,
    },
    {
      icon: FileText,
      label: "Relatório Médico",
      description: "Exportar dossiê em PDF",
      href: "/reports",
      primary: false,
    },
  ];

  return (
    <section aria-label="Ações rápidas">
      <div className="grid grid-cols-1 min-[900px]:grid-cols-2 xl:grid-cols-4 gap-6">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "relative flex items-start gap-3.5 p-4 h-full",
              action.primary ? "nd-shortcut-primary" : "nd-card-interactive"
            )}
          >
            {/* Quadrado neutro de 36px com ícone de linha de 20px */}
            <div
              className={cn(
                "w-9 h-9 rounded-[var(--nd-radius)] flex items-center justify-center shrink-0",
                action.primary
                  ? "bg-white/10 text-white"
                  : "bg-[var(--nd-muted)] text-[var(--nd-primary)]"
              )}
              aria-hidden="true"
            >
              <action.icon className="w-5 h-5" strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1 pr-5">
              <h2
                className={cn(
                  "text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] truncate",
                  action.primary ? "text-white" : "text-[var(--nd-text)]"
                )}
              >
                {action.label}
              </h2>
              <p
                className={cn(
                  "text-[13px] font-normal leading-[1.4] mt-1 truncate",
                  action.primary
                    ? "text-white/80"
                    : "text-[var(--nd-text-secondary)]"
                )}
              >
                {action.description}
              </p>
            </div>

            <ArrowUpRight
              className={cn(
                "w-4 h-4 absolute top-4 right-4 shrink-0",
                action.primary ? "text-white/80" : "text-[var(--nd-icon)]"
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
