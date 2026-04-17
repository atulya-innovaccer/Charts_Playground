import { Fragment, useId, useState } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../primitives/Axis';
import { GridLines } from '../primitives/GridLines';
import { chartTokens } from '../theme/tokens';
import { formatNumberCompact } from '../utils/chart';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  AxisConfig,
  BarSeries,
  DistributionSegment,
  FillStyleMode,
  GridConfig,
  LegendPosition,
  LegendMarkerMode,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromBarSeriesWithOverrides,
  createInvertedScale,
  describeBarPath,
  formatTooltipValue,
  getGroupedExtent,
  getEstimatedHoverCardHeight,
  getHoverCardPosition,
  getHoverIndex,
  getStackedExtent,
  getSvgFillDefinition,
  getViewportHoverCardPosition,
  resolveBarDatum,
  resolveFillLegendMarker,
  resolveTickEntries
} from '../chartUtils';

export interface BarChartProps extends ChartHeaderProps {
  title?: string;
  description?: string;
  categories?: string[];
  series?: BarSeries[];
  layout?: 'grouped' | 'stacked';
  mode?: 'vertical' | 'distribution';
  distributionSegments?: DistributionSegment[];
  showScale?: boolean;
  barHeight?: number;
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  legendPosition?: LegendPosition;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  showLegend?: boolean;
  groupGapRatio?: number;
  barGap?: number;
  barCornerRadius?: number;
  showSegmentLabels?: boolean;
  showTotalLabels?: boolean;
  fillStyle?: FillStyleMode;
  legendMarker?: LegendMarkerMode;
  showHoverCard?: boolean;
}

function renderValueLabel(
  x: number,
  y: number,
  value: number,
  color: string,
  anchor: 'start' | 'middle' | 'end' = 'middle'
) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={chartTokens.fontFamily}
      fontSize="12"
      fontWeight="600"
      fill={color}
    >
      {formatNumberCompact(value)}
    </text>
  );
}

