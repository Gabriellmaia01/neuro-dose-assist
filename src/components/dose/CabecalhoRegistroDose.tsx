/**
 * Cabeçalho editorial da página de registro de dose.
 * Princípio SOLID: Responsabilidade Única (S) — apenas apresentação do header.
 */
export function CabecalhoRegistroDose() {
  return (
    <header className="min-w-0">
      <h1 className="font-display text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--nd-text)] text-balance">
        Registrar Dose
      </h1>
      <p className="text-[14px] text-[var(--nd-text-secondary)] mt-1.5 max-w-[60ch]">
        Registre a administração com contexto clínico, estado subjetivo e avaliação pós-dose.
      </p>
    </header>
  );
}
