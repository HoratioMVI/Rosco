import React from 'react';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({ selectedYear, onYearChange }) => {
  const years = ['All', '2021', '2022', '2023', '2024', '2025', '2026'];

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
      <Calendar className="w-4 h-4 text-indigo-400" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1 hidden sm:inline">Year</span>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="bg-transparent border-none text-sm font-bold text-white focus:ring-0 cursor-pointer outline-none pr-6"
      >
        {years.map((year) => (
          <option key={year} value={year} className="bg-[#0f172a] text-white">
            {year === 'All' ? 'All Dates' : year}
          </option>
        ))}
      </select>
    </div>
  );
};
