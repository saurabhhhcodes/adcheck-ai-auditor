import React, { useState } from 'react';
import { CheckCircle2, RefreshCcw, Download, Loader2 } from 'lucide-react';
import { AuditResult } from '../types';
import { downloadAuditPackage } from '../utils/exportUtils';

interface AuditResultCardProps {
  result: AuditResult;
  creativeBase64: string;
  fixedImage: string | null;
  isFixing: boolean;
  fixError: string | null;
}

const AuditResultCard: React.FC<AuditResultCardProps> = ({ 
  result, 
  creativeBase64,
  fixedImage, 
  isFixing, 
  fixError 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await downloadAuditPackage(creativeBase64, fixedImage, result);
    setIsExporting(false);
  };

  // Scenario 1: Audit Passed
  if (result.pass) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600 w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-green-800">Audit Passed</h2>
              <p className="text-sm text-green-600">Creative meets all guidelines.</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col items-center justify-center">
          <div className="text-slate-500 text-center mb-8">
            <p>No issues found. This creative is ready for publication!</p>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            Download Report & Assets
          </button>
        </div>
      </div>
    );
  }

  // Scenario 2: Audit Failed (implied) - Showing Fix Progress or Result
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col justify-center">
        
        {/* Loading State: Auto-Fixing */}
        {isFixing && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in p-12">
            <RefreshCcw className="text-indigo-600 w-16 h-16 animate-spin mb-6" />
            <h3 className="text-2xl text-indigo-900 font-bold mb-2">Auto-Fixing Creative...</h3>
            <p className="text-slate-500 max-w-sm">
              Gemini is rewriting the ad content to comply with retailer guidelines.
            </p>
          </div>
        )}

        {/* Error State */}
        {fixError && (
           <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-center flex flex-col items-center justify-center h-full">
            <h3 className="text-red-800 font-semibold mb-2">Fix Failed</h3>
            <p className="text-red-600 text-sm">{fixError}</p>
          </div>
        )}

        {/* Success State: Fixed Image */}
        {fixedImage && !isFixing && (
          <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    <h3 className="text-lg font-bold text-slate-800">Optimized Creative</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                        Auto-Fixed
                    </span>
                </div>
             </div>
             
             <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center relative group min-h-0">
                <img 
                    src={fixedImage} 
                    alt="Fixed Creative" 
                    className="max-w-full max-h-full object-contain" 
                />
             </div>
             
             <div className="mt-4 flex flex-col gap-4">
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600 text-center">
                       <span className="font-semibold text-indigo-600">Compliance check complete.</span> The violations have been automatically corrected by Gemini.
                    </p>
                 </div>
                 
                 <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                  >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    Download Report & Fixed Asset
                  </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditResultCard;