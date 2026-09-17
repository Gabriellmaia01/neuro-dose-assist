import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Activity, Brain, AlertTriangle, FileText } from "lucide-react";

/**
 * Barra de abas do histórico.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas seleção de aba
 *  - Segregação de Interfaces (I): recebe apenas valor e callback
 */

interface PropriedadesAbas {
  abaAtiva: string;
  onAbaChange: (valor: string) => void;
}

export function AbasHistorico({ abaAtiva, onAbaChange }: PropriedadesAbas) {
  return (
    <Tabs value={abaAtiva} onValueChange={onAbaChange}>
      <div className="glass-card rounded-2xl p-2 shadow-lg">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full bg-transparent gap-1">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="dose">
            <Pill className="w-4 h-4 mr-1" aria-hidden="true" />
            Doses
          </TabsTrigger>
          <TabsTrigger value="symptom">
            <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
            Sintomas
          </TabsTrigger>
          <TabsTrigger value="recommendation">
            <Brain className="w-4 h-4 mr-1" aria-hidden="true" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="alert">
            <AlertTriangle className="w-4 h-4 mr-1" aria-hidden="true" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="activities">
            <FileText className="w-4 h-4 mr-1" aria-hidden="true" />
            Atividades
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
