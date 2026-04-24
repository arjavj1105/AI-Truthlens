"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PentagonDataPoint {
  label: string;
  value: number; // 0–10
}

interface PentagonChartProps {
  data: PentagonDataPoint[];
  color?: string;
  label?: string;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function buildPolygonPath(cx: number, cy: number, r: number, points: number): string {
  const step = (Math.PI * 2) / points;
  return Array.from({ length: points }, (_, i) => {
    const { x, y } = polarToCartesian(cx, cy, r, i * step);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function buildDataPath(
  cx: number,
  cy: number,
  maxR: number,
  values: number[],
  maxVal: number
): string {
  const step = (Math.PI * 2) / values.length;
  return values.map((v, i) => {
    const r = (v / maxVal) * maxR;
    const { x, y } = polarToCartesian(cx, cy, r, i * step);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

export function PentagonChart({ data, color = "#5ed29c", label, size = 220 }: PentagonChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.37;
  const n = data.length;
  const step = (Math.PI * 2) / n;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center gap-4">
      {label && (
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLevels.map((level, li) => (
          <path
            key={li}
            d={buildPolygonPath(cx, cy, maxR * level, n)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: n }, (_, i) => {
          const { x, y } = polarToCartesian(cx, cy, maxR, i * step);
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={x.toFixed(2)} y2={y.toFixed(2)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}

        {/* Data area */}
        <motion.path
          d={buildDataPath(cx, cy, maxR, data.map((d) => d.value), 10)}
          fill={color}
          fillOpacity={0.15}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const r = (d.value / 10) * maxR;
          const { x, y } = polarToCartesian(cx, cy, r, i * step);
          return (
            <motion.circle
              key={i}
              cx={x} cy={y} r={3}
              fill={color}
              stroke="#070b0a"
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.07 }}
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const { x, y } = polarToCartesian(cx, cy, maxR + 22, i * step);
          const textAnchor = x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle";
          return (
            <text
              key={i}
              x={x.toFixed(2)}
              y={(y + 4).toFixed(2)}
              textAnchor={textAnchor}
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              fill="rgba(255,255,255,0.4)"
              className="uppercase tracking-widest"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Multi-model Pentagon comparison ─────────────────────────────────────────

export interface ModelPentagonData {
  provider: string;
  label: string;
  color: string;
  pillars: PentagonDataPoint[];
}

interface PentagonComparisonProps {
  models: ModelPentagonData[];
}

const COLORS = ["#5ed29c", "#38bdf8", "#f59e0b", "#f472b6", "#a78bfa"];

export function PentagonComparison({ models }: PentagonComparisonProps) {
  if (!models.length) return null;

  return (
    <div className={cn(
      "glass-card border-white/5 p-6 space-y-6"
    )}>
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-sm" />
          </div>
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
            Pentagon Analytic Engine
          </h3>
        </div>
        <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
          5-PILLAR RELIABILITY MAP
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {models.map((m) => (
          <div key={m.provider} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
            <span className="text-[10px] font-mono text-gray-400">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Pentagons grid */}
      <div className={cn(
        "grid gap-8",
        models.length === 1 ? "grid-cols-1 justify-items-center" :
        models.length === 2 ? "grid-cols-2" :
        "grid-cols-2 lg:grid-cols-3"
      )}>
        {models.map((m) => (
          <PentagonChart
            key={m.provider}
            data={m.pillars}
            color={m.color}
            label={m.label}
            size={200}
          />
        ))}
      </div>

      {/* Pillar legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-white/5">
        {["Speed", "Factuality", "Logic", "Token Eff.", "Language"].map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono text-gray-600">
            <span className="w-3 h-[1px] bg-white/20 inline-block" />
            {p.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export { COLORS };
