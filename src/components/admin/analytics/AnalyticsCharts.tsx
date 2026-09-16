import React, { useState, useRef } from 'react';

// ===========================================================================
// 1. AREA & SPLINE CHART (INTERACTIVE MULTI-SERIES WITH CROSSHAIR)
// ===========================================================================
export interface AreaSplinePoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface AreaSplineChartProps {
  data: AreaSplinePoint[];
  height?: number;
  formatValue?: (val: number) => string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryName?: string;
  secondaryName?: string;
  showSecondary?: boolean;
}

export const AreaSplineChart: React.FC<AreaSplineChartProps> = ({
  data,
  height = 240,
  formatValue = (v) => `${v}`,
  primaryColor = '#38bdf8',
  secondaryColor = '#f87171',
  primaryName = 'Primary',
  secondaryName = 'Secondary',
  showSecondary = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data</div>;
  }

  const svgWidth = 600;
  const svgHeight = height;
  const padding = { top: 20, right: 24, bottom: 36, left: 54 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Compute scale maximum
  let maxVal = Math.max(...data.map((d) => d.value));
  if (showSecondary) {
    maxVal = Math.max(maxVal, ...data.map((d) => d.secondaryValue || 0));
  }
  maxVal = maxVal <= 0 ? 100 : maxVal * 1.15; // 15% headroom

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (data.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - (val / maxVal) * graphHeight;
  };

  // Generate cubic Bezier curve path
  const generateSplinePath = (vals: number[]) => {
    const points = vals.map((v, i) => ({ x: getX(i), y: getY(v) }));
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = Math.min(padding.top + graphHeight, Math.max(padding.top, p1.y + (p2.y - p0.y) / 6));
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = Math.min(padding.top + graphHeight, Math.max(padding.top, p2.y - (p3.y - p1.y) / 6));
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const primaryValues = data.map((d) => d.value);
  const primaryLinePath = generateSplinePath(primaryValues);
  const primaryAreaPath = `${primaryLinePath} L ${getX(data.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`;

  let secondaryLinePath = '';
  let secondaryAreaPath = '';
  if (showSecondary) {
    const secondaryValues = data.map((d) => d.secondaryValue || 0);
    secondaryLinePath = generateSplinePath(secondaryValues);
    secondaryAreaPath = `${secondaryLinePath} L ${getX(data.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`;
  }

  // Grid tick counts
  const yTicks = [0, 0.33, 0.66, 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - (padding.left / svgWidth) * rect.width) / ((graphWidth / svgWidth) * rect.width)));
    const idx = Math.round(ratio * (data.length - 1));
    setHoverIndex(idx);
  };

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.32" />
            <stop offset="65%" stopColor={primaryColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="secondaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.0" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((ratio, i) => {
          const y = padding.top + graphHeight * (1 - ratio);
          const val = maxVal * ratio;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + graphWidth}
                y2={y}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${Math.round(val / 1000)}k` : Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Areas */}
        <path d={primaryAreaPath} fill="url(#primaryAreaGrad)" />
        {showSecondary && <path d={secondaryAreaPath} fill="url(#secondaryAreaGrad)" />}

        {/* Lines */}
        {showSecondary && (
          <path
            d={secondaryLinePath}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <path
          d={primaryLinePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowFilter)"
        />

        {/* X-Axis labels */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <text
              key={i}
              x={x}
              y={padding.top + graphHeight + 20}
              fill="#64748b"
              fontSize="11"
              fontWeight="500"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {d.label}
            </text>
          );
        })}

        {/* Hover Crosshair & Dots */}
        {hoverIndex !== null && activePoint && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + graphHeight}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Primary Dot */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(activePoint.value)}
              r="5"
              fill={primaryColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {showSecondary && activePoint.secondaryValue !== undefined && (
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activePoint.secondaryValue)}
                r="4.5"
                fill={secondaryColor}
                stroke="#0f172a"
                strokeWidth="2"
              />
            )}
          </g>
        )}
      </svg>

      {/* Floating Tooltip Card */}
      {hoverIndex !== null && activePoint && (
        <div
          style={{
            position: 'absolute',
            left: `${((getX(hoverIndex) / svgWidth) * 100).toFixed(1)}%`,
            top: '8px',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '8px 12px',
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
            {activePoint.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryColor }} />
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{primaryName}:</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>{formatValue(activePoint.value)}</span>
          </div>
          {showSecondary && activePoint.secondaryValue !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', marginTop: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: secondaryColor }} />
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{secondaryName}:</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{formatValue(activePoint.secondaryValue)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ===========================================================================
// 2. MULTI-SEGMENT DONUT CHART (INTERACTIVE WITH CENTER VALUE)
// ===========================================================================
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  centerValue?: string;
  centerLabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 200,
  centerValue = '',
  centerLabel = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Base background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const fraction = total > 0 ? seg.value / total : 0;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += fraction;

            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Text (Neutral labels, crisp white number) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
            padding: '10px',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            {activeSegment ? activeSegment.label : centerLabel}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {activeSegment
              ? `${activeSegment.percentage ?? Math.round((activeSegment.value / Math.max(total, 1)) * 100)}%`
              : centerValue}
          </span>
        </div>
      </div>

      {/* Legend with Color Swatches */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px 16px',
          marginTop: '16px',
          width: '100%',
        }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 6px',
              borderRadius: '4px',
              background: hoveredIdx === i ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{seg.label}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 700 }}>
              {seg.percentage ?? Math.round((seg.value / Math.max(total, 1)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ===========================================================================
// 3. RADAR / SPIDER WEB CHART (TRAFFIC DOMAIN MASTERY)
// ===========================================================================
export interface RadarCategory {
  name: string;
  score: number; // 0 - 100
  questions?: number;
}

interface RadarSpiderChartProps {
  categories: RadarCategory[];
  size?: number;
  polygonColor?: string;
  fillColor?: string;
}

export const RadarSpiderChart: React.FC<RadarSpiderChartProps> = ({
  categories,
  polygonColor = '#38bdf8',
  fillColor = 'rgba(56, 189, 248, 0.24)',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cx = 175;
  const cy = 145;
  const radius = 88;
  const total = categories.length;

  if (total < 3) return null;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, ratio: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const x = cx + radius * ratio * Math.cos(angle);
    const y = cy + radius * ratio * Math.sin(angle);
    return { x, y };
  };

  // Build grid polygon paths
  const gridPolygons = levels.map((lvl) => {
    return categories
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // Build score polygon points
  const scorePoints = categories.map((cat, i) => {
    const ratio = Math.max(0, Math.min(1, cat.score / 100));
    const { x, y } = getCoordinates(i, ratio);
    return { x, y, cat, index: i };
  });

  const scorePolygonPath = scorePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '350px', height: 'auto', margin: '0 auto' }}>
      <svg viewBox="0 0 350 290" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={polygonColor} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Concentric grid rings */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray={i === levels.length - 1 ? 'none' : '3 3'}
          />
        ))}

        {/* Radial Axis Spokes */}
        {categories.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={scorePolygonPath}
          fill={fillColor}
          stroke={polygonColor}
          strokeWidth="2.4"
          filter="url(#radarGlow)"
        />

        {/* Vertex interactive dots */}
        {scorePoints.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill={polygonColor}
                stroke="#0f172a"
                strokeWidth="2"
                style={{ transition: 'all 0.15s ease' }}
              />
            </g>
          );
        })}

        {/* Outer category labels */}
        {categories.map((cat, i) => {
          const { x, y } = getCoordinates(i, 1.28);
          const isHovered = hoveredIdx === i;
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (x > cx + 15) textAnchor = 'start';
          else if (x < cx - 15) textAnchor = 'end';

          return (
            <text
              key={i}
              x={x}
              y={y + 4}
              fill={isHovered ? '#ffffff' : '#94a3b8'}
              fontSize="9"
              fontWeight={isHovered ? '700' : '500'}
              textAnchor={textAnchor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {cat.name}
            </text>
          );
        })}
      </svg>

      {/* Floating Vertex Tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(15, 23, 42, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
            padding: '6px 10px',
            pointerEvents: 'none',
            boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            {categories[hoveredIdx].name}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {categories[hoveredIdx].score}% Pass Rate
          </div>
        </div>
      )}
    </div>
  );
};


// ===========================================================================
// 4. FUNNEL FLOW CHART (CONNECTED TRAPEZOID TIERS)
// ===========================================================================
export interface FunnelStageData {
  stage: string;
  count: number;
  rate: number;
  description?: string;
  color: string;
}

interface FunnelFlowChartProps {
  stages: FunnelStageData[];
}

export const FunnelFlowChart: React.FC<FunnelFlowChartProps> = ({ stages }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!stages || stages.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {stages.map((stage, i) => {
        const isHovered = hoveredIndex === i;
        const nextStage = stages[i + 1];
        const dropoff = nextStage ? Math.round(((stage.count - nextStage.count) / Math.max(stage.count, 1)) * 100) : 0;

        return (
          <React.Fragment key={i}>
            {/* Stage Container */}
            <div
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                position: 'relative',
                borderRadius: '8px',
                padding: '12px 16px',
                background: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Colored progress bar fill inside the card */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: `${stage.rate}%`,
                  background: `linear-gradient(90deg, ${stage.color}18, ${stage.color}40)`,
                  borderRight: `3px solid ${stage.color}`,
                  pointerEvents: 'none',
                  transition: 'width 0.4s ease',
                }}
              />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: stage.color,
                      color: '#0f172a',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>
                      {stage.stage}
                    </div>
                    {stage.description && (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{stage.description}</div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    {new Intl.NumberFormat('en-US').format(stage.count)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {stage.rate}% conversion
                  </div>
                </div>
              </div>
            </div>

            {/* Drop-off bridge connector */}
            {nextStage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px 0',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  &darr; -{dropoff}% drop-off
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


// ===========================================================================
// 5. GROUPED COLUMN BAR CHART (FOR BOOKINGS OR STATUS COMPARISONS)
// ===========================================================================
export interface BarItem {
  label: string;
  value: number;
  color: string;
  maxValue?: number;
}

interface GroupedBarChartProps {
  bars: BarItem[];
  height?: number;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ bars, height = 180 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...bars.map((b) => b.maxValue || b.value), 1);

  return (
    <div style={{ width: '100%', height, display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 10px 24px' }}>
      {bars.map((bar, i) => {
        const heightPct = Math.max(8, (bar.value / maxVal) * 100);
        const isHovered = hoveredIdx === i;

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {/* Value on top of bar in clean white */}
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '6px',
                opacity: isHovered ? 1 : 0.85,
                transition: 'opacity 0.15s ease',
              }}
            >
              {bar.value}
            </span>

            {/* Vertical Bar Capsule */}
            <div
              style={{
                width: '100%',
                maxWidth: '44px',
                height: `${heightPct}%`,
                borderRadius: '6px 6px 2px 2px',
                background: `linear-gradient(180deg, ${bar.color}, ${bar.color}90)`,
                boxShadow: isHovered ? `0 0 12px ${bar.color}60` : 'none',
                transition: 'all 0.2s ease',
              }}
            />

            {/* Label below in neutral slate */}
            <span
              style={{
                position: 'absolute',
                bottom: '-22px',
                fontSize: '0.72rem',
                color: isHovered ? '#ffffff' : '#94a3b8',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};


// ===========================================================================
// 6. SEMI-CIRCLE GAUGE (RADIAL PASS RATE & VELOCITY)
// ===========================================================================
interface SemiCircleGaugeProps {
  value: number; // 0 - 100
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({
  value,
  label,
  sublabel = '',
  color = '#38bdf8',
  size = 180,
}) => {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(100, value)) / 100;
  const strokeDashoffset = arcLength * (1 - progressRatio);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size / 2 + 10, overflow: 'hidden' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center Numbers */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
            {value}%
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginTop: '8px' }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{sublabel}</div>
      )}
    </div>
  );
};
