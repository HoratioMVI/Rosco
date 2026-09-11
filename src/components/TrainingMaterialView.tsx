import React, { useEffect, useState } from 'react';
import { Play, FileText, Download, Clock, Search, FolderOpen, Video, Book, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface Material {
  name: string;
  relativePath: string;
  size: number;
  updatedAt: string;
  url: string;
  type: string;
}

interface MaterialData {
  videos: Material[];
  workbooks: Material[];
}

export const TrainingMaterialView: React.FC = () => {
  const [data, setData] = useState<MaterialData>({ videos: [], workbooks: [] });
  const [activeTab, setActiveTab] = useState<'videos' | 'workbooks'>('videos');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/rosco/api/training-material');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch training material:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredItems = data[activeTab].filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Training Material</h2>
          <p className="text-slate-400 text-sm mt-1">Access videos and workbooks for the 2021 Programme (Recursive Scan)</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'videos' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Video className="w-4 h-4" />
          Training Videos
          <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-black/20 rounded-full">
            {data.videos.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('workbooks')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'workbooks' 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Book className="w-4 h-4" />
          Course Workbooks
          <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-black/20 rounded-full">
            {data.workbooks.length}
          </span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab} by name or folder...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.relativePath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-black/20"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    activeTab === 'videos' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {activeTab === 'videos' ? <Video className="w-6 h-6" /> : <Book className="w-6 h-6" />}
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                
                <h3 className="text-white font-bold mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors" title={item.name}>
                  {item.name}
                </h3>
                
                {item.relativePath !== item.name && (
                  <p className="text-[10px] text-slate-500 font-mono mb-3 truncate" title={item.relativePath}>
                    {item.relativePath.replace(item.name, '')}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    {formatSize(item.size)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                    activeTab === 'videos' ? 'text-indigo-400 hover:text-indigo-300' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {activeTab === 'videos' ? (
                    <><Play className="w-4 h-4" /> Watch Video</>
                  ) : (
                    <><FileText className="w-4 h-4" /> View Workbook</>
                  )}
                </a>
                <a 
                  href={item.url} 
                  download={item.name}
                  className="text-xs text-slate-500 hover:text-white transition-colors underline decoration-slate-500/50 underline-offset-4"
                >
                  Download
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-2xl border-dashed">
          <div className="p-4 bg-white/5 rounded-full mb-4">
            <FolderOpen className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-white font-bold">No materials found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">
            {searchQuery 
              ? `No ${activeTab} match your search query.` 
              : `The ${activeTab} folder is currently empty. Populate it on the server (even with subfolders) to see content here.`}
          </p>
        </div>
      )}
    </div>
  );
};
