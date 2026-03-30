import React from 'react';
import { FuzzyVariable, evaluateMembership } from '../fuzzy/fuzzy';

interface Props {
  variable: FuzzyVariable;
  currentValue?: number;
  width?: number;
  height?: number;
}

export const FuzzyVariableChart: React.FC<Props> = ({ 
  variable, 
  currentValue, 
  width = 400, 
  height = 200 
}) => {
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xScale = (x: number) => padding + ((x - variable.min) / (variable.max - variable.min)) * chartWidth;
  const yScale = (y: number) => height - padding - y * chartHeight;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
        <span>{variable.name}</span>
        {currentValue !== undefined && (
          <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
            {currentValue.toLocaleString()}{variable.unit || ''}
          </span>
        )}
      </h3>
      <svg width={width} height={height} className="overflow-visible">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="2" />

        {/* Labels */}
        <text x={padding} y={height - padding + 20} fontSize="10" textAnchor="middle" fill="#9CA3AF">{variable.min}</text>
        <text x={width - padding} y={height - padding + 20} fontSize="10" textAnchor="middle" fill="#9CA3AF">{variable.max}</text>

        {/* Membership Functions */}
        {variable.memberships.map((mf, i) => {
          const points: [number, number][] = [];
          const resolution = 50;
          for (let j = 0; j <= resolution; j++) {
            const x = variable.min + (j / resolution) * (variable.max - variable.min);
            const y = evaluateMembership(x, mf);
            points.push([xScale(x), yScale(y)]);
          }

          const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
          const color = colors[i % colors.length];

          return (
            <g key={mf.name}>
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
              <path
                d={`${pathData} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`}
                fill={color}
                fillOpacity="0.05"
              />
              {/* Label for MF */}
              <text 
                x={xScale((mf.params[1] + mf.params[2]) / 2)} 
                y={yScale(1) - 10} 
                fontSize="9" 
                fontWeight="bold"
                textAnchor="middle" 
                fill={color}
              >
                {mf.name}
              </text>
            </g>
          );
        })}

        {/* Current Value Indicator */}
        {currentValue !== undefined && (
          <g>
            <line 
              x1={xScale(currentValue)} 
              y1={padding} 
              x2={xScale(currentValue)} 
              y2={height - padding} 
              stroke="#1E1B4B" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
            />
            <circle cx={xScale(currentValue)} cy={height - padding} r="4" fill="#1E1B4B" />
          </g>
        )}
      </svg>
    </div>
  );
};
