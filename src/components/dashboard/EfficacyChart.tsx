import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  stroke?: string;
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

  return (
    <div className="nd-tooltip-surface p-3 text-[12px] min-w-[164px] nd-tabular">
      <div className="font-medium text-[var(--nd-text)] pb-1.5 mb-1.5 border-b border-[var(--nd-border)]">
        Data: {label}
      </div>
      <div className="space-y-1">
        {payload.map((item) => {
          const isEfficacy = item.name === "efficacy";
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
                      ? "w-3 h-0.5 bg-[#1B4965]"
                      : "w-3 border-t-2 border-dashed border-[#2C7A7B]"
                  }
                />
                <span>{isEfficacy ? "Eficácia" : "Dose"}</span>
              </span>
              <span className="font-semibold text-[var(--nd-text)]">
                {item.value}
                {isEfficacy ? "%" : " mg"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * EfficacyChart - Curva de Eficácia Farmacológica dos últimos 7 dias.
 * Eixo esquerdo em % (0–100%), eixo direito em mg, sem animação de desenho e com estado vazio explícito.
 */
export function EfficacyChart({ data, className }: EfficacyChartProps) {
  const hasData =
    data.length > 0 && data.some((point) => point.efficacy > 0 || point.dose > 0);

  const maxDose = data.reduce((max, p) => Math.max(max, p.dose), 0);
  const doseTicks = buildDoseTicks(maxDose);
  const doseMaxDomain = doseTicks[doseTicks.length - 1];

  // Resumo textual acessível para leitores de tela
  const activePoints = data.filter((p) => p.efficacy > 0 || p.dose > 0);
  const avgEfficacy =
    activePoints.length > 0
      ? Math.round(
          activePoints.reduce((sum, p) => sum + p.efficacy, 0) / activePoints.length
        )
      : 0;

  const accessibleSummary = hasData
    ? `Gráfico de curva de eficácia farmacológica nos últimos 7 dias. ${activePoints.length} dia(s) com registro de dose, eficácia média de ${avgEfficacy}% e dose máxima de ${maxDose} mg.`
    : "Gráfico de curva de eficácia farmacológica nos últimos 7 dias: sem doses registradas no período.";

  return (
    <section
      aria-label="Curva de Eficácia Farmacológica"
      className={cn("nd-card p-6 flex flex-col justify-between", className)}
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
              Curva de Eficácia Farmacológica
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[var(--nd-muted)] text-[var(--nd-label)] text-[12px] font-medium">
              Telemetria 7d
            </span>
          </div>
          <p className="text-[13px] font-normal text-[var(--nd-text-secondary)]">
            Correlação entre dosagens administradas e resposta terapêutica
          </p>
        </div>

        {/* Legenda diferenciada por estilo de linha e cor */}
        <div className="flex items-center gap-5 text-[12px] font-medium text-[var(--nd-label)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#1B4965]" aria-hidden="true" />
            <span>Eficácia (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 border-t-2 border-dashed border-[#2C7A7B]"
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
        <div className="h-64 flex flex-col items-center justify-center text-center px-4">
          <Activity
            className="w-6 h-6 text-[var(--nd-icon)] mb-3"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-[14px] font-normal text-[var(--nd-text-secondary)]">
            Sem doses registradas nos últimos 7 dias
          </p>
          <Link to="/dose" className="nd-btn-secondary mt-4">
            <Plus className="w-4 h-4 text-[var(--nd-primary)]" strokeWidth={1.5} aria-hidden="true" />
            <span>Registrar dose</span>
          </Link>
        </div>
      ) : (
        <div
          role="img"
          aria-label={accessibleSummary}
          className="h-64 w-full overflow-x-auto"
        >
          <div className="h-full min-w-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="#E3E9EF"
                  strokeDasharray="0"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  axisLine={{ stroke: "#E3E9EF" }}
                  tickLine={false}
                  padding={{ left: 12, right: 18 }}
                  tick={{
                    fill: "#5B6B7A",
                    fontSize: 12,
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                  dy={8}
                />

                <YAxis
                  yAxisId="efficacy"
                  orientation="left"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                  axisLine={false}
                  tickLine={false}
                  width={46}
                  tick={{
                    fill: "#5B6B7A",
                    fontSize: 12,
                    fontFamily: "Inter, system-ui, sans-serif",
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
                  width={56}
                  tick={{
                    fill: "#5B6B7A",
                    fontSize: 12,
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#D9E1E8", strokeWidth: 1 }}
                />

                <Line
                  yAxisId="efficacy"
                  type="monotone"
                  dataKey="efficacy"
                  name="efficacy"
                  stroke="#1B4965"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#1B4965",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />

                <Line
                  yAxisId="dose"
                  type="monotone"
                  dataKey="dose"
                  name="dose"
                  stroke="#2C7A7B"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#2C7A7B",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
