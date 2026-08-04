import React, { useRef, useState } from 'react';
import { SEQUENTIAL, SEQUENTIAL_SOFT, GRID, TEXT_MUTED } from './chartTokens';

const W = 600;
const H = 200;
const PAD = 24;

// Single-series magnitude-over-time chart (revenue trend). One sequential
// hue per the dataviz skill's rule ("sequential = one hue"); a hover
// crosshair + tooltip ships by default rather than as an afterthought.
export function MiniAreaChart({ data, formatValue = (v) => v, emptyLabel = 'No data yet' }) {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs" style={{ color: TEXT_MUTED }}>
        {emptyLabel}
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const points = data.map((d, i) => {
    const x = PAD + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = PAD + innerH - ((d.value - min) / (max - min || 1)) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD} L ${points[0].x.toFixed(1)} ${H - PAD} Z`;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIdx(closest);
  };

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[200px]"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={PAD + innerH * (1 - f)} y2={PAD + innerH * (1 - f)} stroke={GRID} strokeWidth="1" />
        ))}

        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SEQUENTIAL_SOFT} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#areaFill)" />
        <path d={linePath} fill="none" stroke={SEQUENTIAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 5 : 3}
            fill={SEQUENTIAL}
            stroke={SURFACE_RING}
            strokeWidth="2"
            className="transition-all"
          />
        ))}

        {hovered && <line x1={hovered.x} x2={hovered.x} y1={PAD} y2={H - PAD} stroke={GRID} strokeWidth="1" strokeDasharray="3,3" />}
      </svg>

      {hovered && (
        <div
          className="absolute pointer-events-none bg-[#1a1c1e] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: `${(hovered.x / W) * 100}%`, top: `${(hovered.y / H) * 100}%` }}
        >
          <p className="text-white font-bold">{formatValue(hovered.value)}</p>
          <p className="text-luma-text-muted">{hovered.label}</p>
        </div>
      )}
    </div>
  );
}

const SURFACE_RING = '#131517';
