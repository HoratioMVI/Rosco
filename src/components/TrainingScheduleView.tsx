import React, { useState, useEffect } from 'react';
import { TrainingSchedule } from '../types';
import { Calendar, BookOpen, Clock, CheckCircle2, Search, Filter, Layers, Laptop, Building2, User, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface MonthStructure {
  month: string;
  name: string;
  unitStandards: { id: string; title: string; credits: number; type: string }[];
  totalCredits: number;
  theoryDays: { label: string; days: string; dates: string; mode: string; facilitator: string };
  onlineDays: { label: string; days: string; dates: string; mode: string; platform: string };
  practicalWeeks: {
    week2: { label: string; dates: string; focus: string };
    week3: { label: string; dates: string; focus: string };
    week4: { label: string; dates: string; focus: string };
  };
}

const MONTH_DATA: MonthStructure[] = [
  {
    month: '01',
    name: 'Month 01 (January 2021)',
    unitStandards: [
      { id: '246694', title: 'Explain the requirements for becoming a security service provider', credits: 4, type: 'Core' },
      { id: '244184', title: 'Apply legal aspects in a security environment', credits: 8, type: 'Core' },
      { id: '244182', title: 'Give evidence in court', credits: 4, type: 'Core' },
    ],
    totalCredits: 16,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '04 Jan – 06 Jan 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '07 Jan – 08 Jan 2021',
      mode: 'Digital LMS / Formative E-learning & Research',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '11 Jan – 15 Jan 2021', focus: 'Site induction, security legislation & compliance on-site' },
      week3: { label: 'Week 3 Practical (2)', dates: '18 Jan – 22 Jan 2021', focus: 'Court evidence preparation & courtroom protocol simulation' },
      week4: { label: 'Week 4 Practical & Evaluation (3)', dates: '25 Jan – 29 Jan 2021', focus: 'Assessor observation, workplace logbook sign-off & practical assessment' }
    }
  },
  {
    month: '02',
    name: 'Month 02 (February 2021)',
    unitStandards: [
      { id: '244176', title: 'Use security equipment', credits: 2, type: 'Core' },
      { id: '244181', title: 'Perform hand over and take over responsibilities', credits: 2, type: 'Core' },
      { id: '244177', title: 'Conduct a security patrol in an area of responsibility', credits: 7, type: 'Core' },
    ],
    totalCredits: 11,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '01 Feb – 03 Feb 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '04 Feb – 05 Feb 2021',
      mode: 'Digital LMS / Equipment manuals & patrol protocols',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '08 Feb – 12 Feb 2021', focus: 'Security radio operation, metal detectors & scanner equipment' },
      week3: { label: 'Week 3 Practical (2)', dates: '15 Feb – 19 Feb 2021', focus: 'Shift handover registers, OB book entries & perimeter patrols' },
      week4: { label: 'Week 4 Practical & Evaluation (3)', dates: '22 Feb – 26 Feb 2021', focus: 'Patrol route verification, assessor sign-off & equipment evaluation' }
    }
  },
  {
    month: '03',
    name: 'Month 03 (March 2021)',
    unitStandards: [
      { id: '244179', title: 'Handle complaints and problems', credits: 6, type: 'Core' },
      { id: '13912', title: 'Apply knowledge of self and team to develop a plan to enhance team performance', credits: 5, type: 'Elective' },
      { id: '244189', title: 'Conduct access and egress control', credits: 7, type: 'Core' },
    ],
    totalCredits: 18,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '01 Mar – 03 Mar 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '04 Mar – 05 Mar 2021',
      mode: 'Digital LMS / Customer service scenarios & team dynamics',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '08 Mar – 12 Mar 2021', focus: 'Access & egress gate control, visitor management & search drills' },
      week3: { label: 'Week 3 Practical (2)', dates: '15 Mar – 19 Mar 2021', focus: 'Complaint handling escalation, conflict de-escalation & team drills' },
      week4: { label: 'Week 4 Practical & Evaluation (3)', dates: '22 Mar – 26 Mar 2021', focus: 'Access control logbook evaluation, team assessment & assessor sign-off' }
    }
  },
  {
    month: '04',
    name: 'Month 04 (April 2021)',
    unitStandards: [
      { id: '242825', title: 'Conduct evacuations and emergency drills', credits: 4, type: 'Core' },
      { id: '11505', title: 'Identify, handle and defuse security-related conflict', credits: 12, type: 'Core' },
      { id: '117705', title: 'Demonstrate knowledge of the Firearms Control Act 2000', credits: 3, type: 'Core' },
    ],
    totalCredits: 19,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '29 Mar – 31 Mar 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '01 Apr – 02 Apr 2021',
      mode: 'Digital LMS / Firearm legislation, safety compliance & emergency paths',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '08 Mar – 12 Mar 2021', focus: 'Emergency evacuation drills, siren protocols & assembly point routing' },
      week3: { label: 'Week 3 Practical (2)', dates: '15 Mar – 19 Mar 2021', focus: 'Defusing aggressive behavior, containment drills & incident notes' },
      week4: { label: 'Week 4 Practical & Evaluation (3)', dates: '22 Mar – 26 Mar 2021', focus: 'Practical emergency drill evaluation, conflict simulation assessment' }
    }
  },
  {
    month: '05',
    name: 'Month 05 (May 2021)',
    unitStandards: [
      { id: '119465', title: 'Write, present or sign texts for a range of communicative contexts', credits: 5, type: 'Fundamental' },
      { id: '113852', title: 'Apply occupational health, safety and environmental principles', credits: 10, type: 'Elective' },
      { id: '11508', title: 'Write security reports and take statements', credits: 10, type: 'Elective' },
    ],
    totalCredits: 25,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '26 Apr – 28 Apr 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '29 Apr – 30 Apr 2021',
      mode: 'Digital LMS / OHS statutory compliance & report writing templates',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '12 Apr – 16 Apr 2021', focus: 'Hazard identification walk-through, PPE inspection & workplace safety' },
      week3: { label: 'Week 3 Practical (2)', dates: '19 Apr – 23 Apr 2021', focus: 'Statement taking drills, incident report draft & supervisor submission' },
      week4: { label: 'Week 4 Practical & Evaluation (3)', dates: '26 Apr – 30 Apr 2021', focus: 'OHS inspection audit, statement accuracy assessment & assessor sign-off' }
    }
  },
  {
    month: '06',
    name: 'Month 06 (June 2021)',
    unitStandards: [
      { id: '119472', title: 'Accommodate audience and context needs in oral or signed communication', credits: 5, type: 'Fundamental' },
      { id: '114941', title: 'Apply knowledge of HIV/AIDS to a specific business sector', credits: 4, type: 'Core' },
      { id: '9010', title: 'Use number bases and measurement units and recognise calculation error', credits: 2, type: 'Fundamental' },
    ],
    totalCredits: 11,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '24 May – 26 May 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '27 May – 28 May 2021',
      mode: 'Digital LMS / Health awareness modules & practical numeracy calculations',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '10 May – 14 May 2021', focus: 'Workplace safety briefings, verbal reporting & perimeter dimension check' },
      week3: { label: 'Week 3 Practical (2)', dates: '17 May – 21 May 2021', focus: 'Wellness peer support protocols & workplace health logs' },
      week4: { label: 'Week 4 Practical & Evaluation (3)', dates: '24 May – 28 May 2021', focus: 'Oral briefing observation, practical calculation assessment & logbook' }
    }
  },
  {
    month: '07',
    name: 'Month 07 (July 2021)',
    unitStandards: [
      { id: '9012', title: 'Investigate life and work-related problems using data and probabilities', credits: 5, type: 'Fundamental' },
      { id: '9013', title: 'Describe, apply, analyse and calculate shape and motion', credits: 4, type: 'Fundamental' },
      { id: '7456', title: 'Use mathematics to investigate and monitor personal & business finances', credits: 5, type: 'Fundamental' },
      { id: '119457', title: 'Interpret and use information from texts', credits: 5, type: 'Fundamental' },
      { id: '119467', title: 'Use language and communication in occupational learning programmes', credits: 5, type: 'Fundamental' }
    ],
    totalCredits: 24,
    theoryDays: {
      label: 'Week 1: 3 Days Theoretical',
      days: 'Mon – Wed (3 Days)',
      dates: '21 Jun – 23 Jun 2021',
      mode: 'Classroom Contact / Learner Workbook (LWB)',
      facilitator: 'Courtney Rosenberg'
    },
    onlineDays: {
      label: 'Week 1: 2 Days Online',
      days: 'Thu – Fri (2 Days)',
      dates: '24 Jun – 25 Jun 2021',
      mode: 'Digital LMS / Mathematical modeling & FISA review',
      platform: 'ROSCO Online LMS Portal'
    },
    practicalWeeks: {
      week2: { label: 'Week 2 Practical (1)', dates: '14 Jun – 18 Jun 2021', focus: 'Site incident data capture, perimeter spatial diagrams & inventory maths' },
      week3: { label: 'Week 3 Practical (2)', dates: '21 Jun – 25 Jun 2021', focus: 'Security budget checks, timesheet calculations & shift statistics' },
      week4: { label: 'Week 4 Practical & FISA Evaluation (3)', dates: '28 Jun – 02 Jul 2021', focus: 'Final Integrated Summative Assessment (FISA) & Portfolio moderation' }
    }
  }
];

