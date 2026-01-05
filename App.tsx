import React, { useState } from 'react';
import { ShieldCheck, FileText, LayoutDashboard, Loader2 } from 'lucide-react';
import UploadZone from './components/UploadZone';
import AuditResultCard from './components/AuditResultCard';
import ImageCropper from './components/ImageCropper';
import { AdCreative, AuditResult, DEFAULT_GUIDELINES } from './types';
import { auditCreative, fixCreative } from './services/gemini';

const App: React.FC = () => {
  const [creative, setCreative] = useState<AdCreative | null>(null);
  const [guidelines, setGuidelines] = useState<string>(DEFAULT_GUIDELINES);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  
  // App States
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Fix States
  const [fixedImage, setFixedImage] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);

  const handleUpload = (newCreative: AdCreative) => {
    setCreative(newCreative);
    resetResults();
  };

  const handleClear = () => {
    setCreative(null);
    resetResults();
  };

  const resetResults = () => {
    setAuditResult(null);
    setError(null);
    setFixedImage(null);
    setFixError(null);
    setIsFixing(false);
  }

  const handleStartCrop = () => {
    if (creative) {
      setIsCropping(true);
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (creative) {
      setCreative({
        ...creative,
        base64: croppedBase64,
        previewUrl: croppedBase64,
      });
      // Invalidate previous results since image changed
      setAuditResult(null);
      setFixedImage(null);
    }
    setIsCropping(false);
  };

  const runAudit = async () => {
    if (!creative) return;

    // Reset previous states
    setIsAuditing(true);
    setError(null);
    setFixedImage(null);
    setFixError(null);
    setAuditResult(null);

    try {
      // 1. Run Audit
      const result = await auditCreative(creative.base64, guidelines);
      setAuditResult(result);
      
      // Stop auditing loading state so the result card appears
      setIsAuditing(false);

      // 2. Automatically Run Fix if Failed
      if (!result.pass) {
        setIsFixing(true);
        try {
          const fixed = await fixCreative(creative.base64, result.corrective_instruction);
          setFixedImage(fixed);
        } catch (err) {
          console.error("Auto-fix failed", err);
          setFixError("Failed to automatically fix the creative. Please try again.");
        } finally {
          setIsFixing(false);
        }
      }

    } catch (err) {
      console.error(err);
      setError("An error occurred during the audit. Please check your API key and try again.");
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">AdCheck</h1>
              <p className="text-xs text-slate-500 font-medium">AI Compliance Auditor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-600">Gemini 3.0 Flash Ready</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard className="text-slate-400" size={20} />
                <h2 className="text-lg font-semibold text-slate-800">1. Upload Creative</h2>
              </div>
              <UploadZone 
                currentCreative={creative} 
                onUpload={handleUpload} 
                onClear={handleClear} 
                onCrop={handleStartCrop}
              />
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-slate-400" size={20} />
                  <h2 className="text-lg font-semibold text-slate-800">2. Retailer Guidelines</h2>
                </div>
                <button 
                  onClick={() => setGuidelines(DEFAULT_GUIDELINES)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                className="w-full flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-sm leading-relaxed text-slate-700 font-mono transition-all"
                placeholder="Paste retailer guidelines here..."
              />
            </section>

            <button
              onClick={runAudit}
              disabled={!creative || isAuditing || isFixing}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3
                ${!creative || isAuditing || isFixing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
            >
              {isAuditing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Running Audit...
                </>
              ) : isFixing ? (
                 <>
                  <Loader2 className="animate-spin" size={24} />
                  Fixing Creative...
                </>
              ) : (
                <>
                  <ShieldCheck size={24} />
                  Run Compliance Audit
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-7 h-full">
            {auditResult && creative ? (
              <AuditResultCard 
                result={auditResult} 
                creativeBase64={creative.base64}
                fixedImage={fixedImage}
                isFixing={isFixing}
                fixError={fixError}
              />
            ) : (
              <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="text-slate-200" size={48} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to Audit</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Upload an ad creative and define your guidelines to let Gemini perform a comprehensive visual and semantic compliance check.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Cropper Modal */}
      {isCropping && creative && (
        <ImageCropper 
          imageSrc={creative.previewUrl} 
          onCancel={() => setIsCropping(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default App;