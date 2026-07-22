import React, { useEffect, useState } from 'react';
import { Target, AlertCircle, FileText, CheckCircle2, TrendingUp, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { extractPdfText, generateAtsScore } from '../lib/gemini';
import toast from 'react-hot-toast';

export function AtsScore() {
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
          .from('ats_reports')
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

      toast('Checking ATS compatibility...', { icon: '🤖' });
      const genData = await generateAtsScore(resumeText, activeJobDetails.description_text);

      const { data, error } = await supabase
        .from('ats_reports')
        .insert({
          user_id: currentUser.id,
          resume_id: activeResumeId,
          job_id: activeJobId,
          score: genData.score,
          matching_keywords: genData.matching_keywords,
          missing_keywords: genData.missing_keywords,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'ats_scanned',
        description: `ATS Score generated: ${genData.score}%`,
        link_url: '/ats'
      });

      setReport(data);
      toast.success("ATS Analysis complete.");
    } catch (e) {
      toast.error(e.message || "We couldn't generate your ATS score. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex pt-20 justify-center">
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <Target className="animate-spin-slow" /> Searching for ATS history...
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
        <p className="text-muted-foreground">You must upload a resume AND set a target job description to dynamically instruct Gemini logic hooks.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/upload'}>Upload Context</Button>
          <Button variant="default" onClick={() => window.location.href = '/job-description'}>Set Job</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            ATS Score <TrendingUp size={24} className="text-primary" />
          </h1>
          <p className="text-muted-foreground mt-2">Gemini actively shreds your terminology mimicking rigid Application Tracking architectures</p>
        </div>
        {!report && (
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-12 px-6 rounded-full font-extrabold text-white bg-gradient-to-r from-indigo-600 via-primary to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 border-none">
            {isGenerating ? "Gemini Scanning..." : "Scan ATS Parameters"}
          </Button>
        )}
      </div>

      {report ? (
        <>
          <Card className="glass-card shadow-xl border-border/50 relative overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                {/* Score Dial (Sharp & Crisp) */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-52 h-52 flex items-center justify-center p-2 rounded-full bg-surface-50/50 dark:bg-surface-900/50 border border-border/40 shadow-inner">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      {/* Outer background track */}
                      <circle
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      {/* Active progress track */}
                      <circle
                        className="transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (report.score || 0)) / 100}
                        strokeLinecap="round"
                        stroke="url(#scoreGradient)"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-5xl font-black text-foreground tracking-tight">
                        {report.score}%
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mt-1">
                        MATCH SCORE
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 text-center">
                    <Badge 
                      variant="outline"
                      className={`px-4 py-1.5 text-xs font-bold rounded-full border ${
                        report.score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                        report.score >= 60 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" :
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {report.score >= 80 ? "Excellent Match" : report.score >= 60 ? "Good Alignment" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>

                {/* Score Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Automated Keyword Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Applicant tracking systems highly rank resumes that closely mirror the syntax of the targeted job description explicitly mapped below.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center shadow-xs">
                      <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                        {report.matching_keywords.length}
                      </div>
                      <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        Hard Matches
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center shadow-xs">
                      <div className="text-4xl font-black text-rose-600 dark:text-rose-400 mb-1">
                        {report.missing_keywords.length}
                      </div>
                      <div className="text-xs font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                        Missing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                  <CheckCircle2 size={18} /> Found Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.matching_keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/10 transition-colors">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                  <AlertCircle size={18} /> Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.missing_keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/10 transition-colors">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-3xl bg-surface-50/50 dark:bg-surface-900/50 text-center space-y-4">
          <Briefcase className="text-primary/50 w-16 h-16" />
          <p className="text-muted-foreground max-w-sm">Tap 'Scan ATS Parameters' to deploy Gemini across both text vectors efficiently generating exact match ratios natively.</p>
        </div>
      )}
    </div>
  );
}
