import React, { useState, useRef } from 'react';
import { Learner } from '../types';
import { FileText, Printer, Search, Download, CheckCircle, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const PracticalEvaluationReportView: React.FC<{ learners: Learner[] }> = ({ learners }) => {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(learners[0] || null);
  const [learnerSearch, setLearnerSearch] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number>(2);
  const [selectedUS, setSelectedUS] = useState<{ id: string; title: string }>({
    id: '244179',
    title: 'Handle complaints and problems'
  });
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const availableUnitStandards = [
    { id: '244179', title: 'Handle complaints and problems' },
    { id: '246694', title: 'Explain the requirements for becoming a security service provider' },
    { id: '244184', title: 'Apply legal aspects in a security environment' },
    { id: '244182', title: 'Give evidence in court' },
    { id: '244176', title: 'Use security equipment' },
    { id: '244177', title: 'Conduct a security patrol in an area of responsibility' },
    { id: '244181', title: 'Perform hand over and take over responsibilities' },
    { id: '244189', title: 'Conduct access and egress control' },
    { id: '242825', title: 'Conduct evacuations and emergency drills' },
    { id: '11505', title: 'Identify, handle and defuse security related conflict' },
    { id: '117705', title: 'Demonstrate knowledge of the Firearms Control Act 2000' },
    { id: '113852', title: 'Apply occupational health, safety and environmental principles' },
    { id: '11508', title: 'Write security reports and take statements' }
  ];

  const filteredLearners = learners.filter(l =>
    l.surname.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.firstName.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.idNumber.includes(learnerSearch)
  );

  const handleGeneratePDF = async () => {
    if (!printRef.current || !selectedLearner) return;
    setIsExporting(true);
    try {
      const imgData = await toPng(printRef.current, { quality: 1.0, pixelRatio: 2, backgroundColor: '#ffffff' });
      const width = printRef.current.offsetWidth;
      const height = printRef.current.offsetHeight;
      const pdf = new jsPDF({ orientation: height > width ? 'p' : 'l', unit: 'px', format: [width, height] });
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Practical_Evaluation_${selectedLearner.surname}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedLearner) return <div className="text-white">No learner selected</div>;

  return (
    <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-400" />
                  Practical Evaluation Report
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Generates SASSETA onsite practical evaluation report sheets for Weeks 2–4 practicals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={2}>Week 2 Practical</option>
                <option value={3}>Week 3 Practical</option>
                <option value={4}>Week 4 Practical</option>
              </select>

              <select
                value={selectedUS.id}
                onChange={(e) => {
                  const found = availableUnitStandards.find(u => u.id === e.target.value);
                  if (found) setSelectedUS(found);
                }}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white max-w-xs focus:outline-none"
              >
                {availableUnitStandards.map(u => (
                  <option key={u.id} value={u.id}>US {u.id} – {u.title}</option>
                ))}
              </select>

              <button
                  onClick={handleGeneratePDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg"
              >
                  {isExporting ? 'Generating...' : <><Download className="w-4 h-4" /> Export PDF</>}
              </button>
            </div>
        </div>

      <div className="flex gap-6">
        <div className="w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-[700px] overflow-y-auto">
          <input
            type="text"
            placeholder="Search learners..."
            value={learnerSearch}
            onChange={(e) => setLearnerSearch(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white mb-4"
          />
          {filteredLearners.map(learner => (
            <button
              key={learner.id}
              onClick={() => setSelectedLearner(learner)}
              className={`w-full text-left p-3 rounded-lg ${selectedLearner.id === learner.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {learner.surname}, {learner.firstName}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-12 text-black shadow-2xl min-h-[1000px]" ref={printRef}>
          {/* Header */}
          <div className="border-b border-black pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Practical Evaluation Report</h1>
              <p className="text-sm">Rosco Consultants Pty Ltd | Registration: 2013 / 211307 / 07 | PSIRA: 3066327 | SASSETA: 07-SAS/SDP260122-43</p>
              <p className="text-sm">Venue: 23 Slater Street, Kilner Park, 0186</p>
            </div>
            <img src="/rosco_logo.png" alt="Rosco Training" className="h-16 object-contain" />
          </div>

          {/* Assessor/Moderator Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="border border-black p-2"><strong>Assessor Name:</strong> {selectedLearner.moderatorName || 'Courtney Rosenberg'}</div>
            <div className="border border-black p-2"><strong>Reg No:</strong> {selectedLearner.moderatorNumber || '19A78062010'}</div>
            <div className="border border-black p-2"><strong>Service Provider:</strong> IRW Security Training Services</div>
          </div>

          {/* Learner Info */}
          <div className="border border-black p-4 mb-6 text-sm">
            <h3 className="font-bold border-b border-black mb-2">Onsite assessment practical evaluation</h3>
            <div className="grid grid-cols-2 gap-2">
                <div><strong>Learner Name:</strong> {selectedLearner.firstName} {selectedLearner.surname}</div>
                <div><strong>ID:</strong> {selectedLearner.idNumber}</div>
                <div><strong>Qualification:</strong> National Certificate General Security Practice (58577)</div>
                <div><strong>Unit Standard:</strong> U/S {selectedUS.id} – {selectedUS.title}</div>
                <div><strong>Evaluation Stage:</strong> Workplace Exposure Week {selectedWeek} Practical</div>
                <div><strong>Learner No:</strong> {selectedLearner.learnerNo || 'L001'}</div>
            </div>
          </div>

          {/* Assessment Criteria Table */}
          <table className="w-full border-collapse border border-black text-sm mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2">Assessment Criteria</th>
                <th className="border border-black p-2">4</th>
                <th className="border border-black p-2">3</th>
                <th className="border border-black p-2">2</th>
                <th className="border border-black p-2">1</th>
                <th className="border border-black p-2">C / NYC</th>
              </tr>
            </thead>
            <tbody>
              {['Assess customer needs and complaints', 'Respond to customer inquiries and problems', 'Communicate with customers to resolve problems and complaints'].map(criterion => (
                  <tr key={criterion}>
                      <td className="border border-black p-2">{criterion}</td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                  </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="border border-black p-2 h-20">Signature of Assessor:</div>
            <div className="border border-black p-2 h-20">Date:</div>
          </div>
        </div>
      </div>
    </div>
  );
};
