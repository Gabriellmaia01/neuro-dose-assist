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
      <DialogContent className="bg-[var(--nd-surface)] border border-[var(--nd-border)] text-[var(--nd-text)] shadow-[var(--nd-shadow-popover)] sm:max-w-md rounded-[var(--nd-radius-lg)]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
            Recuperar senha
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[var(--nd-text-secondary)]">
            Informe o email da sua conta. Enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={aoEnviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recuperar-email" className="text-[13px] font-medium text-[var(--nd-label)]">
              Email da conta
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--nd-icon)] pointer-events-none"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <Input
                id="recuperar-email"
                type="email"
                autoComplete="email"
                placeholder="nome@clinica.med.br"
                value={email}
                onChange={(e) => aoMudarEmail(e.target.value)}
                className="login-input pl-[42px] pr-3.5"
                required
                disabled={enviando}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:h-10 border-[var(--nd-border-input)] text-[var(--nd-label)] hover:bg-[var(--nd-bg)] hover:text-[var(--nd-text)]"
              onClick={() => aoMudarAberto(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-11 sm:h-10 bg-[var(--nd-primary)] hover:bg-[var(--nd-primary-hover)] text-white shadow-none"
              disabled={enviando || email.trim() === ""}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
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
