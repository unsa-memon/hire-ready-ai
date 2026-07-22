import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  FileText, 
  CheckCircle, 
  RotateCcw, 
  Trash2,
  Sparkles,
  ArrowRight,
  Target,
  Compass,
  FileEdit
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function JobDescription() {
  const { setActiveJobId, activeJobDetails } = useAppContext();
  const { currentUser } = useAuth();

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill Job Title and Description");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .insert({
          user_id: currentUser.id,
          company_name: company || "Target Company",
          job_title: title,
          description_text: description
        })
        .select()
        .single();

      if (error) throw error;

      setActiveJobId(data);
      toast.success("Target role saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save target role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteJob = async () => {
    try {
      const { error } = await supabase
        .from('job_descriptions')
        .delete()
        .eq('id', activeJobDetails.id);

      if (error) throw error;

      setActiveJobId(null);
      setCompany('');
      setTitle('');
      setDescription('');
      toast.success("Job target deleted successfully");
    } catch (error) {
      toast.error("Failed to delete target role.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Target Role Requirements
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base font-semibold">
            Specify your target job title, company, and job description to power your ATS score and skill gap roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
          <Sparkles size={16} />
          AI Context Active
        </div>
      </div>

      {activeJobDetails ? (
        /* Saved Target Role Card */
        <div className="bg-gradient-to-br from-emerald-100/90 via-slate-100/95 to-teal-100/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-300/80 dark:border-emerald-700/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Badge Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 border border-emerald-400/40">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>

          <div className="space-y-3 max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
              Active Job Target
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {activeJobDetails.job_title}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-base">
              Company: <span className="text-slate-900 dark:text-white font-extrabold">{activeJobDetails.company_name}</span>
            </p>

            {/* Description Text Box */}
            <div className="mt-6 p-6 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-emerald-200 dark:border-slate-700 shadow-sm text-left max-h-72 overflow-y-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Saved Job Requirements
              </span>
              <p className="text-sm font-semibold leading-relaxed text-slate-900 dark:text-white whitespace-pre-wrap">
                {activeJobDetails.description_text}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-2 w-full max-w-lg">
            <Button 
              variant="outline" 
              className="flex-1 h-12 gap-2 rounded-2xl font-black border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              onClick={() => {
                setCompany(activeJobDetails.company_name);
                setTitle(activeJobDetails.job_title);
                setDescription(activeJobDetails.description_text);
                setActiveJobId(null);
              }}
            >
              <RotateCcw size={18} />
              Edit Target Role
            </Button>
            <Button 
              variant="destructive" 
              className="h-12 px-6 gap-2 rounded-2xl font-black shadow-lg shadow-red-500/20"
              onClick={deleteJob}
            >
              <Trash2 size={18} />
              Delete Target
            </Button>
            <Link to="/analysis" className="w-full">
              <Button className="w-full h-12 gap-2 rounded-2xl font-black bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                Run ATS & Resume Analysis Now
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Form Card */
        <Card className="bg-gradient-to-br from-indigo-50/80 via-white/95 to-purple-50/80 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-indigo-200/90 dark:border-indigo-700/60 shadow-[0_20px_50px_rgba(99,102,241,0.12)] rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-7">
                {/* Company Name Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                    <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Building size={18} />
                    </div>
                    Company Name
                  </label>
                  <Input 
                    placeholder="e.g. Google, Microsoft, Stripe..." 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    className="h-13 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                {/* Job Title Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                    <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Briefcase size={18} />
                    </div>
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    placeholder="e.g. Senior Frontend Developer" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="h-13 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500" 
                  />
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileText size={18} />
                  </div>
                  Job Description Requirements <span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full min-h-[280px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white px-5 py-4 text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all shadow-inner leading-relaxed" 
                  placeholder="Paste complete job description, responsibilities, and key technical skills here..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />
              </div>

              {/* Submit Action */}
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="rounded-2xl px-10 h-13 bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white font-black text-base shadow-xl shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 border-none"
                >
                  {isSubmitting ? "Saving Job Target..." : "Save Target Requirements"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link to="/ats" className="group">
          <div className="bg-gradient-to-br from-blue-50/90 via-slate-100/95 to-indigo-50/80 dark:from-slate-900/95 dark:via-blue-950/40 dark:to-slate-900/90 border border-blue-200/90 dark:border-blue-700/50 p-6 rounded-3xl shadow-sm hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-4 font-bold border border-blue-400/30">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              ATS Match Analysis
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Compare your resume against this job description for Keyword and ATS scoring.
            </p>
          </div>
        </Link>

        <Link to="/skills" className="group">
          <div className="bg-gradient-to-br from-purple-50/90 via-slate-100/95 to-fuchsia-50/80 dark:from-slate-900/95 dark:via-purple-950/40 dark:to-slate-900/90 border border-purple-200/90 dark:border-purple-700/50 p-6 rounded-3xl shadow-sm hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-4 font-bold border border-purple-400/30">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Skill Gap Identification
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Discover missing required skills for this job title and build a roadmap.
            </p>
          </div>
        </Link>

        <Link to="/cover-letter" className="group">
          <div className="bg-gradient-to-br from-emerald-50/90 via-slate-100/95 to-teal-50/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-200/90 dark:border-emerald-700/50 p-6 rounded-3xl shadow-sm hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 font-bold border border-emerald-400/30">
              <FileEdit size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Tailored Cover Letter
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Generate a high-converting cover letter customized specifically for this role.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}