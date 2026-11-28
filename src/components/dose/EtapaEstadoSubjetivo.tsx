import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, ClipboardList } from "lucide-react";

/**
 * Etapa 2 — Estado Subjetivo e Escalas Clínicas Padronizadas (PHQ-2, GAD-2, CGI-S).
 */

const EMOJIS_HUMOR = ["😞", "😔", "😐", "🙂", "😊"];

const CGI_LABELS: Record<number, string> = {
  1: "1 — Normal, não enfermo",
  2: "2 — Limítrofe",
  3: "3 — Levemente enfermo",
  4: "4 — Moderadamente enfermo",
  5: "5 — Acentuadamente enfermo",
  6: "6 — Gravemente enfermo",
  7: "7 — Extremamente enfermo",
};

interface PropriedadesEstadoSubjetivo {
  humor: number[];
  onHumorChange: (valor: number[]) => void;
  energia: number[];
  onEnergiaChange: (valor: number[]) => void;
  sono: number[];
  onSonoChange: (valor: number[]) => void;
  efeitos: string;
  onEfeitosChange: (valor: string) => void;
  usarEscalasClinicas?: boolean;
  onUsarEscalasClinicasChange?: (valor: boolean) => void;
  phq2Score?: number;
  onPhq2ScoreChange?: (valor: number) => void;
  gad2Score?: number;
  onGad2ScoreChange?: (valor: number) => void;
  cgiSeverity?: number;
  onCgiSeverityChange?: (valor: number) => void;
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
  usarEscalasClinicas = false,
  onUsarEscalasClinicasChange,
  phq2Score = 0,
  onPhq2ScoreChange,
  gad2Score = 0,
  onGad2ScoreChange,
  cgiSeverity = 1,
  onCgiSeverityChange,
}: PropriedadesEstadoSubjetivo) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <User className="w-5 h-5 text-secondary-foreground" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">
            Estado Subjetivo & Escalas Clínicas
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre o estado atual e, opcionalmente, escalas psicométricas padronizadas
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

        {/* Bloco Opcional de Escalas Clínicas Padronizadas */}
        {onUsarEscalasClinicasChange && (
          <div className="pt-6 border-t border-[var(--nd-border)] space-y-5">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-2.5 min-w-0">
                <ClipboardList className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <Label htmlFor="toggle-clinical-scales" className="cursor-pointer font-semibold text-sm leading-snug block">
                    Avaliação Clínica Padronizada (PHQ-2, GAD-2 e CGI-S)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Rastreio psicométrico validado para acompanhamento objetivo de resposta terapêutica
                  </p>
                </div>
              </div>
              <Switch
                id="toggle-clinical-scales"
                checked={usarEscalasClinicas}
                onCheckedChange={onUsarEscalasClinicasChange}
                className="shrink-0"
              />
            </div>

            {usarEscalasClinicas && (
              <div className="space-y-6 pt-4 border-t border-dashed border-[var(--nd-border)]">
                {/* PHQ-2 */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-xs sm:text-sm">
                      PHQ-2 — Rastreio Depressivo (anedonia + humor deprimido)
                    </Label>
                    <Badge
                      variant="outline"
                      className={
                        phq2Score >= 3
                          ? "bg-warning/10 text-warning border-warning/30 tabular-nums"
                          : "tabular-nums"
                      }
                    >
                      {phq2Score}/6 {phq2Score >= 3 ? "• Positivo (≥3)" : "• Negativo"}
                    </Badge>
                  </div>
                  <Slider
                    value={[phq2Score]}
                    onValueChange={(v) => onPhq2ScoreChange?.(v[0])}
                    min={0}
                    max={6}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* GAD-2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs sm:text-sm">
                      GAD-2 — Rastreio Ansioso (tensão + preocupação incontrolável)
                    </Label>
                    <Badge
                      variant="outline"
                      className={
                        gad2Score >= 3
                          ? "bg-warning/10 text-warning border-warning/30 tabular-nums"
                          : "tabular-nums"
                      }
                    >
                      {gad2Score}/6 {gad2Score >= 3 ? "• Positivo (≥3)" : "• Negativo"}
                    </Badge>
                  </div>
                  <Slider
                    value={[gad2Score]}
                    onValueChange={(v) => onGad2ScoreChange?.(v[0])}
                    min={0}
                    max={6}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* CGI-S */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs sm:text-sm">
                      CGI-S — Impressão Clínica Global de Gravidade
                    </Label>
                    <Badge
                      variant="outline"
                      className={
                        cgiSeverity >= 5
                          ? "bg-destructive/10 text-destructive border-destructive/30 tabular-nums"
                          : "tabular-nums"
                      }
                    >
                      {CGI_LABELS[cgiSeverity] || `${cgiSeverity}/7`}
                    </Badge>
                  </div>
                  <Slider
                    value={[cgiSeverity]}
                    onValueChange={(v) => onCgiSeverityChange?.(v[0])}
                    min={1}
                    max={7}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
