import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrames, SceneProps} from '../timeline';
import {theme} from '../theme';
import {Footnote, Kicker, Pop, Stage, usePop} from '../components/ui';

type Props = {
  kicker: string;
  prefix?: string;
  value: number;
  from?: number; // count from this to value (e.g. 55 → 17 counts down); default 0
  suffix?: string;
  sub: string;
  subCue?: string;
  footnote?: string;
};

export const BigNumber: React.FC<SceneProps<Props>> = ({props, words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [subAt] = cueFrames(words, [props.subCue], fps, 30);

  // count up fast: a hook has to land in the first second
  const t = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const start = props.from ?? 0;
  const shown = Math.round(start + (props.value - start) * t).toLocaleString('en-US');
  const text = `${props.prefix ?? ''}${shown}${props.suffix ?? ''}`;
  const finalLen = `${props.prefix ?? ''}${props.value.toLocaleString('en-US')}${props.suffix ?? ''}`.length;
  const fontSize = Math.min(320, 1500 / finalLen);
  const pop = usePop(0, 200, 12);

  return (
    <Stage>
      <Kicker>{props.kicker}</Kicker>
      <div
        style={{
          fontSize,
          fontWeight: 900,
          color: theme.accent,
          letterSpacing: -6,
          lineHeight: 1,
          transform: `scale(${0.85 + 0.15 * pop})`,
          textShadow: `0 0 80px rgba(198,255,61,0.35)`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {text}
      </div>
      <Pop at={subAt}>
        <div style={{fontSize: 76, fontWeight: 900, color: theme.fg, textAlign: 'center',
      textWrap: 'balance', lineHeight: 1.1}}>
          {props.sub}
        </div>
      </Pop>
      {props.footnote && (
        <div style={{position: 'absolute', bottom: 0}}>
          <Footnote>{props.footnote}</Footnote>
        </div>
      )}
    </Stage>
  );
};
