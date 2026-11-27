import { Plus, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Patient {
  id: string;
  name: string;
  age: number;
  lastDose: string;
  medication: string;
  efficacy: number;
}

interface RecentPatientsProps {
  patients: Patient[];
  className?: string;
}

function getEfficacyPill(efficacy: number) {
  if (efficacy >= 75) {
    return {
      label: `${Math.round(efficacy)}% · Ótima`,
      className: "bg-[var(--nd-success-bg)] text-[var(--nd-success)]",
    };
  }
  if (efficacy >= 50) {
    return {
      label: `${Math.round(efficacy)}% · Moderada`,
      className: "bg-[var(--nd-warning-bg)] text-[var(--nd-warning)]",
    };
  }
  return {
    label: `${Math.round(efficacy)}% · Atenção`,
    className: "bg-[var(--nd-error-bg)] text-[var(--nd-error)]",
  };
}

/**
 * RecentPatients - Card bento de pacientes recentes em acompanhamento (inspirado em Team Collaboration).
 */
export function RecentPatients({ patients, className }: RecentPatientsProps) {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Pacientes recentes"
      className={cn("nd-card p-6 flex flex-col justify-between h-full", className)}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
            Pacientes recentes
          </h2>
          <p className="text-[12px] font-normal text-[var(--nd-text-secondary)] mt-0.5">
            Monitoramento posológico ativo
          </p>
        </div>

        <Link
          to="/patients"
          className="inline-flex items-center gap-1 min-h-[44px] lg:min-h-[36px] px-3.5 rounded-full border border-[var(--nd-border-input)] bg-[var(--nd-surface)] text-[12px] font-medium text-[var(--nd-text)] hover:bg-[var(--nd-bg)] transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--nd-primary)]" strokeWidth={2} aria-hidden="true" />
          <span>Pacientes</span>
        </Link>
      </div>

      {/* Lista de pacientes */}
      {patients.length === 0 ? (
        <div className="my-auto py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--nd-muted)] flex items-center justify-center mx-auto mb-3">
            <User
              className="w-5 h-5 text-[var(--nd-icon)]"
              strokeWidth={1.65}
              aria-hidden="true"
            />
          </div>
          <p className="text-[14px] font-medium text-[var(--nd-text)]">
            Nenhum paciente cadastrado
          </p>
          <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1">
            Cadastre pacientes para acompanhar as dosagens aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5 flex-1">
          {patients.slice(0, 4).map((patient) => {
            const pill = getEfficacyPill(patient.efficacy);
            return (
              <li key={patient.id}>
                <button
                  type="button"
                  aria-label={`Ver prontuário de ${patient.name}`}
                  onClick={() =>
                    navigate("/patients", {
                      state: { patientId: patient.id, patientName: patient.name },
                    })
                  }
                  className="nd-list-row p-2.5 rounded-2xl gap-3 items-start sm:items-center"
                >
                  <Avatar className="w-10 h-10 shrink-0 border border-[var(--nd-border)]">
                    <AvatarFallback className="bg-[var(--nd-accent-soft)] text-[var(--nd-primary)] text-[13px] font-semibold">
                      {patient.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <p className="text-[14px] font-semibold text-[var(--nd-text)] leading-snug truncate">
                        {patient.name}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold shrink-0 nd-tabular",
                          pill.className
                        )}
                      >
                        {pill.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--nd-text-secondary)] leading-snug mt-0.5 nd-tabular">
                      {patient.age} anos · <span className="font-medium text-[var(--nd-label)]">{patient.medication}</span> · {patient.lastDose}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
