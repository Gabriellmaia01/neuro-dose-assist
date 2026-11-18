import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, Activity } from "lucide-react";

interface DataPoint {
  date: string;
  efficacy: number;
  dose: number;
}

interface EfficacyChartProps {
  data: DataPoint[];
  className?: string;
}

/**
 * CustomTooltip - Tooltip cirúrgico de telemetria médica.
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-slate-950/95 border border-slate-800 p-3 shadow-2xl backdrop-blur-xl font-mono text-xs space-y-1.5 z-50">
        <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800 pb-1">
          Data: {label}
        </div>
        {payload.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span
              className="text-[11px]"
              style={{ color: item.color || item.stroke }}
            >
              {item.name === "efficacy" ? "Eficácia" : "Dose"}:
            </span>
            <span className="text-white font-bold">
              {item.value}
              {item.name === "efficacy" ? "%" : " mg"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * EfficacyChart - Gráfico de Curva de Eficácia e Farmacocinética (Swiss Minimalist).
 * Padrão Awwwards: Visual de telemetria analítica com gradientes luminescentes e precisão matemática.
 */
export function EfficacyChart({ data, className }: EfficacyChartProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-5 sm:p-6 shadow-sm",
        className
      )}
    >
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Curva de Eficácia Farmacológica
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-mono text-[10px]">
                TELEMETRIA 7D
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Correlação entre dosagens administradas e resposta terapêutica
            </p>
          </div>
        </div>

        {/* Legenda Estilo Telemetria */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 ring-2 ring-teal-400/20" />
            <span className="text-muted-foreground">Eficácia (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/20" />
            <span className="text-muted-foreground">Dose (mg)</span>
          </div>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="efficacyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="doseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="currentColor"
              className="text-border/40 dark:text-slate-800/60"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground font-mono"
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground font-mono"
              domain={[0, 100]}
              width={35}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="efficacy"
              name="efficacy"
              stroke="#14b8a6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#efficacyGrad)"
              activeDot={{ r: 5, fill: "#14b8a6", stroke: "#ffffff", strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="dose"
              name="dose"
              stroke="#06b6d4"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fillOpacity={1}
              fill="url(#doseGrad)"
              activeDot={{ r: 4, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
