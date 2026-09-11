import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
  Download,
  Trash2,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Award,
  ExternalLink,
  FolderPlus,
  Edit3,
  FileQuestion,
  Layers,
  ArrowUpDown,
  HardDrive,
  Users
} from 'lucide-react';
import { MentorSlaRecord, MentorFile, MentorsSlaSummary } from '../types';

export const MentorsSlaView: React.FC = () => {
  const [mentors, setMentors] = useState<MentorSlaRecord[]>([]);
  const [summary, setSummary] = useState<MentorsSlaSummary | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'COMPLIANT' | 'MISSING_MOU' | 'MISSING_PSIRA'>('ALL');

  // Modals
  const [showAddMentorModal, setShowAddMentorModal] = useState<boolean>(false);
  const [newMentorNumber, setNewMentorNumber] = useState<string>('');
  const [newMentorName, setNewMentorName] = useState<string>('');

  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [renameOldFolder, setRenameOldFolder] = useState<string>('');
  const [renameNewFolder, setRenameNewFolder] = useState<string>('');

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'mentor' | 'file'; folderName: string; fileName?: string } | null>(null);

  const [previewFile, setPreviewFile] = useState<{ file: MentorFile; folderName: string } | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchMentorsData = async (retainSelection = true) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/rosco/api/mentors-sla');
      if (!res.ok) {
        throw new Error(`Failed to load Mentors SLA repository (HTTP ${res.status})`);
      }
      const data = await res.json();
      setMentors(data.mentors || []);
      setSummary(data.summary || null);

      if (data.mentors && data.mentors.length > 0) {
        if (!retainSelection || !selectedFolder || !data.mentors.some((m: MentorSlaRecord) => m.folderName === selectedFolder)) {
          setSelectedFolder(data.mentors[0].folderName);
        }
      } else {
        setSelectedFolder(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mentors SLA data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorsData(false);
  }, []);

  const selectedMentor = useMemo(() => {
    return mentors.find(m => m.folderName === selectedFolder) || null;
  }, [mentors, selectedFolder]);

  // Filtered mentors list
  const filteredMentors = useMemo(() => {
    return mentors.filter(m => {
      const matchesSearch =
        m.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.files.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCompliance = true;
      if (complianceFilter === 'COMPLIANT') {
        matchesCompliance = m.hasMOU && (m.hasPSIRA || m.hasCertificates);
      } else if (complianceFilter === 'MISSING_MOU') {
        matchesCompliance = !m.hasMOU;
      } else if (complianceFilter === 'MISSING_PSIRA') {
        matchesCompliance = !m.hasPSIRA;
      }

      let matchesCategory = true;
      if (selectedCategoryFilter !== 'ALL') {
        matchesCategory = m.categoriesPresent.includes(selectedCategoryFilter);
      }

      return matchesSearch && matchesCompliance && matchesCategory;
    });
  }, [mentors, searchQuery, complianceFilter, selectedCategoryFilter]);

  // Filtered files of selected mentor
  const filteredFiles = useMemo(() => {
    if (!selectedMentor) return [];
    return selectedMentor.files.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'ALL' || f.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [selectedMentor, searchQuery, selectedCategoryFilter]);

  // Handlers
  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName.trim()) return;

    let folderName = newMentorName.trim();
    if (newMentorNumber.trim()) {
      folderName = `${newMentorNumber.trim()}. ${folderName}`;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/rosco/api/mentors-sla/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create mentor folder');
      }

      showToast(`Mentor folder "${folderName}" created successfully`);
      setShowAddMentorModal(false);
      setNewMentorName('');
      setNewMentorNumber('');
      await fetchMentorsData(true);
      setSelectedFolder(folderName);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameNewFolder.trim() || !renameOldFolder) return;

    try {
      setActionLoading(true);
      const res = await fetch('/rosco/api/mentors-sla/mentor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldFolderName: renameOldFolder,
          newFolderName: renameNewFolder.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rename mentor folder');
      }

      showToast(`Folder renamed to "${renameNewFolder.trim()}"`);
      setShowRenameModal(false);
      setSelectedFolder(renameNewFolder.trim());
      await fetchMentorsData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      if (deleteTarget.type === 'mentor') {
        const res = await fetch('/rosco/api/mentors-sla/mentor', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderName: deleteTarget.folderName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete folder');
        showToast(`Mentor folder "${deleteTarget.folderName}" deleted`);
      } else if (deleteTarget.type === 'file' && deleteTarget.fileName) {
        const res = await fetch('/rosco/api/mentors-sla/file', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderName: deleteTarget.folderName,
            fileName: deleteTarget.fileName
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete file');
        showToast(`File "${deleteTarget.fileName}" deleted`);
      }

      setDeleteTarget(null);
      await fetchMentorsData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!selectedFolder || !files || files.length === 0) return;

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('folderName', selectedFolder);

      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/rosco/api/mentors-sla/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      showToast(`Successfully uploaded ${data.uploadedCount || files.length} file(s)`);
      await fetchMentorsData(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const ext = fileName.toLowerCase();
    if (ext.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-400 shrink-0" />;
    }
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
    if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.webp')) {
      return <ImageIcon className="w-5 h-5 text-sky-400 shrink-0" />;
    }
    if (ext.includes('mou') || ext.includes('sla')) {
      return <FileCheck className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    return <FileQuestion className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'MOU / SLA Agreement':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PSIRA Accreditation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Learner Allocation Roster':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Safety & Compliance Training':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'National Qualifications':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Identity & Legal Documents':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'CV & Assessor Credentials':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-white/10 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FolderCheckIcon className="w-3.5 h-3.5" />
                Live File System Repository
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Path: /Mentors SLA
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Mentors SLA & Evidence Portfolios
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Dynamically synchronizes with on-disk mentor folders in <code className="text-indigo-300 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">Mentors SLA</code>. Tracks signed MOUs, PSIRA registrations, qualifications, safety certificates, and allocated learner registers with live file upload & management.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchMentorsData(true)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              title="Rescan Disk Folder"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Rescan</span>
            </button>

            <button
              onClick={() => {
                const nextNum = mentors.length + 1;
                setNewMentorNumber(String(nextNum));
                setShowAddMentorModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Add Mentor Folder
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Active Mentors</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{summary.totalMentors}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">100%</span> mapped to folders
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Evidence Files</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{summary.totalFiles}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Across <span className="text-indigo-300 font-medium">{summary.categories.length}</span> categories
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">MOU / SLA Signed</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{summary.totalMOUCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">{summary.totalMentors > 0 ? Math.round((summary.totalMOUCount / summary.totalMentors) * 100) : 0}%</span> compliance
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Disk Storage Used</span>
              <HardDrive className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{summary.totalSizeFormatted}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {summary.totalPSIRACount} PSIRA + {summary.totalLearnerListsCount} Learner Rosters
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mentors by name, folder number, or file keywords (e.g. MOU, PSIRA, First Aid, CV)..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compliance Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/10 overflow-x-auto">
            <button
              onClick={() => setComplianceFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                complianceFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Mentors ({mentors.length})
            </button>
            <button
              onClick={() => setComplianceFilter('COMPLIANT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                complianceFilter === 'COMPLIANT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Fully Documented
            </button>
            <button
              onClick={() => setComplianceFilter('MISSING_MOU')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                complianceFilter === 'MISSING_MOU'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Missing MOU
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        {summary && summary.categories && summary.categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs custom-scrollbar">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-500" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All Types
            </button>
            {summary.categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.name ? 'ALL' : cat.name)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategoryFilter === cat.name
                    ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat.name}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-slate-300 font-mono">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Mentor Folders, Right File Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mentor Folders List (5 Cols on large screen) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <span>Mentor Folders ({filteredMentors.length})</span>
            <span>Files / Size</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-900/60 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No mentors found</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredMentors.map((mentor) => {
                const isSelected = mentor.folderName === selectedFolder;
                return (
                  <div
                    key={mentor.folderName}
                    onClick={() => setSelectedFolder(mentor.folderName)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950/90 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-slate-800 text-slate-300 border-white/10 group-hover:border-white/20'
                          }`}
                        >
                          {mentor.orderNumber !== 999 ? mentor.orderNumber : '#'}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate leading-tight flex items-center gap-1.5">
                            {mentor.mentorName}
                          </h3>
                          <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                            {mentor.folderName}
                          </p>

                          {/* Quick compliance badges */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {mentor.hasMOU ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> MOU
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> No MOU
                              </span>
                            )}

                            {mentor.hasPSIRA && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                                PSIRA
                              </span>
                            )}

                            {mentor.hasLearnerList && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium">
                                Roster
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-indigo-300 block">
                          {mentor.fileCount} {mentor.fileCount === 1 ? 'file' : 'files'}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                          {mentor.totalSizeFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Mentor Files & Details (8 Cols on large screen) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedMentor ? (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-xl space-y-6">
              {/* Selected Mentor Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                    {selectedMentor.orderNumber !== 999 ? selectedMentor.orderNumber : <Folder className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {selectedMentor.mentorName}
                      </h2>
                      <button
                        onClick={() => {
                          setRenameOldFolder(selectedMentor.folderName);
                          setRenameNewFolder(selectedMentor.folderName);
                          setShowRenameModal(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Rename Folder"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>Folder: {selectedMentor.folderName}</span>
                      <span>•</span>
                      <span>{selectedMentor.fileCount} documents</span>
                      <span>•</span>
                      <span>{selectedMentor.totalSizeFormatted}</span>
                    </p>
                  </div>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>

                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: 'mentor',
                        folderName: selectedMentor.folderName
                      })
                    }
                    disabled={actionLoading}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs transition-colors"
                    title="Delete Mentor Folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Compliance Checklist Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  {selectedMentor.hasMOU ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-white">SLA / MOU</div>
                    <div className="text-[10px] text-slate-400">{selectedMentor.hasMOU ? 'Verified' : 'Missing'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMentor.hasPSIRA ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-white">PSIRA Reg</div>
                    <div className="text-[10px] text-slate-400">{selectedMentor.hasPSIRA ? 'Registered' : 'Not Found'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMentor.hasCertificates ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-white">Qualifications</div>
                    <div className="text-[10px] text-slate-400">{selectedMentor.hasCertificates ? 'Present' : 'None'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMentor.hasLearnerList ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-white">Learner Roster</div>
                    <div className="text-[10px] text-slate-400">{selectedMentor.hasLearnerList ? 'Linked' : 'Pending'}</div>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-white/15 hover:border-indigo-400/50 bg-slate-950/30 hover:bg-slate-950/50'
                }`}
              >
                <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                <p className="text-xs text-white font-medium">
                  Drag and drop files here to upload to <span className="text-indigo-300 font-semibold">{selectedMentor.mentorName}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports PDFs, Excel spreadsheets (.xlsx, .csv), Images (.jpg, .png), and Word docs
                </p>
              </div>

              {/* Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                  <span>Mentor Evidence Documents ({filteredFiles.length})</span>
                  <span>Size & Actions</span>
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-white/5 text-center">
                    <FileQuestion className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">No files matching criteria</p>
                    <p className="text-slate-400 text-xs mt-1">Upload files using the button above or drag them into the box.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-slate-950/40">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.name}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {getFileIcon(file.name, file.mimeType)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => setPreviewFile({ file, folderName: selectedMentor.folderName })}
                                className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer truncate max-w-md block"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${getCategoryBadgeClass(
                                  file.category
                                )}`}
                              >
                                {file.category}
                              </span>

                              <span className="text-[11px] text-slate-400 font-mono">
                                {file.formattedSize}
                              </span>

                              {file.sha256 && (
                                <span
                                  className="text-[10px] text-slate-400 font-mono hidden md:inline"
                                  title={`SHA256: ${file.sha256}`}
                                >
                                  SHA: {file.sha256.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* File Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => setPreviewFile({ file, folderName: selectedMentor.folderName })}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Preview File"
                          >
                            <Eye className="w-4 h-4 text-indigo-400" />
                          </button>

                          <a
                            href={`${file.previewUrl}&download=true`}
                            download={file.name}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Download File"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                          </a>

                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'file',
                                folderName: selectedMentor.folderName,
                                fileName: file.name
                              })
                            }
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-white/10 text-center">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Select a Mentor</h3>
              <p className="text-slate-400 text-sm mt-1">
                Choose a mentor from the left list to view, upload, or manage their SLA and compliance documents.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add New Mentor Folder */}
      {showAddMentorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Mentor Folder</h3>
                  <p className="text-xs text-slate-400">Creates directory in /Mentors SLA</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMentorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No.
                  </label>
                  <input
                    type="text"
                    value={newMentorNumber}
                    onChange={(e) => setNewMentorNumber(e.target.value)}
                    placeholder="11"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mentor Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMentorName}
                    onChange={(e) => setNewMentorName(e.target.value)}
                    placeholder="e.g. Sipho Mthembu"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 font-mono">
                Will create folder: <span className="text-indigo-300">{newMentorNumber ? `${newMentorNumber}. ` : ''}{newMentorName || '[Name]'}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMentorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newMentorName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Rename Mentor Folder */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Rename Folder</h3>
                  <p className="text-xs text-slate-400">Rename on-disk mentor directory</p>
                </div>
              </div>
              <button
                onClick={() => setShowRenameModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenameMentor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={renameNewFolder}
                  onChange={(e) => setRenameNewFolder(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !renameNewFolder.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
                <p className="text-xs text-rose-300">This action will delete the file/folder permanently from disk</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              {deleteTarget.type === 'mentor' ? (
                <>
                  Are you sure you want to delete the entire mentor folder <strong className="text-white font-mono">{deleteTarget.folderName}</strong> and all files within it?
                </>
              ) : (
                <>
                  Are you sure you want to delete <strong className="text-white">{deleteTarget.fileName}</strong> from <strong className="text-indigo-300">{deleteTarget.folderName}</strong>?
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Document Viewer / Preview */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(previewFile.file.name, previewFile.file.mimeType)}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate max-w-lg">
                    {previewFile.file.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {previewFile.folderName} • {previewFile.file.formattedSize} • {previewFile.file.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${previewFile.file.previewUrl}&download=true`}
                  download={previewFile.file.name}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4">
              {previewFile.file.extension === '.pdf' ? (
                <iframe
                  src={previewFile.file.previewUrl}
                  title={previewFile.file.name}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                />
              ) : previewFile.file.extension === '.jpg' ||
                previewFile.file.extension === '.jpeg' ||
                previewFile.file.extension === '.png' ? (
                <div className="max-h-full max-w-full flex flex-col items-center justify-center">
                  <img
                    src={previewFile.file.previewUrl}
                    alt={previewFile.file.name}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg border border-white/10 shadow-2xl"
                  />
                  <p className="text-xs text-slate-400 mt-2 font-mono">{previewFile.file.name}</p>
                </div>
              ) : (
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-300">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">{previewFile.file.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Spreadsheet and data documents are ready for local inspection in Excel or Google Sheets.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-left text-xs text-slate-300 font-mono mt-4 space-y-1">
                    <div>Size: {previewFile.file.formattedSize}</div>
                    <div>Type: {previewFile.file.mimeType}</div>
                    {previewFile.file.sha256 && <div>SHA256: {previewFile.file.sha256}</div>}
                  </div>
                  <a
                    href={`${previewFile.file.previewUrl}&download=true`}
                    download={previewFile.file.name}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download File ({previewFile.file.formattedSize})
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

function FolderCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  );
}
