import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { type PropriedadesFormularioLogin } from "@/lib/tiposLogin";

/**
 * Formulário de login (email e senha).
 * Recebe handlers e estado via props (ISP).
 */
export function FormularioLogin({
  email,
  senha,
  carregando,
  aoMudarEmail,
  aoMudarSenha,
  aoEnviar,
  aoEsqueceuSenha,
}: PropriedadesFormularioLogin) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form onSubmit={aoEnviar} className="space-y-5">
      {/* Campo de e-mail */}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-[13px] font-medium text-[var(--login-light-label)]"
        >
          E-mail clínico
        </label>
        <div className="relative">
          <Mail
            className="w-[18px] h-[18px] text-[var(--login-light-icon)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="login-email"
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

      {/* Campo de chave de acesso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="login-password"
            className="block text-[13px] font-medium text-[var(--login-light-label)]"
          >
            Chave de acesso
          </label>
          <button
            type="button"
            onClick={aoEsqueceuSenha}
            disabled={carregando}
            className="login-link"
          >
            Recuperar chave
          </button>
        </div>
        <div className="relative">
          <Lock
            className="w-[18px] h-[18px] text-[var(--login-light-icon)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="login-password"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua chave de acesso"
            value={senha}
            onChange={(e) => aoMudarSenha(e.target.value)}
            className="login-input pl-[42px] pr-11"
            required
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
              <span className="sr-only">Acessando painel clínico</span>
            </>
          ) : (
            <>
              <span>Acessar painel clínico</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
