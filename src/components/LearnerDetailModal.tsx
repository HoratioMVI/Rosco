import React, { useState, useEffect } from 'react';
import { Learner, SassetaDocument, Assessor } from '../types';
import { parseSAIDNumber } from '../utils/helpers';
import { X, User, Calendar, ShieldCheck, Award, BookOpen, CheckCircle2, Phone, Mail, MapPin, FileText, Download, ExternalLink, UserCheck } from 'lucide-react';

interface LearnerDetailModalProps {
  learner: Learner | null;
  onClose: () => void;
}

export const LearnerDetailModal: React.FC<LearnerDetailModalProps> = ({ learner, onClose }) => {
  const [documents, setDocuments] = useState<SassetaDocument[]>([]);
  const [learnerSchedule, setLearnerSchedule] = useState<any[]>([]);
  const [workplacePracticals, setWorkplacePracticals] = useState<any[]>([]);
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [selectedAssessorVerifier, setSelectedAssessorVerifier] = useState<string>('Boitumelo Mosidi');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingPracticals, setLoadingPracticals] = useState(false);
  const [practicalStatusMsg, setPracticalStatusMsg] = useState<string | null>(null);

  // Fetch Accredited Assessors from DB
  useEffect(() => {
    fetch('/rosco/api/assessors')
      .then(res => res.json())
      .then(data => {
        const list = data.assessors || [];
        setAssessors(list);
        if (list.length > 0) {
          setSelectedAssessorVerifier(list[0].name);
        }
      })
      .catch(err => console.error('Failed to fetch assessors:', err));
  }, []);

  useEffect(() => {
    if (learner) {
      setLoadingDocs(true);
      
      // Fetch documents
      fetch(`/rosco/api/sasseta/documents/${learner.id}`)
        .then(res => res.json())
        .then(data => {
          setDocuments(data.documents || []);
          setLoadingDocs(false);
        })
        .catch(err => {
          console.error('Failed to fetch learner documents', err);
          setLoadingDocs(false);
        });

      // Fetch specific schedule
      fetch(`/rosco/api/learner/${learner.id}/schedule`)
        .then(res => res.json())
        .then(data => {
          setLearnerSchedule(data.schedules || []);
        })
        .catch(err => {
          console.error('Failed to fetch learner schedule', err);
        });

      // Fetch Week 2 Workplace Practicals
      setLoadingPracticals(true);
      const identifier = learner.learnerNo || learner.idNumber;
      fetch(`/rosco/api/workplace-schedules/learner/${encodeURIComponent(identifier)}?week=2`)
        .then(res => res.json())
        .then(data => {
          setWorkplacePracticals(data.records || []);
          setLoadingPracticals(false);
        })
        .catch(err => {
          console.error('Failed to fetch workplace practicals', err);
          setLoadingPracticals(false);
        });
    }
  }, [learner]);

  const handleVerifyAllWeek2 = async () => {
    if (!learner) return;
    const identifier = learner.learnerNo || learner.idNumber;
    try {
      const res = await fetch('/rosco/api/workplace-schedules/verify-learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          learnerNo: identifier, 
          week: 2, 
          status: 'Verified', 
          verifiedBy: selectedAssessorVerifier || 'Accredited Workplace Assessor' 
        })
      });
      const data = await res.json();
      if (data.success) {
        setPracticalStatusMsg(`Verified ${data.updatedCount} Week 2 practical standards under Assessor ${selectedAssessorVerifier}.`);
        setTimeout(() => setPracticalStatusMsg(null), 3500);
        setWorkplacePracticals(prev => prev.map(p => ({ 
          ...p, 
          verificationStatus: 'Verified',
          verifiedBy: selectedAssessorVerifier
        })));
      }
    } catch (err) {
      console.error('Failed to verify learner practicals', err);
    }
  };

  const handleTogglePracticalStatus = async (recordId: string, currentStatus: string, assignedAssessor?: string) => {
    const nextStatus = currentStatus === 'Verified' ? 'Awaiting Evidence' : 'Verified';
    const verifier = nextStatus === 'Verified' ? (assignedAssessor || selectedAssessorVerifier || 'Accredited Assessor') : '';
    try {
      const res = await fetch('/rosco/api/workplace-schedules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: recordId, 
          verificationStatus: nextStatus, 
          verifiedBy: verifier 
        })
      });
      const data = await res.json();
      if (data.success) {
        setWorkplacePracticals(prev => prev.map(p => p.id === recordId ? { 
          ...p, 
          verificationStatus: nextStatus,
          verifiedBy: verifier
        } : p));
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleUpdateAssessorMentor = async (recordId: string, newAssessor: string) => {
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
        setWorkplacePracticals(prev => prev.map(p => p.id === recordId ? { ...p, assessorMentor: newAssessor } : p));
        setPracticalStatusMsg(`Assessor mentor updated to ${newAssessor} in database.`);
        setTimeout(() => setPracticalStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error updating assessor mentor:', err);
    }
  };

  if (!learner) return null;

  const parsedID = parseSAIDNumber(learner.idNumber);

  // Group documents by category
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.evidenceCategory]) acc[doc.evidenceCategory] = [];
    acc[doc.evidenceCategory].push(doc);
    return acc;
  }, {} as Record<string, SassetaDocument[]>);

  const categories = [
    "ID copies",
    "Learner workbooks",
    "Assessor Feedbacks",
    "Practical evaluations",
    "Summative Assessments",
    "Portfolios",
    "Qualifications",
    "Other learner evidence",
    "EEA01 Forms",
    "Employment contracts",
    "Sasseta Learnership Agreements"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-slate-100">
        <div className="p-6 md:p-8 flex-shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Profile */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {learner.firstName.charAt(0)}{learner.surname.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {learner.surname}, {learner.firstName} {learner.secondName}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Learner No: <span className="text-emerald-400 font-bold">{learner.learnerNo || 'N/A'}</span> &bull; ID Number: <span className="text-indigo-300">{learner.idNumber}</span> &bull; {parsedID.citizenship}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Final Mark</span>
              <span className="text-sm font-semibold text-emerald-400">{learner.marks ? `${learner.marks}%` : '—'}</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Gender</span>
              <span className="text-sm font-semibold text-white">{parsedID.gender}</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Age</span>
              <span className="text-sm font-semibold text-white">{parsedID.age} Years</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Date of Birth</span>
              <span className="text-sm font-semibold text-white font-mono">{parsedID.dob}</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                {learner.comments}
              </span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Cohort</span>
              <span className="text-sm font-semibold text-white">{learner.cohort || '2021 Group'}</span>
            </div>
          </div>

          {/* Moderation Info Section */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Moderation Certified</h4>
                <p className="text-xs text-slate-400">Final Integrated Summative Assessment completed and verified.</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs uppercase">Moderator:</span>
                <span className="text-white font-semibold">{learner.moderatorName || 'Clive Rosenberg'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs uppercase">Reg No:</span>
                <span className="font-mono text-emerald-400">{learner.moderatorNumber || '19MTR1011776'}</span>
              </div>
            </div>
          </div>

          {/* Verification & Matching Details (New Section) */}
          {(learner.companyEmployeeNo || learner.companyGroup || learner.reviewNotes) && (
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Verification & Matching Info
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {learner.companyEmployeeNo && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Company / Employee No:</span>
                    <span className="text-xs font-semibold text-white">{learner.companyEmployeeNo}</span>
                  </div>
                )}
                {learner.companyGroup && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Company Group:</span>
                    <span className="text-xs font-semibold text-white">{learner.companyGroup}</span>
                  </div>
                )}
                {learner.matchBasis && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Match Basis:</span>
                    <span className="text-xs font-semibold text-white">{learner.matchBasis}</span>
                  </div>
                )}
                {learner.otherNumbers && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Other Numbers:</span>
                    <span className="text-xs font-semibold text-white">{learner.otherNumbers}</span>
                  </div>
                )}
                {learner.employeeNumberSource && (
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1 border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Employee Number Source:</span>
                    <span className="text-[11px] text-slate-300 font-mono break-all">{learner.employeeNumberSource}</span>
                  </div>
                )}
                {learner.supportingSources && (
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1 border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Supporting Sources:</span>
                    <span className="text-[11px] text-slate-300 font-mono break-all">{learner.supportingSources}</span>
                  </div>
                )}
                {learner.reviewNotes && (
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1 border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400 uppercase">Review Notes:</span>
                    <span className="text-[11px] text-amber-300 italic">{learner.reviewNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workplace Exposure Week 2 Practicals Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                    Week 2 Workplace Practical Exposure
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    23 Unit Standards practical workplace evaluation matrix for {learner.cohort || '2021 Group'}
                  </p>
                </div>
              </div>

              {workplacePracticals.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] text-slate-400">Verifying Assessor:</span>
                    <select
                      value={selectedAssessorVerifier}
                      onChange={(e) => setSelectedAssessorVerifier(e.target.value)}
                      className="bg-transparent text-[11px] text-indigo-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      {assessors.map(a => (
                        <option key={a.id} value={a.name} className="bg-slate-900 text-white">
                          {a.name} ({a.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    {workplacePracticals.filter(p => p.verificationStatus === 'Verified' || p.verificationStatus === 'Competent').length} / {workplacePracticals.length} Verified
                  </span>
                  <button
                    onClick={handleVerifyAllWeek2}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                    title={`Verify all Week 2 practicals under ${selectedAssessorVerifier}`}
                  >
                    Verify All Week 2
                  </button>
                </div>
              )}
            </div>

            {practicalStatusMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {practicalStatusMsg}
              </div>
            )}

            {loadingPracticals ? (
              <div className="p-6 bg-white/5 rounded-2xl text-center text-xs text-slate-400">
                Loading Week 2 practicals...
              </div>
            ) : workplacePracticals.length === 0 ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-slate-400">
                No Week 2 practical records found for this learner.
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0f172a] text-[10px] uppercase font-semibold text-slate-400 sticky top-0 border-b border-white/10">
                    <tr>
                      <th className="p-3">US ID</th>
                      <th className="p-3">Unit Standard Title</th>
                      <th className="p-3">Scheduled Dates</th>
                      <th className="p-3">Assessor Mentor (DB)</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {workplacePracticals.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono text-amber-400 font-bold">{p.usId}</td>
                        <td className="p-3 font-medium text-white max-w-xs truncate">{p.unitStandardTitle}</td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{p.scheduledStart}</td>
                        <td className="p-3">
                          <select
                            value={p.assessorMentor || (assessors[0]?.name || '')}
                            onChange={(e) => handleUpdateAssessorMentor(p.id, e.target.value)}
                            className="bg-slate-900/80 border border-white/10 rounded-md px-2 py-1 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-400 cursor-pointer"
                            title="Reassign assessor mentor in database"
                          >
                            {assessors.map(a => (
                              <option key={a.id} value={a.name}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleTogglePracticalStatus(p.id, p.verificationStatus, p.assessorMentor)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              p.verificationStatus === 'Verified' || p.verificationStatus === 'Competent'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                          >
                            {p.verificationStatus}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SASSETA Evidence Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                SASSETA Document Repository Evidence
              </h3>
              <div className="text-[10px] text-slate-500 font-mono">
                Authoritative Source: /var/www/.../rosco/Sasseta
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
              {categories.map((cat) => {
                const docs = groupedDocs[cat] || [];
                return (
                  <div key={cat} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${docs.length > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{cat}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{docs.length} Documents Found</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {docs.length > 0 ? (
                        docs.map((doc) => (
                          <a
                            key={doc.id}
                            href={`/sasseta/documents/${encodeURIComponent(doc.relativePath)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-bold rounded-lg border border-indigo-500/20 transition-all"
                            title={doc.originalFilename}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">No evidence uploaded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Modules & Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Personalized Training Schedule ({learner.companyGroup || 'Group 1'})
            </h3>

            <div className="space-y-3">
              {learnerSchedule.length > 0 ? (
                learnerSchedule.map((sched, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-white/[0.08] transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-300 font-bold text-xs">{sched.unitStandardId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">Month {sched.month}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          sched.activity.includes('LWB') ? 'bg-emerald-500/20 text-emerald-400' :
                          sched.activity.includes('Assess') ? 'bg-red-500/20 text-red-400' :
                          'bg-indigo-500/20 text-indigo-400'
                        }`}>{sched.activity}</span>
                      </div>
                      <div className="font-semibold text-white text-sm max-w-2xl">{sched.unitStandardTitle}</div>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[150px] text-right">
                      <span className="text-xs font-mono text-white font-bold bg-[#1e293b] rounded px-3 py-1.5 border border-white/10">
                        {sched.date}
                      </span>
                      <span className="text-[10px] text-slate-500 italic">
                        Facilitator: {sched.facilitator}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-500 italic">
                  No personalized schedule found in rosco_main for this learner's group.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 md:p-8 flex-shrink-0 border-t border-white/10 flex justify-between items-center bg-[#0f172a]">
          <span className="text-xs text-slate-400 font-mono">Database: rosco_main &bull; Learner No: {learner.learnerNo || 'N/A'} &bull; Record ID: #{learner.id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
