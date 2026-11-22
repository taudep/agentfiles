import React from 'react';
import {Composition} from 'remotion';
import {timeline} from './timeline';
import {Video} from './Video';

export const Root: React.FC = () => (
  <Composition
    id="Short"
    component={Video}
    width={timeline.width}
    height={timeline.height}
    fps={timeline.fps}
    durationInFrames={timeline.totalFrames}
  />
);
