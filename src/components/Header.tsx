import React from 'react';
import { Database, ShieldCheck, Terminal, CheckCircle2, Server, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  databaseName: string;
  version: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, databaseName, version }) => {
  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-inner flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">ROSCO LMS Database Manager</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">MariaDB 10.11+ Target: <code className="text-indigo-300 font-semibold">{databaseName}</code></p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right text-xs text-slate-300 font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-slate-400 block text-[10px]">MariaDB Engine</span>
              {version}
            </div>
            <div className="text-right text-xs text-slate-300 font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-slate-400 block text-[10px]">Charset / Collation</span>
              utf8mb4_unicode_ci
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-white/10 pt-2 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-white/10 text-white border-t-2 border-indigo-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Database Status</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'safety'
                ? 'bg-white/10 text-white border-t-2 border-indigo-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety Audit & Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'console'
                ? 'bg-white/10 text-white border-t-2 border-indigo-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>SQL Verification Console</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'report'
                ? 'bg-white/10 text-white border-t-2 border-indigo-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Task Completion Report</span>
          </button>

          <button
            onClick={() => setActiveTab('learners')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'learners'
                ? 'bg-white/10 text-white border-t-2 border-indigo-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Learners Roster</span>
          </button>
        </div>
      </div>
    </header>
  );
};
