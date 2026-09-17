import React from 'react';
import { SkillRadarItem } from '../types';

interface RadarChartProps {
  data: SkillRadarItem[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 320 }) => {
  if (!data || data.length === 0) return null;

  const center = size / 2;
  const radius = center - 45;
  const totalAxes = data.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Levels for concentric polygon rings
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, max: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build points string for the data polygon
  const polygonPoints = data
    .map((item, i) => {
      const { x, y } = getCoordinates(item.score, item.max_score, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Gradients & Filters */}
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.25" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Level Rings */}
        {levels.map((level, lvlIdx) => {
          const points = data
            .map((_, i) => {
              const { x, y } = getCoordinates(level * 9.0, 9.0, i);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvlIdx}
              points={points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray={lvlIdx < 3 ? '3,3' : 'none'}
            />
          );
        })}

        {/* Axis Lines and Labels */}
        {data.map((item, i) => {
          const { x: axisX, y: axisY } = getCoordinates(item.max_score, item.max_score, i);
          const { x: labelX, y: labelY } = getCoordinates(item.max_score + 1.2, item.max_score, i);

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={axisX}
                y2={axisY}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize="11"
                fontFamily="var(--font-heading)"
                fontWeight="600"
              >
                {item.skill_name} ({item.score.toFixed(1)})
              </text>
            </g>
          );
        })}

        {/* Data Area Polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarFill)"
          stroke="#6366f1"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Data Vertex Points */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(item.score, item.max_score, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};
