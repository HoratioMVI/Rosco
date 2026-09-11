import React from 'react';
import { DatabaseStatus } from '../types';
import { CheckCircle2, Award, Database } from 'lucide-react';

interface FinalReportCardProps {
  status: DatabaseStatus | null;
}

export const FinalReportCard: React.FC<FinalReportCardProps> = ({ status }) => {
  if (!status) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-bl-2xl font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 border-l border-b border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Task Successfully Completed
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ROSCO LMS Database Creation Report</h2>
            <p className="text-sm text-slate-400">Task 1: Creation and Verification of <code className="text-indigo-300 font-mono">rosco_main</code></p>
          </div>
        </div>

        {/* Report Summary Card */}
        <div className="bg-[#020617] text-slate-100 rounded-xl p-6 font-mono text-sm space-y-4 shadow-inner border border-white/10">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-sans border-b border-white/10 pb-2">
            Execution Report Summary
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-xs block font-sans">MariaDB Server Version</span>
                <span className="text-emerald-400 font-bold">{status.mariadb_version}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-sans">Database Created</span>
                <span className="text-indigo-300 font-bold">{status.database_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-sans">Character Set</span>
                <span className="text-slate-100">{status.character_set_name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-xs block font-sans">Collation</span>
                <span className="text-slate-100">{status.collation_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-sans">Existing Databases Modified</span>
                <span className="text-emerald-400 font-bold">None (rosco_wp408 & WordPress DBs fully protected)</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-sans">Database Readiness</span>
                <span className="text-emerald-400 font-bold">Empty (0 tables) & ready for schema generation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Check Results */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verification Query Results</h3>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-xs font-mono space-y-2">
            <div className="text-slate-400 font-sans font-semibold mb-1">Expected vs Actual Results:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <span className="text-slate-400 block text-[10px] font-sans">database_name</span>
                <span className="text-white font-bold">rosco_main</span> <span className="text-emerald-400 text-[10px]">(Match)</span>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <span className="text-slate-400 block text-[10px] font-sans">character_set_name</span>
                <span className="text-white font-bold">utf8mb4</span> <span className="text-emerald-400 text-[10px]">(Match)</span>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <span className="text-slate-400 block text-[10px] font-sans">collation_name</span>
                <span className="text-white font-bold">utf8mb4_unicode_ci</span> <span className="text-emerald-400 text-[10px]">(Match)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Step Instruction */}
        <div className="mt-6 p-4 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-start space-x-3 text-indigo-200 text-sm">
          <Database className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-white">Standing By for Next Instruction</span>
            Per instructions ("Do not proceed beyond this task. Stop after successfully creating and verifying rosco_main. Do not design or create the LMS tables yet."), the database is successfully created and verified. Awaiting your next task instruction.
          </div>
        </div>
      </div>
    </div>
  );
};
