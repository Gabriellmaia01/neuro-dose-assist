import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";

/**
 * Botões de navegação entre etapas do formulário.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas navegação
 *  - Segregação de Interfaces (I): recebe apenas callbacks e flags de estado
 */

interface PropriedadesNavegacao {
  etapa: number;
  onVoltar: () => void;
  onContinuar: () => void;
  onEnviar: () => void;
  podeContinuar: boolean;
  analisando: boolean;
}

export function NavegacaoEtapas({
  etapa,
  onVoltar,
  onContinuar,
  onEnviar,
  podeContinuar,
  analisando,
}: PropriedadesNavegacao) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
      <Button
        variant="ghost"
        onClick={onVoltar}
        disabled={etapa === 1}
      >
        Voltar
      </Button>
      {etapa < 3 ? (
        <Button
          variant="neuro"
          onClick={onContinuar}
          disabled={!podeContinuar}
        >
          Continuar
        </Button>
      ) : (
        <Button variant="neuro" onClick={onEnviar} disabled={analisando}>
          {analisando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando…
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" aria-hidden="true" />
              Registrar e Analisar
            </>
          )}
        </Button>
      )}
    </div>
  );
}
