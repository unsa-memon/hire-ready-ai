import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Database, ShieldCheck, ArrowRight, Target, Compass, Video, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function ResumeUpload() {
  const { activeResumeDetails, setActiveResumeId, activePlanInfo, refreshResumesCount } = useAppContext();
  const { currentUser } = useAuth();
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle -> uploading -> finalizing -> success
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB.");
      return false;
    }
    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (validateFile(selected)) {
        await processUpload(selected);
      }
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        await processUpload(selected);
      }
    }
  };

  const processUpload = async (uploadFile) => {
    try {
      // 1. Check existing resume count for the current authenticated user
      const { count, error: countError } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      if (countError) throw countError;

      // 2. Enforce Tier Plan Limit (Free: 2, Pro: 5, Premium: 10)
      const maxLimit = activePlanInfo?.maxResumes || 2;
      if (count >= maxLimit) {
        toast.error(`${activePlanInfo?.name || 'Plan'} limit reached. You can upload a maximum of ${maxLimit} resumes. Upgrade your plan for higher limits!`);
        return;
      }

      setFile(uploadFile);
      setUploadState('uploading');
      setProgress(15);
      
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('resumes')
        .upload(filePath, uploadFile, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;
      setProgress(65);
      
      setUploadState('finalizing');
      
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath);
      setProgress(85);

      const { data: resumeRecord, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: currentUser.id,
          file_name: uploadFile.name,
          file_url: publicUrl,
          file_size: uploadFile.size
        })
        .select()
        .single();
        
      if (dbError) throw dbError;

      await supabase.from('activity_history').insert({
        user_id: currentUser.id,
        activity_type: 'resume_upload',
        description: `Uploaded new resume: ${uploadFile.name}`,
        link_url: '/upload'
      });

      setProgress(100);
      setUploadState('success');
      setActiveResumeId(resumeRecord);
      toast.success("Resume uploaded & secured successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to upload resume.");
      setUploadState('idle');
      setProgress(0);
      setFile(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
    setActiveResumeId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Resume Upload & Storage
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base font-semibold">
            Upload your latest PDF resume to power your AI career analysis, ATS score, and interview coach.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
          <ShieldCheck size={16} />
          256-Bit Encrypted
        </div>
      </div>

      {activeResumeDetails && uploadState === 'idle' ? (
        /* Active Verified Resume Card */
        <div className="bg-gradient-to-br from-emerald-100/90 via-slate-100/95 to-teal-100/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-300/80 dark:border-emerald-700/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 border border-emerald-400/40">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>

          <div className="space-y-3 max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Resume Active & Ready
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
              Your resume is currently linked to your CareerBeam AI profile and ready for multi-layered analysis.
            </p>

            {/* Metadata Box */}
            <div className="mt-6 p-5 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-emerald-200 dark:border-slate-700 shadow-sm space-y-3 text-left w-full">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-bold">File Name:</span>
                <span className="text-slate-900 dark:text-white font-extrabold truncate max-w-[220px]">
                  {activeResumeDetails.file_name}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Upload Date:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {new Date(activeResumeDetails.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-bold">File Size:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {(activeResumeDetails.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center pt-2 w-full max-w-md">
            <Button 
              variant="outline" 
              className="flex-1 h-12 gap-2 rounded-2xl font-black border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
              onClick={handleReset}
            >
              <RefreshCw size={18} />
              Replace Resume
            </Button>
            <Button 
              variant="destructive" 
              className="h-12 px-6 gap-2 rounded-2xl font-black shadow-lg shadow-red-500/20" 
              onClick={async () => {
                try {
                  const pathParts = activeResumeDetails.file_url.split('/public/resumes/');
                  if (pathParts.length === 2) {
                    await supabase.storage.from('resumes').remove([pathParts[1]]);
                  }
                  await supabase.from('resumes').delete().eq('id', activeResumeDetails.id);
                  toast.success("Resume deleted successfully.");
                  handleReset();
                } catch (e) {
                  toast.error("Failed to delete resume.");
                }
              }}
            >
              <Trash2 size={18} />
              Delete
            </Button>
          </div>
        </div>
      ) : uploadState === 'success' ? (
        /* Upload Success State */
        <div className="bg-gradient-to-br from-emerald-100/90 via-slate-100/95 to-teal-100/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-300/80 dark:border-emerald-700/60 p-10 sm:p-12 rounded-[2.5rem] shadow-[0_15px_40px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Resume Secured Successfully!
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mt-2 max-w-md mx-auto text-sm font-semibold">
              Your document <strong className="text-slate-900 dark:text-white">{file?.name}</strong> is processed and ready to power your AI reports.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="h-12 px-6 rounded-2xl font-black" onClick={handleReset}>
              Upload Another
            </Button>
            <Link to="/analysis">
              <Button className="h-12 px-6 gap-2 rounded-2xl font-black bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                Run Resume Analysis
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Dropzone Component */
        <div 
          className={`
            relative p-10 sm:p-14 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ease-out
            flex flex-col items-center justify-center text-center min-h-[440px] overflow-hidden group
            bg-gradient-to-br from-indigo-50/80 via-white/95 to-purple-50/80 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90
            ${dragActive ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.25)] scale-[1.01]' : 'border-indigo-300/80 dark:border-indigo-700/60 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-[0_20px_50px_rgba(99,102,241,0.12)]'}
            ${uploadState !== 'idle' ? 'pointer-events-none' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={handleChange}
          />

          {uploadState === 'idle' ? (
            <div className="space-y-6 flex flex-col items-center pointer-events-none z-10">
              {/* Animated Cloud Icon Box */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 via-primary to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-indigo-400/40 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                <UploadCloud size={44} strokeWidth={2.2} className="drop-shadow-md" />
              </div>
              
              <div>
                <p className="text-2xl sm:text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">
                  Drag & Drop Resume PDF
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm sm:text-base">
                  or click anywhere to browse local files from your device
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-3 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-2">
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <FileText size={15} className="text-indigo-600 dark:text-indigo-400" /> PDF Format
                </span>
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <Database size={15} className="text-purple-600 dark:text-purple-400" /> Max 5MB Size
                </span>
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" /> Instant Parsing
                </span>
              </div>
            </div>
          ) : (
            /* Uploading Progress View */
            <div className="w-full max-w-md mx-auto space-y-8 flex flex-col items-center z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40">
                  <UploadCloud size={36} className="animate-bounce" />
                </div>
              </div>

              <div className="w-full space-y-3 bg-white/95 dark:bg-slate-800/95 p-6 rounded-2xl border border-indigo-200 dark:border-slate-700 shadow-lg backdrop-blur-sm">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{file?.name}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 rounded-full bg-slate-100 dark:bg-slate-700" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-1">
                  {uploadState === 'uploading' ? 'Encrypting & Transmitting File...' : 'Finalizing Storage Entry...'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link to="/ats" className="group">
          <div className="bg-gradient-to-br from-blue-50/90 via-slate-100/95 to-indigo-50/80 dark:from-slate-900/95 dark:via-blue-950/40 dark:to-slate-900/90 border border-blue-200/90 dark:border-blue-700/50 p-6 rounded-3xl shadow-sm hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-4 font-bold border border-blue-400/30">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              1. ATS Score Dial
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Calculate exact match score percentages against target job descriptions.
            </p>
          </div>
        </Link>

        <Link to="/skills" className="group">
          <div className="bg-gradient-to-br from-purple-50/90 via-slate-100/95 to-fuchsia-50/80 dark:from-slate-900/95 dark:via-purple-950/40 dark:to-slate-900/90 border border-purple-200/90 dark:border-purple-700/50 p-6 rounded-3xl shadow-sm hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-4 font-bold border border-purple-400/30">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              2. Skill Gap Roadmap
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Uncover missing technical skills and get a step-by-step learning roadmap.
            </p>
          </div>
        </Link>

        <Link to="/interview" className="group">
          <div className="bg-gradient-to-br from-emerald-50/90 via-slate-100/95 to-teal-50/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-200/90 dark:border-emerald-700/50 p-6 rounded-3xl shadow-sm hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 font-bold border border-emerald-400/30">
              <Video size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              3. AI Interview Coach
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Simulate 10 tailored interview questions and receive instant performance scoring.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
