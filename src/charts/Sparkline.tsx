import { useState } from 'react';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import {
  buildLinePoints,
  describeLinePath,
  formatTooltipValue,
  getDotRadius,
  getEstimatedHoverCardHeight,
  getHoverIndex,
  getViewportHoverCardPosition,
  getValueExtent
} from '../chartUtils';

export interface SparklineProps {
  values: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showHoverCard?: boolean;
}

export function Sparkline({
  values,
  labels,
  width = 84,
  height = 28,
  color = chartTokens.sequential.default.dark,
  strokeWidth = 1.5,
  showHoverCard = false
}: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const extent = getValueExtent(values);
  const points = buildLinePoints(values, width, height, extent.min, extent.max, 2);
  const hoveredPoint =
    hoveredIndex !== null ? points[hoveredIndex] : null;
  const hoverCardPosition = mousePos
    ? getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, getEstimatedHoverCardHeight(1))
    : null;

  return (
    <div
      style={{ position: 'relative', width, height }}
      onMouseMove={
        showHoverCard
          ? (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setHoveredIndex(
                getHoverIndex(event.clientX - rect.left, width, values.length)
              );
              setMousePos({ x: event.clientX, y: event.clientY });
            }
          : undefined
      }
      onMouseLeave={showHoverCard ? () => { setHoveredIndex(null); setMousePos(null); } : undefined}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Sparkline"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <path
          d={describeLinePath(points)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showHoverCard && hoveredPoint ? (
          <>
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={getDotRadius('small') + 2}
              fill="#ffffff"
              stroke={color}
              strokeWidth={2}
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={getDotRadius('small')}
              fill={color}
            />
          </>
        ) : null}
      </svg>
      {showHoverCard && hoveredPoint ? (
        <ChartHoverCard
          title={labels?.[hoveredIndex!] ?? `Point ${hoveredIndex! + 1}`}
          rows={[
            {
              label: 'Value',
              value: formatTooltipValue(hoveredPoint.value),
              color,
              strokeColor: color,
              marker: 'line'
            }
          ]}
          left={hoverCardPosition?.left ?? 12}
          top={hoverCardPosition?.top ?? 12}
        />
      ) : null}
    </div>
  );
}
