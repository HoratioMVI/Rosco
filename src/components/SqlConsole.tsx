import React, { useState } from 'react';
import { QueryLog } from '../types';
import { Terminal, Play, AlertCircle, Copy, Check } from 'lucide-react';

interface SqlConsoleProps {
  queryLogs: QueryLog[];
  onRefresh: () => void;
}

export const SqlConsole: React.FC<SqlConsoleProps> = ({ queryLogs, onRefresh }) => {
  const [customQuery, setCustomQuery] = useState(`USE \`rosco_main\`;\n\nSELECT\n    DATABASE() AS database_name,\n    VERSION() AS mariadb_version,\n    @@character_set_database AS character_set_name,\n    @@collation_database AS collation_name;`);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetQueries = [
    {
      name: "1. Create Database",
      query: "CREATE DATABASE IF NOT EXISTS `rosco_main`\n  CHARACTER SET utf8mb4\n  COLLATE utf8mb4_unicode_ci;"
    },
    {
      name: "2. Verify Existence",
      query: "SHOW DATABASES LIKE 'rosco_main';"
    },
    {
      name: "3. Check Information Schema",
      query: "SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'rosco_main';"
    },
    {
      name: "4. Connection Verification",
      query: "USE `rosco_main`;\n\nSELECT\n    DATABASE() AS database_name,\n    VERSION() AS mariadb_version,\n    @@character_set_database AS character_set_name,\n    @@collation_database AS collation_name;"
    }
  ];

  const handleRunQuery = async (sqlToRun?: string) => {
    const q = sqlToRun || customQuery;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/rosco/api/database/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Query execution failed');
      }
      setQueryResult(data.result);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">SQL Verification Console</h2>
          </div>
          <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
            Target: rosco_main (MariaDB 10.11+)
          </span>
        </div>
        <p className="text-sm text-slate-300 mb-4">
          Execute required verification queries and check expected outputs against <code className="font-mono text-indigo-300 bg-white/10 px-1 py-0.5 rounded">rosco_main</code>.
        </p>

        {/* Preset Query Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presetQueries.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomQuery(preset.query);
                handleRunQuery(preset.query);
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-indigo-400" />
              {preset.name}
            </button>
          ))}
        </div>

        {/* Query Editor */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={6}
              className="w-full font-mono text-sm bg-[#020617] text-slate-100 p-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter SQL statement..."
            />
            <button
              onClick={() => copyToClipboard(customQuery)}
              className="absolute right-3 top-3 p-1.5 bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-colors"
              title="Copy SQL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Press Run to execute query against rosco_main</span>
            <button
              onClick={() => handleRunQuery()}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Executing...' : 'Run SQL Query'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="mt-4 p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Execution Error</span>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Result Display */}
        {queryResult && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Query Result Output</h3>
            <div className="bg-[#020617] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-white/10">
              <pre>{JSON.stringify(queryResult, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Query History Log */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Recent Query & Verification Log</h3>
        <div className="space-y-3">
          {queryLogs.map((log, index) => (
            <div key={index} className="p-3.5 bg-white/5 rounded-lg border border-white/10 font-mono text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-emerald-400 font-semibold">{log.status}</span>
              </div>
              <div className="text-white font-semibold">{log.query}</div>
              {log.message && <div className="text-slate-300">{log.message}</div>}
              {log.result && <div className="text-indigo-300">Result: {log.result}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
