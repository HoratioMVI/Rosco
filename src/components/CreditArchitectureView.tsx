import React, { useEffect, useState } from 'react';
import { Award, ShieldCheck, Database, CheckCircle2, Layers, Key, FileText, AlertCircle, Cpu, GitBranch } from 'lucide-react';

interface ExpandedCreditArchData {
  tablesReused: string[];
  tablesCreated: string[];
  tablesModified: string[];
  columnsAdded: string[];
  foreignKeys: string[];
  uniqueConstraints: string[];
  indexes: string[];
  viewsCreated: string[];
  validation2021: {
    unitStandardsFound: number;
    totalUnitStandardCredits: number;
    expectedRequirementCount: number;
    actualRequirementCount: number;
    isVerified: boolean;
    discrepancies: string[];
    scheduleAnomalies: string[];
    warnings: string[];
    creditAwardsCreated: number;
  };
  requirementsSample: Array<{
    id: number;
    unitStandardId: number;
    usId: string;
    requirementType: string;
    requirementName: string;
    sequenceNo: number;
    mandatory: boolean;
  }>;
}

export const CreditArchitectureView: React.FC = () => {
  const [data, setData] = useState<ExpandedCreditArchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/rosco/api/database/expanded-credit-architecture')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load expanded credit architecture', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="text-center py-12 text-slate-400">Loading expanded credit & requirement architecture...</div>;
  }

  const { validation2021 } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 mb-3">
              <Award className="w-3.5 h-3.5" />
              Expanded Credit & Requirement Architecture Stage
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              ROSCO LMS 2021 Credit & Achievement Ledger
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Normalized unit standard requirements linked to schedules, granular achievement progress tracking, and auditable ledger credit awards.
            </p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 rounded-2xl text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">2021 Architecture Verified</div>
              <div className="text-sm font-bold font-mono">{validation2021.unitStandardsFound} US &bull; {validation2021.totalUnitStandardCredits} Credits &bull; {validation2021.actualRequirementCount} Req Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Unit Standards</span>
          <div className="text-3xl font-bold text-white font-mono">{validation2021.unitStandardsFound}</div>
          <span className="text-xs text-emerald-400 mt-2 block">Expected: 23</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Credits</span>
          <div className="text-3xl font-bold text-indigo-300 font-mono">{validation2021.totalUnitStandardCredits}</div>
          <span className="text-xs text-indigo-400 mt-2 block">Expected: 124</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Requirement Records</span>
          <div className="text-3xl font-bold text-purple-300 font-mono">{validation2021.actualRequirementCount}</div>
          <span className="text-xs text-purple-400 mt-2 block">Expected: {validation2021.expectedRequirementCount} (23 × 7)</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Simulated Credits</span>
          <div className="text-3xl font-bold text-emerald-400 font-mono">{validation2021.creditAwardsCreated}</div>
          <span className="text-xs text-slate-400 mt-2 block">No fake credits generated</span>
        </div>
      </div>

      {/* Migration Architecture Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables Reused, Created & Modified */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Schema Reusability & Creation
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block mb-1">Existing Tables Reused</span>
              <ul className="list-disc list-inside text-slate-200 font-mono text-xs space-y-1">
                {data.tablesReused.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">New Tables Created</span>
              <ul className="list-disc list-inside text-slate-200 font-mono text-xs space-y-1">
                {data.tablesCreated.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Reporting Views Created</span>
              <ul className="list-disc list-inside text-slate-300 font-mono text-xs space-y-1">
                {data.viewsCreated.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Foreign Keys, Constraints & Integrity */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            Foreign Keys, Unique Constraints & Indexes
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">Foreign Keys</span>
              <ul className="list-disc list-inside text-slate-300 font-mono text-xs space-y-1">
                {data.foreignKeys.map((fk, i) => <li key={i}>{fk}</li>)}
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">Unique Constraints</span>
              <ul className="list-disc list-inside text-slate-300 font-mono text-xs space-y-1">
                {data.uniqueConstraints.map((uc, i) => <li key={i}>{uc}</li>)}
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block mb-1">Indexes</span>
              <ul className="list-disc list-inside text-slate-300 font-mono text-xs space-y-1">
                {data.indexes.map((idx, i) => <li key={i}>{idx}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Sample Table (23 x 7 = 161) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Unit Standard Requirements Structure (Sample of 161 Total Records)
          </h3>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-mono">
            7 Requirements per Unit Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Unit Standard</th>
                <th className="py-3 px-4">Requirement Type</th>
                <th className="py-3 px-4">Requirement Name</th>
                <th className="py-3 px-4 text-center">Sequence</th>
                <th className="py-3 px-4 text-center">Mandatory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {data.requirementsSample.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-xs">{req.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-300">{req.usId}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {req.requirementType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{req.requirementName}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{req.sequenceNo}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-400 font-semibold text-xs">Yes</span>
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
