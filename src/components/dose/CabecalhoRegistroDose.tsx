import { Pill } from "lucide-react";

/**
 * Cabeçalho da página de registro de dose.
 * Princípio SOLID: Responsabilidade Única (S) — apenas apresentação do header.
 */
export function CabecalhoRegistroDose() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
        <Pill className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
          Registrar Dose
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Registre uma nova dose com contexto clínico, estado subjetivo e análise por IA
        </p>
      </div>
    </div>
  );
}
