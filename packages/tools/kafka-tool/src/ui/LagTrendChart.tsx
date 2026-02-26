import React, { useMemo, useState } from 'react';
import { LagHistoryEntry } from './consumer-group-store';

interface LagTrendChartProps {
  lagHistory: LagHistoryEntry[];
  isDarkMode?: boolean;
}

/**
 * Task 9.1-9.9: Lag Trend Chart
 * Simple SVG-based line chart showing lag over time
 * No heavy chart library - just pure SVG for lightweight implementation
 */
const LagTrendChart: React.FC<LagTrendChartProps> = ({ lagHistory, isDarkMode = false }) => {
  const [selectedPartition, setSelectedPartition] = useState<string | 'all'>('all');

  // Get unique partitions for filter
  const partitions = useMemo(() => {
    const unique = new Map<string, Set<number>>();
    lagHistory.forEach((entry) => {
      if (!unique.has(entry.topic)) {
        unique.set(entry.topic, new Set());
      }
      unique.get(entry.topic)!.add(entry.partition);
    });
    return unique;
  }, [lagHistory]);

  // Filter and aggregate data
  const chartData = useMemo(() => {
    let filtered = lagHistory;

    if (selectedPartition !== 'all') {
      const [topic, partition] = selectedPartition.split(':');
      const partNum = parseInt(partition, 10);
      filtered = filtered.filter((e) => e.topic === topic && e.partition === partNum);
    }

    // Group by timestamp if aggregating
    const dataMap = new Map<number, { lag: number; count: number }>();
    filtered.forEach((entry) => {
      const time = Math.floor(entry.timestamp / 1000) * 1000; // Group by second
      if (!dataMap.has(time)) {
        dataMap.set(time, { lag: 0, count: 0 });
      }
      const data = dataMap.get(time)!;
      data.lag += entry.lag;
      data.count++;
    });

    return Array.from(dataMap.entries())
      .map(([time, data]) => ({
        time,
        lag: Math.round(data.lag / data.count), // Average lag
      }))
      .sort((a, b) => a.time - b.time);
  }, [lagHistory, selectedPartition]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, current: 0 };
    }

    const lags = chartData.map((d) => d.lag);
    return {
      min: Math.min(...lags),
      max: Math.max(...lags),
      avg: Math.round(lags.reduce((a, b) => a + b, 0) / lags.length),
      current: lags[lags.length - 1],
    };
  }, [chartData]);

  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const timeRange = chartData.length > 1 ? chartData[chartData.length - 1].time - chartData[0].time : 1;
  const maxLag = Math.max(...chartData.map((d) => d.lag), 100);

  const getX = (time: number) => {
    if (timeRange === 0) return padding.left;
    return padding.left + ((time - chartData[0].time) / timeRange) * chartWidth;
  };

  const getY = (lag: number) => padding.top + chartHeight - (lag / maxLag) * chartHeight;

  // Generate path for line chart
  const pathData = chartData
    .map((d, idx) => {
      const x = getX(d.time);
      const y = getY(d.lag);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const filtersStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const selectStyle: React.CSSProperties = {
    padding: '6px 8px',
    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const statsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '12px',
  };

  const statBoxStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '4px',
    textAlign: 'center',
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginBottom: '4px',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const chartContainerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '4px',
    padding: '16px',
    overflowX: 'auto',
  };

  const svgStyle: React.CSSProperties = {
    minWidth: '100%',
  };

  const axisLineStyle = { stroke: isDarkMode ? '#374151' : '#d1d5db', strokeWidth: 1 };
  const gridLineStyle = { stroke: isDarkMode ? '#374151' : '#e5e7eb', strokeWidth: 1, opacity: 0.5 };
  const pathStyle = {
    fill: 'none',
    stroke: isDarkMode ? '#3b82f6' : '#2563eb',
    strokeWidth: 2,
    vectorEffect: 'non-scaling-stroke' as const,
  };
  const textStyle = { fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '12px' };

  return (
    <div style={containerStyle}>
      {/* Filters and Stats */}
      <div>
        <div style={filtersStyle}>
          <label style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
            View:
          </label>
          <select
            value={selectedPartition}
            onChange={(e) => setSelectedPartition(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Partitions (Aggregated)</option>
            {Array.from(partitions.entries()).map(([topic, partSet]) =>
              Array.from(partSet).map((partition) => (
                <option key={`${topic}:${partition}`} value={`${topic}:${partition}`}>
                  {topic}:{partition}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={statsStyle}>
          <div style={statBoxStyle}>
            <div style={statLabelStyle}>当前</div>
            <div style={statValueStyle}>{stats.current}</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statLabelStyle}>平均</div>
            <div style={statValueStyle}>{stats.avg}</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statLabelStyle}>最大</div>
            <div style={statValueStyle}>{stats.max}</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statLabelStyle}>最小</div>
            <div style={statValueStyle}>{stats.min}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div style={chartContainerStyle}>
          <svg width={width} height={height} style={svgStyle}>
            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              {...axisLineStyle}
            />

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight}
              {...axisLineStyle}
            />

            {/* Grid lines (Y) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding.top + chartHeight * (1 - ratio);
              return (
                <g key={`grid-y-${idx}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    {...gridLineStyle}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    {...textStyle}
                  >
                    {Math.round(maxLag * ratio)}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {chartData.length > 1 && (
              <>
                {/* First timestamp */}
                <text
                  x={padding.left}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  {...textStyle}
                  fontSize="10"
                >
                  {new Date(chartData[0].time).toLocaleTimeString()}
                </text>

                {/* Last timestamp */}
                <text
                  x={padding.left + chartWidth}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  {...textStyle}
                  fontSize="10"
                >
                  {new Date(chartData[chartData.length - 1].time).toLocaleTimeString()}
                </text>
              </>
            )}

            {/* Y-axis label */}
            <text
              x={padding.left - 40}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              {...textStyle}
              fontSize="10"
              transform={`rotate(-90 ${padding.left - 40} ${padding.top + chartHeight / 2})`}
            >
              Lag
            </text>

            {/* Line chart */}
            {pathData && <path d={pathData} {...pathStyle} />}

            {/* Data points */}
            {chartData.map((d, idx) => (
              <circle
                key={idx}
                cx={getX(d.time)}
                cy={getY(d.lag)}
                r={3}
                fill={isDarkMode ? '#3b82f6' : '#2563eb'}
              />
            ))}
          </svg>
        </div>
      ) : (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
            borderRadius: '4px',
          }}
        >
          No trend data available
        </div>
      )}
    </div>
  );
};

export default LagTrendChart;
