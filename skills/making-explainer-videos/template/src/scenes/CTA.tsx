import React from 'react';
import {useVideoConfig} from 'remotion';
import {cueFrames, SceneProps} from '../timeline';
import {theme} from '../theme';
import {Footnote, Pop, Stage, Terminal} from '../components/ui';

type Props = {
  code: string;
  codeCue?: string;
  steps: {text: string; cue?: string}[];
  end: string;
  endCue?: string;
  footnote?: string;
};

export const CTA: React.FC<SceneProps<Props>> = ({props, words}) => {
  const {fps} = useVideoConfig();
  const f = cueFrames(words, [props.codeCue, ...props.steps.map((s) => s.cue), props.endCue], fps, 30);
  const codeAt = f[0];
  const stepAt = f.slice(1, 1 + props.steps.length);
  const endAt = f[f.length - 1];

  return (
    <Stage>
      <Pop at={Math.max(0, codeAt - 8)} style={{width: '100%'}}>
        <Terminal code={props.code} at={codeAt} fontSize={60} />
      </Pop>
      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 22, marginTop: 10}}>
        {props.steps.map((s, i) => (
          <Pop key={s.text} at={stepAt[i]}>
            <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  border: `4px solid ${theme.accent}`,
                  color: theme.accent,
                  fontSize: 40,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </div>
              <div style={{fontSize: 58, fontWeight: 800, color: theme.fg}}>{s.text}</div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop at={endAt}>
        <div style={{fontSize: 104, fontWeight: 900, color: theme.accent, textAlign: 'center', lineHeight: 1, marginTop: 20}}>
          {props.end}
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
