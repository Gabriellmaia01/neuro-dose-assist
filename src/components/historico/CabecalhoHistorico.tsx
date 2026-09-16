import { Button } from "@/components/ui/button";
import { Clock, Download, Loader2 } from "lucide-react";

/**
 * Cabeçalho da página de histórico com botão de exportação.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas header e ação de exportar
 *  - Segregação de Interfaces (I): props mínimas
 */

interface PropriedadesCabecalho {
  onExportar: () => void;
  carregando: boolean;
  exportando: boolean;
  temItens: boolean;
}

export function CabecalhoHistorico({
  onExportar,
  carregando,
  exportando,
  temItens,
}: PropriedadesCabecalho) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
          <Clock className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Histórico
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Linha do tempo de doses, sintomas, recomendações e alertas
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onExportar}
        disabled={carregando || exportando || !temItens}
        className="h-11"
      >
        {exportando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exportando…
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </>
        )}
      </Button>
    </div>
  );
}
