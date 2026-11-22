import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const inter = loadInter('normal', {weights: ['400', '600', '800', '900'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['500', '700'], subsets: ['latin']});

export const theme = {
  bg: '#0A0C11',
  panel: '#141925',
  panelEdge: '#232A3B',
  fg: '#F4F6FA',
  muted: '#8B94A8',
  accent: '#C6FF3D', // electric lime: the "look here" colour
  accent2: '#4DD8FF',
  highlighter: 'rgba(198, 255, 61, 0.55)',
  sans: inter.fontFamily,
  mono: mono.fontFamily,
};

/** Vertical 9:16 layout. Visuals live in the stage; captions sit below it, clear of Shorts UI. */
export const layout = {
  stageTop: 150,
  stageHeight: 1110,
  padX: 70,
  captionTop: 1320,
};
