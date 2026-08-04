import React from 'react';
import { CATEGORICAL } from './chartTokens';

// Horizontal bar list for categorical breakdowns (event status, event
// category, user role). Fixed hue order per the dataviz skill -- colors are
// assigned by position, never re-cycled when the filtered set changes.
// Direct value labels are used throughout since there are always <=8 rows
// (a legend box would be redundant here).
export function MiniBarChart({ data, formatValue = (v) => v, emptyLabel = 'No data yet' }) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-luma-text-muted py-6">{emptyLabel}</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const color = CATEGORICAL[i % CATEGORICAL.length];
        const pct = Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0);
        return (
          <div key={d.label} className="group">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-luma-text-light-gray font-medium capitalize truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {d.label}
              </span>
              <span className="text-white font-bold shrink-0 ml-2">{formatValue(d.value)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
