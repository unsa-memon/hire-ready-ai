import React, { useEffect, useState } from 'react';
import { 
  Target, 
  AlertCircle, 
  BookOpen, 
  Key, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Code, 
  Users, 
  Clock, 
  FolderGit2, 
  Sparkles, 
  CheckCircle2,
  Compass,
  Rocket,
  MessageSquare,
  Layers,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { extractPdfText, generateSkillGap } from '../lib/gemini';
import toast from 'react-hot-toast';

export function SkillGap() {
  const { activeResumeId, activeResumeDetails, activeJobId, activeJobDetails } = useAppContext();
  const { currentUser } = useAuth();
  
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!activeResumeId || !activeJobId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('skill_gap_reports')
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
    fetchSkills();
  }, [activeResumeId, activeJobId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      toast('Analyzing your resume & target job requirements...', { icon: '📄' });
      const resumeText = await extractPdfText(activeResumeDetails.file_url);

      toast('Mapping missing skills & building personalized roadmap...', { icon: '🤖' });
      const genData = await generateSkillGap(resumeText, activeJobDetails.description_text);
      
      const { data, error } = await supabase
        .from('skill_gap_reports')
        .insert({
          user_id: currentUser.id,
          resume_id: activeResumeId,
          job_id: activeJobId,
          missing_technical: genData.missing_technical,
          missing_soft: genData.missing_soft,
          roadmap: genData.roadmap
        })
        .select()
        .single();
        
      if (error) throw error;
      
      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'gap_analysis',
        description: `Generated AI Skill Acquisition Roadmap natively focusing missing components.`,
        link_url: '/skills'
      });
      
      setReport(data);
      toast.success("Skill Gap Analysis complete.");
    } catch (e) {
      toast.error(e.message || "We couldn't generate your skill gap analysis. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
       <div className="flex pt-20 justify-center">
         <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
           <Zap className="animate-spin-slow" /> Rendering structural matrices...
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
        <p className="text-muted-foreground">Upload your resume AND select a target job description to compute your personalized Skill Gap roadmap.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/upload'}>Upload Resume</Button>
          <Button variant="default" onClick={() => window.location.href = '/job-description'}>Set Job Context</Button>
        </div>
      </div>
    );
  }

  // Fallback defaults for roadmap step extensions
  const defaultTimelines = ["1 – 2 Weeks", "2 – 3 Weeks", "3 – 4 Weeks"];
  const defaultImpacts = ["Critical Focus", "High Impact Skill", "Core Capability"];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Gap & Learning Roadmap</h1>
          <p className="text-muted-foreground mt-2">Identify missing technical and soft skills and follow a structured execution strategy to qualify for <span className="font-semibold text-foreground">{activeJobDetails?.job_title || 'your target role'}</span>.</p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="shadow-lg shadow-primary/20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
           {isGenerating ? "Analyzing Gaps..." : report ? "Re-Scan Skill Gaps" : "Perform Gap Scan"}
        </Button>
      </div>

      {report ? (
        <>
          {/* Missing Skills Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills Card */}
            <Card className="glass-card shadow-lg border-border/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-1 ring-blue-500/20 shadow-xs">
                    <Code size={20} />
                  </div>
                  <span>Missing Technical Skills</span>
                </CardTitle>
                <CardDescription className="pt-1 text-sm font-medium">
                  Hard skills and technical requirements to add to your stack
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2.5">
                  {report.missing_technical && report.missing_technical.length > 0 ? (
                    report.missing_technical.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800/60 shadow-xs hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
                      >
                        <Layers size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 size={16} /> No missing technical skills identified for this role!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Soft Skills Card */}
            <Card className="glass-card shadow-lg border-border/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center ring-1 ring-purple-500/20 shadow-xs">
                    <Users size={20} />
                  </div>
                  <span>Missing Soft Skills</span>
                </CardTitle>
                <CardDescription className="pt-1 text-sm font-medium">
                  Interpersonal, process, and organizational capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2.5">
                  {report.missing_soft && report.missing_soft.length > 0 ? (
                    report.missing_soft.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-purple-50 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 shadow-xs hover:bg-purple-100 dark:hover:bg-purple-900/80 transition-colors"
                      >
                        <MessageSquare size={14} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 size={16} /> No missing soft skills identified for this role!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personalized Execution Roadmap Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
                  <Compass className="text-primary" size={26} />
                  Personalized Execution Roadmap
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  A step-by-step strategy with actionable portfolio projects & estimated timelines
                </p>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold">
                3-Phase Strategy
              </Badge>
            </div>

            {/* Split Cards Container */}
            <div className="space-y-6">
              {report.roadmap.map((step, index) => {
                const timeline = step.estimated_time || defaultTimelines[index % defaultTimelines.length];
                const impact = step.impact_level || defaultImpacts[index % defaultImpacts.length];
                const projectIdea = step.project_idea || `Build a real-world demo project incorporating ${report.missing_technical[index] || 'the target skills'} to showcase in your portfolio.`;

                return (
                  <Card key={index} className="glass-card shadow-xl border-border/60 overflow-hidden hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-12">
                        
                        {/* LEFT COLUMN: Step Strategy & Task (7 cols) */}
                        <div className="lg:col-span-7 p-6 sm:p-8 space-y-4 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                                {index + 1}
                              </span>
                              <span className="text-xs uppercase tracking-wider font-extrabold text-primary">
                                Phase {index + 1} Execution
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-foreground leading-snug">
                              {step.phase}
                            </h3>

                            <p className="text-foreground/80 text-[15px] leading-relaxed">
                              {step.task}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold px-2.5 py-1">
                              <Rocket size={12} className="mr-1.5 inline" /> Action Required
                            </Badge>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Helpful Actionable Resources & Project Box (5 cols) */}
                        <div className="lg:col-span-5 p-6 sm:p-8 bg-surface-50/60 dark:bg-surface-900/60 flex flex-col justify-between space-y-4">
                          <div className="space-y-4">
                            {/* Meta Metrics Bar */}
                            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                <Clock size={14} className="text-indigo-500" />
                                <span>Timeline: <strong className="text-foreground">{timeline}</strong></span>
                              </div>
                              <Badge className={`text-[11px] font-bold px-2.5 py-0.5 border-transparent ${
                                index === 0 ? 'bg-rose-500 text-white' : index === 1 ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'
                              }`}>
                                {impact}
                              </Badge>
                            </div>

                            {/* Recommended Project Box */}
                            <div className="space-y-2">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <FolderGit2 size={14} className="text-purple-500" />
                                Recommended Portfolio Project
                              </span>
                              <div className="p-3.5 rounded-xl bg-background/80 dark:bg-slate-900/80 border border-border/50 text-xs text-foreground/90 font-medium leading-relaxed shadow-xs">
                                {projectIdea}
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Button */}
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10 font-semibold transition-colors"
                              onClick={() => {
                                toast.success(`Saved Step ${index + 1} to your study plan!`);
                              }}
                            >
                              <Sparkles size={14} /> Add Step {index + 1} to My Action Plan
                            </Button>
                          </div>

                        </div>

                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-3xl bg-surface-50/50 dark:bg-surface-900/50 text-center space-y-4">
          <BookOpen className="text-primary/50 w-16 h-16" />
          <p className="text-muted-foreground max-w-sm">Scan your resume against your target job description to compute missing skills and generate your custom execution roadmap.</p>
        </div>
      )}
    </div>
  );
}
