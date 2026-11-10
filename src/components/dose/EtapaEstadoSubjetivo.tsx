import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { User } from "lucide-react";

/**
 * Etapa 2 — Estado Subjetivo do paciente.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas UI da etapa 2
 *  - Segregação de Interfaces (I): props mínimas necessárias
 */

const EMOJIS_HUMOR = ["😞", "😔", "😐", "🙂", "😊"];

interface PropriedadesEstadoSubjetivo {
  humor: number[];
  onHumorChange: (valor: number[]) => void;
  energia: number[];
  onEnergiaChange: (valor: number[]) => void;
  sono: number[];
  onSonoChange: (valor: number[]) => void;
  efeitos: string;
  onEfeitosChange: (valor: string) => void;
}

export function EtapaEstadoSubjetivo({
  humor,
  onHumorChange,
  energia,
  onEnergiaChange,
  sono,
  onSonoChange,
  efeitos,
  onEfeitosChange,
}: PropriedadesEstadoSubjetivo) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <User className="w-5 h-5 text-secondary-foreground" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">
            Estado Subjetivo
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre o estado atual para contextualizar a análise
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Humor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Humor</Label>
            <span className="text-3xl" aria-hidden="true">
              {EMOJIS_HUMOR[humor[0] - 1]}
            </span>
          </div>
          <Slider
            value={humor}
            onValueChange={onHumorChange}
            min={1}
            max={5}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Muito baixo</span>
            <span>Neutro</span>
            <span>Ótimo</span>
          </div>
        </div>

        {/* Energia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Nível de Energia</Label>
            <span className="font-medium tabular-nums">{energia[0]}/10</span>
          </div>
          <Slider
            value={energia}
            onValueChange={onEnergiaChange}
            min={0}
            max={10}
            step={1}
            className="py-4"
          />
        </div>

        {/* Sono */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Qualidade do Sono (noite anterior)</Label>
            <span className="font-medium tabular-nums">{sono[0]}/10</span>
          </div>
          <Slider
            value={sono}
            onValueChange={onSonoChange}
            min={0}
            max={10}
            step={1}
            className="py-4"
          />
        </div>

        {/* Efeitos Percebidos */}
        <div className="space-y-2">
          <Label htmlFor="effects">Efeitos Percebidos</Label>
          <Textarea
            id="effects"
            name="effects"
            autoComplete="off"
            maxLength={200}
            placeholder="Descreva efeitos observados (se houver)…"
            rows={3}
            value={efeitos}
            onChange={(e) => onEfeitosChange(e.target.value)}
          />
          <div className="flex justify-end">
            <span
              className={`text-xs tabular-nums ${
                efeitos.length >= 200 ? "text-destructive font-medium" : "text-muted-foreground"
              }`}
            >
              {efeitos.length}/200
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
