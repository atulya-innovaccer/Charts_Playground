import type { Meta, StoryObj } from '@storybook/react';

import { LineChart } from '../charts/LineChart';
import { selectOptions, lineCategories, lineSeries } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  hiddenEventArgTypes,
  hoverCardArg,
  numberArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Line Chart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} For line charts, keep the live controls focused on layout and display toggles. ` +
          'Series objects, reference lines, and axis config stay hidden because they are better authored in code.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    categories: advancedDataArg('Advanced category labels. Hidden from Storybook controls for a cleaner playground.'),
    series: advancedDataArg('Advanced line-series data. Hidden from controls because raw object editing is not user-friendly.'),
    yAxis: advancedDataArg('Advanced left-axis config.'),
    secondaryYAxis: advancedDataArg('Advanced right-axis config.', { arg: 'showSecondaryYAxis', truthy: true }),
    grid: advancedDataArg('Advanced grid config.'),
    referenceLines: advancedDataArg('Advanced reference lines.'),
    showSecondaryYAxis: booleanArg(
      'Boolean toggle for the right-side axis.'
    ),
    showHoverCard: hoverCardArg(),
    plotWidth: numberArg(
      'Numeric plot width in pixels.',
      'Layout',
      { min: 240, max: 700, step: 10 }
    ),
    plotHeight: numberArg(
      'Numeric plot height in pixels.',
      'Layout',
      { min: 120, max: 360, step: 10 }
    )
  }
} satisfies Meta<typeof LineChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Average PMPM Trend',
    categories: lineCategories,
    series: lineSeries,
    selectOptions,
    selectedValue: selectOptions[1].value,
    showHoverCard: false,
    referenceLines: [
      {
        value: 1058,
        label: 'Target',
        color: '#394cc7'
      }
    ],
    yAxis: {
      title: 'PMPM',
      ticks: ['$1,100', '$1,050', '$1,000']
    },
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const DualAxis: Story = {
  args: {
    title: 'Monthly census and utilization',
    categories: lineCategories,
    series: [
      {
        key: 'census',
        label: 'Census',
        data: [24, 30, 28, 36],
        stroke: '#3bceff',
        showDots: true,
        showAreaFill: true
      },
      {
        key: 'utilization',
        label: 'Utilization',
        data: [58, 62, 60, 68],
        stroke: '#c93030',
        lineStyle: 'dashed',
        showDots: false,
        axis: 'right'
      }
    ],
    showSecondaryYAxis: true,
    showHoverCard: false,
    yAxis: {
      title: 'Census',
      ticks: ['40', '20', '0']
    },
    secondaryYAxis: {
      title: 'Utilization',
      ticks: ['80', '60', '40']
    },
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
