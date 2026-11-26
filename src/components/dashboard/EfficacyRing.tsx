import { cn } from "@/lib/utils";

interface EfficacyRingProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * EfficacyRing - Indicador circular de eficácia terapêutica sem glow.
 * Faixas clínicas: >=75% (#1E7A4D), 50-74% (#B54708), <50% (#B42318).
 */
export function EfficacyRing({
  value,
  size = "md",
  showLabel = true,
  className,
}: EfficacyRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const sizes = {
    sm: { width: 40, stroke: 4, textClass: "text-[12px]" },
    md: { width: 56, stroke: 6, textClass: "text-[14px]" },
    lg: { width: 88, stroke: 8, textClass: "text-[18px]" },
  };

  const { width, stroke, textClass } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - clamped) / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 75) return "var(--nd-success)";
    if (val >= 50) return "var(--nd-warning)";
    return "var(--nd-error)";
  };

  const getBandLabel = (val: number) => {
    if (val >= 75) return "alta";
    if (val >= 50) return "moderada";
    return "baixa";
  };

  const ringColor = getColor(clamped);

  return (
    <div
      role="img"
      aria-label={`Eficácia ${clamped}% (${getBandLabel(clamped)})`}
      className={cn("efficacy-ring relative inline-flex items-center justify-center shrink-0", className)}
      style={{ width, height: width }}
    >
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="var(--nd-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-semibold text-[var(--nd-text)] nd-tabular leading-none",
              textClass
            )}
          >
            {clamped}%
          </span>
        </div>
      )}
    </div>
  );
}
