import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAutenticacaoLogin } from "@/hooks/useAutenticacaoLogin";
import { LadoHeroLogin } from "@/components/login/LadoHeroLogin";
import { LogoMobileLogin } from "@/components/login/LogoMobileLogin";
import { FormularioLogin } from "@/components/login/FormularioLogin";
import { FormularioCadastro } from "@/components/login/FormularioCadastro";
import { BotaoGoogle } from "@/components/login/BotaoGoogle";
import { DialogoRecuperarSenha } from "@/components/login/DialogoRecuperarSenha";

/**
 * Página de Login (Autenticação).
 * Componente fino de composição — delega estado e lógica para useAutenticacaoLogin
 * e delega renderização visual para os subcomponentes em src/components/login/.
 */
export default function Login() {
  const [abaAtiva, setAbaAtiva] = useState<"login" | "signup">("login");
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

  return (
    <div className="login-shell">
      {/* Painel Esquerdo — Institucional escuro (~55%) */}
      <LadoHeroLogin />

      {/* Painel Direito — Formulário claro (~45%) */}
      <main className="login-panel-right login-panel-enter">
        {/* Cabeçalho compacto exibido abaixo de 900px */}
        <LogoMobileLogin />

        {/* Container do formulário (largura fixa de 400px, centralizado verticalmente) */}
        <div className="login-form-container">
          {/* Cabeçalho do formulário */}
          <div>
            <p className="text-[13px] font-medium text-[var(--login-accent)]">
              Portal de prescrição médica
            </p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] leading-[1.2] text-[var(--login-light-text)]">
              {abaAtiva === "login" ? "Identificação clínica" : "Novo cadastro"}
            </h1>
            <p className="mt-2 text-[15px] font-normal leading-[1.5] text-[var(--login-light-text-secondary)]">
              {abaAtiva === "login"
                ? "Acesse o sistema de decisão e farmacocinética neural."
                : "Registre suas credenciais para acessar a plataforma clínica."}
            </p>
          </div>

          {/* Controle segmentado: Entrar / Novo cadastro */}
          <div
            role="tablist"
            aria-label="Modo de acesso"
            className="login-tabs mt-8"
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
              type="button"
              role="tab"
              id="tab-login"
              aria-selected={abaAtiva === "login"}
              aria-controls="panel-login"
              onClick={() => setAbaAtiva("login")}
              className="login-tab-trigger"
            >
              Entrar
            </button>

            <button
              type="button"
              role="tab"
              id="tab-signup"
              aria-selected={abaAtiva === "signup"}
              aria-controls="panel-signup"
              onClick={() => setAbaAtiva("signup")}
              className="login-tab-trigger"
            >
              Novo cadastro
            </button>
          </div>

          {/* Conteúdo das abas (altura mínima estável para evitar layout shift) */}
          <div className="mt-6 min-h-[252px]">
            {abaAtiva === "login" ? (
              <div
                key="login"
                id="panel-login"
                role="tabpanel"
                aria-labelledby="tab-login"
                className="login-tab-panel"
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
                className="login-tab-panel"
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
            <span className="flex-1 h-px bg-[var(--login-light-border)]" />
            <span className="text-[13px] font-normal text-[var(--login-light-text-secondary)]">
              ou
            </span>
            <span className="flex-1 h-px bg-[var(--login-light-border)]" />
          </div>

          {/* Botão Google */}
          <BotaoGoogle
            carregando={carregando}
            aoClicar={handleEntrarComGoogle}
          />

          {/* Rodapé de conformidade do formulário */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[var(--login-light-text-secondary)]">
            <ShieldCheck
              className="w-4 h-4 text-[var(--login-accent)] shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Ambiente em conformidade com CFM e LGPD</span>
          </div>
        </div>
        {/* Rodapé da página com linha divisória de 1px */}
        <footer className="pt-6 border-t border-[var(--login-light-border)] flex flex-col xs:flex-row items-center justify-between gap-2 text-[12px] text-[var(--login-light-text-secondary)]">
          <span>Neuro-Dose Assist</span>
          <span>© 2026 Todos os direitos reservados</span>
        </footer>
      </main>

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
