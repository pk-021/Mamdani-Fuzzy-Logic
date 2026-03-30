import React, { useMemo } from 'react';
import { FuzzyVariable, evaluateMembership } from '../fuzzy/fuzzy';
import { InferenceMethod, InferenceResult } from '../core/mamdani';

interface Props {
  variable: FuzzyVariable;
  aggregated: number[];
  centroid: number;
  method: InferenceMethod;
  inferenceResults: InferenceResult[];
  width?: number;
  height?: number;
}

export const AggregationChart: React.FC<Props> = ({ 
  variable, 
  aggregated, 
  centroid, 
  method,
  inferenceResults,
  width = 600, 
  height = 300 
}) => {
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xScale = (x: number) => padding + ((x - variable.min) / (variable.max - variable.min)) * chartWidth;
  const yScale = (y: number) => height - padding - y * chartHeight;

  const resolution = aggregated.length - 1;
  const step = (variable.max - variable.min) / resolution;

  const points: [number, number][] = aggregated.map((y, i) => {
    const x = variable.min + i * step;
    return [xScale(x), yScale(y)];
  });

  const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  // Calculate individual rule paths
  const rulePaths = useMemo(() => {
    return inferenceResults
      .filter(res => res.activation > 0)
      .map(res => {
        const mf = variable.memberships.find(m => m.name === res.consequent);
        if (!mf) return null;

        const rulePoints: [number, number][] = [];
        for (let i = 0; i <= resolution; i++) {
          const x = variable.min + i * step;
          const membership = evaluateMembership(x, mf);
          const implied = method === 'max-min' 
            ? Math.min(res.activation, membership)
            : res.activation * membership;
          rulePoints.push([xScale(x), yScale(implied)]);
        }

        const rulePathData = rulePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
        
        // Find peak for label placement
        const peakIdx = rulePoints.reduce((maxIdx, p, idx, arr) => 
          p[1] < arr[maxIdx][1] ? idx : maxIdx, 0);
        const peakX = variable.min + peakIdx * step;
        const peakY = rulePoints[peakIdx][1];

        return {
          id: res.ruleId,
          path: rulePathData,
          labelPos: { x: xScale(peakX), y: peakY - 10 },
          color: res.consequent === 'Approved' ? '#10B981' : 
                 res.consequent === 'Rejected' ? '#EF4444' : '#F59E0B'
        };
      })
      .filter(Boolean);
  }, [inferenceResults, variable, method, resolution, step, width, height]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Final Aggregated Output</h2>
          <p className="text-sm text-gray-500">Mamdani FIS • {method === 'max-min' ? 'Max-Min' : 'Max-Product'} Inference</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Decision Score</span>
          <span className="text-3xl font-black text-blue-600 font-mono">
            {centroid.toFixed(2)}
          </span>
        </div>
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(y => (
          <g key={y}>
            <line 
              x1={padding} 
              y1={yScale(y)} 
              x2={width - padding} 
              y2={yScale(y)} 
              stroke="#F3F4F6" 
              strokeWidth="1" 
            />
            <text x={padding - 10} y={yScale(y) + 4} fontSize="10" textAnchor="end" fill="#9CA3AF">{y}</text>
          </g>
        ))}

        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="2" />

        {/* Membership Functions (Background) */}
        {variable.memberships.map((mf, i) => {
          const mfPoints: [number, number][] = [];
          const res = 50;
          for (let j = 0; j <= res; j++) {
            const x = variable.min + (j / res) * (variable.max - variable.min);
            const y = evaluateMembership(x, mf);
            mfPoints.push([xScale(x), yScale(y)]);
          }
          const mfPathData = mfPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
          
          return (
            <path
              key={mf.name}
              d={mfPathData}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Individual Rule Contributions */}
        {rulePaths.map((rp: any) => (
          <g key={rp.id}>
            <path
              d={rp.path}
              fill="none"
              stroke={rp.color}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            <rect 
              x={rp.labelPos.x - 12} 
              y={rp.labelPos.y - 14} 
              width="24" 
              height="14" 
              rx="4" 
              fill={rp.color} 
              opacity="0.1"
            />
            <text
              x={rp.labelPos.x}
              y={rp.labelPos.y - 4}
              fontSize="9"
              fontWeight="black"
              textAnchor="middle"
              fill={rp.color}
              className="pointer-events-none"
            >
              {rp.id}
            </text>
          </g>
        ))}

        {/* Aggregated Area */}
        <path
          d={`${pathData} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`}
          fill="url(#grad-blue)"
          fillOpacity="0.8"
          className="transition-all duration-1000"
        />
        <path
          d={pathData}
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-1000"
        />

        {/* Centroid Line */}
        <g className="transition-all duration-1000" style={{ transform: `translateX(0)` }}>
          <line 
            x1={xScale(centroid)} 
            y1={padding - 10} 
            x2={xScale(centroid)} 
            y2={height - padding + 10} 
            stroke="#EF4444" 
            strokeWidth="3" 
            strokeDasharray="6 3"
          />
          <rect 
            x={xScale(centroid) - 30} 
            y={padding - 35} 
            width="60" 
            height="20" 
            rx="4" 
            fill="#EF4444" 
          />
          <text 
            x={xScale(centroid)} 
            y={padding - 21} 
            fontSize="10" 
            fontWeight="bold" 
            textAnchor="middle" 
            fill="white"
          >
            CENTROID
          </text>
        </g>

        {/* X-Axis Labels */}
        {variable.memberships.map(mf => (
          <text 
            key={mf.name}
            x={xScale((mf.params[1] + mf.params[2]) / 2)} 
            y={height - padding + 20} 
            fontSize="10" 
            fontWeight="bold"
            textAnchor="middle" 
            fill="#6B7280"
          >
            {mf.name}
          </text>
        ))}

        <defs>
          <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
