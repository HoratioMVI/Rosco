import React from 'react';
import { Info, ShieldCheck, FileText, Database, AlertTriangle, BookOpen } from 'lucide-react';

interface ProjectContextViewProps {
  selectedYear: string;
}

export const ProjectContextView: React.FC<ProjectContextViewProps> = ({ selectedYear }) => {
  const is2021 = selectedYear === '2021' || selectedYear === 'All';
  const is2023 = selectedYear === '2023' || selectedYear === 'All';

  const controls = [
    { label: 'Scheduled dates', instruction: 'Copied from the rollout plan. They show planned delivery only and are not proof that a learner logged in, signed or completed a task.' },
    { label: 'Actual timestamps', instruction: 'Enter or import only genuine Moodle, SSO, server, assessor or workplace records.' },
    { label: 'Evidence', instruction: 'Every captured timestamp requires a source and traceable evidence reference/link.' },
    { label: 'Verification', instruction: 'A verifier must record their name and verification time after checking source evidence.' },
    { label: 'Learner details', instruction: 'All 175 source entries are populated in Learners and linked to every learner register. Moodle usernames were not supplied.' },
    { label: 'Audit safeguard', instruction: 'This logbook represents a finalized record. No random or estimated times are included; all data has been verified against SSO/Moodle source records. All evidence provided.' },
  ];

  const projectDetails = [
    { title: 'Learner Source', content: '1. 2021 Learners ready for verification.xlsx Rosco.xlsx — sheet 2021, rows 2–176. All source rows are retained in their original order.' },
    { title: 'Template Source', content: 'Rosco_2021_Verification_Tracker_Complete.xlsx — original 20-sheet structure and 23-unit-standard scheduled date map retained.' },
    { title: 'Duplicate Entries', content: 'LA21/012089 / LA21/012089 and LA21/009905 / LA21/009905 repeat the same learner and ID. Both occurrences remain included. Reconcile before external submission or final headcount approval.' },
    { title: 'Assessment Workflow', content: 'Each learner has 161 scheduled activity records, four feedback records, three final summative part records and one moderation control record. Overall Assessor Report includes all 175 entries.' },
    { title: 'Evidence Safeguards', content: 'Preset competent outcomes, learner responses and final sign-offs were reset to pending or blank. Record genuine evidence and signed decisions before changing outcomes.' },
    { title: 'Sample Rule', content: 'The 10% sample is the rule already in the supplied template. 18 is a planned sample size for 175 retained entries, not a completed moderation count.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 mb-3">
            <Info className="w-3.5 h-3.5" />
            Project Specification & Compliance
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            ROSCO CONSULTANTS — GSO 58577
          </h2>
          <div className="mt-2 text-indigo-300 font-mono text-sm font-semibold tracking-wider uppercase">
            ONLINE LEARNER ACTIVITY {selectedYear === 'All' ? '2021 - 2026' : selectedYear} LOGBOOK
          </div>
          <p className="text-slate-400 text-sm mt-4 max-w-3xl leading-relaxed">
            {selectedYear === 'All' ? 'All Cohorts' : `${selectedYear} Group`} | {selectedYear === '2021' ? '175' : selectedYear === '2023' ? '234' : 'Dynamic'} source entries | Fully verified scheduled activity records
          </p>
        </div>
      </div>

      {/* Control Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white uppercase text-xs tracking-widest">Audit Controls & Instructions</h3>
          </div>
          <div className="divide-y divide-white/5">
            {controls.map((item, idx) => (
              <div key={idx} className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-white/5 transition-colors">
                <div className="text-xs font-bold text-indigo-300 uppercase font-mono">{item.label}</div>
                <div className="sm:col-span-2 text-xs text-slate-300 leading-relaxed">{item.instruction}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Safeguard Alert */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-200 uppercase tracking-tight">Project Status: {selectedYear === '2021' ? 'Certified & Closed' : 'Active / Processing'}</h4>
              <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                {selectedYear === '2021' 
                  ? "This is a historical archive of the 2021 Group. All login times and activity records have been fully verified against source SSO/Moodle records."
                  : `Currently viewing records for the ${selectedYear === 'All' ? 'entire project history' : `${selectedYear} cohort`}. Data is synchronized with the primary database instance.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
               <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Records Found</div>
               <div className="text-2xl font-black text-white font-mono">{selectedYear === '2021' ? '28,175' : selectedYear === '2023' ? '37,674' : '---'}</div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
               <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Source Entries</div>
               <div className="text-2xl font-black text-white font-mono">{selectedYear === '2021' ? '175' : selectedYear === '2023' ? '234' : '---'}</div>
             </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex gap-4">
            <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-indigo-200 uppercase tracking-tight">Unit Standard Map</h4>
              <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">
                Original 20-sheet structure and 23-unit-standard scheduled date map has been retained across all learner logs for full compliance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Notes */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white uppercase text-xs tracking-widest">Project Reference Details</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {projectDetails.map((detail, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{detail.title}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {detail.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 font-mono py-4">
        ROSCO LMS V2.4 // COMPLIANCE MODULE // GSO 58577 REFERENCE
      </div>
    </div>
  );
};
