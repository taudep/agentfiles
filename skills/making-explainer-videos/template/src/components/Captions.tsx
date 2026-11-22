import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Word} from '../timeline';
import {layout, theme} from '../theme';

type Group = {words: Word[]; start: number; end: number};

/** Short-form captions: 1–3 words at a time, current word lit up. */
function group(words: Word[], max = 3): Group[] {
  const out: Group[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max || /[.,:;!?]$/.test(w.text)) flush();
  }
  flush();
  return out;
}

export const Captions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = useMemo(() => group(words), [words]);

  const gi = groups.findIndex((g, i) => t >= g.start && t < (groups[i + 1]?.start ?? g.end + 0.5));
  if (gi < 0) return null;
  const g = groups[gi];
  const pop = spring({frame: frame - Math.round(g.start * fps), fps, config: {stiffness: 300, damping: 18}});

  return (
    <div
      style={{
        position: 'absolute',
        top: layout.captionTop,
        left: 90,
        right: 90,
        textAlign: 'center',
        fontFamily: theme.sans,
        fontSize: 80,
        textWrap: 'balance',
        fontWeight: 900,
        textTransform: 'uppercase',
        lineHeight: 1.08,
        letterSpacing: -1,
        transform: `scale(${0.85 + 0.15 * pop})`,
      }}
    >
      {g.words.map((w, i) => {
        const next = g.words[i + 1]?.start ?? g.end + 0.5;
        const active = t >= w.start && t < next;
        return (
          <React.Fragment key={i}>
          <span
            style={{
              color: active ? theme.accent : theme.fg,
              WebkitTextStroke: '12px #000',
              paintOrder: 'stroke fill',
            }}
          >
            {w.text}
          </span>{' '}
          </React.Fragment>
        );
      })}
    </div>
  );
};
