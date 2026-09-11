import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WorkplaceScheduleRecord, Learner, Assessor } from '../types';
import { 
  Calendar, Layers, CheckCircle2, Clock, Search, Filter, 
  Download, RefreshCw, ChevronLeft, ChevronRight, 
  ExternalLink, Edit2, Check, X, UserCheck, ShieldAlert, Sparkles, Eye,
  User, Printer, Grid, List, CheckSquare, Award, ArrowRight, ArrowLeft,
  Briefcase, Plus, Trash2, Shield
} from 'lucide-react';

interface WorkplaceExposureViewProps {
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  learners?: Learner[];
  onSelectLearner?: (learner: Learner) => void;
  initialLearnerNo?: string;
}

interface WorkplaceLearnerSummary {
  learnerNo: string;
  learnerName: string;
  learnerIdNumber: string;
  totalRecords: number;
  verifiedCount: number;
  awaitingCount: number;
}

export const WorkplaceExposureView: React.FC<WorkplaceExposureViewProps> = ({
  selectedYear: initialSelectedYear = '2021',
  onYearChange,
  learners: propLearners = [],
  onSelectLearner,
  initialLearnerNo
}) => {
  // Year Filter
  const [selectedYear, setSelectedYear] = useState<string>(initialSelectedYear);

  // Week Filter (Default: 2)
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(2);

  // Month Filter (Default: 'all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // View Mode: 'learnerView' | 'table' | 'matrix'
  const [viewMode, setViewMode] = useState<'table' | 'learnerView' | 'matrix'>('table');

  // Learner Filter
  const [selectedLearnerNo, setSelectedLearnerNo] = useState<string>(initialLearnerNo || 'all');
  const [learnerList, setLearnerList] = useState<WorkplaceLearnerSummary[]>([]);
  const [loadingLearners, setLoadingLearners] = useState(false);

  // Table Data
  const [records, setRecords] = useState<WorkplaceScheduleRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsId, setSelectedUsId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Accredited Assessors (DB-driven)
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [loadingAssessors, setLoadingAssessors] = useState(false);
  const [selectedAssessor, setSelectedAssessor] = useState<string>('all');
  const [batchAssessorTarget, setBatchAssessorTarget] = useState<string>('');
  const [isAssessorModalOpen, setIsAssessorModalOpen] = useState(false);
  const [editingAssessor, setEditingAssessor] = useState<Assessor | null>(null);
  const [isSavingAssessor, setIsSavingAssessor] = useState(false);
  const [showAddAssessorForm, setShowAddAssessorForm] = useState(false);
  const [newAssessorForm, setNewAssessorForm] = useState<Partial<Assessor>>({
    name: '',
    regNumber: '',
    idNumber: '',
    role: 'Workplace Assessor / Mentor',
    phone: '',
    email: '',
    center: 'Pretoria Campus',
    unitStandardScope: '',
    active: true
  });

  // Single Learner Dossier Records
  const [singleLearnerRecords, setSingleLearnerRecords] = useState<WorkplaceScheduleRecord[]>([]);
  const [singleLearnerLoading, setSingleLearnerLoading] = useState(false);
  const [learnerVerifyLoading, setLearnerVerifyLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<{
    totalRecords: number;
    learnersCount: number;
    unitStandardsCount: number;
    byWeek: { week: number; count: number }[];
    byStatus: { verificationStatus: string; count: number }[];
    byAssessor?: { name: string; count: number; verifiedCount: number }[];
  }>({
    totalRecords: 4048,
    learnersCount: 176,
    unitStandardsCount: 23,
    byWeek: [{ week: 2, count: 4048 }],
    byStatus: [{ verificationStatus: 'Awaiting Evidence', count: 4048 }],
    byAssessor: []
  });

  // Selected row for editing
  const [editingRecord, setEditingRecord] = useState<WorkplaceScheduleRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Selected rows for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  // Sync external year change
  useEffect(() => {
    if (initialSelectedYear && initialSelectedYear !== selectedYear) {
      setSelectedYear(initialSelectedYear);
    }
  }, [initialSelectedYear]);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
    setPage(0);
  };

  // Fetch DB Assessors
  const fetchAssessors = async () => {
    setLoadingAssessors(true);
    try {
      const res = await fetch('/rosco/api/assessors');
      const data = await res.json();
      setAssessors(data.assessors || []);
    } catch (err) {
      console.error('Error fetching assessors:', err);
    } finally {
      setLoadingAssessors(false);
    }
  };

  // Fetch stats based on year, week, month & assessor
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedYear && selectedYear !== 'All') params.append('year', selectedYear);
      if (selectedWeek !== 'all') params.append('week', String(selectedWeek));
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedAssessor !== 'all') params.append('assessor', selectedAssessor);
      const res = await fetch(`/rosco/api/workplace-schedules/stats?${params.toString()}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch learners list for dropdown & matrix
  const fetchLearnersList = async () => {
    setLoadingLearners(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear && selectedYear !== 'All') params.append('year', selectedYear);
      if (selectedWeek !== 'all') params.append('week', String(selectedWeek));
      const res = await fetch(`/rosco/api/workplace-schedules/learners?${params.toString()}`);
      const data = await res.json();
      const list: WorkplaceLearnerSummary[] = data.learners || [];
      setLearnerList(list);

      // If initialLearnerNo is set or if currently selected learner is valid
      if (selectedLearnerNo === 'all' && list.length > 0 && viewMode === 'learnerView') {
        setSelectedLearnerNo(list[0].learnerNo);
      }
    } catch (err) {
      console.error('Error fetching learners list:', err);
    } finally {
      setLoadingLearners(false);
    }
  };

  // Fetch records for table
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWeek !== 'all') params.append('week', String(selectedWeek));
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedYear && selectedYear !== 'All') params.append('year', selectedYear);
      if (selectedLearnerNo !== 'all') params.append('learnerNo', selectedLearnerNo);
      if (selectedUsId !== 'all') params.append('usId', selectedUsId);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedAssessor !== 'all') params.append('assessor', selectedAssessor);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('limit', String(pageSize));
      params.append('offset', String(page * pageSize));

      const res = await fetch(`/rosco/api/workplace-schedules?${params.toString()}`);
      const data = await res.json();
      setRecords(data.records || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Error loading workplace schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single learner's complete practical records
  const fetchSingleLearnerRecords = async (learnerNo: string) => {
    if (!learnerNo || learnerNo === 'all') return;
    setSingleLearnerLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWeek !== 'all') params.append('week', String(selectedWeek));
      const res = await fetch(`/rosco/api/workplace-schedules/learner/${encodeURIComponent(learnerNo)}?${params.toString()}`);
      const data = await res.json();
      setSingleLearnerRecords(data.records || []);
    } catch (err) {
      console.error('Error loading single learner records:', err);
    } finally {
      setSingleLearnerLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessors();
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLearnersList();
  }, [selectedYear, selectedWeek, selectedMonth, selectedAssessor]);

  useEffect(() => {
    setPage(0);
  }, [selectedYear, selectedWeek, selectedMonth, selectedLearnerNo, selectedUsId, selectedStatus, selectedAssessor, searchQuery]);

  useEffect(() => {
    fetchRecords();
  }, [page, selectedYear, selectedWeek, selectedMonth, selectedLearnerNo, selectedUsId, selectedStatus, selectedAssessor, searchQuery]);

  useEffect(() => {
    if (selectedLearnerNo !== 'all') {
      fetchSingleLearnerRecords(selectedLearnerNo);
    }
  }, [selectedLearnerNo, selectedWeek]);

  // Handle Edit Save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      const res = await fetch('/rosco/api/workplace-schedules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord)
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Record ${editingRecord.id} updated in database.`);
        setTimeout(() => setStatusNotification(null), 3500);
        setEditingRecord(null);
        fetchRecords();
        fetchStats();
        fetchAssessors();
        if (selectedLearnerNo !== 'all') {
          fetchSingleLearnerRecords(selectedLearnerNo);
        }
      }
    } catch (err) {
      console.error('Error updating record:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline reassignment of assessor for single row directly into DB
  const handleInlineAssessorChange = async (recordId: string, newAssessor: string) => {
    try {
      const res = await fetch('/rosco/api/workplace-schedules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: recordId,
          assessorMentor: newAssessor
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, assessorMentor: newAssessor } : r));
        if (selectedLearnerNo !== 'all') {
          setSingleLearnerRecords(prev => prev.map(r => r.id === recordId ? { ...r, assessorMentor: newAssessor } : r));
        }
        setStatusNotification(`Assessor mentor updated to ${newAssessor} for record ${recordId}.`);
        setTimeout(() => setStatusNotification(null), 3000);
        fetchStats();
        fetchAssessors();
      }
    } catch (err) {
      console.error('Error updating assessor mentor:', err);
    }
  };

  // Toggle status for single row directly
  const handleToggleRowStatus = async (record: WorkplaceScheduleRecord) => {
    const nextStatus = record.verificationStatus === 'Verified' ? 'Awaiting Evidence' : 'Verified';
    const verifier = nextStatus === 'Verified' 
      ? (record.assessorMentor || (selectedAssessor !== 'all' ? selectedAssessor : 'Lead Workplace Assessor'))
      : '';
    try {
      const res = await fetch('/rosco/api/workplace-schedules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record.id,
          verificationStatus: nextStatus,
          verifiedBy: verifier
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchRecords();
        fetchStats();
        fetchAssessors();
        if (selectedLearnerNo !== 'all') {
          fetchSingleLearnerRecords(selectedLearnerNo);
        }
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Batch assign assessor to selected rows in DB
  const handleBatchAssignAssessor = async (assessorName: string) => {
    if (selectedIds.length === 0 || !assessorName) return;
    setIsBatchUpdating(true);
    try {
      const res = await fetch('/rosco/api/workplace-schedules/batch-assign-assessor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, assessorMentor: assessorName })
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Successfully assigned Assessor "${assessorName}" to ${data.count} practical records.`);
        setTimeout(() => setStatusNotification(null), 3500);
        setSelectedIds([]);
        setBatchAssessorTarget('');
        fetchRecords();
        fetchStats();
        fetchAssessors();
      }
    } catch (err) {
      console.error('Batch assessor assignment failed:', err);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  // Batch mark verified
  const handleBatchStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    setIsBatchUpdating(true);
    const verifier = selectedAssessor !== 'all' ? selectedAssessor : 'Lead Workplace Assessor';
    try {
      const res = await fetch('/rosco/api/workplace-schedules/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status, verifiedBy: verifier })
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Successfully updated ${data.count} records to "${status}".`);
        setTimeout(() => setStatusNotification(null), 3500);
        setSelectedIds([]);
        fetchRecords();
        fetchStats();
        fetchLearnersList();
        fetchAssessors();
      }
    } catch (err) {
      console.error('Batch status update failed:', err);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  // Verify all practicals for selected learner
  const handleVerifyLearnerWeek = async (learnerNo: string) => {
    setLearnerVerifyLoading(true);
    const verifier = selectedAssessor !== 'all' ? selectedAssessor : 'Lead Workplace Assessor';
    try {
      const res = await fetch('/rosco/api/workplace-schedules/verify-learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerNo,
          week: selectedWeek === 'all' ? 2 : selectedWeek,
          status: 'Verified',
          verifiedBy: verifier
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Verified ${data.updatedCount} practical records for ${learnerNo} under Assessor ${verifier}.`);
        setTimeout(() => setStatusNotification(null), 3500);
        fetchSingleLearnerRecords(learnerNo);
        fetchRecords();
        fetchStats();
        fetchLearnersList();
        fetchAssessors();
      }
    } catch (err) {
      console.error('Error verifying learner practicals:', err);
    } finally {
      setLearnerVerifyLoading(false);
    }
  };

  // Assessor Management (CRUD directly in DB)
  const handleCreateAssessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessorForm.name) return;
    setIsSavingAssessor(true);
    try {
      const res = await fetch('/rosco/api/assessors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssessorForm)
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Assessor ${newAssessorForm.name} created and registered in database.`);
        setTimeout(() => setStatusNotification(null), 3500);
        setShowAddAssessorForm(false);
        setNewAssessorForm({
          name: '',
          regNumber: '',
          idNumber: '',
          role: 'Workplace Assessor / Mentor',
          phone: '',
          email: '',
          center: 'Pretoria Campus',
          unitStandardScope: '',
          active: true
        });
        fetchAssessors();
      }
    } catch (err) {
      console.error('Error creating assessor:', err);
    } finally {
      setIsSavingAssessor(false);
    }
  };

  const handleUpdateAssessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessor) return;
    setIsSavingAssessor(true);
    try {
      const res = await fetch(`/rosco/api/assessors/${editingAssessor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAssessor)
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Assessor ${editingAssessor.name} updated in database.`);
        setTimeout(() => setStatusNotification(null), 3500);
        setEditingAssessor(null);
        fetchAssessors();
        fetchRecords();
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating assessor:', err);
    } finally {
      setIsSavingAssessor(false);
    }
  };

  const handleDeleteAssessor = async (id: string, name: string) => {
    if (!window.confirm(`Delete assessor "${name}" from database?`)) return;
    try {
      const res = await fetch(`/rosco/api/assessors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Assessor ${name} deleted from database.`);
        setTimeout(() => setStatusNotification(null), 3500);
        fetchAssessors();
      }
    } catch (err) {
      console.error('Error deleting assessor:', err);
    }
  };

  // Generate Week 3 or Week 4
  const handleGenerateWeek = async (weekNum: number) => {
    const confirmMsg = `Generate 4,048 records for Workplace Exposure Week ${weekNum}?`;
    if (!window.confirm(confirmMsg)) return;
    setLoading(true);
    try {
      const res = await fetch('/rosco/api/workplace-schedules/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: weekNum })
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Week ${weekNum} records generated (${data.insertedCount} records).`);
        setTimeout(() => setStatusNotification(null), 4000);
        setSelectedWeek(weekNum);
        fetchStats();
        fetchLearnersList();
        fetchRecords();
      }
    } catch (err) {
      console.error('Error generating week records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick toggle selection
  const handleSelectAllOnPage = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Step through learners in Single Learner View
  const currentLearnerIndex = learnerList.findIndex(l => l.learnerNo === selectedLearnerNo);
  const handlePrevLearner = () => {
    if (currentLearnerIndex > 0) {
      setSelectedLearnerNo(learnerList[currentLearnerIndex - 1].learnerNo);
    }
  };
  const handleNextLearner = () => {
    if (currentLearnerIndex < learnerList.length - 1) {
      setSelectedLearnerNo(learnerList[currentLearnerIndex + 1].learnerNo);
    }
  };

  // Select learner and open dossier
  const handleSelectLearnerDossier = (learnerNo: string) => {
    setSelectedLearnerNo(learnerNo);
    setViewMode('learnerView');
  };

  // Print single learner sheet
  const handlePrintLearnerSheet = () => {
    window.print();
  };

  // Extract distinct US IDs for dropdown
  const unitStandardsOptions = [
    { usId: '246694', title: '246694 - Explain requirements for security service provider' },
    { usId: '244184', title: '244184 - Apply legal aspects in a security environment' },
    { usId: '244182', title: '244182 - Give evidence in court' },
    { usId: '244176', title: '244176 - Use security equipment' },
    { usId: '244181', title: '244181 - Perform hand over and take over responsibilities' },
    { usId: '244177', title: '244177 - Conduct a security patrol' },
    { usId: '244179', title: '244179 - Handle complaints and problems' },
    { usId: '13912', title: '13912 - Enhance team performance' },
    { usId: '244189', title: '244189 - Conduct access and egress control' },
    { usId: '242825', title: '242825 - Conduct evacuations and emergency drills' },
    { usId: '11505', title: '11505 - Identify, handle and defuse security conflict' },
    { usId: '117705', title: '117705 - Knowledge of Firearms Control Act 2000' },
    { usId: '119465', title: '119465 - Write/present/sign texts' },
    { usId: '113852', title: '113852 - Occupational health, safety & environment' },
    { usId: '11508', title: '11508 - Write security reports and take statements' },
    { usId: '119472', title: '119472 - Accommodate audience in oral/signed comms' },
    { usId: '114941', title: '114941 - HIV/AIDS in specific business sector' },
    { usId: '9010', title: '9010 - Number bases and measurement units' },
    { usId: '9012', title: '9012 - Data and probabilities' },
    { usId: '9013', title: '9013 - Shape and motion in 2D and 3D' },
    { usId: '7456', title: '7456 - Financial issues mathematics' },
    { usId: '119457', title: '119457 - Interpret and use information from texts' },
    { usId: '119467', title: '119467 - Language in occupational learning' }
  ];

  // Helper to format activity dates compactly without repeating months/years/times
  const formatActivityDates = (start?: string, end?: string): string => {
    if (!start && !end) return '—';
    const cleanStart = (start || '').replace(/\s*00:00/g, '').trim();
    const cleanEnd = (end || '').replace(/\s*00:00/g, '').trim();

    if (!cleanEnd || cleanStart === cleanEnd) return cleanStart || cleanEnd;
    if (!cleanStart) return cleanEnd;

    const sParts = cleanStart.split(' ');
    const eParts = cleanEnd.split(' ');

    if (sParts.length === 3 && eParts.length === 3) {
      const [sDay, sMonth, sYear] = sParts;
      const [eDay, eMonth, eYear] = eParts;

      if (sMonth === eMonth && sYear === eYear) {
        return `${sDay} – ${eDay} ${sMonth} ${sYear}`;
      }
      if (sYear === eYear) {
        return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${sYear}`;
      }
    }

    return `${cleanStart} – ${cleanEnd}`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Active single learner summary object
  const activeLearnerSummary = learnerList.find(l => l.learnerNo === selectedLearnerNo);
  const singleLearnerVerifiedCount = singleLearnerRecords.filter(r => r.verificationStatus === 'Verified' || r.verificationStatus === 'Competent').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Workplace Exposure Practicals (Week 2 – Week 4)
              </h2>
              <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-full">
                Historical Database Rebuild
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Tracking practical training and workplace exposure schedules across 176 SASSETA learners and 23 Unit Standards.
              View all Week 2 practicals by individual learner or by year/cohort.
            </p>
          </div>

          {/* Quick Year Selector and Generation buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAssessorModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="View & manage accredited assessors directly in database"
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Accredited Assessors ({assessors.length})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected to Database" />
            </button>

            <div className="flex items-center bg-[#0f172a] p-1 rounded-xl border border-white/10">
              <span className="text-xs text-slate-400 px-2 font-medium">Cohort Year:</span>
              <button
                onClick={() => handleYearSelect('2021')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedYear === '2021'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2021 (176 Learners)
              </button>
              <button
                onClick={() => handleYearSelect('2023')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedYear === '2023'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2023
              </button>
              <button
                onClick={() => handleYearSelect('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedYear === 'All'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All Years
              </button>
            </div>

            <button
              onClick={() => handleGenerateWeek(3)}
              className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Populate Week 3 practical schedules for all 176 learners"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Generate Week 3
            </button>
            <button
              onClick={() => handleGenerateWeek(4)}
              className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Populate Week 4 practical schedules for all 176 learners"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Generate Week 4
            </button>
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {statusNotification && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            {statusNotification}
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid - 5 Cards including DB Assessors */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.totalRecords.toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-medium">
              {selectedYear !== 'All' ? `${selectedYear} Records` : 'Total Records'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.learnersCount}</div>
            <div className="text-xs text-slate-400 font-medium">Learners in Cohort</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.unitStandardsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Unit Standards (124 Credits)</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {stats.byWeek.map(w => `W${w.week}`).join(', ') || 'W2'}
            </div>
            <div className="text-xs text-slate-400 font-medium">Active Practical Weeks</div>
          </div>
        </div>

        <div 
          onClick={() => setIsAssessorModalOpen(true)}
          className="bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-colors group"
        >
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white flex items-center gap-1.5">
              {assessors.length}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">DB</span>
            </div>
            <div className="text-xs text-indigo-300 font-medium flex items-center gap-1">
              Accredited Assessors &bull; Manage
            </div>
          </div>
        </div>
      </div>

      {/* Database Assessor Allocation & Workload Bar */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Database Assessor Workload & Allocation Roster
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              (Filter practicals by clicking an assessor)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedAssessor !== 'all' && (
              <button
                onClick={() => setSelectedAssessor('all')}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
              >
                <span>Filtered: {selectedAssessor}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsAssessorModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Manage Assessors DB</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedAssessor('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 border transition-all ${
              selectedAssessor === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            All Assessors ({stats.totalRecords})
          </button>

          {assessors.map((a) => {
            const stat = stats.byAssessor?.find(ba => ba.name === a.name);
            const count = stat ? stat.count : 0;
            const isSelected = selectedAssessor === a.name;

            return (
              <button
                key={a.id}
                onClick={() => setSelectedAssessor(isSelected ? 'all' : a.name)}
                className={`px-3 py-2 rounded-xl text-xs shrink-0 border text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-semibold text-xs leading-tight">{a.name}</div>
                  <div className={`text-[10px] font-mono leading-tight ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {count.toLocaleString()} practicals &bull; {a.regNumber ? `Reg: ${a.regNumber}` : a.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Learnership Delivery Structure Card & Month Filter */}
      <div className="bg-[#0f172a]/90 border border-amber-500/20 rounded-2xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Monthly Learnership Delivery Framework</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">1-Month Block</span>
            </h4>
            <p className="text-xs text-slate-300">
              <strong className="text-amber-300">Week 1:</strong> 3 Days Theoretical (Mon – Wed) + 2 Days Online (Thu – Fri) &bull; <strong className="text-indigo-300">Weeks 2 – 4:</strong> 3 Weeks of Workplace Exposure Practicals (Mon – Fri)
            </p>
          </div>
        </div>
        
        {/* Month Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {[
            { id: 'all', label: 'All Months' },
            { id: '01', label: 'Month 01 (Jan)' },
            { id: '02', label: 'Month 02 (Feb)' },
            { id: '03', label: 'Month 03 (Mar)' },
            { id: '04', label: 'Month 04 (Apr)' },
            { id: '05', label: 'Month 05 (May)' },
            { id: '06', label: 'Month 06 (Jun)' },
            { id: '07', label: 'Month 07 (Jul)' },
          ].map((m) => {
            const isSelected = selectedMonth === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Selector Tabs & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
        {/* Week Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedWeek(2)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedWeek === 2 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Week 2 Practical (4,048 Records)
          </button>
          <button
            onClick={() => setSelectedWeek(3)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedWeek === 3 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Week 3 Practical
          </button>
          <button
            onClick={() => setSelectedWeek(4)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedWeek === 4 
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Week 4 Practical
          </button>
          <button
            onClick={() => setSelectedWeek('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedWeek === 'all' 
                ? 'bg-slate-700 text-white font-bold' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            All Weeks
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#0f172a] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Roster Table
          </button>
          <button
            onClick={() => {
              setViewMode('learnerView');
              if (selectedLearnerNo === 'all' && learnerList.length > 0) {
                setSelectedLearnerNo(learnerList[0].learnerNo);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'learnerView' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Learner Practical File
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'matrix' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Cohort Matrix
          </button>
        </div>
      </div>

      {/* Filter Bar (Search + Learner Dropdown + US Dropdown + Status) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search learner name, L-number, ID number, record ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a]/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
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

        {/* Dedicated Learner Selector Dropdown */}
        <div className="w-full md:w-72">
          <select
            value={selectedLearnerNo}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedLearnerNo(val);
              if (val !== 'all' && viewMode !== 'learnerView') {
                // optionally keep current view or switch
              }
            }}
            className="w-full py-2.5 px-3 bg-[#0f172a]/70 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="all">👥 All Learners ({learnerList.length})</option>
            {learnerList.map(l => (
              <option key={l.learnerNo} value={l.learnerNo}>
                {l.learnerNo} – {l.learnerName} ({l.verifiedCount}/{l.totalRecords} ver.)
              </option>
            ))}
          </select>
        </div>

        {/* Unit Standard Dropdown */}
        <select
          value={selectedUsId}
          onChange={(e) => setSelectedUsId(e.target.value)}
          className="w-full md:w-56 py-2.5 px-3 bg-[#0f172a]/70 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All 23 Unit Standards</option>
          {unitStandardsOptions.map(us => (
            <option key={us.usId} value={us.usId}>{us.title}</option>
          ))}
        </select>

        {/* Assessor Mentor (DB) Dropdown */}
        <select
          value={selectedAssessor}
          onChange={(e) => setSelectedAssessor(e.target.value)}
          className="w-full md:w-56 py-2.5 px-3 bg-[#0f172a]/70 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-400"
        >
          <option value="all">👨‍🏫 All Assessors ({assessors.length})</option>
          {assessors.map(a => {
            const stat = stats.byAssessor?.find(ba => ba.name === a.name);
            const count = stat ? stat.count : 0;
            return (
              <option key={a.id} value={a.name}>
                {a.name} ({count > 0 ? `${count} assigned` : a.role})
              </option>
            );
          })}
        </select>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-40 py-2.5 px-3 bg-[#0f172a]/70 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="Awaiting Evidence">Awaiting Evidence</option>
          <option value="Verified">Verified</option>
          <option value="In Progress">In Progress</option>
        </select>

        {/* Clear Filters Button */}
        {(selectedLearnerNo !== 'all' || selectedMonth !== 'all' || selectedUsId !== 'all' || selectedStatus !== 'all' || selectedAssessor !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedLearnerNo('all');
              setSelectedMonth('all');
              setSelectedUsId('all');
              setSelectedStatus('all');
              setSelectedAssessor('all');
              setSearchQuery('');
            }}
            className="p-2.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 shrink-0"
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Active Learner Banner (If single learner selected in any view) */}
      {selectedLearnerNo !== 'all' && (
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-900/30 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl font-bold text-amber-300 shadow-inner">
                {activeLearnerSummary ? activeLearnerSummary.learnerName.charAt(0) : 'L'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                    {selectedLearnerNo}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {activeLearnerSummary ? activeLearnerSummary.learnerName : selectedLearnerNo}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Learner No: <span className="text-amber-400 font-bold">{selectedLearnerNo}</span> &bull; 
                  Cohort: <span className="text-amber-400 font-semibold">{selectedYear === 'All' ? '2021 Group' : `${selectedYear} Cohort`}</span> &bull; 
                  Exposure Week: <span className="text-indigo-300 font-bold">Week {selectedWeek}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Progress pill */}
              <div className="bg-slate-900/80 px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Week {selectedWeek} Verification</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {singleLearnerVerifiedCount} / {singleLearnerRecords.length || 23} Verified
                  </div>
                </div>
                <div className="w-16 bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${(singleLearnerVerifiedCount / (singleLearnerRecords.length || 23)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Verify all button */}
              <button
                onClick={() => handleVerifyLearnerWeek(selectedLearnerNo)}
                disabled={learnerVerifyLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                {learnerVerifyLoading ? 'Verifying...' : `Verify All 23 Practicals`}
              </button>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={handlePrevLearner}
                  disabled={currentLearnerIndex <= 0}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  title="Previous Learner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-400 font-mono px-1">
                  {currentLearnerIndex + 1} of {learnerList.length}
                </span>
                <button
                  onClick={handleNextLearner}
                  disabled={currentLearnerIndex >= learnerList.length - 1}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  title="Next Learner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setSelectedLearnerNo('all')}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl"
                title="Exit single learner view and show full cohort"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 1: SINGLE LEARNER PRACTICAL FILE DOSSIER */}
      {viewMode === 'learnerView' && (
        <div className="space-y-4">
          {selectedLearnerNo === 'all' ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center space-y-4">
              <User className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
              <h3 className="text-xl font-bold text-white">Select a Learner to View Week {selectedWeek} Practical File</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Choose any learner from the dropdown or click a learner in the list below to view all 23 practical unit standard records, verification checklists, and assessor rotations.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto pt-2">
                {learnerList.slice(0, 12).map(l => (
                  <button
                    key={l.learnerNo}
                    onClick={() => setSelectedLearnerNo(l.learnerNo)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/10 text-xs font-mono transition-colors"
                  >
                    {l.learnerNo} &bull; {l.learnerName}
                  </button>
                ))}
              </div>
            </div>
          ) : singleLearnerLoading ? (
            <div className="p-12 text-center text-slate-400 bg-white/5 border border-white/10 rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
              Loading all 23 practical standards for {selectedLearnerNo}...
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-[#0f172a]/80 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Week {selectedWeek} Practical Exposure File &bull; All 23 Unit Standards (124 Credits)
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrintLearnerSheet}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Practical File
                  </button>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {singleLearnerRecords.map((r, index) => {
                  const isVerified = r.verificationStatus === 'Verified' || r.verificationStatus === 'Competent';
                  return (
                    <div 
                      key={r.id} 
                      className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isVerified ? 'bg-emerald-500/[0.02]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-amber-400 shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              US {r.usId}
                            </span>
                            <h4 className="text-sm font-semibold text-white">
                              {r.unitStandardTitle}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                            <span>Activity: <span className="text-slate-200 font-sans font-medium">{r.activityType}</span> &bull; <span className="text-amber-400">{formatActivityDates(r.scheduledStart, r.scheduledEnd)}</span></span>
                            <div className="flex items-center gap-1.5 font-sans">
                              <span>Assessor Mentor (DB):</span>
                              <select
                                value={r.assessorMentor || (assessors[0]?.name || '')}
                                onChange={(e) => handleInlineAssessorChange(r.id, e.target.value)}
                                className="bg-slate-900 border border-indigo-500/30 rounded px-2 py-0.5 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-400 cursor-pointer"
                                title="Reassign assessor mentor in database"
                              >
                                {assessors.map(a => (
                                  <option key={a.id} value={a.name}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {r.evidenceReference && (
                              <span>Ref: <span className="text-emerald-400">{r.evidenceReference}</span></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => handleToggleRowStatus(r)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isVerified
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                          }`}
                        >
                          {isVerified ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {r.verificationStatus}
                        </button>

                        <button
                          onClick={() => setEditingRecord({ ...r })}
                          className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
                          title="Edit actual login/logout & evidence details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: ROSTER SCHEDULE TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Table Header Action Bar */}
          <div className="p-4 bg-[#0f172a]/80 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Displaying {selectedYear !== 'All' ? `${selectedYear} Cohort` : 'All'} &bull; Week {selectedWeek} Practicals
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
                {totalCount.toLocaleString()} Records
              </span>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-amber-300 font-semibold">{selectedIds.length} selected</span>
                
                {/* Batch Reassign Assessor */}
                <div className="flex items-center gap-1 bg-slate-900/80 border border-white/10 rounded-lg p-0.5">
                  <select
                    value={batchAssessorTarget}
                    onChange={(e) => setBatchAssessorTarget(e.target.value)}
                    className="bg-transparent text-xs text-indigo-300 font-medium px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Reassign Assessor (DB)...</option>
                    {assessors.map(a => (
                      <option key={a.id} value={a.name} className="bg-slate-900 text-white">
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!batchAssessorTarget || isBatchUpdating}
                    onClick={() => handleBatchAssignAssessor(batchAssessorTarget)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors"
                  >
                    Assign
                  </button>
                </div>

                <button
                  onClick={() => handleBatchStatus('Verified')}
                  disabled={isBatchUpdating}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Mark Verified
                </button>
                <button
                  onClick={() => handleBatchStatus('Awaiting Evidence')}
                  disabled={isBatchUpdating}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Reset Status
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0f172a]/90 text-xs uppercase font-semibold text-slate-400 border-b border-white/10 tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={records.length > 0 && selectedIds.length === records.length}
                      onChange={handleSelectAllOnPage}
                      className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0"
                    />
                  </th>
                  <th className="p-4 w-28">Learner No</th>
                  <th className="p-4 w-52">Name Surname</th>
                  <th className="p-4">Unit Standard</th>
                  <th className="p-4">Activity & Dates</th>
                  <th className="p-4 w-36 text-center">Status</th>
                  <th className="p-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-sans">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                      Loading practical records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-sans">
                      No workplace practical records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const isSelected = selectedIds.includes(r.id);
                    const isVerified = r.verificationStatus === 'Verified' || r.verificationStatus === 'Competent';

                    return (
                      <tr 
                        key={r.id} 
                        className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-amber-500/10' : ''}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(r.id)}
                            className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0"
                          />
                        </td>
                        <td className="p-4 font-bold text-amber-400 font-mono text-xs">
                          {r.learnerNo}
                        </td>
                        <td className="p-4 font-sans font-medium text-white">
                          <button
                            onClick={() => handleSelectLearnerDossier(r.learnerNo)}
                            className="hover:text-amber-400 hover:underline text-left font-medium"
                            title="Open practical file for this learner"
                          >
                            {r.learnerName}
                          </button>
                        </td>
                        <td className="p-4 font-sans">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                              US {r.usId}
                            </span>
                            <span className="text-xs text-slate-200 font-medium line-clamp-2">
                              {r.unitStandardTitle}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-sans">
                          <div className="text-xs text-slate-200">
                            <span className="font-medium text-white">{r.activityType}</span>
                            <span className="text-slate-500 mx-1.5">&bull;</span>
                            <span className="font-mono text-amber-400/90 text-[11px] font-semibold">
                              {formatActivityDates(r.scheduledStart, r.scheduledEnd)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleRowStatus(r)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors inline-flex items-center gap-1.5 ${
                              isVerified
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                            title={isVerified ? `Verified & Competent (Click to toggle)` : 'Awaiting Evidence (Click to verify)'}
                          >
                            {isVerified ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {r.verificationStatus}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSelectLearnerDossier(r.learnerNo)}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-sans transition-colors inline-flex items-center gap-1"
                              title="View practical file for learner"
                            >
                              <User className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => setEditingRecord({ ...r })}
                              className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg text-xs font-sans transition-colors"
                              title="Edit record details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-[#0f172a]/80 p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing <span className="text-white font-medium">{records.length > 0 ? page * pageSize + 1 : 0}</span> to{' '}
              <span className="text-white font-medium">{Math.min((page + 1) * pageSize, totalCount)}</span> of{' '}
              <span className="text-white font-medium">{totalCount.toLocaleString()}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-white/5 rounded-lg text-slate-300 font-mono">
                Page {page + 1} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: COHORT MATRIX (ALL LEARNERS × 23 STANDARDS) */}
      {viewMode === 'matrix' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-amber-400" />
                Cohort Practical Verification Matrix (Week {selectedWeek})
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Overview of all 176 learners across all 23 Unit Standards. Click any learner to inspect their practical dossier.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Verified
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Awaiting Evidence
              </span>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0f172a] text-[10px] uppercase font-semibold text-slate-400 sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="p-3 w-16">Learner No</th>
                  <th className="p-3 w-48">Learner Name</th>
                  <th className="p-3 w-28 text-center">Week {selectedWeek} Progress</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {learnerList.map((l) => {
                  const pct = Math.round((l.verifiedCount / (l.totalRecords || 23)) * 100);
                  return (
                    <tr key={l.learnerNo} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-amber-400">{l.learnerNo}</td>
                      <td className="p-3 font-sans font-medium text-white">{l.learnerName}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-bold text-slate-200">
                            {l.verifiedCount} / {l.totalRecords}
                          </span>
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-400 h-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          l.verifiedCount === l.totalRecords
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {l.verifiedCount === l.totalRecords ? 'Fully Verified' : `${l.awaitingCount} Awaiting`}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans">
                        <button
                          onClick={() => handleSelectLearnerDossier(l.learnerNo)}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          View 23 Practicals <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-400" />
                  Edit Workplace Record: {editingRecord.id}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingRecord.learnerName} ({editingRecord.learnerNo}) &bull; US {editingRecord.usId}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Verification Status</label>
                  <select
                    value={editingRecord.verificationStatus}
                    onChange={(e) => setEditingRecord({ ...editingRecord, verificationStatus: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Awaiting Evidence">Awaiting Evidence</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Verified">Verified</option>
                    <option value="Competent">Competent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Assessor Mentor (DB)</label>
                  <select
                    value={editingRecord.assessorMentor || (assessors[0]?.name || '')}
                    onChange={(e) => setEditingRecord({ ...editingRecord, assessorMentor: e.target.value })}
                    className="w-full bg-slate-900 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-indigo-300 font-medium focus:outline-none focus:border-indigo-400"
                  >
                    {assessors.map(a => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.regNumber ? `Reg: ${a.regNumber}` : a.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Verified By (Sign-off Assessor)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Assessor or Facilitator name"
                    value={editingRecord.verifiedBy || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, verifiedBy: e.target.value })}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditingRecord({ ...editingRecord, verifiedBy: e.target.value });
                      }
                    }}
                    value=""
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">Quick-select Assessor...</option>
                    {assessors.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Actual Login</label>
                  <input
                    type="text"
                    placeholder="e.g. 11 Jan 2021 08:30"
                    value={editingRecord.actualLogin || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, actualLogin: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Actual Logout</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Jan 2021 16:30"
                    value={editingRecord.actualLogout || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, actualLogout: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Evidence Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Logbook / Attendance Register"
                    value={editingRecord.evidenceSource || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, evidenceSource: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Evidence Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. LOG-2021-W2-001"
                    value={editingRecord.evidenceReference || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, evidenceReference: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Record (DB)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCREDITED ASSESSORS DATABASE MANAGEMENT MODAL */}
      {isAssessorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-white/20 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Accredited Workplace Assessors & Mentors
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Database Synchronized
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Managing registered assessors, SASSETA registration numbers, and assigned workplace practical workloads.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddAssessorForm(!showAddAssessorForm)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddAssessorForm ? 'Cancel Add' : 'Add Assessor'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsAssessorModalOpen(false);
                    setShowAddAssessorForm(false);
                    setEditingAssessor(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add New Assessor Form */}
            {showAddAssessorForm && (
              <form onSubmit={handleCreateAssessor} className="bg-white/5 border border-amber-500/30 rounded-2xl p-4 space-y-4 shrink-0">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Register New Accredited Assessor into DB
                  </h4>
                  <span className="text-[11px] text-slate-400">Syncs automatically with Staff roster</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nomvula Sithole"
                      value={newAssessorForm.name || ''}
                      onChange={(e) => setNewAssessorForm({ ...newAssessorForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">SASSETA Reg Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SAS-ASS-2021-008"
                      value={newAssessorForm.regNumber || ''}
                      onChange={(e) => setNewAssessorForm({ ...newAssessorForm, regNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">SA ID Number</label>
                    <input
                      type="text"
                      placeholder="13-digit ID number"
                      value={newAssessorForm.idNumber || ''}
                      onChange={(e) => setNewAssessorForm({ ...newAssessorForm, idNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role</label>
                    <select
                      value={newAssessorForm.role || 'Workplace Assessor / Mentor'}
                      onChange={(e) => setNewAssessorForm({ ...newAssessorForm, role: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Workplace Assessor / Mentor">Workplace Assessor / Mentor</option>
                      <option value="Lead Workplace Assessor">Lead Workplace Assessor</option>
                      <option value="Lead Facilitator & Assessor">Lead Facilitator & Assessor</option>
                      <option value="Workplace Mentor">Workplace Mentor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Campus / Center</label>
                    <input
                      type="text"
                      placeholder="e.g. Pretoria Campus"
                      value={newAssessorForm.center || ''}
                      onChange={(e) => setNewAssessorForm({ ...newAssessorForm, center: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email / Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. nomvula@rosco.co.za"
                      value={newAssessorForm.email || ''}
                      onChange={(e) => setNewAssessorForm({ ...newAssessorForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAssessorForm(false)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAssessor}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                  >
                    {isSavingAssessor ? 'Saving...' : 'Save Assessor to DB'}
                  </button>
                </div>
              </form>
            )}

            {/* Edit Assessor Inline Box */}
            {editingAssessor && (
              <form onSubmit={handleUpdateAssessor} className="bg-white/5 border border-indigo-500/30 rounded-2xl p-4 space-y-4 shrink-0">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Assessor: {editingAssessor.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingAssessor.name}
                      onChange={(e) => setEditingAssessor({ ...editingAssessor, name: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">SASSETA Reg Number</label>
                    <input
                      type="text"
                      value={editingAssessor.regNumber || ''}
                      onChange={(e) => setEditingAssessor({ ...editingAssessor, regNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">SA ID Number</label>
                    <input
                      type="text"
                      value={editingAssessor.idNumber || ''}
                      onChange={(e) => setEditingAssessor({ ...editingAssessor, idNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role</label>
                    <input
                      type="text"
                      value={editingAssessor.role}
                      onChange={(e) => setEditingAssessor({ ...editingAssessor, role: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Campus / Center</label>
                    <input
                      type="text"
                      value={editingAssessor.center || ''}
                      onChange={(e) => setEditingAssessor({ ...editingAssessor, center: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Scope / Specialization</label>
                    <input
                      type="text"
                      value={editingAssessor.unitStandardScope || ''}
                      onChange={(e) => setEditingAssessor({ ...editingAssessor, unitStandardScope: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAssessor(null)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAssessor}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    {isSavingAssessor ? 'Saving...' : 'Update Assessor in DB'}
                  </button>
                </div>
              </form>
            )}

            {/* Assessors Table */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0f172a] text-[10px] uppercase font-semibold text-slate-400 sticky top-0 border-b border-white/10">
                  <tr>
                    <th className="p-3">Assessor Name</th>
                    <th className="p-3">SASSETA Reg #</th>
                    <th className="p-3">SA ID Number</th>
                    <th className="p-3">Designation / Role</th>
                    <th className="p-3 text-center">Allocated Practicals</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {loadingAssessors ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                        Loading database assessors...
                      </td>
                    </tr>
                  ) : assessors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                        No assessors found in database.
                      </td>
                    </tr>
                  ) : (
                    assessors.map((a) => {
                      const stat = stats.byAssessor?.find(ba => ba.name === a.name);
                      const count = stat ? stat.count : 0;
                      const verifiedCount = stat ? stat.verifiedCount : 0;

                      return (
                        <tr key={a.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-sans font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-[10px] font-bold">
                              {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div>{a.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{a.email || a.phone || a.center || 'Accredited'}</div>
                            </div>
                          </td>
                          <td className="p-3 text-amber-300 font-bold">{a.regNumber || 'Pending Reg'}</td>
                          <td className="p-3 text-slate-400">{a.idNumber || '—'}</td>
                          <td className="p-3 font-sans text-slate-300">{a.role}</td>
                          <td className="p-3 text-center font-sans">
                            <button
                              onClick={() => {
                                setSelectedAssessor(a.name);
                                setIsAssessorModalOpen(false);
                              }}
                              className="px-2 py-0.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-mono text-[11px] font-semibold transition-colors"
                              title="Filter main practical view by this assessor"
                            >
                              {count.toLocaleString()} practicals ({verifiedCount} ver.)
                            </button>
                          </td>
                          <td className="p-3 text-right font-sans">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingAssessor({ ...a })}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors"
                                title="Edit assessor details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAssessor(a.id, a.name)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg transition-colors"
                                title="Delete assessor from DB"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div>
                Total of <span className="text-white font-bold">{assessors.length}</span> accredited assessors registered in SQLite DB.
              </div>
              <button
                onClick={() => setIsAssessorModalOpen(false)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
