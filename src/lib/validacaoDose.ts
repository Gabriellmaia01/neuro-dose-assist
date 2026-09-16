import { Medication } from "@/lib/medications";

/**
 * Módulo de validação de dose — funções puras sem dependência de React.
 * Princípio SOLID: Responsabilidade Única (S) + Aberto/Fechado (O)
 */

// ── Tipos auxiliares ──────────────────────────────────────────────────────────

export interface ErroValidacao {
  titulo: string;
  descricao: string;
}

// ── Validações de campos obrigatórios ─────────────────────────────────────────

export function validarCamposObrigatorios(
  pacienteId: string,
  medicamentoId: string,
  quantidadeDose: string,
  indicacao: string
): ErroValidacao | null {
  if (!pacienteId || !medicamentoId || !quantidadeDose || Number(quantidadeDose) <= 0 || !indicacao) {
    return {
      titulo: "Campos obrigatórios",
      descricao: "Selecione paciente, medicamento, dose e indicação.",
    };
  }
  return null;
}

// ── Validações de limites de dose ─────────────────────────────────────────────

export function verificarDoseAbaixoLimite(
  quantidadeDose: string,
  medicamento: Medication | undefined
): boolean {
  return !!(
    medicamento?.minDose &&
    Number(quantidadeDose) > 0 &&
    Number(quantidadeDose) < medicamento.minDose
  );
}

export function verificarDoseAcimaLimite(
  quantidadeDose: string,
  medicamento: Medication | undefined
): boolean {
  return !!(
    medicamento?.maxDose &&
    Number(quantidadeDose) > medicamento.maxDose
  );
}

export function obterErroDoseLimite(
  quantidadeDose: string,
  medicamento: Medication | undefined
): ErroValidacao | null {
  if (medicamento?.minDose && Number(quantidadeDose) < medicamento.minDose) {
    return {
      titulo: "Dose abaixo do limite",
      descricao: `A dose informada (${quantidadeDose} mg) está abaixo do limite mínimo de ${medicamento.minDose} mg cadastrado para ${medicamento.name}. Corrija antes de continuar.`,
    };
  }

  if (medicamento?.maxDose && Number(quantidadeDose) > medicamento.maxDose) {
    return {
      titulo: "Dose acima do limite",
      descricao: `A dose informada (${quantidadeDose} mg) excede o limite máximo de ${medicamento.maxDose} mg cadastrado para ${medicamento.name}. Corrija antes de continuar.`,
    };
  }

  return null;
}

// ── Validação de continuidade da etapa 1 ──────────────────────────────────────

export function podeContinuarEtapa1(
  pacienteId: string,
  medicamentoId: string,
  quantidadeDose: string,
  formaAdmin: string,
  horarioDose: string,
  indicacao: string,
  doseAcimaLimite: boolean,
  doseAbaixoLimite: boolean
): boolean {
  return (
    !!pacienteId &&
    !!medicamentoId &&
    !!quantidadeDose &&
    Number(quantidadeDose) > 0 &&
    !!formaAdmin &&
    !!horarioDose &&
    !!indicacao &&
    !doseAcimaLimite &&
    !doseAbaixoLimite
  );
}

// ── Sanitização de entrada de dose ────────────────────────────────────────────

export function sanitizarEntradaDose(valor: string): string {
  const indicePonto = valor.indexOf(".");
  if (indicePonto !== -1 && valor.length - indicePonto - 1 > 2) {
    return valor.slice(0, indicePonto + 3);
  }
  return valor;
}

// ── Sanitização de horário ────────────────────────────────────────────────────

export function sanitizarHorario(valor: string): string {
  const partes = valor.split(":");
  if (partes.length === 2) {
    const horas = Math.min(23, Math.max(0, parseInt(partes[0]) || 0));
    const minutos = Math.min(59, Math.max(0, parseInt(partes[1]) || 0));
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  }
  return valor;
}
