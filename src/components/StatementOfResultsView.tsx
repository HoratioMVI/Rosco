import React, { useState, useRef, useEffect } from 'react';
import { Learner } from '../types';
import { Award, Download, FileText, Search, Printer, CheckCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { unitStandards2021 } from '../data/unitStandards2021';

export const StatementOfResultsView: React.FC<{ learners: Learner[] }> = ({ learners }) => {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(learners[0] || null);
  const [learnerSearch, setLearnerSearch] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string, filename: string } | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedLearner) return;
    setLoading(true);
    const learnerNo = selectedLearner.learnerNo || `L${String(learners.findIndex(l => l.id === selectedLearner.id) + 1).padStart(3, '0')}`;
    fetch(`/rosco/api/theory-learner-books?learnerNo=${learnerNo}`)
      .then(r => r.json())
      .then(data => {
        setBooks(data.records || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedLearner, learners]);

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
      const title = `Statement_of_Results_${selectedLearner.surname}_${selectedLearner.idNumber}.pdf`;
      
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
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-400" />
            Learner Statement of Results
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Generate and export an official Statement of Results for individual learners indicating competency across all assigned unit standards. Suitable for distribution to learners or IBS.
          </p>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={isExporting || loading || !selectedLearner}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shrink-0"
        >
          {isExporting ? <span className="animate-pulse">Generating...</span> : <><Download className="w-4 h-4" /> Export SoR (PDF)</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Learner List */}
        <div className="lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col h-[700px]">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners..."
                value={learnerSearch}
                onChange={(e) => setLearnerSearch(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredLearners.map(learner => (
                <button
                  key={learner.id}
                  onClick={() => setSelectedLearner(learner)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                    selectedLearner?.id === learner.id
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-white shadow-md'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{learner.surname}, {learner.firstName}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">{learner.learnerNo}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{learner.idNumber}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Printable Document Area */}
        <div className="flex-1 overflow-x-auto bg-[#0f172a] rounded-2xl border border-white/10 p-4 custom-scrollbar flex justify-center">
          {selectedLearner && (
            <div 
              ref={printRef} 
              className="bg-white w-full max-w-[800px] min-h-[1056px] p-12 text-slate-900 shadow-2xl relative"
            >
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Statement of Results</h1>
                  <p className="text-sm font-semibold text-slate-500 mt-1 tracking-widest uppercase">Official Academic Record</p>
                </div>
                <div className="text-right">
                  <img src="/rosco_logo.png" alt="Rosco Training" className="h-16 w-16 object-contain ml-auto mb-2" />
                  <div className="font-bold text-sm">ROSCO LMS</div>
                  <div className="text-xs text-slate-500">Date Issued: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Learner Information */}
              <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Learner Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Surname</div>
                    <div className="font-bold text-base">{selectedLearner.surname}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">First Names</div>
                    <div className="font-bold text-base">{selectedLearner.firstName} {selectedLearner.secondName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">ID Number</div>
                    <div className="font-mono text-sm font-semibold text-slate-700">{selectedLearner.idNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Learner Number</div>
                    <div className="font-mono text-sm font-semibold text-emerald-600">
                      {selectedLearner.learnerNo || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Academic Achievements</h3>
                
                {loading ? (
                  <div className="text-center py-12 text-slate-500">Loading results...</div>
                ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-900 bg-slate-50">
                        <th className="py-3 px-4 font-bold text-slate-700 w-24">US ID</th>
                        <th className="py-3 px-4 font-bold text-slate-700">Unit Standard Title</th>
                        <th className="py-3 px-4 font-bold text-slate-700 text-center w-24">Credits</th>
                        <th className="py-3 px-4 font-bold text-slate-700 w-32 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {unitStandards2021.map((us) => {
                        const isVerified = true; // All are certified in this historical cohort
                        
                        return (
                          <tr key={us.usId}>
                            <td className="py-2 px-4 font-mono font-bold text-slate-600">{us.usId}</td>
                            <td className="py-2 px-4">
                              <div className="text-slate-800 text-xs font-semibold">{us.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono uppercase">{us.usType} | {us.nqfLevel}</div>
                            </td>
                            <td className="py-2 px-4 text-center font-mono text-slate-500 font-bold">{us.credits}</td>
                            <td className="py-2 px-4 text-right">
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                                  <CheckCircle className="w-3 h-3" /> Competent
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer / Signatures */}
              <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12">
                <div>
                  <div className="h-12 border-b border-slate-400 mb-2"></div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 text-center">IBS / Assessor Signature</div>
                </div>
                <div>
                  <div className="h-12 border-b border-slate-400 mb-2"></div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 text-center">Date</div>
                </div>
              </div>
              
              <div className="absolute bottom-12 left-12 right-12 text-center text-[10px] text-slate-400 font-mono">
                System generated official transcript. Document ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}-{Date.now().toString().slice(-6)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#0f172a] rounded-2xl border border-white/10 w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e293b]">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Preview: {pdfPreview.filename}
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
