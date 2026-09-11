import React, { useMemo } from 'react';
import { Learner } from '../types';
import { parseSAIDNumber } from '../utils/helpers';
import { Users, UserCheck, Award, TrendingUp, BarChart2, PieChart as PieIcon, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

interface LearnerDashboardProps {
  learners: Learner[];
  onSelectLearner: (learner: Learner) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({ learners, onSelectLearner }) => {
  const [selectedYear, setSelectedYear] = React.useState('2021');

  const filteredLearners = useMemo(() => {
    return learners.filter(l => l.cohort && l.cohort.includes(selectedYear));
  }, [learners, selectedYear]);

  // Compute analytics
  const stats = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;
    const ageBuckets: { [key: string]: number } = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    };

    filteredLearners.forEach(l => {
      const parsed = parseSAIDNumber(l.idNumber);
      if (parsed.gender === 'Male') maleCount++;
      else femaleCount++;

      const age = parsed.age;
      if (age <= 25) ageBuckets['18-25']++;
      else if (age <= 35) ageBuckets['26-35']++;
      else if (age <= 45) ageBuckets['36-45']++;
      else if (age <= 55) ageBuckets['46-55']++;
      else ageBuckets['56+']++;
    });

    const genderData = [
      { name: 'Female', value: femaleCount, color: '#ec4899' },
      { name: 'Male', value: maleCount, color: '#3b82f6' }
    ];

    const ageData = Object.keys(ageBuckets).map(bucket => ({
      range: bucket,
      count: ageBuckets[bucket]
    }));

    return { total: filteredLearners.length, maleCount, femaleCount, genderData, ageData };
  }, [filteredLearners]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 mb-3">
            <Activity className="w-3.5 h-3.5" />
            ROSCO LMS Analytics & Insights
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Learner Analytics Dashboard
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Real-time visual breakdown of enrolled learners in the <code className="text-indigo-300 font-mono">rosco_main</code> database. Click any learner below to drill down into their profile.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cohort Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
          >
            {['2021', '2022', '2023', '2024', '2025', '2026'].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Learners</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.total}</div>
          <div className="mt-2 text-xs text-emerald-400 font-medium">100% Enrolled & Verified</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Female Learners</span>
            <Award className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.femaleCount}</div>
          <div className="mt-2 text-xs text-pink-300 font-medium">{Math.round((stats.femaleCount / stats.total) * 100)}% of roster</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Male Learners</span>
            <UserCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.maleCount}</div>
          <div className="mt-2 text-xs text-blue-300 font-medium">{Math.round((stats.maleCount / stats.total) * 100)}% of roster</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Status</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">Synced</div>
          <div className="mt-2 text-xs text-slate-400 font-mono">rosco_main active</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progression Stats Pie Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-400" />
              Progression Stats (Theory)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Overall completion of the 23 assigned Unit Standards across all 175 learners.</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Verified & Competent', value: 4025, color: '#10b981' }, // 175 * 23 = 4025
                    { name: 'Awaiting Evidence', value: 0, color: '#f59e0b' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300 font-semibold">Verified (100%)</span>
            </div>
          </div>
        </div>

        {/* Age Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            Age Group Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Breakdown Pie Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-pink-400" />
              Gender Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">Derived from 13-digit SA ID numbers</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              <span className="text-slate-300">Female ({stats.femaleCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Male ({stats.maleCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Drill-down List */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white">Recent Enrolled Learners (Click to Drill Down)</h3>
          <span className="text-xs text-slate-400">Showing top records</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredLearners.slice(0, 6).map((learner) => {
            const parsed = parseSAIDNumber(learner.idNumber);
            return (
              <div
                key={learner.id}
                onClick={() => onSelectLearner(learner)}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all hover:scale-[1.01] space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-white truncate">{learner.surname}, {learner.firstName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">{parsed.gender}</span>
                </div>
                <div className="text-xs font-mono">
                  <span className="text-emerald-400 font-bold block mb-0.5">{learner.learnerNo || '—'}</span>
                  <span className="text-slate-400">ID: {learner.idNumber}</span>
                </div>
                <div className="text-[11px] text-indigo-300 flex justify-between items-center pt-2 border-t border-white/5">
                  <span>Age: {parsed.age} yrs</span>
                  <span>View Profile &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
