import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}: PropriedadesFormularioLogin) {
  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-slate-300">
          Email
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          <Input
            id="login-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => aoMudarEmail(e.target.value)}
            className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
            required
            disabled={carregando}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="login-password" className="text-slate-300">
            Senha
          </Label>
          <button
            type="button"
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => aoMudarSenha(e.target.value)}
            className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
            required
            disabled={carregando}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30"
        disabled={carregando}
      >
        {carregando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
