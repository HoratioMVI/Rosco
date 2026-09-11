import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileCode,
  Download,
  Search,
  RefreshCw,
  Layers,
  HardDrive,
  Eye,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FileCheck,
  ShieldCheck,
  BookOpen,
  Info,
  CheckCircle2,
  FolderTree,
  X,
  FileArchive,
  FileQuestion,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { CourseDocumentNode, CourseDocumentsTreeResponse, CourseDocumentSearchItem } from '../types';

export const CourseDocumentsView: React.FC = () => {
  const [treeData, setTreeData] = useState<CourseDocumentsTreeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CourseDocumentSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<CourseDocumentNode | CourseDocumentSearchItem | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [previewModalFile, setPreviewModalFile] = useState<CourseDocumentNode | CourseDocumentSearchItem | null>(null);

  // Fetch full tree from dynamic filesystem
  const fetchTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/rosco/api/course-documents/tree');
      if (!res.ok) {
        throw new Error(`Failed to load course documents tree (HTTP ${res.status})`);
      }
      const data: CourseDocumentsTreeResponse = await res.json();
      setTreeData(data);

      // Default expand top-level folders
      const initialExpanded: Record<string, boolean> = {};
      if (data.children) {
        data.children.forEach(child => {
          if (child.type === 'directory') {
            initialExpanded[child.path] = true;
            // Also expand 1 level deeper by default for convenience
            if (child.children) {
              child.children.forEach(sub => {
                if (sub.type === 'directory') {
                  initialExpanded[sub.path] = true;
                }
              });
            }
          }
        });
      }
      setExpandedFolders(initialExpanded);
    } catch (err: any) {
      console.error('Error fetching course documents:', err);
      setError(err.message || 'Unable to scan course documents filesystem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Handle Dynamic Search via API when search query is typed
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/rosco/api/course-documents/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const expandAll = () => {
    if (!treeData) return;
    const allExpanded: Record<string, boolean> = {};
    function markAll(nodes: CourseDocumentNode[]) {
      for (const node of nodes) {
        if (node.type === 'directory') {
          allExpanded[node.path] = true;
          if (node.children) markAll(node.children);
        }
      }
    }
    markAll(treeData.children);
    setExpandedFolders(allExpanded);
  };

  const collapseAll = () => {
    setExpandedFolders({});
  };

  // Helper to determine file icon and color
  const getFileIconInfo = (extension: string = '', friendlyType: string = '') => {
    const ext = extension.toLowerCase();
    const type = friendlyType.toLowerCase();

    if (ext === '.pdf') {
      return {
        icon: FileText,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      };
    }
    if (ext === '.docx' || ext === '.doc') {
      return {
        icon: FileText,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      };
    }
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      return {
        icon: FileSpreadsheet,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    }
    if (ext === '.zip' || ext === '.rar' || ext === '.tar' || ext === '.gz') {
      return {
        icon: FileArchive,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    }
    if (type.includes('assessment') || type.includes('memo')) {
      return {
        icon: FileCheck,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      };
    }
    if (ext === '.txt' || ext === '.md') {
      return {
        icon: FileCode,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      };
    }
    return {
      icon: FileQuestion,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    };
  };

  // Filter tree nodes by type filter if selected
  const filterNode = (node: CourseDocumentNode): boolean => {
    if (typeFilter === 'ALL') return true;

    if (node.type === 'file') {
      const ext = (node.extension || '').toLowerCase();
      const friendly = (node.friendlyDocType || '').toLowerCase();
      if (typeFilter === 'PDF' && ext === '.pdf') return true;
      if (typeFilter === 'WORD' && (ext === '.docx' || ext === '.doc')) return true;
      if (typeFilter === 'LG' && (friendly.includes('learner guide') || node.name.toLowerCase().includes('-lg'))) return true;
      if (typeFilter === 'LW' && (friendly.includes('learner workbook') || friendly.includes('learner book') || node.name.toLowerCase().includes('-lw') || node.name.toLowerCase().includes('-lb'))) return true;
      if (typeFilter === 'FG' && (friendly.includes('facilitator') || node.name.toLowerCase().includes('-fg'))) return true;
      if (typeFilter === 'ASSESSMENT' && (friendly.includes('assessment') || friendly.includes('memo') || friendly.includes('poe'))) return true;
      return false;
    }

    if (node.type === 'directory' && node.children) {
      return node.children.some(child => filterNode(child));
    }

    return false;
  };

  // Render a recursive directory tree node
  const renderTreeNode = (node: CourseDocumentNode, depth: number = 0) => {
    if (!filterNode(node)) return null;

    if (node.type === 'directory') {
      const isExpanded = !!expandedFolders[node.path];
      const hasChildren = node.children && node.children.length > 0;
      const displayDirTitle = node.title || node.name;

      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => toggleFolder(node.path)}
            className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 group ${
              isExpanded ? 'bg-white/[0.03]' : ''
            }`}
            style={{ paddingLeft: `${Math.max(12, depth * 22 + 12)}px` }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-slate-400 group-hover:text-white transition-colors">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
              <span className="text-amber-400">
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4" />
                ) : (
                  <Folder className="w-4 h-4" />
                )}
              </span>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white truncate block">
                  {displayDirTitle}
                </span>
                {node.title && node.title !== node.name && (
                  <span className="text-[10px] text-slate-500 font-mono block truncate group-hover:text-slate-400">
                    📁 {node.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0 ml-2">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-[11px]">
                {node.fileCount || 0} {node.fileCount === 1 ? 'doc' : 'docs'}
              </span>
            </div>
          </div>

          {isExpanded && hasChildren && (
            <div className="border-l border-white/10 ml-4 pl-1 space-y-0.5 mt-0.5">
              {node.children!.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}

          {isExpanded && !hasChildren && (
            <div
              className="py-2 text-xs text-slate-500 italic"
              style={{ paddingLeft: `${depth * 22 + 36}px` }}
            >
              (Empty folder)
            </div>
          )}
        </div>
      );
    }

    // Render File item
    const isSelected = selectedFile?.path === node.path;
    const iconInfo = getFileIconInfo(node.extension, node.friendlyDocType);
    const IconComponent = iconInfo.icon;
    const displayName = node.title || node.name;

    return (
      <div
        key={node.path}
        onClick={() => setSelectedFile(node)}
        className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all group ${
          isSelected
            ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
            : 'hover:bg-white/5 text-slate-300'
        }`}
        style={{ paddingLeft: `${Math.max(12, depth * 22 + 12)}px` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1 rounded ${iconInfo.bg}`}>
            <IconComponent className={`w-3.5 h-3.5 ${iconInfo.color}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate group-hover:text-white">
                {displayName}
              </span>
              {node.unitStandardId && (
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] shrink-0 font-bold">
                  US {node.unitStandardId}
                </span>
              )}
              {node.friendlyDocType && (
                <span className={`px-2 py-0.2 rounded-full border text-[10px] shrink-0 hidden sm:inline-block font-medium ${iconInfo.badge}`}>
                  {node.friendlyDocType}
                </span>
              )}
            </div>
            {node.title && node.title !== node.name && (
              <span className="text-[11px] text-slate-400 font-mono block truncate group-hover:text-slate-300">
                📄 {node.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
          <span className="font-mono text-[11px] hidden md:inline-block">{node.formattedSize}</span>
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <button
              title="Open Document"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewModalFile(node);
              }}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <a
              title="Direct Download"
              href={`/rosco/api/course-documents/file?path=${encodeURIComponent(node.path)}&download=true`}
              download={node.name}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  const activeDoc = selectedFile;
  const activeIconInfo = activeDoc ? getFileIconInfo(activeDoc.extension, activeDoc.friendlyDocType) : null;
  const ActiveIcon = activeIconInfo ? activeIconInfo.icon : FileText;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 shadow-inner">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  Course Documents
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold tracking-wide">
                    Live Filesystem Repository
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  Root: <span className="text-indigo-300 font-semibold">{treeData?.rootPath || '/var/www/introsoft.co.za/public_html/rosco/corse_documents'}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dynamically scanned source training materials, learner guides, workbooks, facilitator guides, summative assessments, and POE specifications for <strong className="text-white">NC: General Security Practice 58577</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={fetchTree}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Rescan Disk</span>
            </button>
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Real-time Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-xs text-slate-400 block">Total Course Documents</span>
            <span className="text-xl font-bold text-white font-mono">{treeData?.totalFiles ?? '—'}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-xs text-slate-400 block">Folders & Subfolders</span>
            <span className="text-xl font-bold text-amber-400 font-mono">{treeData?.totalDirectories ?? '—'}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-xs text-slate-400 block">Repository Size</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{treeData?.totalSizeFormatted ?? '—'}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-xs text-slate-400 block">Qualification SAQA ID</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">58577 (NQF 3)</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Dynamic Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, folders, or Unit Standard code (e.g., 9010, 119457, 244189, learner guide)..."
            className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'PDF', label: 'PDFs' },
            { id: 'LG', label: 'Learner Guides' },
            { id: 'LW', label: 'Workbooks' },
            { id: 'FG', label: 'Facilitators' },
            { id: 'ASSESSMENT', label: 'Assessments / PoE' },
            { id: 'WORD', label: 'Word / Docs' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setTypeFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === filter.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Explorer Tree or Search Results (7 cols on large) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col min-h-[560px]">
          <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                {searchQuery.trim() ? `Search Results (${searchResults.length})` : 'Hierarchy Explorer'}
              </h2>
            </div>
            {searchQuery.trim() && (
              <span className="text-xs text-indigo-300">
                Matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-[700px] custom-scrollbar">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-sm font-medium">Scanning dynamic filesystem...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-rose-400 space-y-3">
                <Info className="w-8 h-8 mx-auto opacity-70" />
                <div className="text-sm font-semibold">{error}</div>
                <button
                  onClick={fetchTree}
                  className="px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
                >
                  Retry Scan
                </button>
              </div>
            ) : searchQuery.trim() ? (
              /* Search Results List */
              searchResults.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <FileQuestion className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-sm">No documents found matching &ldquo;{searchQuery}&rdquo;.</p>
                  <p className="text-xs text-slate-500">Try searching by Unit Standard number (e.g. 9010, 119457) or document type (LG, Workbook, Facilitator).</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((item) => {
                    const iconInfo = getFileIconInfo(item.extension, item.friendlyDocType);
                    const ItemIcon = iconInfo.icon;
                    const isSelected = selectedFile?.path === item.path;
                    const displayName = item.title || item.name;

                    return (
                      <div
                        key={item.path}
                        onClick={() => setSelectedFile(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500/50 shadow-md text-white'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${iconInfo.bg} shrink-0`}>
                            <ItemIcon className={`w-4 h-4 ${iconInfo.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold truncate text-white">
                                {displayName}
                              </span>
                              {item.unitStandardId && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold">
                                  US {item.unitStandardId}
                                </span>
                              )}
                              <span className={`px-2 py-0.2 rounded-full border text-[10px] ${iconInfo.badge}`}>
                                {item.friendlyDocType}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 truncate mt-0.5 font-mono">
                              <span>📄 {item.name}</span>
                              <span>•</span>
                              <span>📁 {item.folderPath || 'corse_documents root'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
                            {item.formattedSize}
                          </span>
                          <button
                            title="Preview Document"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModalFile(item);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            title="Download Document"
                            href={`/rosco/api/course-documents/file?path=${encodeURIComponent(item.path)}&download=true`}
                            download={item.name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Recursive Tree View */
              <div className="space-y-1">
                {treeData?.children && treeData.children.length > 0 ? (
                  treeData.children.map(child => renderTreeNode(child, 0))
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    <Folder className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                    <p className="text-sm">No folders or files found in course documents repository.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Document Inspector & Actions (5 cols on large) */}
        <div className="lg:col-span-5 space-y-6">
          {activeDoc ? (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-3 rounded-xl ${activeIconInfo?.bg || 'bg-indigo-500/20'} shrink-0`}>
                    <ActiveIcon className={`w-6 h-6 ${activeIconInfo?.color || 'text-indigo-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate" title={activeDoc.title || activeDoc.name}>
                      {activeDoc.title || activeDoc.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${activeIconInfo?.badge || ''}`}>
                        {activeDoc.friendlyDocType || 'Course Document'}
                      </span>
                      {activeDoc.unitStandardId && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold">
                          US {activeDoc.unitStandardId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Document Metadata Table */}
              <div className="space-y-3 text-xs">
                <div className="bg-white/5 rounded-xl p-3 space-y-2 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Name:</span>
                    <span className="font-mono text-white text-right truncate max-w-[240px]" title={activeDoc.name}>
                      {activeDoc.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Relative Path:</span>
                    <span className="font-mono text-slate-200 text-right truncate max-w-[240px]" title={activeDoc.path}>
                      {activeDoc.path}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Extension:</span>
                    <span className="font-mono text-indigo-300 font-bold uppercase">{activeDoc.extension || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-mono text-slate-200">{activeDoc.formattedSize || (activeDoc.size ? `${activeDoc.size} bytes` : '—')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MIME Content-Type:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[200px]">{activeDoc.mimeType || 'application/octet-stream'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Modified:</span>
                    <span className="font-mono text-slate-300">
                      {activeDoc.lastModified ? new Date(activeDoc.lastModified).toLocaleString('en-ZA') : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ROSCO Qualification Integration
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Source reference material for rebuilding qualification credit architecture, formative/summative assessment instruments, and SASSETA verification audits.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setPreviewModalFile(activeDoc)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open / View</span>
                </button>

                <a
                  href={`/rosco/api/course-documents/file?path=${encodeURIComponent(activeDoc.path)}&download=true`}
                  download={activeDoc.name}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Document Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click on any document in the tree explorer or search results on the left to inspect its metadata, preview in browser, or download.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 text-left space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Naming Convention Quick Reference:
                </div>
                <ul className="space-y-1 pl-6 list-disc text-slate-400 text-[11px]">
                  <li><strong className="text-slate-200">*-LG.pdf</strong>: Learner Guide</li>
                  <li><strong className="text-slate-200">*-LW.pdf</strong>: Learner Workbook / Activity Book</li>
                  <li><strong className="text-slate-200">*-FG.pdf</strong>: Facilitator Guide</li>
                  <li><strong className="text-slate-200">*-SA.pdf</strong>: Summative Assessment Tool</li>
                  <li><strong className="text-slate-200">*-POE.pdf</strong>: Portfolio of Evidence Guide</li>
                </ul>
              </div>
            </div>
          )}

          {/* Repository Architecture Notice */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Filesystem Security & Dynamic Synchronization
            </div>
            <p className="text-[11px] leading-relaxed">
              Files and folders placed under <code className="text-indigo-300 font-mono">/var/www/introsoft.co.za/public_html/rosco/corse_documents</code> are rendered dynamically in real-time. Path traversal (<code className="text-rose-400 font-mono">../</code>) is blocked at the kernel/Express API level.
            </p>
          </div>
        </div>
      </div>

      {/* Document View / Preview Modal */}
      {previewModalFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {previewModalFile.title || previewModalFile.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
                    <span>📄 {previewModalFile.name}</span>
                    <span>•</span>
                    <span>{previewModalFile.path}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/rosco/api/course-documents/file?path=${encodeURIComponent(previewModalFile.path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={`/rosco/api/course-documents/file?path=${encodeURIComponent(previewModalFile.path)}&download=true`}
                  download={previewModalFile.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewModalFile(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 bg-slate-950 overflow-hidden relative">
              {previewModalFile.extension?.toLowerCase() === '.pdf' ? (
                <iframe
                  src={`/rosco/api/course-documents/file?path=${encodeURIComponent(previewModalFile.path)}#toolbar=1`}
                  className="w-full h-full border-0"
                  title={previewModalFile.name}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <FileText className="w-12 h-12" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-base font-bold text-white">{previewModalFile.name}</h4>
                    <p className="text-xs text-slate-400">
                      This document format ({previewModalFile.extension || 'document'}) is optimized for direct download or local desktop applications.
                    </p>
                  </div>
                  <a
                    href={`/rosco/api/course-documents/file?path=${encodeURIComponent(previewModalFile.path)}&download=true`}
                    download={previewModalFile.name}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {previewModalFile.name}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
