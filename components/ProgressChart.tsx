import React from 'react';
import { Assessment } from '../types';

interface ProgressChartProps {
  assessments: Assessment[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ assessments }) => {
  const data = assessments.slice().reverse(); // Oldest to newest

  if (data.length < 2) return null;

  const PADDING = { top: 20, right: 20, bottom: 40, left: 40 };
  const WIDTH = 500;
  const HEIGHT = 250;

  const weightValues = data.map(d => d.data.peso);
  const fatValues = data.map(d => d.data.percentualGordura);
  const muscleValues = data.map(d => d.data.massaMuscular);

  const allValues = [...weightValues, ...fatValues, ...muscleValues];
  const yMin = Math.min(...allValues) * 0.95;
  const yMax = Math.max(...allValues) * 1.05;
  const xMin = 0;
  const xMax = data.length - 1;

  const toSvgX = (x: number) => PADDING.left + (x / (xMax || 1)) * (WIDTH - PADDING.left - PADDING.right);
  const toSvgY = (y: number) => HEIGHT - PADDING.bottom - ((y - yMin) / (yMax - yMin || 1)) * (HEIGHT - PADDING.top - PADDING.bottom);

  const createPath = (values: number[], color: string) => (
    <path
      d={`M ${values.map((val, i) => `${toSvgX(i)} ${toSvgY(val)}`).join(' L ')}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  
  const yAxisLabels = () => {
      const labels = [];
      const tickCount = 5;
      for (let i = 0; i < tickCount; i++) {
          const value = yMin + (i / (tickCount - 1)) * (yMax - yMin);
          labels.push(
              <g key={i}>
                <text x={PADDING.left - 8} y={toSvgY(value) + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
                    {value.toFixed(0)}
                </text>
                <line x1={PADDING.left} y1={toSvgY(value)} x2={WIDTH - PADDING.right} y2={toSvgY(value)} stroke="#4b5563" strokeDasharray="2,2"/>
              </g>
          )
      }
      return labels;
  }
  
  const xAxisLabels = () => {
      return data.map((d, i) => {
          if(data.length > 5 && i % Math.floor(data.length / 5) !== 0 && i !== data.length-1) return null;
          return (
             <text key={d.id} x={toSvgX(i)} y={HEIGHT - PADDING.bottom + 15} textAnchor="middle" fill="#9ca3af" fontSize="10">
                 {new Date(d.date).toLocaleDateString('pt-BR', {month: 'short', day: 'numeric'})}
             </text>
          )
      });
  }
  
  const colors = { peso: '#34d399', gordura: '#f59e0b', musculo: '#60a5fa' };

  return (
      <div className="w-full">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
            {yAxisLabels()}
            {xAxisLabels()}
            {createPath(weightValues, colors.peso)}
            {createPath(fatValues, colors.gordura)}
            {createPath(muscleValues, colors.musculo)}
        </svg>
        <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors.peso}}></div>
                <span className="text-gray-300">Peso (kg)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors.gordura}}></div>
                <span className="text-gray-300">Gordura (%)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors.musculo}}></div>
                <span className="text-gray-300">Músculo (kg)</span>
            </div>
        </div>
      </div>
  );
};

export default ProgressChart;