export const TrainingScheduleView: React.FC = () => {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth);

    setLoading(true);
    fetch(`/rosco/api/training-schedules?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setSchedules(data.schedules || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch schedules', err);
        setLoading(false);
      });
  }, [selectedMonth]);

  const filteredMonths = selectedMonth === 'all' 
    ? MONTH_DATA 
    : MONTH_DATA.filter(m => m.month === selectedMonth || parseInt(m.month) === parseInt(selectedMonth));

  const filteredSchedules = schedules.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.unitStandardId.toLowerCase().includes(q) ||
      item.unitStandardTitle.toLowerCase().includes(q) ||
      item.activity.toLowerCase().includes(q) ||
      item.date.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Master Training Delivery Schedule 2021
              </h2>
              <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full">
                124 Credits &bull; 23 Unit Standards
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Standardized SASSETA General Security Practices Learnership delivery schedule.
              Each month follows a strictly governed format: <strong className="text-amber-400">Week 1 (3 Days Classroom Theoretical + 2 Days Online LMS)</strong> followed by <strong className="text-indigo-300">3 Consecutive Weeks of Workplace Practical</strong>.
            </p>
          </div>

          {/* Month Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-[#0f172a] p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMonth === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All 7 Months
            </button>
            {MONTH_DATA.map(m => (
              <button
                key={m.month}
                onClick={() => setSelectedMonth(m.month)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMonth === m.month
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                M{m.month}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Architecture Framework Guide (3 Days Theory + 2 Days Online + 3 Weeks Practical) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500/15 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Week 1: Days 1–3</div>
              <div className="text-sm font-bold text-white">3 Days Theoretical</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Monday to Wednesday classroom contact training with Facilitator. Completion of Learner Workbook (LWB) theory formative activities.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/15 to-slate-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">Week 1: Days 4–5</div>
              <div className="text-sm font-bold text-white">2 Days Online LMS</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Thursday and Friday digital LMS learning, self-paced research, online formative reviews & digital portfolio uploading.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/15 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Weeks 2 & 3: 10 Days</div>
              <div className="text-sm font-bold text-white">Workplace Practical (1 & 2)</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Dedicated on-site workplace exposure shifts, security patrols, equipment usage, access control registers with accredited mentors.
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/15 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Week 4: 5 Days</div>
              <div className="text-sm font-bold text-white">Practical Evaluation (3)</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Final workplace practical shift, supervisor observation, logbook verification and summative practical evaluation by assessor.
          </p>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Monthly Curriculum Blocks ({filteredMonths.length})
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'table'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Detailed Activity Roster ({filteredSchedules.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search standard, activity or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: MONTHLY CURRICULUM BLOCKS (3 Days Theory + 2 Days Online + 3 Weeks Practical) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {filteredMonths.map((m, mIdx) => (
            <motion.div
              key={m.month}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mIdx * 0.05 }}
              className="bg-[#0f172a]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Month Header Bar */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-4 px-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                    {m.month}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{m.name}</h3>
                    <p className="text-xs text-slate-400">
                      {m.unitStandards.length} Unit Standards &bull; {m.totalCredits} Credits &bull; Facilitator: {m.theoryDays.facilitator}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg">
                    Week 1: 3 Days Theory + 2 Days Online
                  </span>
                  <span className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg">
                    Weeks 2–4: 3 Weeks Practical
                  </span>
                </div>
              </div>

              {/* Month Content Grid */}
              <div className="p-6 space-y-5">
                {/* Unit Standards in Month */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    Unit Standards Covered in {m.name} ({m.totalCredits} Credits)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {m.unitStandards.map(us => (
                      <div key={us.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              US {us.id}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {us.type} &bull; {us.credits} Cr
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium line-clamp-2 mt-1">
                            {us.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4-Week Schedule Breakdown Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  {/* Left: Week 1 (Theory + Online) */}
                  <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Week 1: Theoretical & Online Instruction
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 font-semibold">5 Training Days</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* 3 Days Theory */}
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                        <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {m.theoryDays.label} ({m.theoryDays.days})
                          </span>
                          <span className="font-mono text-white text-[11px]">{m.theoryDays.dates}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {m.theoryDays.mode} with Facilitator <strong className="text-white">{m.theoryDays.facilitator}</strong>.
                        </p>
                      </div>

                      {/* 2 Days Online */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5">
                        <div className="flex items-center justify-between text-blue-300 font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <Laptop className="w-3.5 h-3.5" />
                            {m.onlineDays.label} ({m.onlineDays.days})
                          </span>
                          <span className="font-mono text-white text-[11px]">{m.onlineDays.dates}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {m.onlineDays.mode} on <strong className="text-white">{m.onlineDays.platform}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Weeks 2–4 (3 Weeks of Practical) */}
                  <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        Weeks 2 – 4: 3 Weeks of Workplace Practical
                      </div>
                      <span className="text-[11px] font-mono text-indigo-300 font-semibold">15 Practical Days</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Week 2 */}
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-indigo-200 text-xs">{m.practicalWeeks.week2.label}</div>
                          <div className="text-[11px] text-slate-400">{m.practicalWeeks.week2.focus}</div>
                        </div>
                        <span className="font-mono text-white text-[11px] font-semibold shrink-0 ml-2">
                          {m.practicalWeeks.week2.dates}
                        </span>
                      </div>

                      {/* Week 3 */}
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-indigo-200 text-xs">{m.practicalWeeks.week3.label}</div>
                          <div className="text-[11px] text-slate-400">{m.practicalWeeks.week3.focus}</div>
                        </div>
                        <span className="font-mono text-white text-[11px] font-semibold shrink-0 ml-2">
                          {m.practicalWeeks.week3.dates}
                        </span>
                      </div>

                      {/* Week 4 */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-emerald-300 text-xs">{m.practicalWeeks.week4.label}</div>
                          <div className="text-[11px] text-slate-400">{m.practicalWeeks.week4.focus}</div>
                        </div>
                        <span className="font-mono text-white text-[11px] font-semibold shrink-0 ml-2">
                          {m.practicalWeeks.week4.dates}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* TAB 2: DETAILED ACTIVITY ROSTER TABLE */}
      {activeTab === 'table' && (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500" />
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-20 bg-white/5">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No schedule entries found matching your query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-5 py-3.5 w-16">Month</th>
                    <th className="px-5 py-3.5 w-32">Unit Standard</th>
                    <th className="px-5 py-3.5">Standard Title</th>
                    <th className="px-5 py-3.5 w-72">Activity & Week Stage</th>
                    <th className="px-5 py-3.5 w-44">Scheduled Dates</th>
                    <th className="px-5 py-3.5 w-40">Facilitator / Assessor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredSchedules.map((item, idx) => {
                    const isTheory = item.activity.includes('Theoretical');
                    const isOnline = item.activity.includes('Online');
                    const isPractical = item.activity.includes('Practical');

                    return (
                      <tr key={item.id || idx} className="hover:bg-white/5 transition-colors font-sans">
                        <td className="px-5 py-3.5 font-bold font-mono text-amber-400">
                          M{String(item.month).padStart(2, '0')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            US {item.unitStandardId}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white font-medium">
                          {item.unitStandardTitle}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block border ${
                            isTheory ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                            isOnline ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
                            'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          }`}>
                            {item.activity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-white">
                          {item.date}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-300">
                          {item.facilitator}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

