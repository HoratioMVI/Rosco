import React from 'react';
import { Database, ShieldCheck, Terminal, CheckCircle2, Users, LayoutDashboard, Award, Layers, Calendar, BarChart3, BookOpen, MessageSquare, FileText, X, Info, UserCheck, Video, FolderTree } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  databaseName: string;
  version: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, databaseName, version, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuSections = [
    {
      title: "Core",
      items: [
        { id: 'dashboard', label: 'Learner Dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
        { id: 'learnershipOverview', label: 'Learnership Overview', icon: BookOpen, color: 'text-amber-400' },
      ]
    },
    {
      title: "Learner Management",
      items: [
        { id: 'roster', label: 'Learners Roster', icon: Users, color: 'text-emerald-400' },
        { id: 'progress', label: 'Progress & Credits Portal', icon: Layers, color: 'text-purple-400' },
        { id: 'learnerBooks', label: 'Books Assigned', icon: BookOpen, color: 'text-indigo-400' },
        { id: 'learnerFeedback', label: 'Facilitation Feedback', icon: MessageSquare, color: 'text-rose-400' },
      ]
    },
    {
      title: "Training & Attendance",
      items: [
        { id: 'courseDocuments', label: 'Course Documents', icon: FolderTree, color: 'text-amber-400' },
        { id: 'masterSchedule', label: 'Master Schedule', icon: Calendar, color: 'text-indigo-400' },
        { id: 'schedule', label: 'Attendance Roster', icon: Calendar, color: 'text-blue-400' },
        { id: 'workplaceExposure', label: 'Workplace Exposure (W2-W4)', icon: Layers, color: 'text-amber-400' },
        { id: 'analytics', label: 'Attendance Analytics', icon: BarChart3, color: 'text-emerald-400' },
        { id: 'trainingMaterial', label: 'Training Material', icon: Video, color: 'text-indigo-400' },
      ]
    },
    {
      title: "Reports & Documents",
      items: [
        { id: 'courseDocuments', label: 'Course Documents', icon: FolderTree, color: 'text-amber-400' },
        { id: 'reportsCenter', label: 'Reports Center', icon: FileText, color: 'text-rose-400' },
        { id: 'practicalEvaluation', label: 'Practical Evaluation', icon: FileText, color: 'text-emerald-400' },
        { id: 'statementOfResults', label: 'Statement of Results', icon: Award, color: 'text-emerald-400' },
        { id: 'certificate', label: 'Qualification Cert', icon: Award, color: 'text-amber-400' },
        { id: 'sasseta', label: 'SASSETA Repository', icon: Database, color: 'text-emerald-400' },
        { id: 'report', label: 'Completion Report', icon: CheckCircle2, color: 'text-purple-400' }
      ]
    },
    {
      title: "Staff & Mentors",
      items: [
        { id: 'staff', label: 'Staff & Personnel', icon: UserCheck, color: 'text-amber-400' },
        { id: 'mentorsSla', label: 'Mentors SLA & Evidence', icon: Award, color: 'text-purple-400' },
        { id: 'callLogs', label: 'Daily Call Logs', icon: FileText, color: 'text-cyan-400' },
      ]
    },
    {
      title: "Administration",
      items: [
        { id: 'overview', label: 'Database Instance', icon: Database, color: 'text-blue-400' },
        { id: 'safety', label: 'Safety & Audit', icon: ShieldCheck, color: 'text-amber-400' },
        { id: 'console', label: 'SQL Console', icon: Terminal, color: 'text-sky-400' },
        { id: 'projectContext', label: 'Project Context', icon: Info, color: 'text-blue-400' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 w-72 lg:w-64 h-full bg-[#0f172a] lg:bg-white/5 lg:backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/rosco_logo.png" alt="Rosco Training" className="w-10 h-10 object-contain" />
            <div>
              <span className="text-lg font-semibold tracking-tight text-white block">ROSCO LMS</span>
              <span className="text-xs text-slate-400 font-mono">MariaDB 10.11+</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-6 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 px-3">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white/10 text-white border border-white/10 shadow-md shadow-black/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Server & DB Version Info Card */}
        <div className="mt-4 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
            <span>Target DB</span>
            <span className="font-mono text-white font-bold">{databaseName}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {version}
          </div>
        </div>
      </aside>
    </>
  );
};
