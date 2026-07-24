import React, { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle, PenTool, AlertCircle, Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { extractPdfText, generateCoverLetter } from '../lib/gemini';
import toast from 'react-hot-toast';

export function CoverLetter() {
  const { activeResumeId, activeResumeDetails, activeJobId, activeJobDetails } = useAppContext();
  const { currentUser, userProfile } = useAuth();
  
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customRequirements, setCustomRequirements] = useState('');
  const [showCustomBox, setShowCustomBox] = useState(true);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (!activeResumeId || !activeJobId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('cover_letters')
          .select('*')
          .eq('resume_id', activeResumeId)
          .eq('job_id', activeJobId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        if (data) setReport(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoverLetter();
  }, [activeResumeId, activeJobId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      toast('Extracting resume data...', { icon: '📄' });
      const resumeText = await extractPdfText(activeResumeDetails.file_url);

      toast('Synthesizing personalized cover letter...', { icon: '🤖' });
      const genData = await generateCoverLetter(
          resumeText, 
          activeJobDetails.description_text, 
          userProfile?.full_name || currentUser?.email || 'Applicant',
          customRequirements
      );

      const { data, error } = await supabase
        .from('cover_letters')
        .insert({
          user_id: currentUser.id,
          resume_id: activeResumeId,
          job_id: activeJobId,
          content: genData.content
        })
        .select()
        .single();
        
      if (error) throw error;
      
      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'cover_letter_generated',
        description: `Generated AI Cover Letter.`,
        link_url: '/cover-letter'
      });
      
      setReport(data);
      toast.success("Personalized cover letter generated!");
    } catch (e) {
      toast.error(e.message || "Could not generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CoverLetter_${activeResumeDetails?.file_name || 'Output'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded.");
  };

  const addPresetTag = (text) => {
    if (customRequirements.includes(text)) return;
    setCustomRequirements(prev => prev ? `${prev}, ${text}` : text);
  };

  if (isLoading) {
    return (
      <div className="flex pt-20 justify-center">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold animate-pulse">
          <PenTool className="animate-spin" /> Preparing cover letter parameters...
        </div>
      </div>
    );
  }

  if (!activeResumeId || !activeJobId) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Context Required</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
          Upload your resume and specify a target job role to generate a tailored executive cover letter.
        </p>
        <div className="flex gap-4 pt-2">
          <Button variant="outline" className="rounded-2xl font-black" onClick={() => window.location.href = '/upload'}>
            Upload Resume
          </Button>
          <Button className="rounded-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white" onClick={() => window.location.href = '/job-description'}>
            Set Target Role
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Cover Letter Generator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base font-semibold">
            Draft an executive cover letter personalized to your exact experience and specific job requirements.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
          <Sparkles size={16} />
          Gemini LLM Synthesis
        </div>
      </div>

      {/* Personalization Options Box */}
      {(!report || showCustomBox) && (
        <Card className="bg-gradient-to-br from-indigo-50/80 via-white/95 to-purple-50/80 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-indigo-200/90 dark:border-indigo-700/60 shadow-[0_15px_35px_rgba(99,102,241,0.12)] p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-base font-black text-slate-900 dark:text-white">
                <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-400/30">
                  <Sliders size={20} />
                </div>
                Additional Personalization Requirements (Optional)
              </label>

              {report && (
                <button 
                  onClick={() => setShowCustomBox(false)} 
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Close Options
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              Add any specific points, achievements, or tone guidelines you want AI to incorporate into your letter.
            </p>

            {/* Custom Input Box */}
            <textarea
              className="w-full min-h-[100px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white px-5 py-3.5 text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all shadow-inner leading-relaxed"
              placeholder="e.g. Highlight my 3 years of React & TypeScript experience, emphasize my cloud architecture leadership, or keep the tone executive and formal..."
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
            />

            {/* Preset Quick-Add Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 mr-1">Quick Directives:</span>
              <button 
                type="button" 
                onClick={() => addPresetTag("Separate into 4 distinct well-spaced paragraphs: opening hook, technical accomplishments, problem-solving fit, and polite interview closing")} 
                className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 hover:bg-indigo-500/20 transition-colors"
              >
                ✨ Clear Paragraph Layout
              </button>
              <button 
                type="button" 
                onClick={() => addPresetTag("Emphasize technical leadership & team management")} 
                className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-300/40 hover:bg-blue-500/20 transition-colors"
              >
                ⚡ Technical Leadership
              </button>
              <button 
                type="button" 
                onClick={() => addPresetTag("Highlight quantifiable achievements, metrics, and measurable impacts")} 
                className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300/40 hover:bg-purple-500/20 transition-colors"
              >
                📊 Highlight Metrics
              </button>
              <button 
                type="button" 
                onClick={() => addPresetTag("Use a formal, executive, high-impact tone")} 
                className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 hover:bg-emerald-500/20 transition-colors"
              >
                💼 Executive Tone
              </button>
              <button 
                type="button" 
                onClick={() => addPresetTag("Express strong enthusiasm for company culture and modern developer tooling")} 
                className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/40 hover:bg-amber-500/20 transition-colors"
              >
                🚀 High Enthusiasm
              </button>
            </div>

            {/* Action Button */}
            <div className="pt-3 flex justify-end">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="h-12 px-8 rounded-2xl font-black text-base bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:scale-[1.02] transition-all border-none gap-2"
              >
                <Sparkles size={18} />
                {isGenerating 
                  ? "Gemini Synthesizing Draft..." 
                  : report 
                    ? "Regenerate Cover Letter with Directives" 
                    : "Generate Personalized Cover Letter"
                }
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Cover Letter Result View */}
      {report && (
        <div className="relative group perspective-[2000px] space-y-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 rounded-[2.5rem] blur-xl -z-10 transition-opacity duration-500 opacity-60" />
          
          <Card className="glass-card shadow-2xl border-indigo-200/80 dark:border-indigo-900/60 relative overflow-hidden bg-white/95 dark:bg-slate-900/95 rounded-[2.5rem]">
            {/* Top Editor Bar */}
            <div className="h-16 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 backdrop-blur-md relative z-20">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-xs" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
                <span className="ml-3 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hidden sm:inline">
                  Personalized Executive Cover Letter
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 rounded-xl text-xs font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" 
                  onClick={() => {
                    navigator.clipboard.writeText(report.content);
                    toast.success("Cover letter copied to clipboard!");
                  }}
                >
                  <CheckCircle size={15} className="mr-1.5 text-emerald-600 dark:text-emerald-400" /> Copy Document
                </Button>
                
                <Button 
                  size="sm" 
                  className="h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all border-none" 
                  onClick={handleDownload}
                >
                  <Download size={15} className="mr-1.5" /> Export TXT
                </Button>
              </div>
            </div>

            {/* Document Body */}
            <CardContent className="p-0 relative z-10">
              <div className="p-8 sm:p-14 relative">
                {/* Letterhead Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {userProfile?.full_name || currentUser?.email?.split('@')[0] || 'Applicant'}
                    </h3>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">
                      Target Role: {activeJobDetails?.job_title || 'Full Stack Developer'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-slate-700 dark:text-slate-300 font-bold mt-1">{activeJobDetails?.company_name || 'Hiring Manager / Team'}</p>
                  </div>
                </div>

                {/* Formatted Cover Letter Body */}
                <div className="max-w-none text-slate-900 dark:text-slate-100 font-sans leading-relaxed relative z-10 selection:bg-indigo-500/20 space-y-5">
                  {(() => {
                    const text = report.content || "";
                    const paragraphs = text
                      .split(/\n\s*\n/)
                      .map(p => p.trim())
                      .filter(Boolean);

                    if (paragraphs.length <= 1 && text.length > 250) {
                      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                      const chunked = [];
                      let current = "";
                      sentences.forEach((sentence, idx) => {
                        current += sentence + " ";
                        if (current.length > 220 || idx === sentences.length - 1) {
                          chunked.push(current.trim());
                          current = "";
                        }
                      });
                      return chunked.map((para, i) => (
                        <p key={i} className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
                          {para}
                        </p>
                      ));
                    }

                    return paragraphs.map((para, idx) => (
                      <p key={idx} className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-normal whitespace-pre-line">
                        {para}
                      </p>
                    ));
                  })()}
                </div>
              </div>
              
              <div className="px-8 sm:px-14 pb-6 pt-4 flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold gap-3">
                <span className="flex items-center gap-2">
                  <PenTool size={14} className="text-indigo-600 dark:text-indigo-400" /> Synthesized via CareerBeam AI LLM Engine
                </span>
                
                {!showCustomBox && (
                  <button 
                    onClick={() => setShowCustomBox(true)} 
                    className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <RefreshCw size={13} /> Adjust Directives & Regenerate
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
