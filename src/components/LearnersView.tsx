import React, { useState } from 'react';
import { Learner } from '../types';
import { Users, Search, UserPlus, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

interface LearnersViewProps {
  learners: Learner[];
  onSelectLearner: (learner: Learner) => void;
  onRefresh: () => void;
}

export const LearnersView: React.FC<LearnersViewProps> = ({ learners, onSelectLearner, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New learner form state
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [learnerNo, setLearnerNo] = useState('');
  const [comments, setComments] = useState('Certified');
  const [addError, setAddError] = useState('');

  const handleAddLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname || !firstName || !idNumber) {
      setAddError('Surname, First Name, and ID Number are required.');
      return;
    }

    try {
      const res = await fetch('/rosco/api/learners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surname, firstName, secondName, idNumber, learnerNo, comments })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onRefresh();
      setShowAddModal(false);
      setSurname('');
      setFirstName('');
      setSecondName('');
      setIdNumber('');
      setLearnerNo('');
      setAddError('');
    } catch (err: any) {
      setAddError(err.message || 'Failed to add learner');
    }
  };

  const filteredLearners = learners.filter(l =>
    l.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.idNumber.includes(searchQuery) ||
    (l.learnerNo && l.learnerNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 mb-3">
            <Users className="w-3.5 h-3.5" />
            ROSCO LMS Learner Roster ({learners.length} Enrolled)
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Learners Directory & Drill-Down
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Complete database roster for <code className="text-indigo-300 font-mono">rosco_main</code>. Click any row to inspect individual learner records and details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Learner
          </button>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by surname, first name, or ID number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="bg-white/5 px-3 py-2 rounded-xl border border-white/10 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> All {learners.length} verified
          </span>
          <span className="bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            Showing {filteredLearners.length} results
          </span>
        </div>
      </div>

      {/* Learners Table Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Learner No</th>
                <th className="py-3.5 px-6">Surname</th>
                <th className="py-3.5 px-6">First Name</th>
                <th className="py-3.5 px-6">Cohort</th>
                <th className="py-3.5 px-6">ID Number</th>
                <th className="py-3.5 px-6">Marks</th>
                <th className="py-3.5 px-6">Status / Comments</th>
                <th className="py-3.5 px-6 text-right">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No learners found matching "{searchQuery}"</td>
                </tr>
              ) : (
                filteredLearners.map((learner, index) => (
                  <tr
                    key={learner.id}
                    onClick={() => onSelectLearner(learner)}
                    className="hover:bg-white/10 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-6 font-mono text-indigo-400 font-bold">{learner.learnerNo || '—'}</td>
                    <td className="py-3 px-6 font-semibold text-white group-hover:text-indigo-300 transition-colors">{learner.surname}</td>
                    <td className="py-3 px-6 text-slate-200">{learner.firstName}</td>
                    <td className="py-3 px-6 text-slate-400 text-xs">{learner.cohort || '2021 Group'}</td>
                    <td className="py-3 px-6 font-mono text-slate-400 text-xs">{learner.idNumber}</td>
                    <td className="py-3 px-6 font-semibold text-emerald-400">{learner.marks ? `${learner.marks}%` : '—'}</td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {learner.comments}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className="inline-flex items-center text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Inspect <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Learner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Add New Learner
            </h3>

            {addError && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddLearner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Surname *</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="e.g. MOKOENA"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. THABO"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Second Name</label>
                <input
                  type="text"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  placeholder="e.g. JOHN"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">ID Number *</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="13-digit SA ID Number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Learner Number</label>
                <input
                  type="text"
                  value={learnerNo}
                  onChange={(e) => setLearnerNo(e.target.value)}
                  placeholder="e.g. LA21/008819"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Comments / Status</label>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow transition-colors"
                >
                  Save Learner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
