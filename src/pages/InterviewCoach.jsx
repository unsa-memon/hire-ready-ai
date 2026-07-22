import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Mic, 
  StopCircle, 
  Play, 
  Send, 
  CheckCircle2, 
  History, 
  AlertCircle, 
  Bot, 
  ArrowRight, 
  User,
  Award,
  Sparkles,
  Trophy,
  RotateCcw,
  BarChart2,
  Check,
  Star
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { extractPdfText, generateInterviewQuestions, generateInterviewFeedback } from '../lib/gemini';
import toast from 'react-hot-toast';

export function InterviewCoach() {
  const { activeResumeId, activeResumeDetails, activeJobId, activeJobDetails } = useAppContext();
  const { currentUser } = useAuth();
  
  const [sessionInfo, setSessionInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing session for this context
  useEffect(() => {
    const fetchSession = async () => {
      if (!activeResumeId || !activeJobId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data: session, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('resume_id', activeResumeId)
          .eq('job_id', activeJobId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        
        if (session) {
          setSessionInfo(session);
          
          // Fetch linked questions
          const { data: qs } = await supabase
            .from('interview_questions')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });
            
          if (qs) {
             setQuestions(qs);
             
             // Fetch any existing answers/feedback
             const newAnswers = {};
             const newFeedback = {};
             for (const q of qs) {
                const { data: a } = await supabase.from('interview_answers').select('*').eq('question_id', q.id).single();
                if (a) {
                  newAnswers[q.id] = a.answer_text;
                  const { data: f } = await supabase.from('interview_feedback').select('*').eq('answer_id', a.id).single();
                  if (f) {
                    newFeedback[q.id] = f;
                  }
                }
             }
             setAnswers(newAnswers);
             setFeedback(newFeedback);
             if (Object.keys(newFeedback).length === qs.length && qs.length > 0) {
               setShowSummary(true);
             }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [activeResumeId, activeJobId]);

  const handleStartSession = async () => {
    setIsGenerating(true);
    setShowSummary(false);
    try {
      toast('Analyzing your resume & target role...', { icon: '📄' });
      const resumeText = await extractPdfText(activeResumeDetails.file_url);

      toast('Generating 10 structured interview questions...', { icon: '🤖' });
      const generatedQs = await generateInterviewQuestions(resumeText, activeJobDetails.description_text);

      // Create session
      const { data: session, error: sErr } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: currentUser.id,
          resume_id: activeResumeId,
          job_id: activeJobId,
          started_at: new Date().toISOString()
        })
        .select().single();
        
      if (sErr) throw sErr;
      
      // Insert questions
      const qInserts = generatedQs.map(txt => ({
        session_id: session.id,
        user_id: currentUser.id,
        question_text: txt
      }));
      
      const { data: savedQs, error: qErr } = await supabase
        .from('interview_questions')
        .insert(qInserts)
        .select();
        
      if (qErr) throw new Error("Our systems couldn't save your interview components. Please try again.");

      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'interview_started',
        description: `Started 10-Question Gemini AI technical interview simulation.`,
        link_url: '/interview'
      });
      
      setSessionInfo(session);
      setQuestions(savedQs);
      setAnswers({});
      setFeedback({});
      setCurrentQuestionIndex(0);
      toast.success("10-Question Interview Simulation Ready!");
    } catch (e) {
      toast.error(e.message || "We encountered an issue preparing the interview simulation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async () => {
    const qId = questions[currentQuestionIndex].id;
    const ansText = answers[qId]?.trim();
    if (!ansText) return;
    
    setIsSubmitting(true);
    
    try {
      // Send to Gemini grading
      toast('Grading your answer with STAR metrics...', { icon: '🧠' });
      const grading = await generateInterviewFeedback(questions[currentQuestionIndex].question_text, ansText, activeJobDetails.description_text);
      
      // Save Answer
      const { data: ansData, error: aErr } = await supabase
        .from('interview_answers')
        .insert({
          question_id: qId,
          user_id: currentUser.id,
          answer_text: ansText
        })
        .select().single();
        
      if (aErr) throw new Error("Could not log your evaluated answer securely. Please try submitting again.");
      
      // Save Feedback
      const { data: feedData, error: fErr } = await supabase
        .from('interview_feedback')
        .insert({
          user_id: currentUser.id,
          answer_id: ansData.id,
          score: grading.score,
          feedback_text: grading.feedback
        })
        .select().single();
        
      if (fErr) throw new Error("Your feedback mapped correctly, but we couldn't cache it into your grading history right now.");
      
      const updatedFeedback = { ...feedback, [qId]: feedData };
      setFeedback(updatedFeedback);
      toast.success("Answer successfully evaluated.");
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Complete session
         await supabase
          .from('interview_sessions')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', sessionInfo.id);
         
         const avgScore = Math.round(Object.values(updatedFeedback).reduce((sum, f) => sum + f.score, 0) / questions.length);
         
         await supabase.from('activity_history').insert({
            user_id: currentUser.id,
            activity_type: 'interview_completed',
            description: `Completed 10-Question Interview. Overall Score: ${avgScore}%`,
            link_url: '/interview'
          });
          
         setShowSummary(true);
         toast.success("10-Question Interview Completed! Check your evaluation summary.");
      }
    } catch (error) {
      toast.error(error.message || "We couldn't evaluate your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(feedback).length;
  const isAllCompleted = questions.length > 0 && answeredCount === questions.length;
  const totalScoreSum = Object.values(feedback).reduce((sum, f) => sum + (f?.score || 0), 0);
  const averageScore = questions.length > 0 ? Math.round(totalScoreSum / questions.length) : 0;

  const getPerformanceRemarks = (score) => {
    if (score >= 85) {
      return {
        title: "Outstanding Performance",
        badge: "Top-Tier Candidate",
        badgeClass: "bg-emerald-500 text-white border-transparent",
        bgGradient: "from-emerald-500/10 via-green-500/5 to-teal-500/10 border-emerald-500/30",
        remarks: "You demonstrated exceptional technical depth, clear STAR-method structured answers, and impressive quantifiable achievements across all 10 questions. You are highly ready for live technical interviews!"
      };
    } else if (score >= 70) {
      return {
        title: "Strong Candidate",
        badge: "Interview Ready",
        badgeClass: "bg-indigo-500 text-white border-transparent",
        bgGradient: "from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border-indigo-500/30",
        remarks: "Great overall interview execution! You displayed strong domain knowledge and relevant technical skills. To boost your score even higher, add more specific metrics and quantifiable results to your responses."
      };
    } else if (score >= 55) {
      return {
        title: "Solid Effort with Room to Grow",
        badge: "Needs Polish",
        badgeClass: "bg-amber-500 text-white border-transparent",
        bgGradient: "from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-500/30",
        remarks: "Good effort covering foundational concepts. However, some answers lacked structured methodology or concrete technical examples. Focus on structuring responses into Situation, Task, Action, and Result (STAR)."
      };
    } else {
      return {
        title: "Targeted Practice Recommended",
        badge: "Needs Practice",
        badgeClass: "bg-rose-500 text-white border-transparent",
        bgGradient: "from-rose-500/10 via-red-500/5 to-pink-500/10 border-rose-500/30",
        remarks: "You covered basic points, but missed key technical details and structured methodologies. We recommend reviewing the job description requirements and practicing STAR-formatted responses."
      };
    }
  };

  const performance = getPerformanceRemarks(averageScore);

  if (isLoading) {
    return (
       <div className="flex pt-20 justify-center">
         <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
           <Bot className="animate-spin-slow" /> Calibrating technical parameters...
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
        <p className="text-muted-foreground">Upload your resume and paste a job description explicitly allowing Gemini AI schemas to map an interview simulation seamlessly.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/upload'}>Upload Context</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Coach Module</h1>
          <p className="text-muted-foreground mt-2">Simulate real-time 10-question interviews with AI-graded responses & performance scoring.</p>
        </div>
        
        {(!sessionInfo || questions.length === 0) ? (
          <Button 
            onClick={handleStartSession} 
            disabled={isGenerating} 
            size="lg" 
            className="h-12 px-6 rounded-full font-extrabold text-white bg-gradient-to-r from-indigo-600 via-primary to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all border-none gap-2"
          >
             <Play size={18} />
             {isGenerating ? "Compiling 10 Questions..." : "Start 10-Question Simulation"}
          </Button>
        ) : (
          <div className="flex gap-3">
            {isAllCompleted && (
              <Button 
                variant="outline" 
                onClick={() => setShowSummary(!showSummary)}
                className="gap-2 border-primary/30 text-primary"
              >
                <Trophy size={16} /> {showSummary ? "Show Questions" : "View Score Remarks"}
              </Button>
            )}
            <Button onClick={handleStartSession} disabled={isGenerating} variant="secondary" className="gap-2">
              <RotateCcw size={16} /> New 10-Q Session
            </Button>
          </div>
        )}
      </div>

      {sessionInfo && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Interview Chat Area or Summary Card */}
          <div className="lg:col-span-3 flex flex-col min-h-[75vh]">
            {showSummary && isAllCompleted ? (
              /* Performance Summary & Remarks View */
              <Card className="glass-card shadow-xl border-border/50 overflow-hidden animate-in zoom-in-95 duration-500">
                <CardContent className="p-8 space-y-8">
                  {/* Header Banner */}
                  <div className={`p-6 rounded-3xl bg-gradient-to-br ${performance.bgGradient} border backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6`}>
                    <div className="space-y-2 text-center md:text-left">
                      <Badge variant="outline" className={`px-3 py-1 rounded-full font-bold text-xs ${performance.badgeClass}`}>
                        {performance.badge}
                      </Badge>
                      <h2 className="text-3xl font-extrabold text-foreground">{performance.title}</h2>
                      <p className="text-sm text-muted-foreground max-w-lg">
                        10-Question Simulation completed for position <span className="font-semibold text-foreground">{activeJobDetails?.job_title || 'Target Role'}</span>.
                      </p>
                    </div>

                    {/* Overall Score Circle */}
                    <div className="flex flex-col items-center justify-center p-6 bg-background/80 dark:bg-slate-900/90 rounded-3xl border border-border/50 shadow-xl min-w-[170px]">
                      <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Overall Score</span>
                      <div className="text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        {averageScore}%
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground mt-1">{answeredCount} of 10 Evaluated</span>
                    </div>
                  </div>

                  {/* AI Remarks Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="text-primary" size={20} />
                      AI Executive Performance Remarks
                    </h3>
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-border/50 text-foreground/90 text-[15px] leading-relaxed shadow-sm">
                      {performance.remarks}
                    </div>
                  </div>

                  {/* 10 Question Score Grid */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <BarChart2 className="text-indigo-500" size={20} />
                      Detailed 10-Question Score Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {questions.map((q, idx) => {
                        const f = feedback[q.id];
                        const score = f?.score || 0;
                        return (
                          <div 
                            key={q.id}
                            className="p-4 rounded-2xl border border-border/50 bg-background/60 flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer"
                            onClick={() => {
                              setShowSummary(false);
                              setCurrentQuestionIndex(idx);
                            }}
                          >
                            <div className="flex items-center gap-3 pr-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <span className="text-xs font-medium text-foreground line-clamp-1">
                                {q.question_text}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 flex-shrink-0 font-bold ${
                                score >= 85 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                score >= 70 ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                score >= 55 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              }`}
                            >
                              {score}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <Button variant="outline" onClick={() => setShowSummary(false)} className="gap-2">
                      Review Questions & Answers
                    </Button>
                    <Button onClick={handleStartSession} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                      <RotateCcw size={16} /> Start New 10-Question Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Standard Chat View */
              <Card className="glass-card shadow-lg border-border/50 flex flex-col flex-1 overflow-hidden h-[75vh] max-h-[800px]">
                 <div className="flex justify-between items-center px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-md z-10">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-primary to-cyan-500 flex items-center justify-center text-white shadow-md ring-2 ring-primary/20">
                       <Bot size={20} />
                     </div>
                     <div>
                       <h3 className="font-bold text-base leading-none">HireReady AI</h3>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </span>
                         <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">
                           Active Online
                         </span>
                         <span className="text-muted-foreground text-xs">•</span>
                         <span className="text-xs text-muted-foreground font-medium">
                           Question {currentQuestionIndex + 1} of {questions.length}
                         </span>
                       </div>
                     </div>
                   </div>
                   <Badge variant="outline" className="bg-background/80 border-primary/20 text-xs font-semibold px-3 py-1">Behavioral & Technical</Badge>
                 </div>
                 
                 <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                   {questions.slice(0, currentQuestionIndex + 1).map((q, idx) => {
                     const hasAnswered = !!feedback[q.id];
                     
                     return (
                       <div key={q.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         
                         {/* AI Question Bubble */}
                         <div className="flex gap-4 max-w-[85%]">
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary border border-primary/20">
                             <Bot size={16} />
                           </div>
                           <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl rounded-tl-sm p-4 text-[15px] leading-relaxed shadow-sm text-foreground">
                             <span className="text-xs font-bold text-primary block mb-1">Question {idx + 1}</span>
                             {q.question_text}
                           </div>
                         </div>
                         
                         {/* User Answer Bubble (if answered) */}
                         {hasAnswered && (
                           <div className="flex gap-4 max-w-[85%] self-end ml-auto justify-end">
                             <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 text-[15px] leading-relaxed shadow-md">
                               {answers[q.id]}
                             </div>
                             <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm border border-cyan-400">
                               <User size={16} />
                             </div>
                           </div>
                         )}
                         
                         {/* AI Feedback Bubble (if answered) */}
                         {hasAnswered && (
                           <div className="flex gap-4 max-w-[85%] mt-2">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                               <CheckCircle2 size={16} />
                             </div>
                             <div className="bg-green-500/10 border border-green-500/20 rounded-2xl rounded-tl-sm p-5 text-[15px] leading-relaxed shadow-sm w-full">
                               <div className="flex justify-between items-center mb-3">
                                 <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">AI Evaluation</span>
                                 <Badge variant="outline" className="bg-green-500 text-white border-transparent">
                                   Score: {feedback[q.id].score}/100
                                 </Badge>
                               </div>
                               <p className="text-foreground/90">{feedback[q.id].feedback_text}</p>
                             </div>
                           </div>
                         )}
                       </div>
                     )
                   })}
                   
                   {/* Input Area (only show if not evaluating and currently unanswered) */}
                   {!feedback[questions[currentQuestionIndex].id] && (
                     <div className="pt-4 border-t border-border/50 animate-in fade-in duration-700">
                       <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 ml-2 flex items-center gap-2">
                         {isSubmitting ? <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block"></span> AI is evaluating response...</span> : `Your Response to Question ${currentQuestionIndex + 1}`}
                       </div>
                       <div className="relative group">
                         <textarea 
                            className="w-full min-h-[140px] p-4 pr-14 rounded-2xl border border-input bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none shadow-inner"
                            placeholder="Type your answer using the STAR method (Situation, Task, Action, Result)..."
                            value={answers[questions[currentQuestionIndex].id] || ''}
                            onChange={(e) => setAnswers(prev => ({...prev, [questions[currentQuestionIndex].id]: e.target.value}))}
                            disabled={isSubmitting}
                         />
                         <Button 
                           size="icon"
                           className="absolute bottom-3 right-3 rounded-xl h-10 w-10 shadow-md transition-transform active:scale-95"
                           onClick={submitAnswer} 
                           disabled={!answers[questions[currentQuestionIndex].id]?.trim() || isSubmitting}
                         >
                           <Send size={16} className={isSubmitting ? "animate-pulse" : ""} />
                         </Button>
                       </div>
                       <p className="text-[11px] text-muted-foreground mt-2 ml-2">Tip: Use quantifiable metrics and specific STAR methodology steps for higher marks.</p>
                     </div>
                   )}
                   
                   {/* Next Question Trigger Box */}
                   {feedback[questions[currentQuestionIndex].id] && currentQuestionIndex < questions.length - 1 && (
                       <div className="flex justify-center pt-6 pb-2 animate-in slide-in-from-bottom-2 fade-in">
                         <Button 
                          variant="default" 
                          size="lg"
                          className="rounded-full shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                         >
                           Proceed to Question {currentQuestionIndex + 2} of 10 <ArrowRight size={18} className="ml-2" />
                         </Button>
                       </div>
                   )}

                   {/* Completion Summary Trigger Button when on question 10 */}
                   {isAllCompleted && !showSummary && (
                      <div className="flex justify-center pt-6 pb-2 animate-in zoom-in duration-500">
                        <Button 
                          onClick={() => setShowSummary(true)}
                          className="rounded-full px-8 h-12 shadow-xl shadow-emerald-500/25 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-bold gap-2"
                        >
                          <Trophy size={20} /> View Final Evaluation & Performance Remarks
                        </Button>
                      </div>
                   )}
                   
                 </CardContent>
              </Card>
            )}
          </div>
          
          {/* Side Progress Bar for 10 Questions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Questions (10)</h3>
              <Badge variant="outline" className="text-xs font-bold">
                {answeredCount}/10 Done
              </Badge>
            </div>

            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div 
                  key={q.id}
                  className={`
                    p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                    ${idx === currentQuestionIndex ? 'border-primary bg-primary/10 shadow-md shadow-primary/10' : 'border-border/50 bg-background/50 hover:bg-surface-50'}
                  `}
                  onClick={() => {
                    if (feedback[q.id] || idx <= answeredCount) {
                       setCurrentQuestionIndex(idx);
                       setShowSummary(false);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${feedback[q.id] ? 'bg-green-500 text-white' : idx === currentQuestionIndex ? 'bg-primary text-primary-foreground' : 'bg-surface-200 text-muted-foreground'}
                    `}>
                      {feedback[q.id] ? <Check size={14} /> : idx + 1}
                    </div>
                    <span className="text-xs font-medium truncate">Q{idx + 1}: {q.question_text}</span>
                  </div>
                  {feedback[q.id] && (
                     <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px] font-bold flex-shrink-0">
                       {feedback[q.id].score}%
                     </Badge>
                  )}
                </div>
              ))}
            </div>

            {isAllCompleted && (
              <Button 
                onClick={() => setShowSummary(true)}
                variant="outline"
                className="w-full gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <Trophy size={16} /> View Score Remarks
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
