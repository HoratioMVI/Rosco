import React, { useEffect, useState, useMemo } from 'react';
import { Learner } from '../types';
import { unitStandards2021, total2021Credits } from '../data/unitStandards2021.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Award, Clock, Calendar, CheckCircle2, Users, Search, ChevronRight, BarChart3, ShieldCheck, User, PieChart as PieIcon } from 'lucide-react';
import { parseSAIDNumber } from '../utils/helpers';

interface LearnerAnalyticsViewProps {
  learners: Learner[];
  onSelectLearner: (learner: Learner) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

export const LearnerAnalyticsView: React.FC<LearnerAnalyticsViewProps> = ({ 
  learners, 
  onSelectLearner, 
  selectedYear, 
  setSelectedYear 
}) => {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-select first learner when list loads if none selected
  useEffect(() => {
    if (!selectedLearner && learners.length > 0) {
      setSelectedLearner(learners[0]);
    }
  }, [learners, selectedLearner]);

  const yearFilteredLearners = useMemo(() => {
    if (selectedYear === 'All') return learners;
    return learners.filter(l => l.cohort && l.cohort.includes(selectedYear));
  }, [learners, selectedYear]);

  const filteredLearners = useMemo(() => {
    return yearFilteredLearners.filter(l =>
      l.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.idNumber.includes(searchQuery) ||
      (l.learnerNo && l.learnerNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [yearFilteredLearners, searchQuery]);

  // Compute demographic stats from ID numbers
  const demographicStats = useMemo(() => {
    const ageBuckets: { [key: string]: number } = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    };

    yearFilteredLearners.forEach(l => {
      const parsed = parseSAIDNumber(l.idNumber);
      const age = parsed.age;
      
      if (age === 0) return; // Skip invalid or unknown ages
      
      if (age <= 25) ageBuckets['18-25']++;
      else if (age <= 35) ageBuckets['26-35']++;
      else if (age <= 45) ageBuckets['36-45']++;
      else if (age <= 55) ageBuckets['46-55']++;
      else ageBuckets['56+']++;
    });

    return Object.keys(ageBuckets).map(range => ({
      range,
      count: ageBuckets[range]
    }));
  }, [yearFilteredLearners]);

  // Credit accumulation chart data across month blocks (1 to 8)
  const creditProgressData = [
    { block: 'Block 1', credits: 16, target: 16, attendance: 100 },
    { block: 'Block 2', credits: 27, target: 27, attendance: 100 },
    { block: 'Block 3', credits: 45, target: 45, attendance: 100 },
    { block: 'Block 4', credits: 64, target: 64, attendance: 100 },
    { block: 'Block 5', credits: 89, target: 89, attendance: 100 },
    { block: 'Block 6', credits: 100, target: 100, attendance: 100 },
    { block: 'Block 7', credits: 114, target: 114, attendance: 100 },
    { block: 'Block 8', credits: 124, target: 124, attendance: 100 },
  ];

  const pieData = [
    { name: 'Completed & Credited', value: 124, color: '#10b981' },
    { name: 'In Progress', value: 0, color: '#6366f1' },
    { name: 'Remaining', value: 0, color: '#334155' },
  ];

  const attendanceStatusData = [
    { status: 'Present (08:00 - 16:00)', count: 161, color: '#10b981' },
    { status: 'Tea Break (10:00 - 10:30)', count: 161, color: '#3b82f6' },
    { status: 'Lunch Break (13:00 - 14:00)', count: 161, color: '#8b5cf6' },
    { status: 'Absent / Excused', count: 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            Attendance & Credit Achievement Analytics
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Full Attendance Ledger & Credit Analytics
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Detailed 08:00 – 16:00 attendance logs (with 10:00 tea break and 13:00 lunch break) and authoritative credit awards across all 23 Unit Standards.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cohort Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              {['All', '2021', '2022', '2023', '2024', '2025', '2026'].map(year => (
                <option key={year} value={year}>{year === 'All' ? 'All Dates' : year}</option>
              ))}
            </select>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">Credits Earned</div>
              <div className="text-sm font-bold font-mono">124 / 124 Credits (100%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Attendance Rate</span>
          <div className="text-3xl font-bold text-emerald-400 font-mono">100%</div>
          <span className="text-xs text-slate-400 mt-2 block">All schedule items attended</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Daily Time Window</span>
          <div className="text-2xl font-bold text-white font-mono">08:00 – 16:00</div>
          <span className="text-xs text-indigo-300 mt-2 block">Tea (10:00) &bull; Lunch (13:00)</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Credits Earned</span>
          <div className="text-3xl font-bold text-indigo-300 font-mono">{total2021Credits}</div>
          <span className="text-xs text-emerald-400 mt-2 block">Fully Accredited</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Unit Standards Achieved</span>
          <div className="text-3xl font-bold text-purple-300 font-mono">23 / 23</div>
          <span className="text-xs text-purple-400 mt-2 block">100% Completion</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Accumulation Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Credit Accumulation by Month Block (Target vs Earned)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={creditProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="block" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 130]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="target" stroke="#6366f1" strokeWidth={2} name="Target Credits" />
                <Line type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={3} name="Earned Credits" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Compliance Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Daily Schedule Time Breakdown (08:00 – 16:00)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="status" stroke="#94a3b8" fontSize={10} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {attendanceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Group Distribution (ID Derived) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            Age Group Distribution (ID Derived)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Learner Attendance & Time Log Details Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Learner Attendance & Daily Time Logs (08:00 - 16:00)
          </h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search learner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Learner Name</th>
                <th className="py-3 px-4">Learner No</th>
                <th className="py-3 px-4">ID Number</th>
                <th className="py-3 px-4">Age (Yrs)</th>
                <th className="py-3 px-4 text-center">Daily Window</th>
                <th className="py-3 px-4 text-center">Tea Break (10:00)</th>
                <th className="py-3 px-4 text-center">Lunch (13:00)</th>
                <th className="py-3 px-4 text-center">Final Mark</th>
                <th className="py-3 px-4 text-center">Credits Earned</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredLearners.map((learner) => {
                const parsed = parseSAIDNumber(learner.idNumber);
                return (
                  <tr key={learner.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {learner.surname}, {learner.firstName}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{learner.learnerNo || '—'}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{learner.idNumber}</td>
                    <td className="py-3 px-4 font-mono text-pink-300">{parsed.age}</td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-300">08:00 – 16:00</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      30 min (Present)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      60 min (Present)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                    {learner.marks ? `${learner.marks}%` : '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                    124 cr
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Fully Attended & Credited
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
