import React, { useEffect, useState } from 'react';
import { Learner } from '../types';
import { unitStandards2021, total2021Credits } from '../data/unitStandards2021.js';
import { unitStandardRequirements2021 } from '../data/unitStandardRequirements2021.js';
import { Award, CheckCircle2, ShieldCheck, Layers, FileText, ChevronRight, User, Search, BookOpen, Clock, AlertTriangle, Check } from 'lucide-react';

interface ProgressPortalViewProps {
  learners: Learner[];
  onSelectLearner: (learner: Learner) => void;
}

export const ProgressPortalView: React.FC<ProgressPortalViewProps> = ({ learners, onSelectLearner }) => {
  const [selectedUS, setSelectedUS] = useState(unitStandards2021[0]);
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'requirements' | 'ledger'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingLearner, setInspectingLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);

  // Store completed unit standard details per learner: Record<learnerId, { usId: string, title: string, level: number, credits: number }[]>
  const [completedUSMap, setCompletedUSMap] = useState<Record<string, { usId: string, title: string, level: number, credits: number }[]>>({});

  useEffect(() => {
    fetch('/rosco/api/learner-progress')
      .then(res => res.json())
      .then(data => {
        if (data.progressMap) {
          setCompletedUSMap(data.progressMap);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load learner progress', err);
        setLoading(false);
      });
  }, []);

  const filteredLearners = learners.filter(l =>
    l.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.idNumber.includes(searchQuery) ||
    (l.learnerNo && l.learnerNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentUSRequirements = unitStandardRequirements2021.filter(r => r.unitStandardId === selectedUS.id);

  if (loading) {
    return <div className="text-center py-24 text-slate-400">Loading authoritative credit ledger & progress...</div>;
  }

  const toggleUSCompletion = (learnerId: string, usId: number) => {
    const usIdStr = String(usId);
    const completedItems = completedUSMap[learnerId] || [];
    const isCurrentlyCompleted = completedItems.some(item => item.usId === usIdStr);
    const newCompleted = !isCurrentlyCompleted;

    setCompletedUSMap(prev => {
      const current = prev[learnerId] || [];
      const updated = newCompleted 
        ? [...current, { usId: usIdStr, title: '', level: 0, credits: 0 }] 
        : current.filter(item => item.usId !== usIdStr);
      return { ...prev, [learnerId]: updated };
    });

    fetch('/rosco/api/learner-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId, unitStandardId: usId, completed: newCompleted })
    }).catch(err => console.error('Failed to update progress', err));
  };

  const markAllCompleted = (learnerId: string) => {
    const usIds = unitStandards2021.map(us => String(us.id));
    setCompletedUSMap(prev => ({
      ...prev,
      [learnerId]: usIds
    }));

    fetch('/rosco/api/learner-progress/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId, unitStandardIds: usIds.map(Number), completed: true })
    }).catch(err => console.error('Failed to bulk update progress', err));
  };

  const markAllIncomplete = (learnerId: string) => {
    setCompletedUSMap(prev => ({
      ...prev,
      [learnerId]: []
    }));

    fetch('/rosco/api/learner-progress/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId, unitStandardIds: unitStandards2021.map(us => us.id), completed: false })
    }).catch(err => console.error('Failed to bulk reset progress', err));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 mb-3">
            <Award className="w-3.5 h-3.5" />
            Admin Credit & Progress Portal
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Unit Standard Progress & Credit Ledger
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Dynamic calculation: Total Credits Available = <span className="text-indigo-300 font-mono font-bold">{total2021Credits}</span>. Credits Earned updates as learners complete unit standards, and Remaining = Available - Earned.
          </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'summary' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Learner Summary View
          </button>
          <button
            onClick={() => setActiveSubTab('requirements')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'requirements' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            US Requirements (161)
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'ledger' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Credit Ledger Audit
          </button>
        </div>
      </div>

      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          {/* Search toolbar */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners for credit breakdown..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-300">
              Showing {filteredLearners.length} Enrolled Learners &bull; Total Available Credits: <span className="text-indigo-300 font-mono font-bold">{total2021Credits}</span>
            </div>
          </div>

          {/* Learner Credit Summary Table */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Learner Name</th>
                    <th className="py-3.5 px-6">Learner No</th>
                    <th className="py-3.5 px-6">ID Number</th>
                    <th className="py-3.5 px-6 text-center">Credits Available</th>
                    <th className="py-3.5 px-6 text-center">Credits Earned</th>
                    <th className="py-3.5 px-6 text-center">Remaining</th>
                    <th className="py-3.5 px-6">Completion %</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredLearners.map((learner) => {
                    const creditsEarned = (completedUSMap[learner.id] || []).reduce((sum, item) => sum + item.credits, 0);
                    const remaining = total2021Credits - creditsEarned;
                    const completionPct = Math.round((creditsEarned / total2021Credits) * 100);

                    return (
                      <tr
                        key={learner.id}
                        className="hover:bg-white/10 transition-colors group"
                      >
                        <td
                          onClick={() => setInspectingLearner(learner)}
                          className="py-3 px-6 font-semibold text-white group-hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          {learner.surname}, {learner.firstName}
                        </td>
                        <td className="py-3 px-6 font-mono text-emerald-400 font-bold">{learner.learnerNo || '—'}</td>
                        <td className="py-3 px-6 font-mono text-indigo-300">{learner.idNumber}</td>
                        <td className="py-3 px-6 text-center font-mono text-slate-300">{total2021Credits}</td>
                        <td className="py-3 px-6 text-center font-mono text-emerald-400 font-bold">{creditsEarned}</td>
                        <td className="py-3 px-6 text-center font-mono text-amber-400 font-bold">{remaining}</td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full transition-all duration-300"
                                style={{ width: `${completionPct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-mono text-slate-300">{completionPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-right space-x-2">
                          <button
                            onClick={() => setInspectingLearner(learner)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all"
                          >
                            Manage Unit Standards
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'requirements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Standards List Sidebar */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-2 max-h-[600px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
              Select Unit Standard (23 Total)
            </h3>
            {unitStandards2021.map((us) => {
              const isSelected = selectedUS.id === us.id;
              return (
                <button
                  key={us.id}
                  onClick={() => setSelectedUS(us)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-mono font-semibold text-xs text-indigo-300">{us.usId}</div>
                    <div className="text-xs font-medium truncate max-w-[200px]">{us.title}</div>
                  </div>
                  <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded-lg">
                    {us.credits} cr
                  </span>
                </button>
              );
            })}
          </div>

          {/* Requirements for Selected Unit Standard */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                  {selectedUS.usId} &bull; {selectedUS.usType}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedUS.title}</h3>
              </div>
              <div className="bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-300 text-xs font-mono font-bold">
                {selectedUS.credits} Credits Available
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mandatory Component Requirements (7 per Unit Standard)
              </h4>

              <div className="space-y-2">
                {currentUSRequirements.map((req) => (
                  <div key={req.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs font-bold">
                        {req.sequenceNo}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{req.requirementName}</div>
                        <span className="text-[11px] text-slate-400 font-mono">Type: {req.requirementType}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Mandatory
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ledger' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Auditable Credit Ledger (<code className="text-indigo-300 font-mono">learner_credit_awards</code>)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Credits are awarded upon completion of unit standard requirements and attendance verification.
              </p>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold">
              Total Available Credits: {total2021Credits}
            </div>
          </div>

          <div className="space-y-3">
            {learners.map(l => {
              const completedIds = completedUSMap[l.id] || [];
              const earned = unitStandards2021.filter(us => completedIds.includes(us.id)).reduce((s, us) => s + us.credits, 0);
              return (
                <div key={l.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{l.surname}, {l.firstName}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      <span className="text-emerald-400 font-bold">{l.learnerNo || '—'}</span> &bull; ID: {l.idNumber} &bull; Completed {completedIds.length} / 23 Unit Standards
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-xs text-slate-400">Earned / Available</div>
                      <div className="text-emerald-400 font-bold text-sm">{earned} / {total2021Credits} cr</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learner Unit Standard Management Modal */}
      {inspectingLearner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                  Learner Unit Standard Progress & Credits
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {inspectingLearner.surname}, {inspectingLearner.firstName}
                </h3>
                <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                  LEARNER NO: {inspectingLearner.learnerNo || '—'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => markAllCompleted(inspectingLearner.id)}
                  className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-600/30"
                >
                  Mark All Complete
                </button>
                <button
                  onClick={() => markAllIncomplete(inspectingLearner.id)}
                  className="px-3 py-1.5 bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold hover:bg-rose-600/30"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setInspectingLearner(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-medium">Credits Available</span>
                  <span className="text-2xl font-bold text-white font-mono">{total2021Credits}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-medium">Credits Earned</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    {(completedUSMap[inspectingLearner.id] || []).reduce((sum, item) => sum + item.credits, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-medium">Remaining Credits</span>
                  <span className="text-2xl font-bold text-amber-400 font-mono">
                    {total2021Credits - (completedUSMap[inspectingLearner.id] || []).reduce((sum, item) => sum + item.credits, 0)}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Click Unit Standards to Toggle Completion & Earn Credits
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unitStandards2021.map((us) => {
                  const isCompleted = (completedUSMap[inspectingLearner.id] || []).some(item => item.usId === us.id);
                  return (
                    <div
                      key={us.id}
                      onClick={() => toggleUSCompletion(inspectingLearner.id, us.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCompleted
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-300">{us.usId}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{us.usType}</span>
                        </div>
                        <div className="text-xs font-medium mt-1 truncate max-w-[260px]">{us.title}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-indigo-200">{us.credits} cr</span>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                          isCompleted ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20 bg-white/5'
                        }`}>
                          {isCompleted && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end bg-white/5">
              <button
                onClick={() => setInspectingLearner(null)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
