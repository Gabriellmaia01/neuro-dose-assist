import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { type PropriedadesFormularioCadastro } from "@/lib/tiposLogin";

/**
 * Formulário de criação de conta (email e senha).
 * Recebe handlers e estado via props (ISP).
 */
export function FormularioCadastro({
  email,
  senha,
  carregando,
  aoMudarEmail,
  aoMudarSenha,
  aoEnviar,
}: PropriedadesFormularioCadastro) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form onSubmit={aoEnviar} className="space-y-5">
      {/* Campo de e-mail */}
      <div className="space-y-2">
        <label
          htmlFor="signup-email"
          className="block text-[13px] font-medium text-[var(--login-light-label)]"
        >
          E-mail profissional
        </label>
        <div className="relative">
          <Mail
            className="w-[18px] h-[18px] text-[var(--login-light-icon)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="nome@clinica.med.br"
            value={email}
            onChange={(e) => aoMudarEmail(e.target.value)}
            className="login-input pl-[42px] pr-3.5"
            required
            disabled={carregando}
          />
        </div>
      </div>

      {/* Campo de senha */}
      <div className="space-y-2">
        <label
          htmlFor="signup-password"
          className="block text-[13px] font-medium text-[var(--login-light-label)]"
        >
          Chave de acesso
        </label>
        <div className="relative">
          <Lock
            className="w-[18px] h-[18px] text-[var(--login-light-icon)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="signup-password"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Crie uma chave de acesso"
            value={senha}
            onChange={(e) => aoMudarSenha(e.target.value)}
            className="login-input pl-[42px] pr-11"
            required
            minLength={6}
            disabled={carregando}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((prev) => !prev)}
            className="login-icon-btn absolute right-2 top-1/2 -translate-y-1/2"
            aria-label={mostrarSenha ? "Ocultar chave de acesso" : "Mostrar chave de acesso"}
            disabled={carregando}
          >
            {mostrarSenha ? (
              <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="text-[12px] text-[var(--login-light-text-secondary)]">
          Utilize pelo menos 6 caracteres.
        </p>
      </div>

      {/* Botão primário */}
      <div className="pt-1">
        <button
          type="submit"
          className="login-btn-primary"
          disabled={carregando}
          aria-busy={carregando}
        >
          {carregando ? (
            <>
              <span className="login-spinner" aria-hidden="true" />
              <span className="sr-only">Criando conta</span>
            </>
          ) : (
            <>
              <span>Criar conta profissional</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
