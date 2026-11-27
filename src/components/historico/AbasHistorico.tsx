import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Activity, Brain, AlertTriangle, FileText } from "lucide-react";

/**
 * Barra de abas do histórico.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas seleção de aba e container semântico do painel
 *  - Segregação de Interfaces (I): recebe apenas valor, callback e painel ativo
 */

interface PropriedadesAbas {
  abaAtiva: string;
  onAbaChange: (valor: string) => void;
  children?: ReactNode;
}

export function AbasHistorico({
  abaAtiva,
  onAbaChange,
  children,
}: PropriedadesAbas) {
  return (
    <Tabs value={abaAtiva} onValueChange={onAbaChange} className="space-y-6">
      <div className="nd-card p-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto w-full bg-[var(--nd-bg)] p-1.5 rounded-xl gap-1">
          <TabsTrigger value="all" className="min-h-[38px]">
            Todos
          </TabsTrigger>
          <TabsTrigger value="dose" className="min-h-[38px]">
            <Pill className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
            Doses
          </TabsTrigger>
          <TabsTrigger value="symptom" className="min-h-[38px]">
            <Activity className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
            Sintomas
          </TabsTrigger>
          <TabsTrigger value="recommendation" className="min-h-[38px]">
            <Brain className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="alert" className="min-h-[38px]">
            <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="activities" className="min-h-[38px]">
            <FileText className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
            Atividades
          </TabsTrigger>
        </TabsList>
      </div>
      {children ? (
        <TabsContent value={abaAtiva} className="mt-0">
          {children}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
