import { Calendar, Clock, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { type Appointment } from "@/lib/appointments";
import { cn } from "@/lib/utils";

interface PropriedadesSecaoConsultas {
  consultas: Appointment[];
}

/**
 * SecaoConsultas - Próximos atendimentos da agenda clínica.
 * Estado vazio sóbrio sem caixa tracejada; lista com divisórias de 1px.
 */
export function SecaoConsultas({ consultas }: PropriedadesSecaoConsultas) {
  return (
    <section
      aria-label="Agenda clínica"
      className="nd-card overflow-hidden"
    >
      {/* Cabeçalho */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3 border-b border-[var(--nd-border)]">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
            Agenda clínica
          </h2>
          <p className="text-[13px] font-normal text-[var(--nd-text-secondary)] mt-0.5">
            Próximos atendimentos
          </p>
        </div>

        <Link
          to="/appointments"
          className="nd-link inline-flex items-center gap-1 shrink-0"
        >
          <span>Agenda completa</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      {/* Lista ou estado vazio sóbrio */}
      {consultas.length > 0 ? (
        <ul className="divide-y divide-[var(--nd-border)]">
          {consultas.slice(0, 3).map((consulta) => {
            const isConfirmed = consulta.status === "Confirmada";

            return (
              <li
                key={consulta.id}
                className="px-6 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center justify-center w-12 h-11 rounded-[var(--nd-radius)] bg-[var(--nd-muted)] shrink-0 nd-tabular">
                    <span className="text-[13px] font-semibold text-[var(--nd-text)] leading-none">
                      {consulta.time}
                    </span>
                    <span className="text-[12px] text-[var(--nd-text-secondary)] leading-none mt-1">
                      {format(new Date(consulta.date + "T00:00:00"), "dd/MM")}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[var(--nd-text)] truncate">
                      {consulta.patientName}
                    </p>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] truncate">
                      {consulta.type}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--nd-radius)] text-[12px] font-medium shrink-0",
                    isConfirmed
                      ? "bg-[var(--nd-success-bg)] text-[var(--nd-success)]"
                      : "bg-[var(--nd-muted)] text-[var(--nd-label)]"
                  )}
                >
                  {isConfirmed ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  <span>{consulta.status}</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
          <Calendar
            className="w-6 h-6 text-[var(--nd-icon)] mb-3"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-[14px] font-medium text-[var(--nd-text)]">
            Nenhuma consulta agendada
          </p>
          <Link to="/appointments" className="nd-link mt-2">
            + Agendar novo horário
          </Link>
        </div>
      )}
    </section>
  );
}
