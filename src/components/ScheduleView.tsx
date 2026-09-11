import React, { useEffect, useState } from 'react';
import { Learner } from '../types';
import { ScheduleRow2021 } from '../data/schedule2021Real.js';
import { Calendar, BookOpen, CheckCircle2, Users, Search, ChevronRight, Award, Clock, FileText, Check, X } from 'lucide-react';

interface ScheduleViewProps {
  learners: Learner[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ learners }) => {
  const [schedule, setSchedule] = useState<ScheduleRow2021[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedScheduleRow, setSelectedScheduleRow] = useState<ScheduleRow2021 | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>('theoryDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/rosco/api/schedule/matrix').then(r => r.json()),
      fetch('/rosco/api/schedule/attendance').then(r => r.json())
    ])
      .then(([schedData, attData]) => {
        setSchedule(schedData.schedule || []);
        setAttendance(attData.attendance || {});
        if (schedData.schedule && schedData.schedule.length > 0) {
          setSelectedScheduleRow(schedData.schedule[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load schedule & attendance', err);
        setLoading(false);
      });
  }, []);

  const handleUpdateAttendance = async (learnerId: string, schedId: string | number, compType: string, status: string) => {
    try {
      const res = await fetch('/rosco/api/schedule/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId, scheduleId: String(schedId), componentType: compType, status })
      });
      const data = await res.json();
      if (data.success) {
        setAttendance(prev => ({ ...prev, [data.key]: data.status }));
        setSuccessMessage(`Updated attendance for learner ${learnerId}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update attendance', err);
    }
  };

  const handleMarkAllForComponent = async (status: string) => {
    if (!selectedScheduleRow) return;
    for (const learner of learners) {
      await handleUpdateAttendance(learner.id, selectedScheduleRow.id, selectedComponent, status);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading 2021 Schedule & Attendance matrix...</div>;
  }

  const filteredSchedule = schedule.filter(row =>
    row.usId.includes(searchQuery) ||
    row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.usType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const componentLabels: Record<string, { label: string; dateKey: keyof ScheduleRow2021 }> = {
    theoryDate: { label: 'Theory Learner Book', dateKey: 'theoryDate' },
    practicalDate: { label: 'Practical Evaluation', dateKey: 'practicalDate' },
    summativeDate: { label: 'Summative Assessment', dateKey: 'summativeDate' },
    feedbackDate: { label: 'Assessor Feedback', dateKey: 'feedbackDate' },
    workplaceWeek2: { label: 'Workplace Week 2', dateKey: 'workplaceWeek2' },
    workplaceWeek3: { label: 'Workplace Week 3', dateKey: 'workplaceWeek3' },
    workplaceWeek4: { label: 'Workplace Week 4', dateKey: 'workplaceWeek4' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            2021 Programme Schedule & Attendance Matrix
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Course Schedule & Learner Attendance
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            View the 2021 course schedule (23 Unit Standards, 124 credits, 7 scheduled components per US) and assign attendance/participation for all learners accordingly.
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">Schedule Loaded</div>
            <div className="text-sm font-bold font-mono">23 Unit Standards &bull; 124 Credits</div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Schedule Table & Drill down */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              2021 Unit Standards Schedule
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search US or Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0f172a] z-10">
                <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Blk</th>
                  <th className="py-3 px-3">US ID</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3 text-right">Cr</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredSchedule.map((row) => {
                  const isSelected = selectedScheduleRow?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedScheduleRow(row)}
                      className={`hover:bg-white/10 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-600/20 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-xs text-slate-400">{row.monthBlock}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-indigo-300 text-xs">{row.usId}</td>
                      <td className="py-3 px-3 text-white text-xs truncate max-w-[220px]" title={row.title}>
                        {row.title}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-slate-300">{row.credits}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScheduleRow(row);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-indigo-300 hover:bg-white/10'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'View & Attend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Unit Standard Detail & Attendance Assignment */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedScheduleRow ? (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                  Block {selectedScheduleRow.monthBlock} &bull; {selectedScheduleRow.usType} &bull; {selectedScheduleRow.credits} Credits
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  US {selectedScheduleRow.usId}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{selectedScheduleRow.title}</p>
              </div>

              {/* Component Schedule Dates */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Component Dates</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
                  {Object.entries(componentLabels).map(([key, { label, dateKey }]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedComponent(key)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedComponent === key
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="font-mono text-[11px] text-indigo-300">{selectedScheduleRow[dateKey]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Assignment Panel */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Assign Attendance ({componentLabels[selectedComponent]?.label})
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMarkAllForComponent('PRESENT')}
                      className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold hover:bg-emerald-500/30"
                    >
                      All Present
                    </button>
                    <button
                      onClick={() => handleMarkAllForComponent('ABSENT')}
                      className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold hover:bg-rose-500/30"
                    >
                      All Absent
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {learners.map((learner) => {
                    const key = `${learner.id}_${selectedScheduleRow.id}_${selectedComponent}`;
                    const status = attendance[key] || 'PENDING';
                    return (
                      <div key={learner.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium text-white truncate max-w-[140px]">
                            {learner.surname}, {learner.firstName}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">
                            {learner.learnerNo}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateAttendance(learner.id, selectedScheduleRow.id, selectedComponent, 'PRESENT')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                              status === 'PRESENT' ? 'bg-emerald-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleUpdateAttendance(learner.id, selectedScheduleRow.id, selectedComponent, 'ABSENT')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                              status === 'ABSENT' ? 'bg-rose-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleUpdateAttendance(learner.id, selectedScheduleRow.id, selectedComponent, 'EXCUSED')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                              status === 'EXCUSED' ? 'bg-amber-600 text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Select a Unit Standard from the schedule.</div>
          )}
        </div>
      </div>
    </div>
  );
};
