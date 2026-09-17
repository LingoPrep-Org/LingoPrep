import React from 'react';

interface ScoreBadgeProps {
  band: number;
  cefr: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  band,
  cefr,
  size = 'md',
  showLabel = true,
}) => {
  const getCefrClass = (c: string) => {
    switch (c?.toUpperCase()) {
      case 'C2': return 'score-c2';
      case 'C1': return 'score-c1';
      case 'B2': return 'score-b2';
      case 'B1': return 'score-b1';
      default: return 'score-a2';
    }
  };

  const sizeStyles = {
    sm: { padding: '4px 10px', fontSize: '0.8rem', badgeSize: '18px' },
    md: { padding: '6px 14px', fontSize: '0.95rem', badgeSize: '22px' },
    lg: { padding: '10px 20px', fontSize: '1.25rem', badgeSize: '30px' },
  }[size];

  return (
    <div
      className={`score-pill ${getCefrClass(cefr)}`}
      style={{
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
      }}
    >
      {showLabel && <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.8em' }}>IELTS</span>}
      <span style={{ fontWeight: 800 }}>Band {band.toFixed(1)}</span>
      <span
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.8em',
          fontWeight: 700,
        }}
      >
        {cefr}
      </span>
    </div>
  );
};
