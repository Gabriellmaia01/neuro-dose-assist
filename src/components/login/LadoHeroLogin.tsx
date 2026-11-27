import { ArrowDown, Brain, ShieldCheck, Activity, Pill } from "lucide-react";

const PILARES_CLINICOS = [
  {
    icon: Pill,
    titulo: "Faixas min–max",
    descricao: "Validação posológica por\u00A0medicamento",
  },
  {
    icon: ShieldCheck,
    titulo: "Interações",
    descricao: "Alertas leves, moderados e\u00A0graves",
  },
  {
    icon: Activity,
    titulo: "Análise pós-dose",
    descricao: "Humor, energia, sono e efeitos\u00A0adversos",
  },
] as const;

interface LadoHeroLoginProps {
  aoExplorar: () => void;
}

/**
 * LadoHeroLogin - Painel editorial esquerdo da tela de login.
 * Apresenta a tese clínica em tipografia editorial, a curva farmacocinética sobre o plano arquitetural e os 3 pilares reais.
 */
export function LadoHeroLogin({ aoExplorar }: LadoHeroLoginProps) {
  return (
    <section
      aria-label="Apresentação Neuro-Dose Assist"
      className="login-panel-left"
    >
      {/* Topo: marca Neuro-Dose + âncora única para conhecer a plataforma */}
      <header className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl bg-[var(--nd-dark-surface)] border border-[var(--nd-dark-border)] flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Brain
              className="w-5 h-5 text-[var(--nd-dark-accent-soft)]"
              strokeWidth={1.75}
            />
          </div>
          <div className="min-w-0">
            <span className="text-[18px] font-semibold tracking-[-0.015em] text-[var(--nd-surface)] block leading-none whitespace-nowrap">
              Neuro-Dose
            </span>
            <span className="hidden sm:block text-[12px] text-[var(--nd-dark-text-secondary)] mt-1 leading-none">
              Neurologia e Neuropsiquiatria
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={aoExplorar}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 sm:px-4 rounded-full bg-[var(--nd-dark-surface)] hover:bg-[var(--nd-primary)] border border-[var(--nd-dark-border)] text-[13px] font-medium text-[var(--nd-dark-text)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-dark-accent-soft)] shrink-0 whitespace-nowrap"
        >
          <span className="sm:hidden">Sobre</span>
          <span className="hidden sm:inline">Como funciona</span>
          <ArrowDown className="w-3.5 h-3.5 login-scroll-cue-icon" strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      {/* Centro: tese editorial em voz única + curva farmacocinética diretamente no plano */}
      <div className="relative z-10 mt-4 mb-1 lg:my-auto py-1 lg:py-8 space-y-5 lg:space-y-8">
        <div className="space-y-2.5 lg:space-y-4">
          <h1 className="login-display text-[28px] sm:text-[38px] xl:text-[48px] leading-[1.08] text-[var(--nd-surface)] max-w-[18ch]">
            Precisão posológica na Neurologia{"\u00A0"}Clínica.
          </h1>

          <p className="text-[15px] sm:text-[16px] font-normal leading-[1.6] text-[var(--nd-dark-text)] max-w-[50ch]">
            Centralize prontuários, valide faixas terapêuticas seguras e acompanhe
            a resposta pós-dose em um único{"\u00A0"}ambiente.
          </p>
        </div>

        {/* Traçado farmacocinético direto no plano (sem card aninhado) */}
        <div className="hidden sm:block border-y border-[var(--nd-dark-border)] py-5 max-w-[580px]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[13px] font-semibold text-[var(--nd-surface)]">
                Janela Terapêutica & Monitoramento
              </p>
              <p className="text-[12px] text-[var(--nd-dark-text-secondary)]">
                Concentração plasmática × faixa segura{"\u00A0"}(min–max)
              </p>
            </div>
            <span className="text-[12px] font-medium text-[var(--nd-dark-text)] nd-tabular shrink-0">
              Exemplo ilustrativo
            </span>
          </div>

          <svg
            viewBox="0 0 520 128"
            className="w-full h-auto"
            role="img"
            aria-label="Diagrama ilustrativo de curva farmacocinética dentro da janela terapêutica entre dose mínima eficaz e limite máximo seguro"
          >
            <defs>
              <linearGradient id="login-pk-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--nd-dark-accent-soft)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--nd-accent)" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="login-pk-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--nd-dark-accent-soft)" />
                <stop offset="55%" stopColor="var(--nd-dark-title-accent)" />
                <stop offset="100%" stopColor="var(--nd-surface)" />
              </linearGradient>
            </defs>

            {/* Banda da janela terapêutica */}
            <rect x="38" y="30" width="466" height="50" rx="6" fill="url(#login-pk-band)" />
            <line x1="38" y1="30" x2="504" y2="30" stroke="var(--nd-dark-title-accent)" strokeOpacity="0.45" strokeDasharray="4 4" />
            <line x1="38" y1="80" x2="504" y2="80" stroke="var(--nd-dark-title-accent)" strokeOpacity="0.35" strokeDasharray="4 4" />

            {/* Rótulos dos limites */}
            <text x="4" y="34" fill="var(--nd-dark-text)" fontSize="12" fontFamily="var(--nd-font)">
              Máx
            </text>
            <text x="4" y="84" fill="var(--nd-dark-text)" fontSize="12" fontFamily="var(--nd-font)">
              Mín
            </text>

            {/* Curva farmacocinética */}
            <path
              d="M 42 100 C 86 100, 108 38, 162 42 C 216 46, 242 70, 294 48 C 344 28, 396 60, 498 50"
              fill="none"
              stroke="url(#login-pk-stroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="login-pk-curve"
            />

            {/* Ponto de equilíbrio estável */}
            <circle cx="294" cy="48" r="9" fill="var(--nd-dark-accent-soft)" fillOpacity="0.35" className="login-pk-pulse-ring" />
            <circle cx="294" cy="48" r="4" fill="var(--nd-surface)" />

            {/* Eixo temporal */}
            <g fill="var(--nd-dark-text-secondary)" fontSize="12" fontFamily="var(--nd-font)">
              <text x="42" y="118">0h</text>
              <text x="155" y="118">6h</text>
              <text x="284" y="118">12h</text>
              <text x="394" y="118">18h</text>
              <text x="484" y="118">24h</text>
            </g>
          </svg>

          {/* 3 pilares reais separados por fio vertical (zero caixas internas) */}
          <div className="mt-4 pt-4 border-t border-[var(--nd-dark-border)] grid grid-cols-3 divide-x divide-[var(--nd-dark-border)]">
            {PILARES_CLINICOS.map((pilar, idx) => (
              <div
                key={pilar.titulo}
                className={idx === 0 ? "pr-3 space-y-1 min-w-0" : idx === 1 ? "px-3 space-y-1 min-w-0" : "pl-3 space-y-1 min-w-0"}
              >
                <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--nd-surface)]">
                  <pilar.icon
                    className="w-3.5 h-3.5 text-[var(--nd-dark-accent-soft)] shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="truncate">{pilar.titulo}</span>
                </div>
                <p className="text-[12px] text-[var(--nd-dark-text-secondary)] leading-snug">
                  {pilar.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé sóbrio do hero (sem segundo botão redundante) */}
      <footer className="relative z-10 hidden lg:flex pt-5 border-t border-[var(--nd-dark-border)] items-center justify-between gap-3 text-[12px] text-[var(--nd-dark-text-secondary)]">
        <span>Suporte à decisão posológica · Uso exclusivo médico</span>
        <span>Conformidade LGPD</span>
      </footer>
    </section>
  );
}
