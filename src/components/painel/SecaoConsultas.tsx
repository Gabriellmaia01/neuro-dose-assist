import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { type Appointment } from "@/lib/appointments";

interface PropriedadesSecaoConsultas {
  consultas: Appointment[];
}

/**
 * Seção de próximas consultas do painel.
 * Responsabilidade única: renderizar a lista de consultas agendadas.
 */
export function SecaoConsultas({ consultas }: PropriedadesSecaoConsultas) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold">Próximas Consultas</h3>
        </div>
        <Link to="/appointments" className="text-sm text-primary hover:underline">
          Ver todas
        </Link>
      </div>

      {consultas.length > 0 ? (
        <div className="space-y-3">
          {consultas.slice(0, 4).map((consulta) => (
            <div
              key={consulta.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Clock className="w-4 h-4 text-primary mb-0.5" />
                <span className="text-xs font-medium">{consulta.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{consulta.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(consulta.date + "T00:00:00"), "dd/MM")} •{" "}
                  {consulta.type}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  consulta.status === "Confirmada"
                    ? "bg-success/10 text-success border-success/20"
                    : consulta.status === "Agendada"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary border-primary/20"
                }
              >
                {consulta.status}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma consulta agendada</p>
          <Link
            to="/appointments"
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            Agendar consulta
          </Link>
        </div>
      )}
    </div>
  );
}
