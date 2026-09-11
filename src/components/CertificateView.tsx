import React, { useState, useRef } from 'react';
import { Learner } from '../types';
import { Award, Download, Search, Printer, CheckCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { unitStandards2021 } from '../data/unitStandards2021';

export const CertificateView: React.FC<{ learners: Learner[] }> = ({ learners }) => {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(learners.find(l => l.surname === 'GXEKWA') || learners[0] || null);
  const [learnerSearch, setLearnerSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string, filename: string } | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const filteredLearners = learners.filter(l =>
    l.surname.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.firstName.toLowerCase().includes(learnerSearch.toLowerCase()) ||
    l.idNumber.includes(learnerSearch) ||
    (l.learnerNo && l.learnerNo.toLowerCase().includes(learnerSearch.toLowerCase()))
  );

  const handleGeneratePDF = async () => {
    if (!printRef.current || !selectedLearner) return;
    setIsExporting(true);
    
    try {
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
      const title = `Certificate_${selectedLearner.surname}_${selectedLearner.idNumber}.pdf`;
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfPreview({ url, filename: title });
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  const coreStandards = unitStandards2021.filter(us => us.usType === 'Core');
  const fundamentalStandards = unitStandards2021.filter(us => us.usType === 'Fundamental');
  const electiveStandards = unitStandards2021.filter(us => us.usType === 'Elective');

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            Qualification Certificates
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Generate official certificates for NC: General Security Practice 58577. This document certifies full competency across Core, Fundamental, and Elective unit standards.
          </p>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={isExporting || !selectedLearner}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-amber-600/20"
        >
          {isExporting ? <span className="animate-pulse">Generating...</span> : <><Download className="w-4 h-4" /> Export Certificate (PDF)</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col h-[800px]">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners..."
                value={learnerSearch}
                onChange={(e) => setLearnerSearch(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredLearners.map(learner => (
                <button
                  key={learner.id}
                  onClick={() => setSelectedLearner(learner)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                    selectedLearner?.id === learner.id
                      ? 'bg-amber-500/20 border border-amber-500/30 text-white shadow-md'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{learner.surname}, {learner.firstName}</div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">{learner.learnerNo}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{learner.idNumber}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto bg-[#0f172a] rounded-2xl border border-white/10 p-4 custom-scrollbar flex justify-center">
          {selectedLearner && (
            <div 
              ref={printRef} 
              className="bg-white w-full max-w-[800px] min-h-[1100px] p-16 text-slate-900 shadow-2xl relative border-[12px] border-double border-slate-200"
            >
              {/* Ornamental Border Corner */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-400 opacity-30"></div>
              <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-400 opacity-30"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-400 opacity-30"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-400 opacity-30"></div>

              {/* Certificate Header */}
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl mx-auto mb-6 text-4xl transform -rotate-3">
                  R
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">THIS IS TO CERTIFY THAT:</h1>
                <div className="text-3xl font-serif italic font-bold text-indigo-900 border-b-2 border-slate-900 inline-block px-8 py-2 mb-2">
                  {selectedLearner.firstName} {selectedLearner.secondName} {selectedLearner.surname}
                </div>
                <div className="text-lg font-mono font-bold text-slate-600">ID {selectedLearner.idNumber}</div>
                {selectedLearner.learnerNo && (
                  <div className="text-sm font-mono font-bold text-amber-600 mt-1 uppercase tracking-wider">Learner No: {selectedLearner.learnerNo}</div>
                )}
              </div>

              <div className="text-center mb-8">
                <p className="text-lg text-slate-700 leading-relaxed max-w-xl mx-auto">
                  Has attended and successfully completed the following unit standards for
                </p>
                <h2 className="text-2xl font-black text-slate-900 mt-2 uppercase tracking-wide">NC: General Security Practice 58577</h2>
              </div>

              {/* Standards Table */}
              <div className="mb-12">
                <table className="w-full text-left border-collapse text-[10px] leading-tight">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-50">
                      <th className="py-1 px-2 font-bold text-slate-900 w-16">TYPE</th>
                      <th className="py-1 px-2 font-bold text-slate-900 w-20">ID</th>
                      <th className="py-1 px-2 font-bold text-slate-900">UNIT STANDARD TITLE</th>
                      <th className="py-1 px-2 font-bold text-slate-900 w-24">NQF LEVEL</th>
                      <th className="py-1 px-2 font-bold text-slate-900 w-12 text-center">CREDITS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unitStandards2021.map((us) => (
                      <tr key={us.usId}>
                        <td className="py-1 px-2 font-bold text-slate-500 uppercase">{us.usType}</td>
                        <td className="py-1 px-2 font-mono font-bold text-slate-700">{us.usId}</td>
                        <td className="py-1 px-2 font-medium text-slate-800">{us.title}</td>
                        <td className="py-1 px-2 text-slate-600">{us.nqfLevel}</td>
                        <td className="py-1 px-2 text-center font-bold text-indigo-700">{us.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-20 mt-12 mb-12">
                <div className="text-center">
                  <div className="border-b border-slate-900 py-4 mb-2 italic font-serif text-lg text-slate-800">
                    Courtney Rosenberg
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Name of Assessor</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-900 py-4 mb-2 font-mono text-lg text-slate-800">
                    22/03/2024
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Date</div>
                </div>
              </div>

              {/* Accreditation Info */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <div>Reg 2013/211307/07</div>
                <div className="text-center">Sasseta Accreditation number: 07-SAS/SDP260122-4315</div>
                <div className="text-right">Auth ID: {selectedLearner.idNumber.slice(0, 6)}-{Math.random().toString(36).substr(2, 4).toUpperCase()}</div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-[-35deg]">
                <div className="text-[120px] font-black leading-none border-[20px] border-slate-900 rounded-full p-20">
                  CERTIFIED
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {pdfPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#0f172a] rounded-2xl border border-white/10 w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e293b]">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Preview: {pdfPreview.filename}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={pdfPreview.url}
                  download={pdfPreview.filename}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors"
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
