import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { type Appointment } from "@/lib/appointments";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PropriedadesSecaoConsultas {
  consultas: Appointment[];
}

/**
 * SecaoConsultas - Próximas Consultas Agendadas (Swiss Clinical Minimalist).
 * Padrão Awwwards: Visual cirúrgico de agenda clínica, horário em destaque e tags de status.
 */
export function SecaoConsultas({ consultas }: PropriedadesSecaoConsultas) {
  return (
    <div className="rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Agenda Clínica
            </h3>
            <p className="text-xs text-muted-foreground">
              Próximos atendimentos
            </p>
          </div>
        </div>

        <Link
          to="/appointments"
          className="text-xs font-mono text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 hover:underline"
        >
          <span>Agenda Completa</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {consultas.length > 0 ? (
        <div className="space-y-2.5">
          {consultas.slice(0, 3).map((consulta) => (
            <motion.div
              key={consulta.id}
              whileHover={{ x: 2 }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200",
                "bg-muted/20 hover:bg-muted/40 dark:bg-slate-950/40 dark:hover:bg-slate-950/80",
                "border border-border/40 hover:border-border dark:border-slate-800/60 dark:hover:border-slate-700"
              )}
            >
              {/* Box de Horário */}
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 shrink-0 font-mono">
                <Clock className="w-3.5 h-3.5 text-teal-400 mb-0.5" />
                <span className="text-[11px] font-bold text-foreground">{consulta.time}</span>
              </div>

              {/* Informações do Paciente */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {consulta.patientName}
                </p>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {format(new Date(consulta.date + "T00:00:00"), "dd/MM")} • {consulta.type}
                </p>
              </div>

              {/* Status */}
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0",
                  consulta.status === "Confirmada"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : consulta.status === "Agendada"
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                      : "bg-muted text-muted-foreground border-border"
                )}
              >
                {consulta.status}
              </Badge>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground border border-dashed border-border/60 rounded-xl">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-400" />
          <p className="text-xs font-mono uppercase tracking-wider text-foreground">Nenhuma consulta agendada</p>
          <Link
            to="/appointments"
            className="text-xs font-mono text-teal-400 hover:underline mt-1 inline-block"
          >
            + Agendar novo horário
          </Link>
        </div>
      )}
    </div>
  );
}
