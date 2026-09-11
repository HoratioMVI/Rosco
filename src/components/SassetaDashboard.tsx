import React, { useState, useEffect } from 'react';
import { Database, FileText, Search, RefreshCw, AlertCircle, CheckCircle2, FileWarning, Layers } from 'lucide-react';
import { SassetaStats } from '../types';

export function SassetaDashboard() {
  const [stats, setStats] = useState<SassetaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/rosco/api/sasseta/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch SASSETA stats', err);
      setError('Failed to connect to SASSETA repository service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/rosco/api/sasseta/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchStats();
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError('Scan request failed');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">SASSETA Evidence Repository</h2>
          <p className="text-slate-400 text-sm mt-1">Management and synchronization of source documentation</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20"
        >
          {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {scanning ? 'Scanning Repository...' : 'Scan Repository'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Repository Status" 
          value={stats?.repositoryStatus || 'Unknown'} 
          icon={<Database className="w-5 h-5" />}
          status={stats?.repositoryStatus === 'Connected' ? 'success' : 'error'}
        />
        <StatCard 
          label="Learners Found" 
          value={stats?.learnersFound || 0} 
          icon={<Layers className="w-5 h-5 text-blue-400" />}
        />
        <StatCard 
          label="Total Documents" 
          value={stats?.documentsFound || 0} 
          icon={<FileText className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard 
          label="Matched Docs" 
          value={`${stats?.matchedDocuments || 0} / ${stats?.documentsFound || 0}`} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            Repository Health Dashboard
          </h3>
          
          <div className="space-y-4">
            <HealthItem 
              label="Matched Documents" 
              value={stats?.matchedDocuments || 0} 
              total={stats?.documentsFound || 0}
              description="Documents successfully associated with a learner in the database."
            />
            <HealthItem 
              label="Unmatched Documents" 
              value={stats?.unmatchedDocuments || 0} 
              total={stats?.documentsFound || 0}
              description="Files found in repository but could not be linked to a known learner."
              warning={stats?.unmatchedDocuments ? stats.unmatchedDocuments > 0 : false}
            />
            <HealthItem 
              label="Repository Errors" 
              value={stats?.repositoryErrors || 0} 
              total={stats?.documentsFound || 0}
              description="Files that failed to scan due to permissions or corruption."
              error={stats?.repositoryErrors ? stats.repositoryErrors > 0 : false}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Last Scan: <span className="text-slate-300 font-mono">{stats?.lastScan ? new Date(stats.lastScan).toLocaleString() : 'Never'}</span>
            </div>
            <div className="flex gap-3">
              <button className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300">View Unmatched</button>
              <button className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300">View Errors</button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-amber-400" />
            Root Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Configured Path</label>
              <div className="p-3 bg-black/20 rounded-xl font-mono text-[11px] text-slate-400 break-all">
                {stats?.rootConfigured ? (process.env.SASSETA_DOCUMENT_ROOT || 'sasseta_repo (Development)') : 'Not Configured'}
              </div>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <p className="text-[11px] text-amber-200/70 leading-relaxed">
                The repository root is the authoritative source for SASSETA evidence.
                Production deployment must point to <code className="text-amber-300">/var/www/introsoft.co.za/public_html/rosco/Sasseta</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, status }: { label: string, value: string | number, icon: React.ReactNode, status?: 'success' | 'error' | 'warning' }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all group">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-400'}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-white font-mono group-hover:scale-105 transition-transform origin-left">{value}</div>
      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">{label}</div>
    </div>
  );
}

function HealthItem({ label, value, total, description, warning, error }: { label: string, value: number, total: number, description: string, warning?: boolean, error?: boolean }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : warning ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
          <span className="text-sm font-bold text-slate-200">{label}</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          {value} <span className="opacity-50">/ {total}</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${error ? 'bg-red-500' : warning ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-[11px] text-slate-500 italic">{description}</p>
    </div>
  );
}
