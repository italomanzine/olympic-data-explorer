import React from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  label?: string;
}

export default function RangeSlider({ min, max, value, onChange, label }: RangeSliderProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
          <span>{label}</span>
          <span className="text-olympic-blue">{value}</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-400">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={4}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-olympic-blue"
        />
        <span className="text-xs font-medium text-slate-400">{max}</span>
      </div>
    </div>
  );
}
