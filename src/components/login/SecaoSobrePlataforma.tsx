import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Brain,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecaoSobrePlataformaProps {
  aoVoltarParaLogin: () => void;
}

const ETAPAS_FLUXO = [
  {
    id: "prontuario",
    numero: "01",
    tempo: "0h · Prescrição",
    coordX: 54,
    coordY: 94,
    titulo: "Prontuário estruturado e catálogo farmacológico",
    resumo:
      "Centralize histórico clínico, alergias, condição principal e prescrições por paciente, conectados a um catálogo organizado por classe\u00A0terapêutica.",
  },
  {
    id: "seguranca",
    numero: "02",
    tempo: "6h · Janela segura",
    coordX: 168,
    coordY: 40,
    titulo: "Validação de limites posológicos e interações",
    resumo:
      "Ao registrar uma dose, o sistema valida faixas seguras (minDose–maxDose) e aciona o detector automático de interações entre princípios ativos e\u00A0classes.",
  },
  {
    id: "analise",
    numero: "03",
    tempo: "12h · Estado pós-dose",
    coordX: 296,
    coordY: 48,
    titulo: "Análise clínica pós-dose orientada ao estado subjetivo",
    resumo:
      "O fluxo guiado em 3 etapas combina dados da aplicação com humor, energia, sono e efeitos adversos para gerar estimativa de eficácia e insights\u00A0acionáveis.",
  },
  {
    id: "telemetria",
    numero: "04",
    tempo: "7d · Telemetria & PDF",
    coordX: 454,
    coordY: 44,
    titulo: "Telemetria de 7 dias, analytics preditivo e PDF",
    resumo:
      "Acompanhe curvas de eficácia × dose, tendências de aderência, alertas de risco e exporte dossiês clínicos personalizados em PDF com trilha de\u00A0auditoria.",
  },
] as const;

const MODULOS_CLINICOS = [
  {
    indice: "01",
    dominio: "Dashboard & Analytics",
    titulo: "Telemetria de 7 dias e análise preditiva por paciente",
    descricao:
      "Visualize taxa de aderência, curvas de eficácia × dosagem, tendências de humor e energia, indicadores de risco e previsão semanal para orientar ajustes\u00A0posológicos.",
    escopo: "Curva 7d · Forecast semanal · Alertas\u00A0de\u00A0risco",
  },
  {
    indice: "02",
    dominio: "Agenda Clínica",
    titulo: "Calendário mensal e painel diário de atendimentos",
    descricao:
      "Organize consultas, retornos e avaliações laboratoriais vinculadas diretamente ao prontuário, com transição clara entre status clínicos do\u00A0dia.",
    escopo: "Agendada · Confirmada · Concluída\u00A0·\u00A0Cancelada",
  },
  {
    indice: "03",
    dominio: "Operação Multiclínica",
    titulo: "Atuação individual ou compartilhada em equipe médica",
    descricao:
      "Alterne entre consultório individual e operação em clínica, compartilhando prontuários sob controle de permissões e envio formal de convites por\u00A0e-mail.",
    escopo: "Proprietário · Administrador\u00A0·\u00A0Membro",
  },
  {
    indice: "04",
    dominio: "Auditoria & Relatórios",
    titulo: "Histórico rastreável e exportação de dossiês em PDF",
    descricao:
      "Filtre registros posológicos por paciente ou janela temporal, audite todas as ações da equipe e gere dossiês clínicos estruturados para\u00A0prontuário.",
    escopo: "Log completo · Filtro temporal · Exportação\u00A0PDF",
  },
] as const;

/**
 * Folha clínica sem cards aninhados: apenas divisores hairline e leitura tabular.
 */
