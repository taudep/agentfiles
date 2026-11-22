import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {layout, theme} from '../theme';

/** The visual area above the captions. */
export const Stage: React.FC<{children: React.ReactNode; justify?: React.CSSProperties['justifyContent']}> = ({
  children,
  justify = 'center',
}) => (
  <AbsoluteFill
    style={{
      top: layout.stageTop,
      height: layout.stageHeight,
      padding: `0 ${layout.padX}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: 'center',
      gap: 36,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** 0→1 spring that starts at `at` (scene-relative frame). */
export const usePop = (at: number, stiffness = 170, damping = 15) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: Math.max(0, frame - at), fps, config: {stiffness, damping}});
};

/** Element that springs up into place at frame `at`. */
export const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number}> = ({
  at,
  children,
  style,
  dy = 40,
}) => {
  const frame = useCurrentFrame();
  const p = usePop(at);
  const visible = frame >= at;
  return (
    <div
      style={{
        opacity: visible ? Math.min(1, p * 1.4) : 0,
        transform: `translateY(${(1 - p) * dy}px) scale(${0.9 + 0.1 * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Footnote: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontSize: 30, color: theme.muted, textAlign: 'center',
      textWrap: 'balance', fontWeight: 600, letterSpacing: 0.5}}>
    {children}
  </div>
);

export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = theme.muted}) => (
  <div
    style={{
      fontSize: 50,
      fontWeight: 800,
      color,
      textTransform: 'uppercase',
      letterSpacing: 2,
      textAlign: 'center',
      textWrap: 'balance',
      lineHeight: 1.15,
    }}
  >
    {children}
  </div>
);

/** Terminal window with a typing effect starting at frame `at`. */
export const Terminal: React.FC<{code: string; at: number; fontSize?: number; prompt?: boolean}> = ({
  code,
  at,
  fontSize = 52,
  prompt = true,
}) => {
  const frame = useCurrentFrame();
  const typed = Math.max(0, Math.floor((frame - at) / 1.4));
  const shown = code.slice(0, typed);
  const done = typed >= code.length;
  const cursorOn = !done || Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        width: '100%',
        background: '#05070B',
        border: `2px solid ${theme.panelEdge}`,
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{display: 'flex', gap: 14, padding: '22px 28px', background: theme.panel}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{width: 22, height: 22, borderRadius: 11, background: c}} />
        ))}
      </div>
      <div
        style={{
          padding: '40px 36px',
          fontFamily: theme.mono,
          fontSize,
          fontWeight: 700,
          color: theme.fg,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: 1.35,
          minHeight: fontSize * 1.4,
        }}
      >
        {prompt && <span style={{color: theme.accent}}>$ </span>}
        {shown}
        <span style={{opacity: cursorOn ? 1 : 0, color: theme.accent}}>▋</span>
      </div>
    </div>
  );
};
