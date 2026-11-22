import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrames, SceneProps} from '../timeline';
import {theme} from '../theme';
import {Footnote, Pop, Stage} from '../components/ui';

type Bar = {label: string; value: number; highlight?: boolean; cue?: string};
type Props = {
  kicker: string;
  kickerAccent: string;
  title: string;
  max: number;
  bars: Bar[];
  punch?: string;
  punchCue?: string;
  footnote?: string;
};

export const BarChart: React.FC<SceneProps<Props>> = ({props, words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const frames = cueFrames(words, [...props.bars.map((b) => b.cue), props.punchCue], fps, 30);
  const barAt = frames.slice(0, props.bars.length);
  const punchAt = frames[props.bars.length];

  return (
    <Stage>
      <Pop at={0}>
        <div style={{fontSize: 62, fontWeight: 900, color: theme.fg, textAlign: 'center',
      textWrap: 'balance', lineHeight: 1.1}}>
          {props.kicker}
          <div style={{color: theme.accent, fontSize: 150, letterSpacing: -4, marginTop: 6}}>{props.kickerAccent}</div>
        </div>
      </Pop>
      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 34, marginTop: 20}}>
        <div style={{fontSize: 30, color: theme.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1}}>
          {props.title}
        </div>
        {props.bars.map((b, i) => {
          const p = interpolate(frame, [barAt[i], barAt[i] + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          const color = b.highlight ? theme.accent : '#5B6680';
          return (
            <div key={b.label} style={{opacity: frame >= barAt[i] ? 1 : 0.25}}>
              <div style={{fontSize: 40, fontWeight: 800, color: b.highlight ? theme.fg : theme.muted, marginBottom: 12}}>
                {b.label}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                <div style={{flex: 1, height: 72, background: theme.panel, borderRadius: 18, overflow: 'hidden'}}>
                  <div
                    style={{
                      width: `${(b.value / props.max) * 100 * p}%`,
                      height: '100%',
                      background: color,
                      borderRadius: 18,
                      boxShadow: b.highlight ? '0 0 40px rgba(198,255,61,0.4)' : undefined,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 120,
                    fontSize: 72,
                    fontWeight: 900,
                    color,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(b.value * p)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {props.punch && (
        <Pop at={punchAt}>
          <div style={{fontSize: 52, fontWeight: 900, color: theme.fg, textAlign: 'center',
      textWrap: 'balance', marginTop: 16}}>
            {props.punch}
          </div>
        </Pop>
      )}
      {props.footnote && (
        <div style={{position: 'absolute', bottom: 0}}>
          <Footnote>{props.footnote}</Footnote>
        </div>
      )}
    </Stage>
  );
};
