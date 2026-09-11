import React, { useState, useRef, useMemo } from 'react';
import { Learner } from '../types';
import { parseSAIDNumber } from '../utils/helpers';
import { FileText, Users, Calendar, BarChart2, Download, Clock, Layers, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

interface ReportsCenterViewProps {
  learners: Learner[];
}

export const ReportsCenterView: React.FC<ReportsCenterViewProps> = ({ learners }) => {
  const [reportType, setReportType] = useState<'roster' | 'schedule' | 'attendance' | 'analytics' | 'progress'>('roster');
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  React.useEffect(() => {
    setLoadingSchedules(true);
    fetch('/rosco/api/training-schedules')
      .then(r => r.json())
      .then(data => {
        setDbSchedules(data.schedules || []);
        setLoadingSchedules(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingSchedules(false);
      });
  }, []);

  const courseDateInfo = useMemo(() => {
    if (dbSchedules.length === 0) {
      return { startStr: '', endStr: '', display: 'N/A' };
    }
    
    // Sort schedules by date
    const sortedSchedules = [...dbSchedules].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const start = new Date(sortedSchedules[0].date);
    const end = new Date(sortedSchedules[sortedSchedules.length - 1].date);
    
    // Check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { startStr: '', endStr: '', display: 'Invalid Date Range' };
    }

    return {
      startStr: start.toISOString().split('T')[0],
      endStr: end.toISOString().split('T')[0],
      display: `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    };
  }, [dbSchedules]);

  const [dateMode, setDateMode] = useState<'course' | 'custom'>('course');
  const [customStartDate, setCustomStartDate] = useState(courseDateInfo.startStr);
  const [customEndDate, setCustomEndDate] = useState(courseDateInfo.endStr);
  
  const [isExporting, setIsExporting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string, filename: string } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [dailyAttendanceRecords, setDailyAttendanceRecords] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/rosco/api/daily-attendance')
      .then(r => r.json())
      .then(data => {
        setDailyAttendanceRecords(data.records || []);
      })
      .catch(console.error);
  }, []);

  const handleGeneratePDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    
    try {
      // Use html-to-image instead of html2canvas to natively support oklch and modern CSS
      const imgData = await toPng(printRef.current, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const width = printRef.current.offsetWidth;
      const height = printRef.current.offsetHeight;

      const pdf = new jsPDF({
        orientation: height > width ? 'p' : 'l',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report.pdf`;
      
      // Instead of downloading immediately, we generate a blob and create a URL to preview
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfPreview({ url, filename: title });
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Central Reports Generation
          </h1>
          <p className="text-slate-400 text-sm mt-1">Generate and download comprehensive PDF reports across all LMS modules.</p>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating Preview...' : 'Preview & Download PDF'}
        </button>
      </div>

      {/* Report Navigation Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setReportType('roster')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              reportType === 'roster' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Learner Roster
          </button>
          <button
            onClick={() => setReportType('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              reportType === 'schedule' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" /> Course Schedule
          </button>
          <button
            onClick={() => setReportType('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              reportType === 'attendance' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" /> Daily Log & Catch-up Roster
          </button>
          <button
            onClick={() => setReportType('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              reportType === 'analytics' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
          <button
            onClick={() => setReportType('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              reportType === 'progress' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" /> Progress
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400 whitespace-nowrap">Report Period:</span>
            <select 
              className="bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none cursor-pointer min-w-[180px]"
              value={dateMode}
              onChange={(e) => setDateMode(e.target.value as 'course' | 'custom')}
            >
              <option value="course">Full Course Duration</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
          
          {dateMode === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-slate-500 text-sm">to</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* --- REPORT PRINT CONTAINER --- */}
      <div ref={printRef} className="p-8 bg-white text-slate-900 min-h-[800px] border border-slate-200 rounded-2xl">
        
        {/* Universal Report Header */}
        <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">ROSCO LMS OFFICIAL REPORT</h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-500 font-mono text-sm">Type: <span className="font-bold text-slate-700">{reportType.toUpperCase()}</span></p>
              <span className="text-slate-300">|</span>
              <p className="text-slate-500 font-mono text-sm">Period: <span className="font-bold text-slate-700">{
                dateMode === 'course' 
                  ? `COURSE DURATION (${courseDateInfo.display})`
                  : `${customStartDate} TO ${customEndDate}`
              }</span></p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm text-indigo-700">{new Date().toLocaleDateString()}</div>
            <div className="text-xs text-slate-500 mt-1">Generated via AI Studio Platform</div>
          </div>
        </div>

        {/* 1. Learner Roster Report */}
        {reportType === 'roster' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Complete Cohort Roster ({learners.length} Enrolled)</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-slate-500 font-medium">#</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Learner No</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Surname</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">First Name</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">ID Number</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Gender</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Final Mark</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {learners.map((l, idx) => {
                  const parsed = parseSAIDNumber(l.idNumber);
                  return (
                    <tr key={l.id}>
                      <td className="py-2 px-4 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-4 font-mono text-emerald-700 font-bold">{l.learnerNo || '—'}</td>
                      <td className="py-2 px-4 text-slate-900 font-medium">{l.surname}</td>
                      <td className="py-2 px-4 text-slate-700">{l.firstName}</td>
                      <td className="py-2 px-4 font-mono text-indigo-700">{l.idNumber}</td>
                      <td className="py-2 px-4 text-slate-700">{parsed.gender}</td>
                      <td className="py-2 px-4 font-mono font-bold text-emerald-700">{l.marks ? `${l.marks}%` : '—'}</td>
                      <td className="py-2 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {l.comments}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Course Schedule Report */}
        {reportType === 'schedule' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">2021 Master Programme Schedule (DB Mapped)</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-slate-500 font-medium">Month</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">US ID</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Activity</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Group</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dbSchedules
                  .filter(sched => {
                    if (dateMode === 'course') return true;
                    if (!customStartDate || !customEndDate) return true;
                    
                    const schedDate = new Date(sched.date).getTime();
                    const filterStart = new Date(customStartDate).getTime();
                    // Add a day to end date to make it inclusive
                    const filterEnd = new Date(customEndDate).getTime() + 86400000;
                    
                    return schedDate >= filterStart && schedDate <= filterEnd;
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((sched) => (
                  <tr key={sched.id}>
                    <td className="py-2 px-4 font-mono text-indigo-700">Month {sched.month}</td>
                    <td className="py-2 px-4 font-mono text-slate-700">{sched.unitStandardId}</td>
                    <td className="py-2 px-4 text-slate-900 font-medium">{sched.activity}</td>
                    <td className="py-2 px-4 text-center font-mono text-emerald-700 font-bold">{sched.groupName}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-500">{sched.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Daily Attendance Report */}
        {reportType === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Daily Log & Catch-up Roster (DB Integrated)</h3>
            <p className="text-sm text-slate-500 mb-4">This roster identifies daily attendance activities mapped to the Master Training Schedule and catch-up sessions.</p>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-slate-500 font-medium">Date</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Learner Name</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Unit Standard / Activity</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Status</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-right">Facilitator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dailyAttendanceRecords
                  .filter(rec => {
                    const isLearnerInCurrentYear = learners.some(l => l.id === rec.learnerId);
                    if (!isLearnerInCurrentYear) return false;

                    if (dateMode === 'course') return true;
                    if (!customStartDate || !customEndDate) return true;
                    const recDate = new Date(rec.date).getTime();
                    const filterStart = new Date(customStartDate).getTime();
                    const filterEnd = new Date(customEndDate).getTime() + 86400000;
                    return recDate >= filterStart && recDate <= filterEnd;
                  })
                  .slice(0, 150)
                  .map((rec) => {
                  
                  // Find matching schedule entry for this date and US
                  const matchingSched = dbSchedules.find(s => s.date === rec.date && s.unitStandardId === rec.usId);
                  
                  let colorClass = 'text-slate-500';
                  if (rec.status === 'Present') colorClass = 'text-emerald-700';
                  else if (rec.status === 'Catch-up') colorClass = 'text-amber-600';
                  else if (rec.status === 'Absent') colorClass = 'text-rose-600';
                  
                  return (
                  <tr key={rec.id}>
                    <td className="py-2 px-4 font-mono text-slate-600 whitespace-nowrap">{rec.date}</td>
                    <td className="py-2 px-4 text-slate-900 font-medium">
                      {rec.learnerName}
                      <div className="text-[10px] text-slate-500 font-mono">{rec.learnerNo}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-mono text-indigo-700 font-medium">{rec.usId}</div>
                      <div className="text-xs text-slate-900 font-bold">{matchingSched ? matchingSched.activity : rec.unitStandardTitle}</div>
                      {matchingSched && <div className="text-[10px] text-slate-500 italic">Block {matchingSched.month} - {matchingSched.groupName}</div>}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`${colorClass} font-bold text-xs uppercase tracking-wider`}>{rec.status}</span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-xs text-slate-500">
                      {matchingSched ? matchingSched.facilitator : '—'}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            <div className="text-center text-xs text-slate-500 mt-4 italic">* Limited to 150 records for PDF export performance. Log maps directly to rosco_main.training_schedules.</div>
          </div>
        )}

        {/* 4. Attendance Analytics */}
        {reportType === 'analytics' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Attendance Analytics & Logs</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-slate-500 font-medium">Learner Name</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Daily Window</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Tea Break (10:00)</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Lunch (13:00)</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Final Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {learners.slice(0, 30).map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 px-4 text-slate-900 font-medium">{l.surname}, {l.firstName}</td>
                    <td className="py-2 px-4 text-center">
                      <span className="text-emerald-700 font-mono text-xs">08:00 - 15:30</span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className="text-indigo-700 font-mono text-xs">15 min</span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className="text-indigo-700 font-mono text-xs">60 min</span>
                    </td>
                    <td className="py-2 px-4 text-center font-mono font-bold text-amber-700">
                      {l.marks ? `${l.marks}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {learners.length > 30 && <div className="text-center text-xs text-slate-500 mt-4 italic">* Snapshot truncated to 30 learners for preview</div>}
          </div>
        )}

        {/* 5. Progress and Credits Portal */}
        {reportType === 'progress' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Learner Progress & Credits Accrued</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-slate-500 font-medium">Learner Name</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Learner No</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">ID Number</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Credits Earned</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Target Credits</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-right">Completion Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {learners.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 px-4 text-slate-900 font-medium">{l.surname}, {l.firstName}</td>
                    <td className="py-2 px-4 text-center font-mono text-emerald-700 font-bold">{l.learnerNo || '—'}</td>
                    <td className="py-2 px-4 font-mono text-slate-500">{l.idNumber}</td>
                    <td className="py-2 px-4 text-center font-mono font-bold text-indigo-700">124</td>
                    <td className="py-2 px-4 text-center font-mono text-slate-500">124</td>
                    <td className="py-2 px-4 text-right">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          COMPLETED
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#0f172a] rounded-2xl border border-white/10 w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e293b]">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Report Preview: {pdfPreview.filename}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={pdfPreview.url}
                  download={pdfPreview.filename}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download to Device
                </a>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(pdfPreview.url);
                    setPdfPreview(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-800 w-full h-full relative">
              <iframe
                src={`${pdfPreview.url}#view=FitH`}
                className="w-full h-full border-0 absolute inset-0"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

