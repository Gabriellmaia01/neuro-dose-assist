import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EfficacyGaugeCardProps {
  efficacy: number;
  dosesCount: number;
  inferencesCount: number;
  className?: string;
}

/**
 * EfficacyGaugeCard - Mostrador semicircular (180°) de índice clínico médio,
 * com arco hachurado de referência e arco preenchido em gradiente navy-teal.
 */
export function EfficacyGaugeCard({
  efficacy,
  dosesCount,
  inferencesCount,
  className,
}: EfficacyGaugeCardProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(efficacy)));

  // Semicírculo SVG (centro 130,126; raio 96; comprimento = PI * 96 ≈ 301.59)
  const radius = 96;
  const semiCircumference = Math.PI * radius;
  const filledLength = (clamped / 100) * semiCircumference;
  const dashOffset = semiCircumference - filledLength;

  const bandLabel =
    clamped >= 75
      ? "Resposta terapêutica ótima"
      : clamped >= 50
        ? "Resposta clínica moderada"
        : clamped > 0
          ? "Requer revisão posológica"
          : "Aguardando registros";

  return (
    <section
      aria-label="Índice clínico de eficácia"
      className={cn("nd-card p-6 flex flex-col justify-between h-full", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
            Índice de Eficácia
          </h2>
          <p className="text-[12px] text-[var(--nd-text-secondary)] mt-0.5">
            {bandLabel}
          </p>
        </div>

        <Link
          to="/analytics"
          className="inline-flex items-center min-h-[44px] sm:min-h-[32px] px-3.5 rounded-full border border-[var(--nd-border-input)] text-[12px] font-medium text-[var(--nd-label)] hover:bg-[var(--nd-bg)] transition-colors shrink-0"
        >
          Analytics
        </Link>
      </div>

      {/* Semicírculo 180° */}
      <div className="relative my-3 flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 260 144"
          className="w-full max-w-[248px] overflow-visible"
          role="img"
          aria-label={`Eficácia clínica média de ${clamped}%`}
        >
          <defs>
            <pattern
              id="nd-gauge-hatch"
              width="7"
              height="7"
              patternTransform="rotate(42 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="7"
                stroke="var(--nd-border-hover)"
                strokeWidth="2.2"
              />
            </pattern>
            <linearGradient id="nd-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--nd-accent)" />
              <stop offset="60%" stopColor="var(--nd-primary)" />
              <stop offset="100%" stopColor="var(--nd-primary-deep)" />
            </linearGradient>
          </defs>

          {/* Arco base hachurado (pendente / headroom) */}
          <path
            d="M 34 126 A 96 96 0 0 1 226 126"
            fill="none"
            stroke="url(#nd-gauge-hatch)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Arco preenchido */}
          {clamped > 0 && (
            <path
              d="M 34 126 A 96 96 0 0 1 226 126"
              fill="none"
              stroke="url(#nd-gauge-grad)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray={semiCircumference}
              strokeDashoffset={dashOffset}
            />
          )}
        </svg>

        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <span className="text-[36px] font-semibold tracking-[-0.03em] leading-none text-[var(--nd-text)] nd-tabular">
            {clamped}%
          </span>
          <span className="mt-1 text-[12px] font-medium text-[var(--nd-text-secondary)]">
            Eficácia média
          </span>
        </div>
      </div>

      {/* Legenda fiel aos 2 arcos do mostrador + resumo real */}
      <div className="pt-3 border-t border-[var(--nd-border)] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--nd-text-secondary)] nd-tabular">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--nd-primary)]" aria-hidden="true" />
            <span>Eficácia ativa</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--nd-border-hover)]" aria-hidden="true" />
            <span>Margem</span>
          </span>
        </div>
        <span className="font-medium text-[var(--nd-label)]">
          {dosesCount} doses · {inferencesCount} IA
        </span>
      </div>
    </section>
  );
}