function DetalheEtapaClinica({ etapaIndex, animar }: { etapaIndex: number; animar: boolean }) {
  const classePalco = animar ? "login-stage-pane" : undefined;

  if (etapaIndex === 0) {
    return (
      <div key="stage-0" className={classePalco}>
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--nd-border)]">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[var(--nd-accent-soft)] flex items-center justify-center text-[13px] font-semibold text-[var(--nd-primary)] shrink-0 mt-0.5">
              MC
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[var(--nd-text)] leading-snug">
                Paciente ilustrativo · 42{"\u00A0"}anos
              </p>
              <p className="text-[13px] text-[var(--nd-text-secondary)] leading-snug mt-0.5">
                Transtorno de Ansiedade Generalizada · Em{"\u00A0"}acompanhamento
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--nd-success)] shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ativo</span>
          </span>
        </div>

        <dl className="divide-y divide-[var(--nd-border)] text-[13px]">
          <div className="py-3 flex items-baseline justify-between gap-4">
            <dt className="text-[var(--nd-text-secondary)]">Classe terapêutica</dt>
            <dd className="font-semibold text-[var(--nd-text)] text-right">ISRS · Uso contínuo</dd>
          </div>
          <div className="py-3 flex items-baseline justify-between gap-4">
            <dt className="text-[var(--nd-text-secondary)]">Alergias registradas</dt>
            <dd className="font-semibold text-[var(--nd-text)] text-right">Nenhuma conhecida</dd>
          </div>
          <div className="pt-3 flex items-baseline justify-between gap-4">
            <dt className="text-[var(--nd-text-secondary)]">Catálogo farmacológico</dt>
            <dd className="font-medium text-[var(--nd-primary)] text-right">
              ISRS, IRSN, Psicoestimulantes, Antipsicóticos e{"\u00A0"}Estabilizadores
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  if (etapaIndex === 1) {
    return (
      <div key="stage-1" className={classePalco}>
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--nd-border)]">
          <div>
            <p className="text-[15px] font-semibold text-[var(--nd-text)]">
              Verificação de Faixa Segura
            </p>
            <p className="text-[13px] text-[var(--nd-text-secondary)]">
              Comparação automática com minDose e maxDose do{"\u00A0"}catálogo
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--nd-success)] shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dentro da faixa</span>
          </span>
        </div>

        <div className="py-4 border-b border-[var(--nd-border)] space-y-2.5">
          <div className="flex items-center justify-between text-[12px] text-[var(--nd-label)] nd-tabular">
            <span>Mín: 25 mg</span>
            <span className="text-[var(--nd-primary)] font-semibold">Dose informada: 50 mg</span>
            <span>Máx: 200 mg</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-[var(--nd-muted)] overflow-hidden">
            <div
              className="absolute inset-y-0 left-[12%] right-[12%] rounded-full bg-[var(--nd-accent-soft)] border-x border-[var(--nd-accent)]"
              aria-hidden="true"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 left-[32%] w-3.5 h-3.5 rounded-full bg-[var(--nd-primary)] border-2 border-[var(--nd-surface)]"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="pt-3.5 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[var(--nd-warning)] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[13px] text-[var(--nd-label)] leading-relaxed">
            <strong className="font-semibold text-[var(--nd-text)]">Triagem em 3 níveis:</strong>{" "}
            sinaliza combinações de gravidade leve, moderada ou grave com conduta clínica antes de{"\u00A0"}confirmar.
          </p>
        </div>
      </div>
    );
  }

  if (etapaIndex === 2) {
    return (
      <div key="stage-2" className={classePalco}>
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--nd-border)]">
          <div>
            <p className="text-[15px] font-semibold text-[var(--nd-text)]">
              Estado Subjetivo Pós-Dose
            </p>
            <p className="text-[13px] text-[var(--nd-text-secondary)]">
              Avaliação clínica estruturada junto ao registro{"\u00A0"}posológico
            </p>
          </div>
          <span className="text-[12px] font-semibold text-[var(--nd-primary)] nd-tabular shrink-0">
            Etapa 2 de 3
          </span>
        </div>

        <div className="py-4 border-b border-[var(--nd-border)] space-y-3">
          {[
            { label: "Estabilidade de humor", valor: "8 / 10", largura: "80%" },
            { label: "Nível de energia", valor: "7 / 10", largura: "70%" },
            { label: "Qualidade do sono", valor: "8 / 10", largura: "80%" },
          ].map((metrica) => (
            <div key={metrica.label} className="space-y-1">
              <div className="flex items-center justify-between text-[13px] nd-tabular">
                <span className="text-[var(--nd-label)]">{metrica.label}</span>
                <span className="font-semibold text-[var(--nd-primary)]">{metrica.valor}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--nd-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--nd-accent)]"
                  style={{ width: metrica.largura }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3.5 flex items-center justify-between gap-3 text-[13px]">
          <span className="text-[var(--nd-text-secondary)]">Síntese determinística</span>
          <span className="font-semibold text-[var(--nd-success)]">
            Resposta favorável · Risco{"\u00A0"}mínimo
          </span>
        </div>
      </div>
    );
  }

  return (
    <div key="stage-3" className={classePalco}>
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--nd-border)]">
        <div>
          <p className="text-[15px] font-semibold text-[var(--nd-text)]">
            Telemetria de 7 Dias & Dossiê PDF
          </p>
          <p className="text-[13px] text-[var(--nd-text-secondary)]">
            Evolução posológica semanal e exportação{"\u00A0"}estruturada
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--nd-primary)] shrink-0">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>PDF pronto</span>
        </span>
      </div>

      <div className="py-4 border-b border-[var(--nd-border)]">
        <div className="flex items-end justify-between gap-2 h-20 pt-1">
          {[58, 72, 68, 84, 78, 88, 82].map((altura, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-full max-w-[24px] rounded-full",
                  idx === 5 ? "bg-[var(--nd-primary-deep)]" : "bg-[var(--nd-accent)]"
                )}
                style={{ height: `${Math.round(altura * 0.62)}px` }}
              />
              <span className="text-[12px] text-[var(--nd-label)] nd-tabular">
                D{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3.5 flex items-center justify-between gap-4 text-[13px]">
        <span className="text-[var(--nd-text-secondary)]">Dossiê por paciente e período</span>
        <span className="font-semibold text-[var(--nd-text)]">Trilha auditável{"\u00A0"}completa</span>
      </div>
    </div>
  );
}

