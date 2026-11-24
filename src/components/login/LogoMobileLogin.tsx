import { Brain } from "lucide-react";

/**
 * LogoMobileLogin - Cabeçalho compacto exibido em telas menores que 900px.
 * Responsabilidade única: renderizar a marca Neuro-Dose no topo em dispositivos menores.
 */
export function LogoMobileLogin() {
  return (
    <header className="login-mobile-header items-center gap-3 pb-6 border-b border-[var(--login-light-border)]">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-[var(--login-radius)] border border-[var(--login-accent)] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Brain
            className="w-[18px] h-[18px] text-[var(--login-accent)]"
            strokeWidth={1.5}
          />
        </div>
        <span className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--login-light-text)]">
          Neuro-Dose
        </span>
      </div>

      <span
        className="w-px h-4 bg-[var(--login-light-border)] shrink-0"
        aria-hidden="true"
      />

      <span className="text-[13px] font-normal text-[var(--login-light-text-secondary)]">
        Plataforma clínica
      </span>
    </header>
  );
}
