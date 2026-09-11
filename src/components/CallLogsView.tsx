import React, { useState, useEffect } from 'react';
import { Learner } from '../types';
import { FileText, Search, User } from 'lucide-react';

export const CallLogsView: React.FC<{ learners: Learner[] }> = ({ learners }) => {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(learners[0] || null);
  const [learnerSearch, setLearnerSearch] = useState('');
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLearner) return;
    setLoading(true);
    fetch(`/rosco/api/daily-attendance?learnerId=${selectedLearner.id}`)
      .then(r => r.json())
      .then(data => {
        setCallLogs(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedLearner]);

  const filteredLearners = learners.filter(l =>
    l.surname.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.firstName.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.idNumber.includes(learnerSearch)
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <FileText className="w-6 h-6 text-cyan-400" />
          Daily Call Logs & Activity
        </h2>
        <p className="text-slate-300 text-sm max-w-2xl">
          Detailed time logging and schedule adherence breakdown per learner. Shows specific login/logout times and the structured daily activities spanning theory, practicals, and summatives.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Learner List */}
        <div className="lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col h-[600px]">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners..."
                value={learnerSearch}
                onChange={(e) => setLearnerSearch(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredLearners.map(learner => (
                <button
                  key={learner.id}
                  onClick={() => setSelectedLearner(learner)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                    selectedLearner?.id === learner.id
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-white shadow-md'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{learner.surname}, {learner.firstName}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">{learner.learnerNo || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{learner.idNumber}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Call Logs */}
        <div className="flex-1 space-y-4">
          {selectedLearner ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
              <div className="border-b border-white/10 pb-4 mb-4 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-semibold">
                    Learner Call Logs & Timesheets
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedLearner.surname}, {selectedLearner.firstName} {selectedLearner.secondName}
                  </h3>
                  <div className="text-sm font-mono text-emerald-400 font-bold mt-1">
                    Learner No: {selectedLearner.learnerNo || '—'}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">Loading call logs...</div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {callLogs.map(log => {
                    const statusColor = log.status === 'Present' ? 'text-emerald-400' : (log.status === 'Catch-up' ? 'text-amber-400' : 'text-rose-400');
                    return (
                      <div key={log.id} className="bg-[#0f172a] rounded-xl border border-white/5 p-4 flex flex-col md:flex-row md:items-start gap-4 transition-all hover:border-white/10">
                        <div className="shrink-0 w-32">
                          <div className="font-mono text-white font-bold">{log.date}</div>
                          <div className={`text-xs font-semibold uppercase tracking-wider mt-1 ${statusColor}`}>{log.status}</div>
                          
                          {(log.loginTime || log.logoutTime) && (
                            <div className="mt-3 space-y-1">
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Times</div>
                              <div className="text-xs text-slate-300 font-mono">In: {log.loginTime || '--:--'}</div>
                              <div className="text-xs text-slate-300 font-mono">Out: {log.logoutTime || '--:--'}</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                          <div className="text-xs font-semibold text-slate-400 mb-1">UNIT STANDARD</div>
                          <div className="text-sm text-white font-medium mb-3">
                            <span className="text-cyan-400 font-mono mr-2">{log.usId}</span>
                            {log.unitStandardTitle}
                          </div>
                          
                          {log.activityLog && (
                            <>
                              <div className="text-xs font-semibold text-slate-400 mb-1">ACTIVITY & CALL LOG</div>
                              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg font-mono">
                                {log.activityLog}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {callLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No call logs recorded for this learner.</div>
                  )}
                </div>
              )}
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-slate-500 bg-white/5 border border-white/10 rounded-2xl h-[600px]">
               Select a learner to view their detailed call logs
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
