import React from 'react';

/**
 * 星阑符印 · 纯 SVG 的六芒星法阵
 * 参考图的视觉中心：金色细线 + 同心法环 + 地支刻度 + 中心辉光。
 * 用矢量而非位图，缩放不糊、可无限旋转，体积近乎为零。
 */
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export default function Mandala({ size = 560, className = '' }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return (
    <svg
      className={`mandala ${className}`}
      viewBox="0 0 600 600"
      width={size}
      height={size}
      role="img"
      aria-label="星阑符印"
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6dc" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#f3d79a" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#b98cff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8e7bd" />
          <stop offset="45%" stopColor="#e3bf7d" />
          <stop offset="100%" stopColor="#b98cff" />
        </linearGradient>
        <linearGradient id="ringStroke" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f3d79a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a98bff" stopOpacity="0.45" />
        </linearGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="bigGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* 中心辉光 */}
      <circle cx="300" cy="300" r="250" fill="url(#coreGlow)" opacity="0.55" filter="url(#bigGlow)" className="mandala-core" />

      {/* 最外圈：虚线细环 */}
      <circle cx="300" cy="300" r="286" fill="none" stroke="url(#ringStroke)" strokeWidth="1" strokeDasharray="2 10" opacity="0.55" />

      {/* 刻度环（缓慢旋转） */}
      <g className="mandala-spin-slow" style={{ transformOrigin: '300px 300px' }}>
        {ticks.map((i) => {
          const angle = (i * 360) / 72;
          const long = i % 6 === 0;
          const r1 = long ? 258 : 268;
          const r2 = 276;
          return (
            <line
              key={i}
              x1="300" y1={300 - r1} x2="300" y2={300 - r2}
              stroke={long ? '#f3d79a' : '#c8b4ff'}
              strokeWidth={long ? 1.6 : 0.8}
              opacity={long ? 0.85 : 0.4}
              transform={`rotate(${angle} 300 300)`}
            />
          );
        })}
      </g>

      {/* 地支环 */}
      <g className="mandala-spin-reverse" style={{ transformOrigin: '300px 300px' }}>
        <circle cx="300" cy="300" r="238" fill="none" stroke="url(#ringStroke)" strokeWidth="0.9" opacity="0.5" />
        {BRANCHES.map((b, i) => {
          const angle = (i * 360) / 12 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 300 + Math.cos(rad) * 218;
          const y = 300 + Math.sin(rad) * 218;
          return (
            <text
              key={b}
              x={x}
              y={y}
              fill="#e9d7b6"
              fontSize="15"
              fontFamily="'Songti SC','Noto Serif SC',serif"
              textAnchor="middle"
              dominantBaseline="central"
              opacity="0.78"
              transform={`rotate(${angle + 90} ${x} ${y})`}
            >
              {b}
            </text>
          );
        })}
      </g>

      {/* 六芒星：两个三角形 */}
      <g filter="url(#softGlow)" className="mandala-pulse">
        <polygon points="300,110 462,390 138,390" fill="none" stroke="url(#goldStroke)" strokeWidth="2.4" strokeLinejoin="round" />
        <polygon points="300,490 138,210 462,210" fill="none" stroke="url(#goldStroke)" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="300" cy="300" r="150" fill="none" stroke="url(#goldStroke)" strokeWidth="1.1" opacity="0.6" />
      </g>

      {/* 中心星核 */}
      <g className="mandala-core-pulse" style={{ transformOrigin: '300px 300px' }}>
        <circle cx="300" cy="300" r="26" fill="url(#coreGlow)" />
        <circle cx="300" cy="300" r="6" fill="#fff8e6" filter="url(#softGlow)" />
        <path d="M300 236 L306 294 L364 300 L306 306 L300 364 L294 306 L236 300 L294 294 Z" fill="#ffeec7" opacity="0.5" filter="url(#softGlow)" />
      </g>

      {/* 四角星芒 */}
      {[0, 90, 180, 270].map((a) => (
        <circle
          key={a}
          cx="300" cy="44" r="3.2" fill="#fff4d6" filter="url(#softGlow)"
          transform={`rotate(${a} 300 300)`} className="mandala-spark"
        />
      ))}
    </svg>
  );
}
