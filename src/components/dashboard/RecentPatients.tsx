import { User, ChevronRight, UserCircle, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EfficacyRing } from "./EfficacyRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

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
 * RecentPatients - Lista de Pacientes Recentes (Swiss Clinical Minimalist).
 * Padrão Awwwards: Linhas com espaçamento cirúrgico, indicadores táteis e telemetria por paciente.
 */
export function RecentPatients({ patients, className }: RecentPatientsProps) {
  const navigate = useNavigate();

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
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Pacientes Recentes
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitoramento posológico ativo
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-mono text-xs hover:bg-teal-500/10 rounded-lg"
          onClick={() => navigate("/patients")}
        >
          <span>Catálogo Completo</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Lista de Pacientes */}
      <div className="space-y-2.5">
        {patients.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground border border-dashed border-border/60 rounded-xl">
            <User className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-400" />
            <p className="text-xs font-mono uppercase tracking-wider text-foreground">Nenhum paciente registrado</p>
            <p className="text-xs text-muted-foreground mt-1">Cadastre pacientes para iniciar o acompanhamento neural.</p>
          </div>
        ) : (
          patients.map((patient) => (
            <motion.div
              key={patient.id}
              whileHover={{ x: 2 }}
              onClick={() => navigate("/patients")}
              className={cn(
                "flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer group",
                "bg-muted/20 hover:bg-muted/40 dark:bg-slate-950/40 dark:hover:bg-slate-950/80",
                "border border-border/40 hover:border-border dark:border-slate-800/60 dark:hover:border-slate-700"
              )}
            >
              {/* Avatar com Anel */}
              <Avatar className="w-10 h-10 ring-1 ring-border shrink-0">
                <AvatarImage src={patient.photoURL} alt={patient.name} />
                <AvatarFallback className="bg-teal-500/10 text-teal-400 font-mono text-xs font-bold">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Informações Clínicas */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-teal-400 transition-colors">
                  {patient.name}
                </p>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {patient.age} anos • <span className="text-teal-400/80">{patient.medication}</span>
                </p>
              </div>

              {/* Última dose */}
              <div className="text-right hidden sm:block font-mono">
                <p className="text-[10px] text-muted-foreground uppercase">Última dose</p>
                <p className="text-xs font-medium text-foreground">{patient.lastDose}</p>
              </div>

              {/* Anel de Eficácia */}
              <div className="shrink-0 flex items-center gap-2">
                <EfficacyRing value={patient.efficacy} size="sm" showLabel={false} />
                <span className="font-mono text-xs font-semibold text-foreground hidden xs:inline">
                  {patient.efficacy}%
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
