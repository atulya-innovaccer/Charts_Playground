import type { Meta, StoryObj } from '@storybook/react';

import { Sparkline } from '../charts/Sparkline';
import { sparklineLabels, sparklineValues } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  colorArg,
  hoverCardArg,
  rangeArg,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Sparkline controls should stay minimal: width, height, stroke width, and color. ` +
          'The value array is hidden because it is advanced data.'
      }
    }
  },
  argTypes: {
    values: advancedDataArg('Advanced sparkline values. Hidden from controls because raw array editing is not a good default experience.'),
    labels: advancedDataArg('Advanced sparkline labels used by the hover helper card.'),
    showHoverCard: hoverCardArg(),
    width: rangeArg('Numeric sparkline width in pixels.', 'Layout', { min: 40, max: 200, step: 4 }),
    height: rangeArg('Numeric sparkline height in pixels.', 'Layout', { min: 16, max: 80, step: 2 }),
    strokeWidth: rangeArg('Numeric line width in pixels.', 'Style', { min: 1, max: 6, step: 0.5 }),
    color: colorArg('Line color for the sparkline.')
  }
} satisfies Meta<typeof Sparkline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    values: sparklineValues,
    labels: sparklineLabels,
    showHoverCard: false
  }
};
