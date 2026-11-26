import { Brain } from "lucide-react";

const METRICAS_CLINICAS = [
  {
    rotulo: "Eficiência",
    valor: "70%",
    descricao: "Precisão em curvas de dosagem",
  },
  {
    rotulo: "Conformidade",
    valor: "LGPD",
    descricao: "Criptografia e sigilo médico ponta a ponta",
  },
] as const;

/**
 * LadoHeroLogin - Painel institucional esquerdo da tela de login.
 * Responsabilidade única: apresentar a identidade clínica e os indicadores do sistema.
 */
export function LadoHeroLogin() {
  return (
    <section
      aria-label="Apresentação Neuro-Dose"
      className="login-panel-left login-panel-enter"
    >
      {/* Topo: marca simples + divisor vertical + subtítulo discreto */}
      <header className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-[var(--login-radius)] border border-[var(--login-dark-accent-soft)] flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Brain
              className="w-[18px] h-[18px] text-[var(--login-dark-accent-soft)]"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--login-dark-text)]">
            Neuro-Dose
          </span>
        </div>

        <span
          className="w-px h-4 bg-white/15 shrink-0"
          aria-hidden="true"
        />

        <span className="text-[13px] font-normal text-[var(--login-dark-text-secondary)]">
          Plataforma clínica
        </span>
      </header>

      {/* Centro: título, subtítulo e grade de 3 métricas */}
      <div className="my-auto py-10">
        <p className="text-[48px] font-semibold tracking-[-0.02em] leading-[1.1] text-[var(--login-dark-text)]">
          Precisão algorítmica na
          <br />
          <span className="text-[var(--login-dark-title-accent)]">
            Neurologia Clínica.
          </span>
        </p>

        <p className="mt-6 text-[18px] font-normal leading-[1.6] text-[var(--login-dark-text-secondary)] max-w-[560px]">
          Modelagem farmacocinética e suporte à dosagem em tempo real.
          Desenvolvido para neurologistas que exigem rigor computacional e total
          conformidade com diretrizes clínicas.
        </p>

        {/* 3 cards de métricas (48px abaixo do subtítulo) */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-[640px]">
          {METRICAS_CLINICAS.map((metrica) => (
            <div
              key={metrica.rotulo}
              className="bg-[var(--login-dark-surface)] border border-[var(--login-dark-border)] rounded-[var(--login-radius)] p-5 flex flex-col justify-between"
            >
              <span className="text-[12px] font-normal text-[var(--login-dark-text-secondary)]">
                {metrica.rotulo}
              </span>
              <div className="mt-2 text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--login-dark-text)] login-tabular">
                {metrica.valor}
              </div>
              <p className="mt-2 text-[13px] font-normal leading-[1.45] text-[var(--login-dark-text-secondary)]">
                {metrica.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé com linha divisória de 1px */}
      <footer className="pt-6 border-t border-[var(--login-dark-border)] flex items-center justify-between text-[13px]">
        <span className="text-[var(--login-dark-text-secondary)]">
          Neuro-Dose Assist
        </span>
        <a
          href="#documentacao-clinica"
          onClick={(e) => e.preventDefault()}
          className="login-dark-link"
        >
          Documentação clínica ↗
        </a>
      </footer>
    </section>
  );
}
