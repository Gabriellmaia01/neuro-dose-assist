import { memo, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Activity, Plus } from "lucide-react";

interface DataPoint {
  date: string;
  efficacy: number;
  dose: number;
}

interface EfficacyChartProps {
  data: DataPoint[];
  className?: string;
  embedded?: boolean;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: {
    efficacy?: number;
    dose?: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

/**
 * Gera ticks estritamente crescentes e únicos para o eixo de doses (mg).
 */
function buildDoseTicks(maxDose: number): number[] {
  const safeMax = Math.max(maxDose, 4);
  const rawStep = Math.ceil(safeMax / 4);
  const step = rawStep <= 5 ? rawStep : Math.ceil(rawStep / 5) * 5;
  return [0, step, step * 2, step * 3, step * 4];
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const ponto = payload[0]?.payload;
  const semRegistro = (ponto?.efficacy ?? 0) === 0 && (ponto?.dose ?? 0) === 0;

  return (
    <div className="nd-tooltip-surface p-3 text-[12px] min-w-[168px] nd-tabular">
      <div className="font-semibold text-[var(--nd-text)] pb-1.5 mb-1.5 border-b border-[var(--nd-border)]">
        Data: {label}
      </div>
      {semRegistro ? (
        <p className="text-[var(--nd-text-secondary)]">Sem dose registrada neste dia.</p>
      ) : (
        <div className="space-y-1">
          {payload.map((item) => {
            const isEfficacy = item.name === "efficacy";
            const displayValue = isEfficacy
              ? item.payload?.efficacy ?? item.value ?? 0
              : item.payload?.dose ?? item.value ?? 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="inline-flex items-center gap-2 text-[var(--nd-text-secondary)]">
                  <span
                    aria-hidden="true"
                    className={
                      isEfficacy
                        ? "w-2.5 h-2.5 rounded-full bg-[var(--nd-primary)]"
                        : "w-3 border-t-2 border-dashed border-[var(--nd-accent)]"
                    }
                  />
                  <span>{isEfficacy ? "Eficácia" : "Dose"}</span>
                </span>
                <span className="font-semibold text-[var(--nd-text)]">
                  {displayValue}
                  {isEfficacy ? "%" : " mg"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * EfficacyChart - Telemetria farmacológica fiel à escala 0–100% (dias sem dose permanecem em 0%).
 */
export const EfficacyChart = memo(function EfficacyChart({
  data,
  className,
  embedded = false,
}: EfficacyChartProps) {
  const {
    hasData,
    doseTicks,
    doseMaxDomain,
    peakEfficacy,
    accessibleSummary,
  } = useMemo(() => {
    const hasPoints =
      data.length > 0 && data.some((point) => point.efficacy > 0 || point.dose > 0);
    const maxDoseValue = data.reduce((max, p) => Math.max(max, p.dose), 0);
    const ticks = buildDoseTicks(maxDoseValue);
    const activePoints = data.filter((p) => p.efficacy > 0 || p.dose > 0);
    const avg =
      activePoints.length > 0
        ? Math.round(
            activePoints.reduce((sum, p) => sum + p.efficacy, 0) / activePoints.length
          )
        : 0;
    const peak = data.reduce((max, p) => Math.max(max, p.efficacy), 0);
    const summary = hasPoints
      ? `Gráfico de telemetria farmacológica nos últimos 7 dias. ${activePoints.length} dia(s) com registro de dose, eficácia média de ${avg}% e dose máxima de ${maxDoseValue} mg.`
      : "Gráfico de telemetria farmacológica nos últimos 7 dias: sem doses registradas no período.";

    return {
      hasData: hasPoints,
      doseTicks: ticks,
      doseMaxDomain: ticks[ticks.length - 1],
      peakEfficacy: peak,
      accessibleSummary: summary,
    };
  }, [data]);

  const Container = embedded ? "div" : "section";

  return (
    <Container
      aria-label={embedded ? undefined : "Curva de Eficácia Farmacológica"}
      className={cn(
        embedded
          ? "flex flex-col justify-between"
          : "nd-card p-6 flex flex-col justify-between",
        className
      )}
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div className="space-y-1">
          {!embedded && (
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
                Telemetria Farmacológica
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--nd-accent-soft)] text-[var(--nd-primary)] text-[12px] font-semibold">
                7 dias
              </span>
            </div>
          )}
          <p className="text-[13px] font-normal text-[var(--nd-text-secondary)]">
            Eficácia terapêutica (%) × dosagem administrada (mg)
          </p>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 text-[12px] font-medium text-[var(--nd-label)] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--nd-primary)]" aria-hidden="true" />
            <span>Eficácia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 border-t-2 border-dashed border-[var(--nd-accent)]"
              aria-hidden="true"
            />
            <span>Dose (mg)</span>
          </div>
        </div>
      </div>

      {/* Resumo textual para leitores de tela */}
      <p className="sr-only">{accessibleSummary}</p>

      {/* Área do gráfico ou estado vazio */}
      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center px-4">
          <div className="w-11 h-11 rounded-full bg-[var(--nd-muted)] flex items-center justify-center mb-3">
            <Activity
              className="w-5 h-5 text-[var(--nd-primary)]"
              strokeWidth={1.65}
              aria-hidden="true"
            />
          </div>
          <p className="text-[14px] font-medium text-[var(--nd-text)]">
            Sem doses registradas nos últimos 7 dias
          </p>
          <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1">
            Registre uma dose para iniciar a curva de resposta clínica.
          </p>
          <Link to="/dose" className="nd-btn-outline-pill mt-4">
            <Plus className="w-4 h-4 text-[var(--nd-primary)]" strokeWidth={1.75} aria-hidden="true" />
            <span>Nova aplicação</span>
          </Link>
        </div>
      ) : (
        <div
          role="img"
          aria-label={accessibleSummary}
          className="h-56 w-full overflow-x-auto"
        >
          <div className="h-full min-w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 12, left: -6, bottom: 2 }}
              >
                <CartesianGrid
                  stroke="var(--nd-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--nd-text-secondary)",
                    fontSize: 12,
                    fontFamily: "var(--nd-font)",
                  }}
                  dy={6}
                />

                <YAxis
                  yAxisId="efficacy"
                  orientation="left"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tick={{
                    fill: "var(--nd-text-secondary)",
                    fontSize: 12,
                    fontFamily: "var(--nd-font)",
                  }}
                />

                <YAxis
                  yAxisId="dose"
                  orientation="right"
                  domain={[0, doseMaxDomain]}
                  ticks={doseTicks}
                  tickFormatter={(value: number) => `${value} mg`}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{
                    fill: "var(--nd-text-secondary)",
                    fontSize: 12,
                    fontFamily: "var(--nd-font)",
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--nd-chart-cursor)", radius: 12 }}
                />

                <Bar
                  yAxisId="efficacy"
                  dataKey="efficacy"
                  name="efficacy"
                  barSize={26}
                  radius={[8, 8, 2, 2]}
                  isAnimationActive={false}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        entry.efficacy > 0 && entry.efficacy === peakEfficacy
                          ? "var(--nd-primary-deep)"
                          : "var(--nd-primary)"
                      }
                    />
                  ))}
                </Bar>

                <Line
                  yAxisId="dose"
                  type="monotone"
                  dataKey="dose"
                  name="dose"
                  stroke="var(--nd-accent)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "var(--nd-surface)", stroke: "var(--nd-accent)", strokeWidth: 2 }}
                  activeDot={{
                    r: 4.5,
                    fill: "var(--nd-accent)",
                    stroke: "var(--nd-surface)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Container>
  );
});
