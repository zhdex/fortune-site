import React from 'react';

/**
 * 金色线性图标（SVG 版，作为 ComfyUI 生成图的稳定兜底）
 * 统一 64×64 视窗、细线条、居中，配色由 currentColor 继承。
 */
const base = {
  width: '100%',
  height: '100%',
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconSelf(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="32" cy="32" r="26" opacity="0.45" strokeDasharray="2 5" />
      <circle cx="32" cy="22" r="5" />
      <path d="M32 27v3" />
      <path d="M22 46c1.6-7 5.6-11 10-11s8.4 4 10 11" />
      <path d="M23 43c3 2.4 6 3.4 9 3.4s6-1 9-3.4" />
      <path d="M20 16c2.2-.6 3.6-1.8 4.4-4M44 16c-2.2-.6-3.6-1.8-4.4-4" opacity="0.7" />
    </svg>
  );
}

export function IconCareer(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="32" cy="32" r="26" opacity="0.45" strokeDasharray="2 5" />
      <path d="M20 44h24" />
      <path d="M23 44V33M32 44V26M41 44V38" strokeWidth="2.6" />
      <path d="M22 24l8-6 6 4 8-9" />
      <path d="M38 13h6v6" />
    </svg>
  );
}

export function IconLove(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="32" cy="32" r="26" opacity="0.45" strokeDasharray="2 5" />
      <path d="M25.5 24c-3.6 0-6.5 2.9-6.5 6.4 0 6.2 9.4 12.2 13 14.6 3.6-2.4 13-8.4 13-14.6 0-3.5-2.9-6.4-6.5-6.4-2.6 0-4.9 1.4-6.5 3.6-1.6-2.2-3.9-3.6-6.5-3.6Z" />
      <path d="M32 18v-5" opacity="0.7" />
      <circle cx="32" cy="11" r="1.6" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

export function IconFortune(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="32" cy="32" r="26" opacity="0.45" strokeDasharray="2 5" />
      <circle cx="32" cy="32" r="17" opacity="0.8" />
      <path d="M32 15l3.6 13.4L49 32l-13.4 3.6L32 49l-3.6-13.4L15 32l13.4-3.6Z" />
      <circle cx="32" cy="32" r="2.2" fill="currentColor" stroke="none" opacity="0.9" />
    </svg>
  );
}

export const CARD_ICONS = { self: IconSelf, career: IconCareer, love: IconLove, fortune: IconFortune };
