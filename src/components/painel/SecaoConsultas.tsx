import { Calendar, Clock, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { type Appointment } from "@/lib/appointments";
import { cn } from "@/lib/utils";

interface PropriedadesSecaoConsultas {
  consultas: Appointment[];
}

/**
 * SecaoConsultas - Card bento de lembrete da próxima consulta (estilo Reminders com CTA em pílula).
 */
export function SecaoConsultas({ consultas }: PropriedadesSecaoConsultas) {
  const proxima = consultas[0];
  const demais = consultas.slice(1, 3);

  return (
    <section
      aria-label="Agenda clínica"
      className="nd-card p-6 flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
          Próximo atendimento
        </h2>
        {consultas.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--nd-muted)] text-[var(--nd-label)] text-[11px] font-semibold nd-tabular">
            {consultas.length} na fila
          </span>
        )}
      </div>

      {proxima ? (
        <div className="my-5 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[19px] font-semibold tracking-[-0.015em] leading-snug text-[var(--nd-primary-deep)] truncate">
              {proxima.patientName}
            </p>
            <p className="text-[13px] text-[var(--nd-text-secondary)] nd-tabular">
              {format(new Date(proxima.date + "T00:00:00"), "dd/MM")} · {proxima.time} — {proxima.type}
            </p>
            <div className="pt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium",
                  proxima.status === "Confirmada"
                    ? "bg-[var(--nd-success-bg)] text-[var(--nd-success)]"
                    : "bg-[var(--nd-muted)] text-[var(--nd-label)]"
                )}
              >
                {proxima.status === "Confirmada" ? (
                  <Check className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Clock className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                )}
                <span>{proxima.status}</span>
              </span>
            </div>
          </div>

          {demais.length > 0 && (
            <ul className="pt-3 border-t border-[var(--nd-border)] space-y-2">
              {demais.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-[12px]"
                >
                  <span className="font-medium text-[var(--nd-text)] truncate">
                    {item.patientName}
                  </span>
                  <span className="text-[var(--nd-text-secondary)] shrink-0 nd-tabular">
                    {format(new Date(item.date + "T00:00:00"), "dd/MM")} · {item.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="my-auto py-6 flex flex-col items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--nd-accent-soft)] flex items-center justify-center">
            <Calendar
              className="w-5 h-5 text-[var(--nd-primary)]"
              strokeWidth={1.65}
              aria-hidden="true"
            />
          </div>
          <p className="text-[16px] font-semibold text-[var(--nd-text)] mt-1">
            Nenhuma consulta agendada
          </p>
          <p className="text-[13px] text-[var(--nd-text-secondary)] leading-relaxed">
            Organize retornos e avaliações neurológicas na agenda clínica.
          </p>
        </div>
      )}

      <Link to="/appointments" className="nd-btn-primary-pill w-full">
        <Calendar className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        <span>{proxima ? "Abrir agenda" : "Agendar consulta"}</span>
      </Link>
    </section>
  );
}