/**
 * SecaoSobrePlataforma - Narrativa farmacocinética scroll-coreografada e índice clínico editorial.
 */
export function SecaoSobrePlataforma({ aoVoltarParaLogin }: SecaoSobrePlataformaProps) {
  const [etapaAtiva, setEtapaAtiva] = useState(0);
  const [etapaAlterada, setEtapaAlterada] = useState(false);
  const [barraVisivel, setBarraVisivel] = useState(false);
  const [blocosVisiveis, setBlocosVisiveis] = useState<Record<string, boolean>>({});

  const progressBarRef = useRef<HTMLDivElement>(null);
  const stageTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chapterRefs = useRef<(HTMLLIElement | null)[]>([]);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  const selecionarEtapa = (idx: number, opcoes?: { rolarNoMobile?: boolean; focarAba?: boolean }) => {
    setEtapaAtiva((atual) => {
      if (atual !== idx) {
        setEtapaAlterada(true);
      }
      return idx;
    });
    if (opcoes?.focarAba) {
      stageTabRefs.current[idx]?.focus();
    }
    if (opcoes?.rolarNoMobile && typeof window !== "undefined" && window.innerWidth < 1024) {
      const palco = document.getElementById("palco-etapas");
      if (palco) {
        const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        palco.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "nearest" });
      }
    }
  };

  const handleTecladoEtapas = (e: KeyboardEvent<HTMLDivElement>) => {
    const total = ETAPAS_FLUXO.length;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      selecionarEtapa((etapaAtiva + 1) % total, { focarAba: true });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      selecionarEtapa((etapaAtiva - 1 + total) % total, { focarAba: true });
    } else if (e.key === "Home") {
      e.preventDefault();
      selecionarEtapa(0, { focarAba: true });
    } else if (e.key === "End") {
      e.preventDefault();
      selecionarEtapa(total - 1, { focarAba: true });
    }
  };

  // Progresso de leitura direto na DOM via rAF (zero re-render React por frame de scroll)
  useEffect(() => {
    let rafId = 0;

    const atualizarScroll = () => {
      rafId = 0;
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progresso = Math.min(1, Math.max(0, scrollTop / maxScroll));
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progresso})`;
      }
      const visivel = scrollTop > 380;
      setBarraVisivel((prev) => (prev === visivel ? prev : visivel));
    };

    const aoRolar = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(atualizarScroll);
      }
    };

    atualizarScroll();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  // Sincronização do palco sticky com a etapa em foco no viewport
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const chapterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-step-index"));
            if (!Number.isNaN(idx)) {
              setEtapaAtiva((atual) => {
                if (atual !== idx) {
                  setEtapaAlterada(true);
                }
                return idx;
              });
            }
          }
        });
      },
      {
        rootMargin: "-32% 0px -38% 0px",
        threshold: 0.2,
      }
    );

    chapterRefs.current.forEach((el) => {
      if (el) chapterObserver.observe(el);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute("data-reveal-key");
            if (key) {
              setBlocosVisiveis((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
            }
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealRefs.current.forEach((el) => {
      if (el) revealObserver.observe(el);
    });

    return () => {
      chapterObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  const rolarParaSecao = (id: string) => {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
  };

  const etapaCorrente = ETAPAS_FLUXO[etapaAtiva];

  return (
    <>
      {/* Barra flutuante de continuidade com trilha de progresso compositada em GPU */}
      <div
        className="login-scroll-bar"
        data-visible={barraVisivel ? "true" : "false"}
        aria-hidden={!barraVisivel}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--nd-primary)] text-[var(--nd-surface)] flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.015em] text-[var(--nd-text)] truncate">
              Neuro-Dose Assist
            </span>
          </div>

          <nav aria-label="Seções sobre a plataforma" className="hidden md:flex items-center gap-1">
            {[
              { id: "sobre-plataforma", label: "Fluxo clínico" },
              { id: "modulos-clinicos", label: "Módulos" },
              { id: "governanca-clinica", label: "Governança" },
            ].map((link) => (
              <button
                key={link.id}
                type="button"
                tabIndex={barraVisivel ? 0 : -1}
                onClick={() => rolarParaSecao(link.id)}
                className="min-h-[44px] px-3.5 rounded-full text-[13px] font-medium text-[var(--nd-text-secondary)] hover:text-[var(--nd-text)] hover:bg-[var(--nd-muted)] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            tabIndex={barraVisivel ? 0 : -1}
            onClick={aoVoltarParaLogin}
            className="nd-btn-primary-pill !px-4 text-[13px] shrink-0"
          >
            <span>Acessar painel</span>
            <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="w-full h-[2px] bg-[var(--nd-border)]">
          <div
            ref={progressBarRef}
            className="login-progress-fill"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      {/* Conteúdo editorial abaixo da dobra */}
      <div className="bg-[var(--nd-bg)] border-t border-[var(--nd-border)]">
        {/* Faixa 1: Espinha dorsal farmacocinética sincronizada ao scroll */}
        <section
          id="sobre-plataforma"
          aria-labelledby="titulo-fluxo-clinico"
          className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 sm:py-24"
        >
          <div className="max-w-[62ch] mb-12 sm:mb-16 space-y-3">
            <h2
              id="titulo-fluxo-clinico"
              className="login-display text-[28px] sm:text-[38px] leading-[1.12] text-[var(--nd-text)]"
            >
              O que é o Neuro-Dose Assist e como ele opera no{"\u00A0"}consultório.
            </h2>
            <p className="text-[16px] text-[var(--nd-text-secondary)] leading-[1.6]">
              Uma plataforma web clínica construída para neurologistas, psiquiatras e equipes
              médicas acompanharem prescrições neuropsiquiátricas com rigor posológico e histórico{"\u00A0"}auditável.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Folha clínica sticky à esquerda com a curva farmacocinética viva */}
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <div
                id="palco-etapas"
                className="rounded-[20px] bg-[var(--nd-surface)] border border-[var(--nd-border-input)] shadow-[var(--nd-shadow-popover)] p-6 sm:p-8"
              >
                {/* Tablist WAI-ARIA completo com navegação por setas */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nd-border)]">
                  <div
                    className="flex items-center gap-1.5"
                    role="tablist"
                    aria-label="Etapas do ciclo posológico"
                    onKeyDown={handleTecladoEtapas}
                  >
                    {ETAPAS_FLUXO.map((etapa, idx) => {
                      const selecionada = etapaAtiva === idx;
                      return (
                        <button
                          key={etapa.id}
                          ref={(el) => {
                            stageTabRefs.current[idx] = el;
                          }}
                          id={`stage-tab-${etapa.numero}`}
                          type="button"
                          role="tab"
                          tabIndex={selecionada ? 0 : -1}
                          aria-selected={selecionada}
                          aria-controls="painel-palco-etapa"
                          onClick={() => selecionarEtapa(idx)}
                          className={cn(
                            "min-h-[44px] min-w-[44px] px-3.5 rounded-full text-[13px] font-semibold nd-tabular transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]",
                            selecionada
                              ? "bg-[var(--nd-primary)] text-[var(--nd-surface)]"
                              : "bg-[var(--nd-muted)] text-[var(--nd-label)] hover:bg-[var(--nd-accent-soft)] hover:text-[var(--nd-primary)]"
                          )}
                        >
                          {etapa.numero}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[12px] font-medium text-[var(--nd-text-secondary)] nd-tabular">
                    {etapaCorrente.tempo} · Exemplo{"\u00A0"}ilustrativo
                  </span>
                </div>

                {/* Fio condutor: Curva Farmacocinética que avança conforme a etapa */}
                <div className="py-4 border-b border-[var(--nd-border)]">
                  <svg
                    viewBox="0 0 500 116"
                    className="w-full h-auto"
                    role="img"
                    aria-label={` Posição ativa na curva farmacocinética: etapa ${etapaCorrente.numero}, ${etapaCorrente.tempo}`}
                  >
                    {/* Faixa terapêutica segura */}
                    <rect x="28" y="24" width="452" height="48" rx="6" fill="var(--nd-accent-soft)" />
                    <line x1="28" y1="24" x2="480" y2="24" stroke="var(--nd-accent)" strokeOpacity="0.45" strokeDasharray="4 4" />
                    <line x1="28" y1="72" x2="480" y2="72" stroke="var(--nd-accent)" strokeOpacity="0.35" strokeDasharray="4 4" />

                    <text x="2" y="28" fill="var(--nd-label)" fontSize="12" fontFamily="var(--nd-font)">
                      Máx
                    </text>
                    <text x="2" y="76" fill="var(--nd-label)" fontSize="12" fontFamily="var(--nd-font)">
                      Mín
                    </text>

                    {/* Traçado completo */}
                    <path
                      d="M 54 94 C 98 94, 122 36, 168 40 C 218 44, 246 66, 296 48 C 348 30, 400 54, 454 44"
                      fill="none"
                      stroke="var(--nd-primary)"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                    />

                    {/* Marcadores discretos das 4 estações */}
                    {ETAPAS_FLUXO.map((ponto, idx) => (
                      <circle
                        key={ponto.id}
                        cx={ponto.coordX}
                        cy={ponto.coordY}
                        r="3.5"
                        fill={idx <= etapaAtiva ? "var(--nd-primary)" : "var(--nd-border-hover)"}
                      />
                    ))}

                    {/* Cursor ativo deslizando em GPU ao longo da curva */}
                    <g
                      className="login-pk-node"
                      style={{
                        transform: `translate(${etapaCorrente.coordX}px, ${etapaCorrente.coordY}px)`,
                      }}
                    >
                      <circle r="10" fill="var(--nd-accent)" fillOpacity="0.2" />
                      <circle r="5" fill="var(--nd-primary-deep)" stroke="var(--nd-surface)" strokeWidth="2" />
                    </g>

                    {/* Rótulos do ciclo */}
                    <g fill="var(--nd-text-secondary)" fontSize="12" fontFamily="var(--nd-font)">
                      <text x="40" y="110">01 · 0h</text>
                      <text x="148" y="110">02 · 6h</text>
                      <text x="276" y="110">03 · 12h</text>
                      <text x="434" y="110">04 · 7d</text>
                    </g>
                  </svg>
                </div>

                {/* Painel da etapa corrente (sem caixas aninhadas) */}
                <div
                  id="painel-palco-etapa"
                  role="tabpanel"
                  aria-labelledby={`stage-tab-${etapaCorrente.numero}`}
                  className="pt-5"
                >
                  <DetalheEtapaClinica etapaIndex={etapaAtiva} animar={etapaAlterada} />
                </div>
              </div>
            </div>

            {/* Lista editorial semântica das 4 etapas (sem <h3> dentro de <button> e sem sopa de chips) */}
            <ol className="lg:col-span-6 divide-y divide-[var(--nd-border)] border-y border-[var(--nd-border)]">
              {ETAPAS_FLUXO.map((etapa, idx) => {
                const ativa = etapaAtiva === idx;
                return (
                  <li
                    key={etapa.id}
                    ref={(el) => {
                      chapterRefs.current[idx] = el;
                    }}
                    data-step-index={idx}
                    onClick={() => selecionarEtapa(idx, { rolarNoMobile: true })}
                    className="py-7 sm:py-9 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          "text-[14px] font-semibold nd-tabular shrink-0 pt-0.5",
                          ativa ? "text-[var(--nd-accent)]" : "text-[var(--nd-label)]"
                        )}
                      >
                        {etapa.numero}
                      </span>

                      <div className="space-y-2 min-w-0">
                        <h3 className="text-[18px] font-semibold tracking-[-0.015em] leading-snug">
                          <button
                            type="button"
                            aria-current={ativa ? "step" : undefined}
                            onClick={(e) => {
                              e.stopPropagation();
                              selecionarEtapa(idx, { rolarNoMobile: true });
                            }}
                            className={cn(
                              "block text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)] rounded-sm",
                              ativa ? "text-[var(--nd-primary)]" : "text-[var(--nd-text)] hover:text-[var(--nd-primary)]"
                            )}
                          >
                            {etapa.titulo}
                          </button>
                        </h3>

                        <p className="text-[15px] text-[var(--nd-text-secondary)] leading-[1.6] max-w-[58ch]">
                          {etapa.resumo}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Faixa 2: Índice Editorial dos Módulos Clínicos (substitui cards bento com quadrados de ícone) */}
        <section
          id="modulos-clinicos"
          aria-labelledby="titulo-modulos-clinicos"
          ref={(el) => {
            revealRefs.current[0] = el;
          }}
          data-reveal-key="modulos"
          data-reveal={blocosVisiveis.modulos ? "visible" : "hidden"}
          className="login-reveal max-w-[1200px] mx-auto px-4 sm:px-8 py-14 sm:py-20 border-t border-[var(--nd-border)]"
        >
          <div className="max-w-[62ch] mb-10 sm:mb-12 space-y-2.5">
            <h2
              id="titulo-modulos-clinicos"
              className="login-display text-[28px] sm:text-[38px] leading-[1.12] text-[var(--nd-text)]"
            >
              Arquitetura clínica integrada em quatro{"\u00A0"}frentes.
            </h2>
            <p className="text-[16px] text-[var(--nd-text-secondary)] leading-[1.6]">
              Cada módulo opera sobre a mesma base de prontuários, medicamentos e registros posológicos em tempo{"\u00A0"}real.
            </p>
          </div>

          <div className="divide-y divide-[var(--nd-border)] border-y border-[var(--nd-border)]">
            {MODULOS_CLINICOS.map((modulo) => (
              <article
                key={modulo.indice}
                className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-baseline"
              >
                <div className="md:col-span-3 flex items-baseline gap-3">
                  <span className="text-[13px] font-semibold text-[var(--nd-accent)] nd-tabular">
                    {modulo.indice}
                  </span>
                  <span className="text-[14px] font-semibold text-[var(--nd-primary)]">
                    {modulo.dominio}
                  </span>
                </div>

                <div className="md:col-span-6 space-y-2">
                  <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-[var(--nd-text)] leading-snug">
                    {modulo.titulo}
                  </h3>
                  <p className="text-[15px] text-[var(--nd-text-secondary)] leading-[1.6] max-w-[60ch]">
                    {modulo.descricao}
                  </p>
                </div>

                <div className="md:col-span-3 md:text-right">
                  <span className="text-[13px] font-medium text-[var(--nd-label)] nd-tabular">
                    {modulo.escopo}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Faixa 3: Governança clínica enxuta (medida 62ch, sem faixa de selos genéricos) */}
        <section
          id="governanca-clinica"
          aria-labelledby="titulo-governanca-clinica"
          ref={(el) => {
            revealRefs.current[1] = el;
          }}
          data-reveal-key="governanca"
          data-reveal={blocosVisiveis.governanca ? "visible" : "hidden"}
          className="login-reveal max-w-[1200px] mx-auto px-4 sm:px-8 py-14 sm:py-20 border-t border-[var(--nd-border)]"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-3 max-w-[62ch]">
              <h2
                id="titulo-governanca-clinica"
                className="login-display text-[24px] sm:text-[28px] leading-[1.15] text-[var(--nd-text)]"
              >
                Apoio à decisão construído para complementar o julgamento{"\u00A0"}médico.
              </h2>
              <p className="text-[15px] text-[var(--nd-text-secondary)] leading-[1.65]">
                O Neuro-Dose Assist é uma ferramenta de apoio tecnológico e acadêmico para organização
                clínica e suporte posológico. As análises, estimativas e alertas gerados não substituem
                o julgamento médico profissional, protocolos clínicos oficiais ou a responsabilidade de
                prescrição do profissional{"\u00A0"}habilitado.
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={aoVoltarParaLogin}
                className="nd-btn-primary-pill"
              >
                <span>Acessar ou criar conta</span>
                <ArrowUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <footer className="mt-12 pt-6 border-t border-[var(--nd-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-[var(--nd-text-secondary)]">
            <span>Neuro-Dose Assist — Plataforma Clínica de Suporte Posológico para Neurologia e Psiquiatria</span>
            <span>Autenticação Firebase · Isolamento por conta ou clínica · LGPD</span>
          </footer>
        </section>
      </div>
    </>
  );
}
