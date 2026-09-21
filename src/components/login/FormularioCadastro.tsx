import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  return (
    <form onSubmit={aoEnviar} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-slate-300">
          Email
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <Input
            id="signup-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => aoMudarEmail(e.target.value)}
            className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
            required
            disabled={carregando}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-slate-300">
          Senha
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <Input
            id="signup-password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => aoMudarSenha(e.target.value)}
            className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
            required
            minLength={6}
            disabled={carregando}
          />
        </div>
        <p className="text-xs text-slate-500">
          Use pelo menos 6 caracteres com letras e números
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30"
        disabled={carregando}
      >
        {carregando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Criando conta...
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  );
}
