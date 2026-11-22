import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from './components/Captions';
import {BarChart} from './scenes/BarChart';
import {BigNumber} from './scenes/BigNumber';
import {CTA} from './scenes/CTA';
import {Checklist} from './scenes/Checklist';
import {PaperZoom} from './scenes/PaperZoom';
import {SceneProps, timeline} from './timeline';
import {theme} from './theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCENES: Record<string, React.FC<SceneProps<any>>> = {BigNumber, PaperZoom, BarChart, Checklist, CTA};

/** Persistent background so cuts feel like one stage, not a slide deck. */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const a = frame * 0.6;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + 10 * Math.sin(a / 90)}% ${20 + 8 * Math.cos(a / 110)}%, rgba(198,255,61,0.10), transparent 45%),
                     radial-gradient(circle at ${75 + 8 * Math.cos(a / 80)}% ${75 + 6 * Math.sin(a / 70)}%, rgba(77,216,255,0.10), transparent 50%),
                     ${theme.bg}`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)',
          backgroundSize: '48px 48px',
          backgroundPosition: `0 ${-(frame * 0.4) % 48}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Quick punch-in on every cut except the very first frame (the hook must be instant). */
const SceneShell: React.FC<{instant: boolean; children: React.ReactNode}> = ({instant, children}) => {
  const frame = useCurrentFrame();
  const p = instant ? 1 : interpolate(frame, [0, 7], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: p, transform: `scale(${1.04 - 0.04 * p})`}}>{children}</AbsoluteFill>;
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: theme.accent}} />
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{fontFamily: theme.sans, backgroundColor: theme.bg}}>
    <Background />
    {timeline.scenes.map((s, i) => {
      const Scene = SCENES[s.type];
      if (!Scene) throw new Error(`Unknown scene type "${s.type}" in ${s.id}`);
      return (
        <Sequence key={s.id} name={s.id} from={s.startFrame} durationInFrames={s.durationInFrames}>
          <Audio src={staticFile(s.audio)} />
          <SceneShell instant={i === 0}>
            <Scene id={s.id} props={s.props} words={s.words} />
          </SceneShell>
          <Captions words={s.words} />
        </Sequence>
      );
    })}
    <ProgressBar />
  </AbsoluteFill>
);
