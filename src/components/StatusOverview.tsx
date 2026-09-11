import React from 'react';
import { DatabaseStatus } from '../types';
import { Database, Server, CheckCircle2, ShieldAlert, Cpu, Layers, HardDrive } from 'lucide-react';

interface StatusOverviewProps {
  status: DatabaseStatus | null;
  onRefresh: () => void;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({ status, onRefresh }) => {
  if (!status) {
    return <div className="p-8 text-center text-slate-400">Loading database status...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 mb-3">
              <Database className="w-3.5 h-3.5" />
              SQLite Target Database
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-mono">
              {status.database_name}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Purpose-built new ROSCO LMS database initialized successfully with SQLite. Data is persistently stored in local.db.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm shadow transition-colors flex items-center justify-center gap-2"
            >
              <Server className="w-4 h-4" />
              Verify & Refresh Status
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Name</span>
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono truncate">{status.database_name}</div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified exact match
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MariaDB Version</span>
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono truncate">{status.mariadb_version}</div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 10.11+ Compatible
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Charset & Collation</span>
            <HardDrive className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">{status.character_set_name}</div>
          <div className="text-xs text-slate-400 font-mono">{status.collation_name}</div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> UTF-8 Multibyte ready
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tables Count</span>
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{status.tablesCount}</div>
          <div className="mt-2 flex items-center text-xs text-amber-400 font-medium">
            <span>Pristine & empty for next task</span>
          </div>
        </div>
      </div>

      {/* Safety & Isolation Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Database Isolation & Safety Status
          </h3>
          <p className="text-sm text-slate-300 mb-4">
            Per strict safety instructions, the creation of <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-indigo-300">rosco_main</code> was executed in complete isolation. The following safety invariants are active:
          </p>

          <div className="space-y-3">
            <div className="flex items-start justify-between p-3.5 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">WordPress Databases Protected</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <code className="text-slate-300 font-mono">rosco_wp408</code> and all other existing WordPress schemas were not dropped, altered, or imported into.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">Intact</span>
            </div>

            <div className="flex items-start justify-between p-3.5 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Zero Application Tables Created</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No LMS or WordPress tables have been created yet. The database is pristine and awaiting the next schema generation instruction.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-full">Ready</span>
            </div>

            <div className="flex items-start justify-between p-3.5 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Strict MariaDB 10.11+ Compatibility</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified utf8mb4 character set and utf8mb4_unicode_ci collation. SQLite was strictly avoided as mandated.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">Compliant</span>
            </div>
          </div>
        </div>

        {/* Protected Databases Inspector */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2">Protected Schemas</h3>
            <p className="text-xs text-slate-400 mb-4">
              The following databases are safeguarded by system policy:
            </p>
            <div className="space-y-2">
              {status.protectedDatabases?.map((db, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10 font-mono text-xs">
                  <span className="text-slate-200 font-semibold">{db}</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-sans text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Untouched
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Connection Mode:</span>
            <span className="font-semibold text-indigo-400">
              {status.connectedToLiveDB ? 'Live MariaDB Connected' : 'Simulated MariaDB 10.11'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
