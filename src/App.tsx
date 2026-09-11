import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatusOverview } from './components/StatusOverview';
import { SafetyAuditView } from './components/SafetyAuditView';
import { SqlConsole } from './components/SqlConsole';
import { FinalReportCard } from './components/FinalReportCard';
import { LearnersView } from './components/LearnersView';
import { TrainingScheduleView } from './components/TrainingScheduleView';
import { TrainingMaterialView } from './components/TrainingMaterialView';
import { StaffView } from './components/StaffView';
import { LearnerDashboard } from './components/LearnerDashboard';
import { LearnerDetailModal } from './components/LearnerDetailModal';
import { CreditArchitectureView } from './components/CreditArchitectureView';
import { ProgressPortalView } from './components/ProgressPortalView';
import { ScheduleView } from './components/ScheduleView';
import { WorkplaceExposureView } from './components/WorkplaceExposureView';
import { LearnerAnalyticsView } from './components/LearnerAnalyticsView';
import { LearnerBooksAssignedView } from './components/LearnerBooksAssignedView';
import { LearnerFeedbackView } from './components/LearnerFeedbackView';
import { DailyAttendanceRoster } from './components/DailyAttendanceRoster';
import { ReportsCenterView } from './components/ReportsCenterView';
import { PracticalEvaluationReportView } from './components/PracticalEvaluationReportView';
import { DatabaseStatus, Learner } from './types';
import { CallLogsView } from './components/CallLogsView';
import { StatementOfResultsView } from './components/StatementOfResultsView';
import { CertificateView } from './components/CertificateView';
import { SassetaDashboard } from './components/SassetaDashboard';
import { CourseDocumentsView } from './components/CourseDocumentsView';
import { MentorsSlaView } from './components/MentorsSlaView';
import { ProjectContextView } from './components/ProjectContextView';
import LearnershipOverviewView from './components/LearnershipOverviewView';
import { YearSelector } from './components/YearSelector';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('projectContext');
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2021');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Mobile responsive state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [dbRes, learnersRes] = await Promise.all([
        fetch('/rosco/api/database/status'),
        fetch('/rosco/api/learners')
      ]);
      const dbData = await dbRes.json();
      const learnersData = await learnersRes.json();
      setStatus(dbData);
      setAllLearners(learnersData.learners || []);
    } catch (err) {
      console.error('Failed to fetch application data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const learners = useMemo(() => {
    if (selectedYear === 'All') return allLearners;
    return allLearners.filter(l => 
      (l.cohort && l.cohort.includes(selectedYear)) || 
      (l.startDate && l.startDate.includes(selectedYear))
    );
  }, [allLearners, selectedYear]);

  return (
    <div className="h-screen bg-[#0f172a] text-slate-100 font-sans antialiased flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[100px]"></div>
      </div>

      {/* Mobile Top Navigation Bar (Hidden on desktop) */}
      <div className="lg:hidden z-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            R
          </div>
          <span className="text-base font-semibold tracking-tight text-white">ROSCO LMS</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Left Sidebar Menu (Fixed height within the flex container) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        databaseName={status?.database_name || 'rosco_main'}
        version={status?.mariadb_version || '10.11.6-MariaDB'}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area (Scrollable independently) */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-full overflow-y-auto w-full">
        {/* Global Header with Year Selector */}
        <header className="shrink-0 z-20 bg-[#0f172a]/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">
              {activeTab.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
          </div>
        </header>

        <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'projectContext' && (
            <ProjectContextView selectedYear={selectedYear} />
          )}
          {activeTab === 'learnershipOverview' && (
            <LearnershipOverviewView />
          )}
          {activeTab === 'dashboard' && (
            <LearnerDashboard learners={learners} onSelectLearner={(l) => setSelectedLearner(l)} />
          )}
          {activeTab === 'roster' && (
            <LearnersView learners={learners} onSelectLearner={(l) => setSelectedLearner(l)} onRefresh={fetchData} />
          )}
          {activeTab === 'masterSchedule' && (
            <TrainingScheduleView />
          )}
          {activeTab === 'staff' && (
            <StaffView />
          )}
          {activeTab === 'mentorsSla' && (
            <MentorsSlaView />
          )}
          {activeTab === 'schedule' && (
            <ScheduleView learners={learners} />
          )}
          {activeTab === 'workplaceExposure' && (
            <WorkplaceExposureView 
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              learners={learners}
              onSelectLearner={setSelectedLearner}
            />
          )}
          {activeTab === 'dailyAttendance' && (
            <DailyAttendanceRoster learners={learners} />
          )}
          {activeTab === 'analytics' && (
            <LearnerAnalyticsView 
              learners={learners} 
              onSelectLearner={(l) => setSelectedLearner(l)} 
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          )}
          {activeTab === 'learnerBooks' && (
            <LearnerBooksAssignedView learners={learners} />
          )}
          {activeTab === 'learnerFeedback' && (
            <LearnerFeedbackView learners={learners} />
          )}
          {activeTab === 'trainingMaterial' && (
            <TrainingMaterialView />
          )}
          {activeTab === 'progress' && (
            <ProgressPortalView learners={learners} onSelectLearner={(l) => setSelectedLearner(l)} />
          )}
          {activeTab === 'credits' && (
            <CreditArchitectureView />
          )}
          {activeTab === 'overview' && (
            <StatusOverview status={status} onRefresh={fetchData} />
          )}
          {activeTab === 'safety' && (
            <SafetyAuditView />
          )}
          {activeTab === 'reportsCenter' && (
            <ReportsCenterView learners={learners} />
          )}
          {activeTab === 'practicalEvaluation' && (
            <PracticalEvaluationReportView learners={learners} />
          )}
          {activeTab === 'callLogs' && (
            <CallLogsView learners={learners} />
          )}
          {activeTab === 'statementOfResults' && (
            <StatementOfResultsView learners={learners} />
          )}
          {activeTab === 'certificate' && (
            <CertificateView learners={learners} />
          )}
          {activeTab === 'sasseta' && (
            <SassetaDashboard />
          )}
          {activeTab === 'courseDocuments' && (
            <CourseDocumentsView />
          )}
          {activeTab === 'console' && (
            <SqlConsole queryLogs={status?.queryLogs || []} onRefresh={fetchData} />
          )}
          {activeTab === 'report' && (
            <FinalReportCard status={status} />
          )}
        </main>

        <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 py-4 text-center text-xs text-slate-400">
          ROSCO LMS Database Manager &bull; MariaDB 10.11+ Compatibility &bull; <code className="font-mono text-indigo-400">rosco_main</code> Secure Instance
        </footer>
      </div>

      {/* Learner Detail Drill-Down Modal */}
      <LearnerDetailModal
        learner={selectedLearner}
        onClose={() => setSelectedLearner(null)}
      />
    </div>
  );
}
