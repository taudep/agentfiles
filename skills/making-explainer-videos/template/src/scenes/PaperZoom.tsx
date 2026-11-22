import React from 'react';
import {Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import paper from '../generated/paper.json';
import {cueFrames, SceneProps} from '../timeline';
import {layout, theme} from '../theme';
import {Pop} from '../components/ui';

type Shot = {
  page: number;
  image: string;
  aspect: number;
  rect: number[]; // normalized [x0, y0, x1, y1]
  lines: number[][];
  highlight: boolean;
  cue: string | null;
  zoom: number;
  pan: boolean;
};

type Props = {pageLabel?: string; badge?: string; punch?: string; punchCue?: string};

const PAGE_W = 1836; // matches extract_paper.py render size (612pt × zoom 3)
const MOVE = 22; // frames per camera move
const VIEW_W = 1080 - 2 * 40;
const VIEW_H = layout.stageHeight;

/** Camera that frames `rect` (normalized) in the viewport. */
function camera(rect: number[], aspect: number, zoom = 1) {
  const pw = PAGE_W;
  const ph = PAGE_W / aspect;
  const [x0, y0, x1, y1] = rect;
  const w = (x1 - x0) * pw;
  const h = (y1 - y0) * ph;
  const fill = rect[2] - rect[0] >= 0.99 ? 0.96 : 0.9;
  const scale = Math.min((VIEW_W * fill) / w, (VIEW_H * fill) / h, 3.2) * zoom;
  return {scale, cx: ((x0 + x1) / 2) * pw, cy: ((y0 + y1) / 2) * ph};
}

/** Keep the viewport on the paper: never show past the page edges when zoomed in. */
function clampToPage(c: {scale: number; cx: number; cy: number}, aspect: number) {
  const ph = PAGE_W / aspect;
  const hw = VIEW_W / 2 / c.scale;
  const hh = VIEW_H / 2 / c.scale;
  const clamp = (v: number, half: number, len: number) => (len > 2 * half ? Math.min(Math.max(v, half), len - half) : v);
  return {...c, cx: clamp(c.cx, hw, PAGE_W), cy: clamp(c.cy, hh, ph)};
}

/** For a panning shot: camera centre x at progress p (0→1), sweeping the rect's width. */
function panX(rect: number[], scale: number, p: number) {
  const half = VIEW_W / 2 / scale;
  const left = rect[0] * PAGE_W + half;
  const right = rect[2] * PAGE_W - half;
  if (right <= left) return ((rect[0] + rect[2]) / 2) * PAGE_W;
  return left + (right - left) * p;
}

export const PaperZoom: React.FC<SceneProps<Props>> = ({id, props, words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shots = (paper as Record<string, Shot[]>)[id];
  const starts = cueFrames(
    words,
    shots.map((s) => s.cue),
    fps,
    40,
  );
  const [punchAt] = props.punchCue
    ? cueFrames(words, [...shots.map((s) => s.cue), props.punchCue], fps, 40).slice(-1)
    : [Infinity];

  // which shot are we in, and how far through the move into it?
  let k = 0;
  for (let i = 0; i < shots.length; i++) if (frame >= starts[i]) k = i;
  // a shot runs until the next cue, or until the narration ends
  const endOf = (i: number) => (i + 1 < shots.length ? starts[i + 1] : Math.round((words.at(-1)?.end ?? 3) * fps));
  const shotCam = (i: number, f: number) => {
    const c = clampToPage(camera(shots[i].rect, shots[i].aspect, shots[i].zoom), shots[i].aspect);
    if (!shots[i].pan) return c;
    const s0 = starts[i] + (i > 0 ? MOVE : 0);
    const p = interpolate(f, [s0, endOf(i)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sin),
    });
    return clampToPage({...c, cx: panX(shots[i].rect, c.scale, p)}, shots[i].aspect);
  };
  const cur = shotCam(k, frame);
  // same page: fly the camera; different page: hard cut with a quick fade-in
  const samePage = k > 0 && shots[k - 1].page === shots[k].page;
  const prev = samePage ? shotCam(k - 1, starts[k]) : null;
  const cutFade = k > 0 && !samePage ? interpolate(frame, [starts[k], starts[k] + 6], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  const m = prev
    ? interpolate(frame, [starts[k], starts[k] + MOVE], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;
  // slow push-in during each shot keeps static pages alive
  const drift = 1 + 0.035 * interpolate(frame, [starts[k], starts[k] + fps * 4], [0, 1], {extrapolateRight: 'clamp'});
  const lerp = (a: number, b: number) => a + (b - a) * m;
  const scale = (prev ? Math.exp(lerp(Math.log(prev.scale), Math.log(cur.scale))) : cur.scale) * drift;
  const cx = prev ? lerp(prev.cx, cur.cx) : cur.cx;
  const cy = prev ? lerp(prev.cy, cur.cy) : cur.cy;

  const shot = shots[k];
  const ph = PAGE_W / shot.aspect;
  // highlighter sweeps line by line once the camera has arrived
  const hlStart = starts[k] + (prev ? MOVE : 6);
  const perLine = 10;

  return (
    <div style={{position: 'absolute', top: layout.stageTop, left: 40, width: VIEW_W, height: VIEW_H}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 36,
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          background: '#1A1F2B',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: PAGE_W,
            height: ph,
            transformOrigin: '0 0',
            opacity: cutFade,
            transform: `translate(${VIEW_W / 2}px, ${VIEW_H / 2}px) scale(${scale}) translate(${-cx}px, ${-cy}px)`,
          }}
        >
          <Img src={staticFile(shot.image)} style={{width: PAGE_W, height: ph, display: 'block'}} />
          {shot.highlight &&
            shot.lines.map(([x0, y0, x1, y1], i) => {
              const p = interpolate(frame, [hlStart + i * perLine, hlStart + (i + 1) * perLine], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x0 * PAGE_W - 6,
                    top: y0 * ph - 2,
                    width: (x1 - x0) * PAGE_W * p + 12 * p,
                    height: (y1 - y0) * ph + 4,
                    background: theme.highlighter,
                    mixBlendMode: 'multiply',
                    borderRadius: 6,
                  }}
                />
              );
            })}
        </div>
        {/* vignette so the zoomed page reads as an object on the stage */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {props.badge && (
        <div
          style={{
            position: 'absolute',
            top: -24,
            left: 40,
            background: theme.accent,
            color: '#0A0C11',
            fontWeight: 900,
            fontSize: 40,
            padding: '12px 26px',
            borderRadius: 14,
            letterSpacing: 2,
          }}
        >
          {props.badge}
        </div>
      )}
      {props.pageLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: 26,
            left: 30,
            background: 'rgba(10,12,17,0.82)',
            color: theme.fg,
            fontSize: 28,
            fontWeight: 700,
            padding: '10px 18px',
            borderRadius: 12,
          }}
        >
          From the paper · {props.pageLabel}
        </div>
      )}
      {props.punch && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center'}}>
          <Pop at={punchAt}>
            <div
              style={{
                background: theme.accent,
                color: '#0A0C11',
                fontSize: 64,
                fontWeight: 900,
                padding: '22px 36px',
                borderRadius: 22,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {props.punch}
            </div>
          </Pop>
        </div>
      )}
    </div>
  );
};
