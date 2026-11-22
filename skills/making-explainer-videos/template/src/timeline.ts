import raw from './generated/timeline.json';

export type Word = {text: string; start: number; end: number};

export type SceneEntry = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  audio: string;
  startFrame: number;
  durationInFrames: number;
  words: Word[];
};

export type Timeline = {fps: number; width: number; height: number; totalFrames: number; scenes: SceneEntry[]};

export const timeline = raw as unknown as Timeline;

export type SceneProps<P> = {id: string; props: P; words: Word[]};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Turn cue words into frame numbers (relative to the scene). Cues are matched in order,
 * each searching after the previous match, so "now" in "Now give it a job" isn't
 * confused with an earlier "right now". Missing/unmatched cues fall back to `step`
 * frames after the previous cue.
 */
export function cueFrames(words: Word[], cues: (string | undefined | null)[], fps: number, step = 24): number[] {
  let from = 0;
  let prev = 0;
  return cues.map((cue, i) => {
    if (cue) {
      const target = norm(cue);
      const idx = words.findIndex((w, j) => j >= from && norm(w.text).startsWith(target));
      if (idx >= 0) {
        from = idx + 1;
        prev = Math.round(words[idx].start * fps);
        return prev;
      }
    }
    prev = i === 0 && !cue ? 0 : prev + step;
    return prev;
  });
}
