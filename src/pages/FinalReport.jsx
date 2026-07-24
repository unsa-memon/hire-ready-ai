import React, { useEffect, useState } from 'react';
import { Target, FileText, Download, CheckCircle, TrendingUp, Presentation, AlertCircle, Sparkles, Copy, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { extractPdfText, generateFinalReport } from '../lib/gemini';
import toast from 'react-hot-toast';

export function FinalReport() {
  const { activeResumeId, activeResumeDetails, activeJobId, activeJobDetails } = useAppContext();
  const { currentUser } = useAuth();
  
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!activeResumeId || !activeJobId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('final_reports')
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
    fetchReport();
  }, [activeResumeId, activeJobId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      toast('Extracting resume metrics...', { icon: '📄' });
      const resumeText = await extractPdfText(activeResumeDetails.file_url);

      toast('Synthesizing executive alignment thesis...', { icon: '🤖' });
      const genData = await generateFinalReport(resumeText, activeJobDetails.description_text);

      const { data, error } = await supabase
        .from('final_reports')
        .insert({
          user_id: currentUser.id,
          resume_id: activeResumeId,
          job_id: activeJobId,
          overall_score: genData.overall_score,
          summary: genData.summary
        })
        .select()
        .single();
        
      if (error) throw error;
      
      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'final_report',
        description: `Finalized Executive Alignment Summary via CareerBeam AI Engine.`,
        link_url: '/report'
      });
      
      setReport(data);
      toast.success("Executive evaluation report generated!");
    } catch (e) {
       toast.error(e.message || "We couldn't generate your final report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([
      `CAREERBEAM AI - EXECUTIVE EVALUATION REPORT\n--------------------------------------------\nCandidate File: ${activeResumeDetails?.file_name || 'Resume'}\nTarget Position: ${activeJobDetails?.job_title || 'Position'}\nCompany: ${activeJobDetails?.company_name || 'Target Company'}\nHolistic Match Score: ${report.overall_score}%\n\nEVALUATION THESIS:\n${report.summary}`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CareerBeam_ExecutiveReport_${activeResumeDetails?.file_name || 'Output'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded.");
  };

  const renderEvaluationThesis = (summaryText) => {
    if (!summaryText) return null;

    const explicitParagraphs = summaryText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);

    if (explicitParagraphs.length > 1) {
      return explicitParagraphs.map((para, idx) => (
        <p key={idx} className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-normal whitespace-pre-line">
          {para}
        </p>
      ));
    }

    // Protect technical terms (Node.js, Express.js, React.js, e.g., i.e.) from splitting on periods
    const protectedText = summaryText
      .replace(/\b([a-zA-Z0-9_-]+)\.(js|ts|py|net|io|org|com|ai|dev|app|sh)\b/gi, '$1__DOT__$2')
      .replace(/\b(e\.g|i\.e|vs|dr|mr|mrs|ms|prof)\./gi, '$1__DOT__');

    const rawSentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z])/g);
    const sentences = rawSentences.map(s => s.replace(/__DOT__/g, '.').trim()).filter(Boolean);

    if (sentences.length <= 1) {
      return (
        <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
          {summaryText.trim()}
        </p>
      );
    }

    const paragraphs = [];
    let currentChunk = "";

    sentences.forEach((sentence, idx) => {
      currentChunk += (currentChunk ? " " : "") + sentence;
      if (currentChunk.length >= 240 || idx === sentences.length - 1) {
        paragraphs.push(currentChunk.trim());
        currentChunk = "";
      }
    });

    return paragraphs.map((para, i) => (
      <p key={i} className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
        {para}
      </p>
    ));
  };

  if (isLoading) {
    return (
       <div className="flex pt-20 justify-center">
         <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold animate-pulse">
           <Presentation className="animate-spin-slow" /> Computing executive alignment matrices...
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
          Upload your resume and select a target job description to compute your executive evaluation report.
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
            Executive Summary & Thesis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base font-semibold">
            Comprehensive holistic evaluation mapping your technical experience directly against target role vectors.
          </p>
        </div>
        {!report && (
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-12 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-600 via-primary to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 border-none gap-2">
             <Sparkles size={18} />
             {isGenerating ? "Gemini Synthesizing..." : "Compute Final Report"}
          </Button>
        )}
      </div>

      {report ? (
        <Card className="glass-card shadow-2xl border-indigo-200/80 dark:border-indigo-900/60 relative overflow-hidden bg-white/95 dark:bg-slate-900/95 rounded-[2.5rem]">
          {/* Top Action Bar */}
          <div className="h-16 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 backdrop-blur-md relative z-20">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
              <span className="ml-3 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hidden sm:inline">
                Executive Evaluation Thesis
              </span>
            </div>

            <div className="flex gap-3 items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 rounded-xl text-xs font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" 
                onClick={() => {
                  navigator.clipboard.writeText(report.summary);
                  toast.success("Evaluation thesis copied!");
                }}
              >
                <Copy size={14} className="mr-1.5 text-indigo-600 dark:text-indigo-400" /> Copy Thesis
              </Button>
              
              <Button 
                size="sm" 
                className="h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all border-none" 
                onClick={handleDownload}
              >
                <Download size={14} className="mr-1.5" /> Export Text
              </Button>
            </div>
          </div>
          
          <CardContent className="p-8 md:p-12 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-[1fr_2.2fr] gap-10 items-start">
                
                {/* Score Dial & Alignment Column */}
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-8 md:pb-0 md:pr-8 space-y-6">
                  <div className="relative w-56 h-56 flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="finalReportScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="50%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <circle
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (report?.overall_score ?? 0)) / 100}
                        strokeLinecap="round"
                        stroke="url(#finalReportScoreGradient)"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{report?.overall_score ?? 0}%</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-1">Holistic Match</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2 w-full">
                    <Badge variant={report.overall_score >= 80 ? 'default' : 'secondary'} className={`px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-xs cursor-default ${report.overall_score >= 80 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'}`}>
                      {report.overall_score >= 80 ? "Highly Competitive" : report.overall_score >= 60 ? "Moderately Aligned" : "Requires Targeted Optimization"}
                    </Badge>
                  </div>

                  {/* Target Context Summary Box */}
                  <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <span>Target Role Context</span>
                      <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {activeJobDetails?.job_title || 'Target Position'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {activeJobDetails?.company_name || 'Target Company'}
                    </p>
                  </div>
                </div>

                {/* Summary & Evaluation Thesis Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md flex items-center justify-center text-white shrink-0">
                          <CheckCircle size={20} /> 
                        </div>
                        Evaluation Thesis
                      </h3>
                      
                      <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <RefreshCw size={13} className={isGenerating ? "animate-spin" : ""} /> Re-Evaluate
                      </button>
                    </div>

                    {/* Styled Evaluation Thesis Container */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-50/90 via-white/95 to-indigo-50/60 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-indigo-950/30 border border-slate-200/90 dark:border-slate-800/80 shadow-md space-y-4">
                      {renderEvaluationThesis(report.summary)}
                    </div>
                  </div>
                  
                  {/* Strategic Recommendation Callout */}
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3.5 text-xs sm:text-sm font-semibold text-indigo-950 dark:text-indigo-100">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-md">
                      <Sparkles size={16} />
                    </div>
                    <div className="space-y-1">
                      <span className="font-black text-indigo-700 dark:text-indigo-300 block uppercase tracking-wider text-[11px]">
                        Strategic Career Recommendation
                      </span>
                      <p className="leading-relaxed">
                        {report.overall_score >= 80 
                          ? "Your profile demonstrates strong structural alignment for this role. Focus on tailoring your cover letter and practicing targeted technical mock interviews to stand out."
                          : "Bridge identified technical gaps in backend frameworks or cloud tools by utilizing your personalized Skill Gap roadmap before submitting your application."
                        }
                      </p>
                    </div>
                  </div>

                  {/* Document Footer Metadata */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Compiled via CareerBeam AI Engine
                    </span>
                    <span className="hidden sm:inline text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Verified Matching Heuristic
                    </span>
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-14 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-white/50 dark:bg-slate-900/50 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Presentation size={36} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Compute Executive Matching Report</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold max-w-md">
            Click below to generate a holistic evaluation thesis and match scoring gauge for your target job application.
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-12 px-8 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-600 via-primary to-purple-600 shadow-xl shadow-indigo-500/30 hover:scale-[1.02] transition-all border-none gap-2">
            <Sparkles size={18} />
            {isGenerating ? "Gemini Synthesizing..." : "Compute Final Report"}
          </Button>
        </div>
      )}
    </div>
  );
}
