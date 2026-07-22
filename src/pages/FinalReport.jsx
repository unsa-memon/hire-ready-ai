import React, { useEffect, useState } from 'react';
import { Target, FileText, Download, CheckCircle, TrendingUp, Presentation, AlertCircle } from 'lucide-react';
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
      toast('Analyzing your resume...', { icon: '📄' });
      const resumeText = await extractPdfText(activeResumeDetails.file_url);

      toast('Generating final report...', { icon: '🤖' });
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
        description: `Finalized Executive Summary seamlessly via Gemini integration.`,
        link_url: '/report'
      });
      
      setReport(data);
      toast.success("Final report generated.");
    } catch (e) {
       toast.error(e.message || "We couldn't generate your final report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([
      `HIRE READY AI - EXECUTIVE SUMMARY\n--------------------------------\n\nScore: ${report.overall_score}%\n\nSummary:\n${report.summary}`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HireReady_FinalReport_${activeResumeDetails?.file_name || 'Output'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded.");
  };

  if (isLoading) {
    return (
       <div className="flex pt-20 justify-center">
         <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
           <Presentation className="animate-spin-slow" /> Rendering structural matrices...
         </div>
       </div>
    );
  }

  if (!activeResumeId || !activeJobId) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold">Incomplete Context</h2>
        <p className="text-muted-foreground">Upload your resume and paste a job description explicitly allowing AI schemas to compute an exact executive matching heuristic.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/upload'}>Upload Context</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Summary</h1>
          <p className="text-muted-foreground mt-2">A holistic mapping natively evaluating your competitiveness symmetrically mapped to explicitly parsed structural parameters.</p>
        </div>
        {!report && (
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-12 px-6 rounded-full font-extrabold text-white bg-gradient-to-r from-indigo-600 via-primary to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 border-none gap-2">
             {isGenerating ? "Gemini Formatting Matrix..." : "Compute Final Report"}
          </Button>
        )}
      </div>

      {report ? (
        <Card className="glass-card shadow-xl border-border/50 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-0 right-0 p-6 flex gap-2 z-10">
             <Button variant="default" size="sm" className="gap-2 shadow-sm" onClick={handleDownload}>
              <Download size={14} /> Export Text
             </Button>
          </div>
          
          <CardContent className="p-8 md:p-12 relative z-0">
             <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-center">
                
                {/* Score Dial */}
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/50 pb-8 md:pb-0 md:pr-8">
                  <div className="relative w-56 h-56 flex items-center justify-center group mx-auto md:mx-0">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
                    <svg className="w-full h-full transform -rotate-90 relative z-10 filter drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--color-primary-500)" />
                          <stop offset="100%" stopColor="var(--color-cyan-500)" />
                        </linearGradient>
                      </defs>
                      <circle
                        className="text-surface-200 dark:text-surface-800/80 transition-colors"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] drop-shadow-md"
                        strokeWidth="10"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * report.overall_score) / 100}
                        strokeLinecap="round"
                        stroke="url(#scoreGradient)"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center z-10 animate-in zoom-in duration-700 delay-300">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60">{report.overall_score}%</span>
                      <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Holistic Match</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Badge variant={report.overall_score >= 80 ? 'default' : 'secondary'} className="px-4 py-1 text-sm shadow-sm transition-colors cursor-default">
                      {report.overall_score >= 80 ? "Highly Competitive" : "Requires Optimization"}
                    </Badge>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 shadow-md flex items-center justify-center text-white hidden md:flex">
                          <CheckCircle size={20} /> 
                       </div>
                       Evaluation Thesis
                    </h3>
                    <div className="p-6 rounded-2xl bg-surface-50/80 dark:bg-surface-900/80 border border-border/50 shadow-inner">
                      <p className="text-foreground/90 leading-relaxed text-[15px]">
                        {report.summary}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border/40">
                     <p className="text-xs text-muted-foreground italic leading-relaxed">
                        This executive alignment was compiled utilizing automated intelligence securely matching exact variables identified inside your historical documentation and target vectors.
                     </p>
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-3xl bg-surface-50/50 dark:bg-surface-900/50 text-center space-y-4">
          <Presentation className="text-primary/50 w-16 h-16" />
          <p className="text-muted-foreground max-w-sm">Determine your holistic ranking algorithmically isolating parameters across all datasets gracefully aggregating success statistics effortlessly.</p>
        </div>
      )}
    </div>
  );
}
