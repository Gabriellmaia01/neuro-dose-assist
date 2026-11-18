import { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type PropriedadesFormularioLogin } from "@/lib/tiposLogin";

/**
 * Formulário de login (email e senha) no padrão Minimalista Suíço.
 * Possui alternância de visibilidade de senha, foco cirúrgico e microinterações táteis.
 */
export function FormularioLogin({
  email,
  senha,
  carregando,
  aoMudarEmail,
  aoMudarSenha,
  aoEnviar,
}: PropriedadesFormularioLogin) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      {/* Campo de Email */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="login-email"
            className="text-[12px] font-mono tracking-wider uppercase text-slate-300"
          >
            Email Corporativo / Clínico
          </Label>
          <span className="text-[10px] font-mono text-slate-500">ID OBRIGATÓRIO</span>
        </div>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
          <Input
            id="login-email"
            type="email"
            placeholder="doutor@neuroclinica.med.br"
            value={email}
            onChange={(e) => aoMudarEmail(e.target.value)}
            className="pl-10 h-11 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 rounded-lg text-sm transition-all"
            required
            disabled={carregando}
          />
        </div>
      </div>

      {/* Campo de Senha */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="login-password"
            className="text-[12px] font-mono tracking-wider uppercase text-slate-300"
          >
            Chave de Acesso
          </Label>
          <button
            type="button"
            className="text-[11px] font-mono text-teal-400/90 hover:text-teal-300 hover:underline transition-colors focus:outline-none"
          >
            Recuperar chave
          </button>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
          <Input
            id="login-password"
            type={mostrarSenha ? "text" : "password"}
            placeholder="••••••••••••"
            value={senha}
            onChange={(e) => aoMudarSenha(e.target.value)}
            className="pl-10 pr-10 h-11 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 rounded-lg text-sm transition-all font-mono"
            required
            disabled={carregando}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
          >
            {mostrarSenha ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Botão de Autenticação */}
      <Button
        type="submit"
        className="w-full h-11 mt-2 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-lg shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
        disabled={carregando}
      >
        {carregando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-mono text-xs tracking-wider uppercase">Autenticando sessão...</span>
          </>
        ) : (
          <>
            <span>Acessar Painel Clínico</span>
            <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
