import React, { useEffect, useState } from 'react';
import { DailyAttendanceRecord } from '../data/dailyAttendance2021';
import { Learner } from '../types';
import { Calendar, Search, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface DailyAttendanceRosterProps {
  learners: Learner[];
}

export const DailyAttendanceRoster: React.FC<DailyAttendanceRosterProps> = ({ learners }) => {
  const [records, setRecords] = useState<DailyAttendanceRecord[]>([]);
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLearnerId, setSelectedLearnerId] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/rosco/api/daily-attendance').then(r => r.json()),
      fetch('/rosco/api/training-schedules').then(r => r.json())
    ])
      .then(([attData, schedData]) => {
        setRecords(attData.records || []);
        setDbSchedules(schedData.schedules || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load daily attendance & schedules', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading Daily Attendance Roster...</div>;
  }

  const filteredRecords = records.filter(r => {
    // Only show records for learners that are in the current filtered list (year-specific)
    const isLearnerInCurrentYear = learners.some(l => l.id === r.learnerId);
    if (!isLearnerInCurrentYear) return false;

    const matchesLearner = selectedLearnerId === 'ALL' || r.learnerId === selectedLearnerId;
    const matchesSearch =
      r.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.learnerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.usId.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesLearner && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Daily Attendance Roster
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Daily Log & Catch-up Roster
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Detailed daily attendance tracking per learner. Shows 63% perfect attendance vs absences (Sick, Family Duty) and subsequent catch-up sessions.
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">Total Records</div>
            <div className="text-sm font-bold font-mono">{records.length} Logs</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
          <div className="relative w-full md:w-64 lg:w-72">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={selectedLearnerId}
              onChange={(e) => setSelectedLearnerId(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="ALL">All Learners</option>
              {learners.map(l => (
                <option key={l.id} value={l.id}>{l.surname}, {l.firstName}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-64 lg:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by learner, learner No, or US ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Catch-up">Catch-up</option>
          </select>
          <div className="text-xs text-slate-400 font-mono ml-4">
            Showing {filteredRecords.length} records
          </div>
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#0f172a] z-10">
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">Unit Standard</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-1/4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.slice(0, 150).map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-indigo-300 font-semibold">{rec.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{rec.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{rec.learnerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rec.learnerNo}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-indigo-300 font-semibold">{rec.usId}</div>
                    <div className="text-slate-300 truncate max-w-[200px]" title={rec.unitStandardTitle}>
                      {(() => {
                        const match = dbSchedules.find(s => s.date === rec.date && s.unitStandardId === rec.usId);
                        return match ? `${match.activity} (Block ${match.month})` : rec.unitStandardTitle;
                      })()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      rec.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      rec.status === 'Absent' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {rec.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                      {rec.status === 'Absent' && <XCircle className="w-3 h-3" />}
                      {rec.status === 'Catch-up' && <Clock className="w-3 h-3" />}
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {rec.reason ? (
                      <div className="font-medium text-amber-300">{rec.reason}</div>
                    ) : null}
                    {((rec as any).loginTime || (rec as any).logoutTime) && (
                      <div className="font-mono text-cyan-300 mt-1 mb-1">
                        In: {(rec as any).loginTime || '--:--'} | Out: {(rec as any).logoutTime || '--:--'}
                      </div>
                    )}
                    {(rec as any).activityLog && (
                      <div className="whitespace-pre-wrap leading-relaxed mt-1 opacity-80">
                        {(rec as any).activityLog}
                      </div>
                    )}
                    {!rec.reason && !(rec as any).activityLog && '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white/5 border-t border-white/10 text-xs text-slate-400 flex justify-between items-center">
          <span>Displaying first 150 records for performance. Use filters to narrow down.</span>
        </div>
      </div>
    </div>
  );
};