export function BarChart({
  title = 'Bar Chart',
  description,
  categories = [],
  series = [],
  layout = 'grouped',
  mode = 'vertical',
  distributionSegments,
  showScale = false,
  barHeight = 24,
  width = 502,
  plotWidth = 414,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  legendPosition = 'top',
  yAxis,
  grid,
  showLegend = true,
  groupGapRatio = chartTokens.chart.barCategoryGapRatio,
  barGap = chartTokens.chart.barGapPx,
  barCornerRadius = chartTokens.radii.bar,
  showSegmentLabels = false,
  showTotalLabels = false,
  fillStyle = 'inherit',
  legendMarker = 'auto',
  showHoverCard = false,
  ...headerProps
}: BarChartProps) {
  const svgId = useId().replace(/:/g, '');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredDistributionIndex, setHoveredDistributionIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  /* ---------- Distribution / horizontal bar mode ---------- */
  if (mode === 'distribution' && distributionSegments?.length) {
    const total = distributionSegments.reduce((sum, seg) => sum + seg.value, 0);
    const distributionLegendItems = distributionSegments.map((seg, i) => ({
      label: seg.label,
      marker: 'solid' as const,
      color:
        seg.fill ??
        chartTokens.categorical.axisPalette[
          i % chartTokens.categorical.axisPalette.length
        ].fill,
      active: true
    }));
    const hoveredSegment =
      hoveredDistributionIndex !== null
        ? distributionSegments[hoveredDistributionIndex]
        : null;
    const hoveredDistributionCardHeight = getEstimatedHoverCardHeight(1, true);
    const hoveredDistributionPosition = mousePos
      ? getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, hoveredDistributionCardHeight)
      : null;

    return (
      <ChartShell
        width={width}
        showCardBackground={showCardBackground}
        showHeader={showHeader}
        showTitle={showTitle}
        title={title}
        description={description}
        legendItems={showLegend ? distributionLegendItems : []}
        legendPosition={legendPosition}
        {...headerProps}
      >
        <div style={{ padding: '4px 0', position: 'relative', width: plotWidth }}>
          <div
            style={{
              display: 'flex',
              height: barHeight,
              borderRadius: '4px',
              overflow: 'hidden',
              width: plotWidth,
              background: chartTokens.neutral.surfaceTint,
              boxShadow: `inset 0 0 0 1px ${chartTokens.neutral.stoneLight}`
            }}
            onMouseLeave={
              showHoverCard ? () => { setHoveredDistributionIndex(null); setMousePos(null); } : undefined
            }
          >
            {distributionSegments.map((seg, i) => {
              const percent = total > 0 ? seg.value / total : 0;
              const color =
                seg.fill ??
                chartTokens.categorical.axisPalette[
                  i % chartTokens.categorical.axisPalette.length
                ].fill;
              return (
                <div
                  key={i}
                  onMouseMove={
                    showHoverCard
                      ? (event: React.MouseEvent) => { setHoveredDistributionIndex(i); setMousePos({ x: event.clientX, y: event.clientY }); }
                      : undefined
                  }
                  style={{
                    width: `${percent * 100}%`,
                    height: '100%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                      i < distributionSegments.length - 1
                        ? 'inset -1px 0 0 rgba(255,255,255,0.35)'
                        : undefined,
                    opacity:
                      hoveredDistributionIndex === null ||
                      hoveredDistributionIndex === i
                        ? 1
                        : 0.78
                  }}
                >
                  {percent > 0.08 && (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#fff',
                        fontFamily: chartTokens.fontFamily
                      }}
                    >
                      {`${Math.round(percent * 100)}%`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {showScale && (
            <div
              style={{
                position: 'relative',
                marginTop: '6px',
                width: plotWidth,
                height: 18
              }}
            >
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
                <span
                  key={`tickmark-${tick}`}
                  style={{
                    position: 'absolute',
                    left: `${tick * 100}%`,
                    top: 0,
                    width: 1,
                    height: 4,
                    background: chartTokens.neutral.stoneLight,
                    transform: 'translateX(-0.5px)'
                  }}
                />
              ))}
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
                <span
                  key={`ticklabel-${tick}`}
                  style={{
                    position: 'absolute',
                    left: `${tick * 100}%`,
                    top: 6,
                    fontSize: '11px',
                    color: chartTokens.text.subtle,
                    fontFamily: chartTokens.fontFamily,
                    transform:
                      tick === 0
                        ? 'translateX(0)'
                        : tick === 1
                          ? 'translateX(-100%)'
                          : 'translateX(-50%)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {`${Math.round(tick * 100)}%`}
                </span>
              ))}
            </div>
          )}
          {showHoverCard && hoveredSegment ? (
            <ChartHoverCard
              title={hoveredSegment.label}
              rows={[
                {
                  label: 'Share of patients',
                  value: `${Math.round((hoveredSegment.value / Math.max(total, 1)) * 100)}%`,
                  color:
                    hoveredSegment.fill ??
                    chartTokens.categorical.axisPalette[
                      hoveredDistributionIndex ?? 0
                    ].fill,
                  marker: 'solid'
                }
              ]}
              totalLabel="Band total"
              totalValue={formatTooltipValue(hoveredSegment.value)}
              left={hoveredDistributionPosition?.left ?? 12}
              top={hoveredDistributionPosition?.top ?? 12}
            />
          ) : null}
        </div>
      </ChartShell>
    );
  }

  const legendItems = showLegend
    ? buildLegendItemsFromBarSeriesWithOverrides(series, fillStyle, legendMarker)
    : [];
  const extent =
    layout === 'stacked'
      ? getStackedExtent(series, categories.length)
      : getGroupedExtent(series);
  const tickEntries = resolveTickEntries(
    yAxis,
    extent.min,
    extent.max,
    grid?.count ?? chartTokens.chart.gridLineCount
  );
  const categoryWidth = plotWidth / Math.max(categories.length, 1);
  const usableCategoryWidth = categoryWidth * (1 - groupGapRatio);
  const groupedBarWidth =
    layout === 'stacked'
      ? usableCategoryWidth
      : Math.max(
          (usableCategoryWidth - barGap * Math.max(series.length - 1, 0)) /
            Math.max(series.length, 1),
          8
        );
  const scaleY = createInvertedScale(extent.min, extent.max, plotHeight);
  const zeroY = scaleY(0);
  const defs: ReactNode[] = [];
  const marks: ReactNode[] = [];
  const labels: ReactNode[] = [];

  categories.forEach((category, categoryIndex) => {
    const slotX = categoryIndex * categoryWidth;
    const startX = slotX + (categoryWidth - usableCategoryWidth) / 2;

    if (layout === 'stacked') {
      let positiveTotal = 0;
      let negativeTotal = 0;
      let topLabelY: number | null = null;
      let topLabelValue = 0;

      series.forEach((item, seriesIndex) => {
        const resolved = resolveBarDatum(
          item.data[categoryIndex] ?? 0,
          item,
          seriesIndex,
          fillStyle
        );
        const startValue = resolved.value >= 0 ? positiveTotal : negativeTotal;
        const endValue = startValue + resolved.value;
        const topValue = Math.max(startValue, endValue);
        const bottomValue = Math.min(startValue, endValue);
        const y = scaleY(topValue);
        const height = Math.max(scaleY(bottomValue) - y, 1);
        const laterSeries = series.slice(seriesIndex + 1);
        const hasLaterPositive = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              fillStyle
            ).value > 0
        );
        const hasLaterNegative = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              fillStyle
            ).value < 0
        );
        const paintId = `bar-${svgId}-${categoryIndex}-${seriesIndex}`;
        const paint = getSvgFillDefinition(
          paintId,
          resolved.fillStyle,
          resolved.fill,
          resolved.stroke
        );

        if (paint.definition) {
          defs.push(paint.definition);
        }

        marks.push(
          <path
            key={`${item.key}-${category}`}
            d={describeBarPath(
              startX + 1,
              y,
              Math.max(usableCategoryWidth - 2, 4),
              height,
              resolved.value >= 0
                ? hasLaterPositive
                  ? 0
                  : barCornerRadius
                : hasLaterNegative
                  ? 0
                  : barCornerRadius,
              resolved.value >= 0 ? 'positive' : 'negative'
            )}
            fill={paint.fill}
            stroke={resolved.stroke}
            strokeWidth={1}
            opacity={resolved.active === false ? 0.4 : 1}
          />
        );

        if ((showSegmentLabels || resolved.showLabel) && height > 24) {
          labels.push(
            <Fragment key={`segment-${item.key}-${category}`}>
              {renderValueLabel(
                startX + usableCategoryWidth / 2,
                resolved.value >= 0 ? y + 14 : y + height - 8,
                resolved.value,
                resolved.fill === chartTokens.neutral.surfaceTint
                  ? chartTokens.text.default
                  : chartTokens.text.inverse
              )}
            </Fragment>
          );
        }

        if (resolved.value >= 0) {
          positiveTotal = endValue;
          topLabelY = y;
          topLabelValue = endValue;
        } else {
          negativeTotal = endValue;
        }
      });

      if (showTotalLabels && topLabelY !== null && topLabelValue > 0) {
        labels.push(
          <Fragment key={`total-${category}`}>
            {renderValueLabel(
              startX + usableCategoryWidth / 2,
              topLabelY - 6,
              topLabelValue,
              chartTokens.text.default
            )}
          </Fragment>
        );
      }

      return;
    }

    series.forEach((item, seriesIndex) => {
      const resolved = resolveBarDatum(
        item.data[categoryIndex] ?? 0,
        item,
        seriesIndex,
        fillStyle
      );
      const x = startX + seriesIndex * (groupedBarWidth + barGap);
      const valueY = scaleY(resolved.value);
      const y = resolved.value >= 0 ? valueY : zeroY;
      const height = Math.max(Math.abs(zeroY - valueY), 1);
      const paintId = `bar-${svgId}-${categoryIndex}-${seriesIndex}`;
      const paint = getSvgFillDefinition(
        paintId,
        resolved.fillStyle,
        resolved.fill,
        resolved.stroke
      );

      if (paint.definition) {
        defs.push(paint.definition);
      }

      marks.push(
        <path
          key={`${item.key}-${category}`}
          d={describeBarPath(
            x,
            y,
            groupedBarWidth,
            height,
            barCornerRadius,
            resolved.value >= 0 ? 'positive' : 'negative'
          )}
          fill={paint.fill}
          stroke={resolved.stroke}
          strokeWidth={1}
          opacity={resolved.active === false ? 0.4 : 1}
        />
      );
    });
  });

  const hoveredRows =
    hoveredIndex !== null
      ? series.map((item, index) => {
          const resolved = resolveBarDatum(
            item.data[hoveredIndex] ?? 0,
            item,
            index,
            fillStyle
          );

          return {
            label: item.label,
            value: formatTooltipValue(resolved.value),
            color: resolved.fill,
            strokeColor: resolved.stroke,
            marker: resolveFillLegendMarker(resolved.fillStyle, legendMarker)
          };
        })
      : [];
  const hoveredStackTotal =
    hoveredIndex !== null && layout === 'stacked'
      ? series.reduce(
          (sum, item, index) =>
            sum +
            resolveBarDatum(
              item.data[hoveredIndex] ?? 0,
              item,
              index,
              fillStyle
            ).value,
          0
        )
      : undefined;
  const hoverCardPosition =
    hoveredIndex !== null && mousePos
      ? getViewportHoverCardPosition(
          mousePos.x,
          mousePos.y,
          196,
          getEstimatedHoverCardHeight(
            hoveredRows.length,
            typeof hoveredStackTotal === 'number'
          )
        )
      : null;

  return (
    <ChartShell
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      legendItems={legendItems}
      legendPosition={legendPosition}
      description={description}
      {...headerProps}
    >
      <div className="cl-cartesian-chart">
        <YAxis
          title={yAxis?.title}
          ticks={tickEntries.map((entry) => entry.label)}
          hideMarkers={yAxis?.hideMarkers}
        />
        <div className="cl-cartesian-chart__middle" style={{ width: plotWidth }}>
          <div className="cl-cartesian-chart__plot" style={{ width: plotWidth }}>
            <div
              style={{
                position: 'absolute',
                inset: '0 0 26px 0'
              }}
            >
              {(grid?.show ?? true) ? (
                <GridLines
                  width={plotWidth}
                  height={plotHeight}
                  count={grid?.count}
                  color={grid?.color}
                />
              ) : null}
              <div
                style={{ position: 'relative', width: plotWidth, height: plotHeight }}
                onMouseMove={
                  showHoverCard
                    ? (event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHoveredIndex(
                          getHoverIndex(
                            event.clientX - rect.left,
                            plotWidth,
                            categories.length
                          )
                        );
                        setMousePos({ x: event.clientX, y: event.clientY });
                      }
                    : undefined
                }
                onMouseLeave={
                  showHoverCard ? () => { setHoveredIndex(null); setMousePos(null); } : undefined
                }
              >
                <svg
                  width={plotWidth}
                  height={plotHeight}
                  viewBox={`0 0 ${plotWidth} ${plotHeight}`}
                  role="img"
                  aria-label={title}
                  style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
                >
                  <defs>{defs}</defs>
                  {showHoverCard && hoveredIndex !== null ? (
                    <rect
                      x={hoveredIndex * categoryWidth}
                      y={0}
                      width={categoryWidth}
                      height={plotHeight}
                      fill={chartTokens.neutral.surfaceTint}
                      opacity={0.4}
                    />
                  ) : null}
                  <line
                    x1="0"
                    y1={zeroY}
                    x2={plotWidth}
                    y2={zeroY}
                    stroke={chartTokens.neutral.stoneLight}
                    strokeWidth="1"
                  />
                  {marks}
                  {labels}
                </svg>
                {showHoverCard && hoveredIndex !== null ? (
                  <ChartHoverCard
                    title={categories[hoveredIndex]}
                    rows={hoveredRows}
                    totalLabel={layout === 'stacked' ? 'Total' : undefined}
                    totalValue={
                      typeof hoveredStackTotal === 'number'
                        ? formatTooltipValue(hoveredStackTotal)
                        : undefined
                    }
                    left={hoverCardPosition?.left ?? 12}
                    top={hoverCardPosition?.top ?? 12}
                  />
                ) : null}
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 26
              }}
            >
              <XAxis labels={categories} />
            </div>
          </div>
        </div>
      </div>
    </ChartShell>
  );
}
