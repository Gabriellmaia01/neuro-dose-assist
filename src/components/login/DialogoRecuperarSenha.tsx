import { Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type PropriedadesDialogoRecuperarSenha } from "@/lib/tiposLogin";

/**
 * Diálogo de recuperação de senha.
 * Recebe estado e handlers via props: não conhece Firebase nem o AuthContext.
 */
export function DialogoRecuperarSenha({
  aberto,
  email,
  enviando,
  aoMudarAberto,
  aoMudarEmail,
  aoEnviar,
}: PropriedadesDialogoRecuperarSenha) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar senha</DialogTitle>
          <DialogDescription className="text-slate-400">
            Informe o email da sua conta. Enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={aoEnviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recuperar-email" className="text-slate-300">
              Email da conta
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                id="recuperar-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => aoMudarEmail(e.target.value)}
                className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                required
                disabled={enviando}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => aoMudarAberto(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              disabled={enviando || email.trim() === ""}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar link"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
