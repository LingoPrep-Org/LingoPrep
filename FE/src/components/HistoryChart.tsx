import React from 'react';
import { TrendPoint } from '../types';

interface HistoryChartProps {
  data: TrendPoint[];
  width?: number;
  height?: number;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ data, width = 600, height = 220 }) => {
  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minBand = 4.0;
  const maxBand = 9.0;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (band: number) => {
    return padding.top + chartHeight - ((band - minBand) / (maxBand - minBand)) * chartHeight;
  };

  // Build SVG path
  const pathD = data.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.band);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build area fill
  const areaD = `${pathD} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines for bands 5.0, 6.0, 7.0, 8.0, 9.0 */}
        {[5.0, 6.0, 7.0, 8.0, 9.0].map((b) => {
          const y = getY(b);
          return (
            <g key={b}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {b.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area fill under the line */}
        <path d={areaD} fill="url(#trendGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((pt, i) => {
          const x = getX(i);
          const y = getY(pt.band);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#101522" stroke="#6366f1" strokeWidth="2.5" />
              <text
                x={x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
                fontFamily="var(--font-heading)"
              >
                {pt.date}
              </text>
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-heading)"
              >
                {pt.band.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
