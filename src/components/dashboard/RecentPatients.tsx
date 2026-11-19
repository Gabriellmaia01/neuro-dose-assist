import { User, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EfficacyRing } from "./EfficacyRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Patient {
  id: string;
  name: string;
  age: number;
  lastDose: string;
  medication: string;
  efficacy: number;
  photoURL?: string;
}

interface RecentPatientsProps {
  patients: Patient[];
  className?: string;
}

/**
 * RecentPatients - Lista clínica de pacientes recentes em acompanhamento.
 * Linhas de 72px separadas por divisórias de 1px, sem caixas internas escuras.
 */
export function RecentPatients({ patients, className }: RecentPatientsProps) {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Pacientes recentes"
      className={cn("nd-card overflow-hidden", className)}
    >
      {/* Cabeçalho */}
      <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--nd-border)]">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
            Pacientes recentes
          </h2>
          <p className="text-[13px] font-normal text-[var(--nd-text-secondary)] mt-0.5">
            Monitoramento posológico ativo
          </p>
        </div>

        <Link
          to="/patients"
          className="nd-link inline-flex items-center gap-1.5 shrink-0"
        >
          <span>Catálogo completo</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      {/* Lista de pacientes com rolagem horizontal contida no card em telas estreitas */}
      {patients.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <User
            className="w-6 h-6 mx-auto mb-3 text-[var(--nd-icon)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-[14px] font-medium text-[var(--nd-text)]">
            Nenhum paciente cadastrado
          </p>
          <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1">
            Cadastre pacientes para acompanhar as dosagens aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ul className="divide-y divide-[var(--nd-border)] min-w-[460px]">
            {patients.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  onClick={() => navigate("/patients")}
                  className="nd-list-row min-h-[72px] px-6 py-3 gap-4"
                >
                  {/* Avatar circular neutro */}
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={patient.photoURL} alt={patient.name} />
                    <AvatarFallback className="bg-[var(--nd-muted)] text-[var(--nd-primary)] text-[14px] font-semibold">
                      {patient.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Nome + idade e medicamento */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--nd-text)] leading-[1.3] truncate">
                      {patient.name}
                    </p>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] leading-[1.4] mt-0.5 truncate nd-tabular">
                      {patient.age} anos • {patient.medication}
                    </p>
                  </div>

                  {/* Última dose alinhada à direita */}
                  <div className="text-right shrink-0 nd-tabular">
                    <p className="text-[12px] text-[var(--nd-text-secondary)]">
                      Última dose
                    </p>
                    <p className="text-[13px] font-medium text-[var(--nd-text)] mt-0.5">
                      {patient.lastDose}
                    </p>
                  </div>

                  {/* Indicador circular de 40px + porcentagem ao lado */}
                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                    <EfficacyRing
                      value={patient.efficacy}
                      size="sm"
                      showLabel={false}
                    />
                    <span className="text-[13px] font-semibold text-[var(--nd-text)] nd-tabular w-9 text-right">
                      {Math.round(patient.efficacy)}%
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
