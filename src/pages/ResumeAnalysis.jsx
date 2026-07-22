import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, BrainCircuit, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { extractPdfText, generateResumeAnalysis } from '../lib/gemini';
import toast from 'react-hot-toast';

export function ResumeAnalysis() {
  const { activeResumeId, activeResumeDetails, activeJobId, activeJobDetails } = useAppContext();
  const { currentUser } = useAuth();
  
  const [analysis, setAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch logic
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!activeResumeId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        let query = supabase.from('resume_analysis').select('*').eq('resume_id', activeResumeId);
        if (activeJobId) {
          query = query.eq('job_id', activeJobId);
        } else {
          query = query.is('job_id', null);
        }
        
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) setAnalysis(data);
      } catch (error) {
        console.error("Error fetching analysis:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [activeResumeId, activeJobId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // 1. Shred PDF
      toast('Analyzing your resume...', { icon: '📄' });
      const resumeText = await extractPdfText(activeResumeDetails.file_url);

      // 2. Transmit to Gemini AI
      toast('Generating analysis...', { icon: '🧠' });
      const genData = await generateResumeAnalysis(resumeText, activeJobDetails?.description_text);
      
      // 3. Database Insertion
      toast('Saving results...', { icon: '💾' });
      const { data, error } = await supabase
        .from('resume_analysis')
        .insert({
          user_id: currentUser.id,
          resume_id: activeResumeId,
          job_id: activeJobId || null,
          strengths: genData.strengths,
          weaknesses: genData.weaknesses
        })
        .select()
        .single();
        
      if (error) throw error;
      
      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'resume_analyzed',
        description: `Generated explicit Gemini AI Resume structure natively.`,
        link_url: '/analysis'
      });

      setAnalysis(data);
      toast.success("AI Analysis complete!");
    } catch (error) {
      toast.error(error.message || "We couldn't generate your resume analysis. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
       <div className="flex pt-20 justify-center">
         <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
           <BrainCircuit className="animate-spin-slow" /> Loading analytics securely...
         </div>
       </div>
    );
  }

  if (!activeResumeId) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold">No Resume Active</h2>
        <p className="text-muted-foreground">Upload a resume in the portal first to unlock artificial intelligence analysis tools.</p>
        <Button variant="default" onClick={() => window.location.href = '/upload'}>Go to Upload</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep-dive structural parsing of your profile powered by Gemini Flash</p>
        </div>
        {!analysis && (
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-12 px-6 rounded-full font-extrabold text-white bg-gradient-to-r from-indigo-600 via-primary to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 border-none gap-2">
             <Sparkles size={18} />
             {isGenerating ? "Analyzing..." : "Generate Analysis"}
          </Button>
        )}
      </div>
      
      {analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths Card */}
          <Card className="bg-gradient-to-br from-emerald-50/90 via-slate-100/95 to-teal-50/80 dark:from-slate-900/95 dark:via-emerald-950/30 dark:to-slate-900/90 border border-emerald-200/90 dark:border-emerald-700/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-500 rounded-3xl overflow-hidden relative group">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xl font-black">
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300/40">
                  <CheckCircle size={22} />
                </div>
                Identified Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-emerald-200/70 dark:border-slate-700 shadow-xs group-hover:border-emerald-400 transition-colors">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-emerald-500/20 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[15px] font-bold leading-relaxed text-slate-900 dark:text-white">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Weaknesses Card */}
          <Card className="bg-gradient-to-br from-orange-50/90 via-slate-100/95 to-amber-50/80 dark:from-slate-900/95 dark:via-orange-950/30 dark:to-slate-900/90 border border-orange-200/90 dark:border-orange-700/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(249,115,22,0.1)] hover:-translate-y-1 transition-all duration-500 rounded-3xl overflow-hidden relative group">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-300 text-xl font-black">
                <div className="p-2.5 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-300 font-bold border border-orange-300/40">
                  <AlertCircle size={22} />
                </div>
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {analysis.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-orange-200/70 dark:border-slate-700 shadow-xs group-hover:border-orange-400 transition-colors">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-xs font-black shadow-md shadow-orange-500/20 mt-0.5">
                      !
                    </span>
                    <span className="text-[15px] font-bold leading-relaxed text-slate-900 dark:text-white">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-border/50 rounded-3xl bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-sm">
          <p className="text-muted-foreground italic text-center max-w-sm px-4">
            Click 'Generate Analysis' to instruct Gemini to natively shred and classify your architecture mapping.
          </p>
        </div>
      )}
    </div>
  );
}
