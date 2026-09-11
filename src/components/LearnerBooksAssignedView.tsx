import React, { useEffect, useState } from 'react';
import { Learner } from '../types';
import { TheoryLearnerBookRecord } from '../data/theoryLearnerBooks2021';
import { BookOpen, Search, User, CheckCircle2, Clock, ShieldCheck, Check, ChevronRight } from 'lucide-react';

interface LearnerBooksAssignedViewProps {
  learners: Learner[];
}

export const LearnerBooksAssignedView: React.FC<LearnerBooksAssignedViewProps> = ({ learners }) => {
  const [selectedLearner, setSelectedLearner] = useState<Learner>(learners[0] || null);
  const [assignedBooks, setAssignedBooks] = useState<TheoryLearnerBookRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [learnerSearch, setLearnerSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLearner) return;
    setLoading(true);
    const learnerNo = selectedLearner.learnerNo || `L${String(learners.findIndex(l => l.id === selectedLearner.id) + 1).padStart(3, '0')}`;
    fetch(`/rosco/api/theory-learner-books?learnerNo=${learnerNo}`)
      .then(r => r.json())
      .then(data => {
        setAssignedBooks(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch assigned books for learner', err);
        setLoading(false);
      });
  }, [selectedLearner, learners]);

  const handleVerifyBook = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Verified' ? 'Awaiting Evidence' : 'Verified';
    try {
      const res = await fetch('/rosco/api/theory-learner-books/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verificationStatus: newStatus, verifiedBy: 'Instructor' })
      });
      const data = await res.json();
      if (data.success) {
        setAssignedBooks(prev => prev.map(b => b.id === id ? data.record : b));
        setSuccessMsg(`Updated verification status for book record ${id}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update verification', err);
    }
  };

  const filteredLearners = learners.filter(l =>
    l.surname.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.firstName.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.idNumber.includes(learnerSearch)
  );

  const filteredBooks = assignedBooks.filter(b => {
    const code = b.usId || (b as any).moduleNo || '';
    const name = b.unitStandardTitle || (b as any).title || '';
    return code.includes(searchQuery) || name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const verifiedCount = assignedBooks.filter(b => b.verificationStatus === 'Verified').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Assigned Theory Learner Books by Learner
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Learner Book Assignments Ledger
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            View all 23 Theory Learner Books linked to each learner with scheduled dates, activity types, and verification records.
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">Assigned Books</div>
            <div className="text-sm font-bold font-mono">{verifiedCount} / {assignedBooks.length} Verified</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Learners Selector */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Select Learner ({learners.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search learner..."
              value={learnerSearch}
              onChange={(e) => setLearnerSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {filteredLearners.map((learner) => {
              const isSelected = selectedLearner?.id === learner.id;
              return (
                <button
                  key={learner.id}
                  onClick={() => setSelectedLearner(learner)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/30 border border-indigo-500/50 text-white shadow'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-white">{learner.surname}, {learner.firstName}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">{learner.learnerNo || '—'}</div>
                    <div className="text-[11px] font-mono text-indigo-300">{learner.idNumber}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Assigned Books Table for Selected Learner */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          {selectedLearner ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                    Assigned Theory Learner Books (23 Unit Standards)
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedLearner.surname}, {selectedLearner.firstName} {selectedLearner.secondName}
                  </h3>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    Learner No: {selectedLearner.learnerNo || '—'}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">ID Number: {selectedLearner.idNumber}</span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search assigned books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading assigned books...</div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-[#0f172a] z-10">
                      <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-3">Rec ID</th>
                        <th className="py-3 px-3">US ID & Title</th>
                        <th className="py-3 px-3">Scheduled Date</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBooks.map((book) => {
                        const code = book.usId || (book as any).moduleNo || 'N/A';
                        const name = book.unitStandardTitle || (book as any).title || 'Unknown Title';
                        const startDate = (book as any).startDate || '--';
                        const endDate = (book as any).endDate || '--';
                        return (
                        <tr key={book.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-mono text-indigo-300">{book.id}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-indigo-200 mr-2">{code}</span>
                            <span className="text-white">{name}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300 text-[10px]">
                            {startDate} - {endDate}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              book.verificationStatus === 'Verified'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {book.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleVerifyBook(book.id, book.verificationStatus)}
                              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                                book.verificationStatus === 'Verified'
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {book.verificationStatus === 'Verified' ? 'Verified ✓' : 'Verify'}
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Select a learner from the left roster.</div>
          )}
        </div>
      </div>
    </div>
  );
};
