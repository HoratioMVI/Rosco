import React, { useEffect, useState } from 'react';
import { TheoryLearnerBookRecord } from '../data/theoryLearnerBooks2021';
import { BookOpen, Search, CheckCircle2, ShieldCheck, Clock, User, FileText, Check, AlertCircle } from 'lucide-react';

export const TheoryLearnerBooksView: React.FC = () => {
  const [records, setRecords] = useState<TheoryLearnerBookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/rosco/api/theory-learner-books')
      .then(r => r.json())
      .then(data => {
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load theory learner books', err);
        setLoading(false);
      });
  }, []);

  const handleUpdateRecord = async (id: string, verificationStatus: string) => {
    try {
      const res = await fetch('/rosco/api/theory-learner-books/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verificationStatus, verifiedBy: 'System Admin' })
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.map(r => r.id === id ? data.record : r));
        setSuccessMsg(`Successfully updated record ${id}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update record', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading 2,300 Theory Learner Book Controlled Records...</div>;
  }

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.learnerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.usId.includes(searchQuery) ||
      r.unitStandardTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Database Table &bull; 2,300 Controlled Records
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            2021 Theory Learner Books Master Audit Table
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Complete database ledger linking all 100 learners across 23 Unit Standards (2,300 total Theory Learner Book assignment records).
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">Database Table Active</div>
            <div className="text-sm font-bold font-mono">2,300 Assigned Records</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by learner, learner No, US ID, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Awaiting Evidence">Awaiting Evidence</option>
            <option value="Verified">Verified</option>
          </select>
          <div className="text-xs text-slate-400 font-mono ml-4">
            Showing {filteredRecords.length} of {records.length} records
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
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">US ID & Title</th>
                <th className="py-3 px-4">Activity Type</th>
                <th className="py-3 px-4">Scheduled Start</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.slice(0, 150).map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-indigo-300 font-semibold">{rec.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{rec.learnerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rec.learnerNo} &bull; {rec.learnerIdNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-indigo-300 font-semibold">{rec.usId}</div>
                    <div className="text-slate-300 truncate max-w-[240px]" title={rec.unitStandardTitle}>{rec.unitStandardTitle}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{rec.activityType}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{rec.scheduledStart}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      rec.verificationStatus === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {rec.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {rec.verificationStatus === 'Awaiting Evidence' ? (
                      <button
                        onClick={() => handleUpdateRecord(rec.id, 'Verified')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white font-semibold transition-all text-[11px]"
                      >
                        Verify Book
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateRecord(rec.id, 'Awaiting Evidence')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white font-semibold transition-all text-[11px]"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white/5 border-t border-white/10 text-xs text-slate-400 flex justify-between items-center">
          <span>Displaying first 150 records for responsive performance (Total 2,300 database records stored)</span>
          <span className="font-mono text-indigo-300">Database Table: <code className="text-white">learner_theory_learner_books</code></span>
        </div>
      </div>
    </div>
  );
};
