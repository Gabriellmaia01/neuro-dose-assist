import { DoseRecord } from "@/lib/doses";
import { ActivityAction, EntityType } from "@/lib/activityLog";
import {
  Pill,
  Activity,
  Brain,
  AlertTriangle,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";

/**
 * Tipos e configurações compartilhados do módulo Histórico.
 * Princípio SOLID: Responsabilidade Única (S) — apenas definições de tipo e constantes de exibição.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ItemHistorico extends DoseRecord {
  patientName: string;
  medicationName: string;
  displayType: "dose" | "symptom" | "recommendation" | "alert";
}

export interface EstatisticasHistorico {
  totalFiltrado: number;
  pacientesUnicos: number;
  eficaciaMedia: number;
  quantidadeAlertas: number;
}

// ── Configuração de tipos de registro ─────────────────────────────────────────

export const configuracaoTipoRegistro = {
  dose: {
    icon: Pill,
    label: "Dose",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  symptom: {
    icon: Activity,
    label: "Sintoma",
    color: "bg-warning/10 text-warning border-warning/20",
  },
  recommendation: {
    icon: Brain,
    label: "Recomendação",
    color: "bg-info/10 text-info border-info/20",
  },
  alert: {
    icon: AlertTriangle,
    label: "Alerta",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
} as const;

export type TipoRegistro = keyof typeof configuracaoTipoRegistro;

// ── Configuração de ações de atividade ────────────────────────────────────────

export const configuracaoAcao: Record<
  ActivityAction,
  { icon: typeof PlusCircle; label: string; color: string }
> = {
  create: {
    icon: PlusCircle,
    label: "Cadastrou",
    color: "bg-success/10 text-success border-success/20",
  },
  update: {
    icon: Edit,
    label: "Atualizou",
    color: "bg-info/10 text-info border-info/20",
  },
  delete: {
    icon: Trash2,
    label: "Removeu",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

// ── Configuração de tipos de entidade ─────────────────────────────────────────

export const configuracaoEntidade: Record<
  EntityType,
  { label: string; icon: typeof Users }
> = {
  patient: { label: "Paciente", icon: Users },
  medication: { label: "Medicamento", icon: Pill },
  appointment: { label: "Consulta", icon: CalendarIcon },
  dose: { label: "Dose", icon: Pill },
  invite: { label: "Convite", icon: Users },
  clinic_member: { label: "Membro", icon: Users },
};

// ── Formatadores de data/hora ─────────────────────────────────────────────────

export const formatadorDataHoraCurto = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export const formatadorDataHoraLongo = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeStyle: "short",
});

export const formatadorHoraCurto = new Intl.DateTimeFormat("pt-BR", {
  timeStyle: "short",
});

// ── Helpers ───────────────────────────────────────────────────────────────────

export function inferirTipoRegistro(
  item: ItemHistorico,
  abaAtiva: string
): TipoRegistro {
  if (abaAtiva !== "all") return abaAtiva as TipoRegistro;

  const temRisco =
    !!item.analysis?.riskAssessment?.some((r) => r.level !== "Baixo");
  const temSintomas =
    !!item.subjectiveState?.effects ||
    (item.subjectiveState?.mood ?? 5) <= 3 ||
    (item.subjectiveState?.sleep ?? 5) <= 4;
  const temRecomendacao = !!item.analysis?.recommendation;

  if (temRisco) return "alert";
  if (temSintomas) return "symptom";
  if (temRecomendacao) return "recommendation";
  return "dose";
}
