import { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type PropriedadesFormularioCadastro } from "@/lib/tiposLogin";

/**
 * Formulário de cadastro de novo profissional clínico (Swiss Minimalist).
 * Inclui validação visual de segurança, alternância de senha e estilo cirúrgico.
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
    <form onSubmit={aoEnviar} className="space-y-4">
      {/* Campo de Email */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="signup-email"
            className="text-[12px] font-mono tracking-wider uppercase text-slate-300"
          >
            Email Profissional
          </Label>
          <span className="text-[10px] font-mono text-slate-500">CREDENCIAL</span>
        </div>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
          <Input
            id="signup-email"
            type="email"
            placeholder="doutor@neuroclinica.med.br"
            value={email}
            onChange={(e) => aoMudarEmail(e.target.value)}
            className="pl-10 h-11 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-lg text-sm transition-all"
            required
            disabled={carregando}
          />
        </div>
      </div>

      {/* Campo de Senha */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="signup-password"
            className="text-[12px] font-mono tracking-wider uppercase text-slate-300"
          >
            Definir Chave de Segurança
          </Label>
          <span className="text-[10px] font-mono text-cyan-400">MIN. 6 CARACTERES</span>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
          <Input
            id="signup-password"
            type={mostrarSenha ? "text" : "password"}
            placeholder="••••••••••••"
            value={senha}
            onChange={(e) => aoMudarSenha(e.target.value)}
            className="pl-10 pr-10 h-11 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-lg text-sm transition-all font-mono"
            required
            minLength={6}
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
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Proteção criptográfica com chave de alta entropia</span>
        </div>
      </div>

      {/* Botão de Registro */}
      <Button
        type="submit"
        className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
        disabled={carregando}
      >
        {carregando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-mono text-xs tracking-wider uppercase">Registrando credencial...</span>
          </>
        ) : (
          "Criar Conta Profissional"
        )}
      </Button>
    </form>
  );
}
