import React from 'react';
import {useVideoConfig} from 'remotion';
import {cueFrames, SceneProps} from '../timeline';
import {theme} from '../theme';
import {Kicker, Pop, Stage, usePop} from '../components/ui';

type Props = {title: string; items: {text: string; cue?: string}[]};

const Check: React.FC<{at: number}> = ({at}) => {
  const p = usePop(at, 260, 11);
  return (
    <div
      style={{
        width: 92,
        height: 92,
        flexShrink: 0,
        borderRadius: 46,
        background: theme.accent,
        color: '#0A0C11',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 60,
        fontWeight: 900,
        transform: `scale(${p}) rotate(${(1 - p) * -30}deg)`,
      }}
    >
      ✓
    </div>
  );
};

export const Checklist: React.FC<SceneProps<Props>> = ({props, words}) => {
  const {fps} = useVideoConfig();
  const at = cueFrames(
    words,
    props.items.map((i) => i.cue),
    fps,
    30,
  );
  return (
    <Stage>
      <Kicker color={theme.fg}>{props.title}</Kicker>
      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 34, marginTop: 30}}>
        {props.items.map((item, i) => (
          <Pop key={item.text} at={at[i]} dy={60}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 32,
                background: theme.panel,
                border: `2px solid ${theme.panelEdge}`,
                borderRadius: 28,
                padding: '30px 36px',
              }}
            >
              <Check at={at[i] + 4} />
              <div style={{fontSize: 54, fontWeight: 800, color: theme.fg, lineHeight: 1.1, textWrap: 'balance'}}>{item.text}</div>
            </div>
          </Pop>
        ))}
      </div>
    </Stage>
  );
};
