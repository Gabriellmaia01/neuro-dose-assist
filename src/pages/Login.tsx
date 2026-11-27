import { useRef, useState, type KeyboardEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { useAutenticacaoLogin } from "@/hooks/useAutenticacaoLogin";
import { LadoHeroLogin } from "@/components/login/LadoHeroLogin";
import { FormularioLogin } from "@/components/login/FormularioLogin";
import { FormularioCadastro } from "@/components/login/FormularioCadastro";
import { BotaoGoogle } from "@/components/login/BotaoGoogle";
import { DialogoRecuperarSenha } from "@/components/login/DialogoRecuperarSenha";
import { SecaoSobrePlataforma } from "@/components/login/SecaoSobrePlataforma";

/**
 * Página de Login (Gateway Clínico + Narrativa Farmacocinética Scroll-Coreografada).
 * Acima da dobra: autenticação imediata + traçado editorial farmacocinético.
 * Abaixo da dobra: espinha dorsal farmacocinética sincronizada ao scroll, índice clínico e governança.
 */
export default function Login() {
  const [abaAtiva, setAbaAtiva] = useState<"login" | "signup">("login");
  const [abaAlterada, setAbaAlterada] = useState(false);
  const tabLoginRef = useRef<HTMLButtonElement>(null);
  const tabSignupRef = useRef<HTMLButtonElement>(null);

  const {
    email,
    senha,
    carregando,
    setEmail,
    setSenha,
    handleEntrar,
    handleCriarConta,
    handleEntrarComGoogle,
    recuperacaoSenha,
  } = useAutenticacaoLogin();

  const handleTrocarAba = (novaAba: "login" | "signup", focarBotao = false) => {
    if (novaAba !== abaAtiva) {
      setAbaAlterada(true);
      setAbaAtiva(novaAba);
    }
    if (focarBotao) {
      (novaAba === "login" ? tabLoginRef.current : tabSignupRef.current)?.focus();
    }
  };

  const handleTecladoAbas = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      handleTrocarAba(abaAtiva === "login" ? "signup" : "login", true);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleTrocarAba("login", true);
    } else if (e.key === "End") {
      e.preventDefault();
      handleTrocarAba("signup", true);
    }
  };

  const handleExplorarPlataforma = () => {
    const alvo = document.getElementById("sobre-plataforma");
    if (!alvo) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
  };

  const handleVoltarParaLogin = () => {
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
    window.setTimeout(() => {
      const emailInput = document.getElementById(
        abaAtiva === "login" ? "login-email" : "signup-email"
      );
      emailInput?.focus({ preventScroll: true });
    }, reduzido ? 0 : 420);
  };

  return (
    <div className="login-shell">
      {/* Primeira dobra: Split Hero Editorial + Card de Autenticação */}
      <div id="acesso-clinico" className="login-hero-grid">
        <LadoHeroLogin aoExplorar={handleExplorarPlataforma} />

        <main className="login-panel-right">
          <div className="login-auth-card">
            <div className="login-form-container">
              {/* Cabeçalho do formulário */}
              <div>
                <h2 className="login-display text-[24px] sm:text-[28px] leading-[1.15] text-[var(--login-light-text)]">
                  {abaAtiva === "login" ? "Identificação clínica" : "Novo cadastro"}
                </h2>
                <p className="mt-2 text-[14px] font-normal leading-[1.5] text-[var(--login-light-text-secondary)]">
                  {abaAtiva === "login"
                    ? "Acesse o sistema de decisão e telemetria\u00A0farmacológica."
                    : "Registre suas credenciais profissionais para iniciar na\u00A0plataforma."}
                </p>
              </div>

              {/* Controle segmentado em pílula com suporte completo a setas */}
              <div
                role="tablist"
                aria-label="Modo de acesso"
                onKeyDown={handleTecladoAbas}
                className="login-tabs mt-5 sm:mt-7"
              >
                <span
                  aria-hidden="true"
                  className="login-tab-indicator"
                  style={{
                    transform:
                      abaAtiva === "signup" ? "translateX(100%)" : "translateX(0)",
                  }}
                />

                <button
                  ref={tabLoginRef}
                  type="button"
                  role="tab"
                  id="tab-login"
                  tabIndex={abaAtiva === "login" ? 0 : -1}
                  aria-selected={abaAtiva === "login"}
                  aria-controls="panel-login"
                  onClick={() => handleTrocarAba("login")}
                  className="login-tab-trigger"
                >
                  Entrar
                </button>

                <button
                  ref={tabSignupRef}
                  type="button"
                  role="tab"
                  id="tab-signup"
                  tabIndex={abaAtiva === "signup" ? 0 : -1}
                  aria-selected={abaAtiva === "signup"}
                  aria-controls="panel-signup"
                  onClick={() => handleTrocarAba("signup")}
                  className="login-tab-trigger"
                >
                  Novo cadastro
                </button>
              </div>

              {/* Conteúdo das abas (altura mínima estável para evitar layout shift) */}
              <div className="mt-5 sm:mt-6 min-h-[288px]">
                {abaAtiva === "login" ? (
                  <div
                    key="login"
                    id="panel-login"
                    role="tabpanel"
                    aria-labelledby="tab-login"
                    className={abaAlterada ? "login-tab-panel" : undefined}
                  >
                    <FormularioLogin
                      email={email}
                      senha={senha}
                      carregando={carregando}
                      aoMudarEmail={setEmail}
                      aoMudarSenha={setSenha}
                      aoEnviar={handleEntrar}
                      aoEsqueceuSenha={recuperacaoSenha.abrir}
                    />
                  </div>
                ) : (
                  <div
                    key="signup"
                    id="panel-signup"
                    role="tabpanel"
                    aria-labelledby="tab-signup"
                    className={abaAlterada ? "login-tab-panel" : undefined}
                  >
                    <FormularioCadastro
                      email={email}
                      senha={senha}
                      carregando={carregando}
                      aoMudarEmail={setEmail}
                      aoMudarSenha={setSenha}
                      aoEnviar={handleCriarConta}
                    />
                  </div>
                )}
              </div>

              {/* Divisor simples "ou" */}
              <div className="my-6 flex items-center gap-4" aria-hidden="true">
                <span className="flex-1 h-px bg-[var(--nd-border)]" />
                <span className="text-[13px] font-normal text-[var(--login-light-text-secondary)]">
                  ou
                </span>
                <span className="flex-1 h-px bg-[var(--nd-border)]" />
              </div>

              {/* Botão Google */}
              <BotaoGoogle
                carregando={carregando}
                aoClicar={handleEntrarComGoogle}
              />

              {/* Rodapé de conformidade do card */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[var(--login-light-text-secondary)]">
                <ShieldCheck
                  className="w-4 h-4 text-[var(--login-accent)] shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>Ambiente seguro · Conformidade LGPD</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Abaixo da dobra: narrativa farmacocinética scroll-coreografada e índice clínico */}
      <SecaoSobrePlataforma aoVoltarParaLogin={handleVoltarParaLogin} />

      {/* Diálogo de recuperação de senha */}
      <DialogoRecuperarSenha
        aberto={recuperacaoSenha.aberto}
        email={recuperacaoSenha.email}
        enviando={recuperacaoSenha.enviando}
        aoMudarAberto={recuperacaoSenha.aoMudarAberto}
        aoMudarEmail={recuperacaoSenha.setEmail}
        aoEnviar={recuperacaoSenha.enviar}
      />
    </div>
  );
}
