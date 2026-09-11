import React, { useEffect, useState } from 'react';
import { LearnerFeedbackRecord } from '../data/learnerFeedback2021';
import { MessageSquare, Search, CheckCircle2, User, ChevronRight, Check } from 'lucide-react';
import { Learner } from '../types';

interface LearnerFeedbackViewProps {
  learners: Learner[];
}

export const LearnerFeedbackView: React.FC<LearnerFeedbackViewProps> = ({ learners }) => {
  const [records, setRecords] = useState<LearnerFeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/rosco/api/learner-feedback')
      .then(r => r.json())
      .then(data => {
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load learner feedback', err);
        setLoading(false);
      });
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Competent' ? 'Pending' : 'Competent';
    try {
      const res = await fetch('/rosco/api/learner-feedback/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, confirmationStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.map(r => r.id === id ? data.record : r));
        setSuccessMsg(`Updated confirmation status for record ${id}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update confirmation status', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading Feedback Records...</div>;
  }

  const filteredRecords = records.filter(r => {
    // Check if the record's cohort matches or if the learner belongs to the current filtered list
    const isLearnerInCurrentYear = learners.some(l => l.learnerNo === r.learnerNo);
    const matchesCohort = r.cohort && r.cohort.includes(learners[0]?.cohort?.split(' ')[0] || ''); // Loose cohort match fallback

    if (!isLearnerInCurrentYear && records.length > 0) {
       // if we have learners filtered, we should respect that.
       // Note: r.cohort is also available in this record
    }

    const matchesSearch =
      r.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.learnerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.learnerFeedback.toLowerCase().includes(searchQuery.toLowerCase());

    return isLearnerInCurrentYear && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            Online Facilitation Learner Feedback
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Learner Feedback Control Ledger
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Pre-populated feedback records for administrative preparation. Each entry must be reviewed and verified against authentic learner statements before confirmation.
          </p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">Feedback Records</div>
            <div className="text-sm font-bold font-mono">{records.length} Active</div>
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
            placeholder="Search by learner or feedback content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono ml-4">
          Showing {filteredRecords.length} records
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#0f172a] z-10">
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">ID Number</th>
                <th className="py-3 px-4 w-1/3">Feedback Statement</th>
                <th className="py-3 px-4">Subject & Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Confirmation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{rec.learnerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rec.learnerNo} &bull; {rec.cohort}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-300">
                    {rec.learnerIdNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-300 leading-relaxed max-w-sm">
                    "{rec.learnerFeedback}"
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-indigo-300 font-semibold">{rec.feedbackAbout}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rec.deliveryMode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      rec.confirmationStatus === 'Competent'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {rec.confirmationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleUpdateStatus(rec.id, rec.confirmationStatus)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all ${
                        rec.confirmationStatus === 'Competent'
                          ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                          : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white shadow-sm'
                      }`}
                    >
                      {rec.confirmationStatus === 'Competent' ? 'Revoke' : 'Confirm'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
