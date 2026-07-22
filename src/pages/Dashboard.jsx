import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  FileText, 
  Target, 
  Activity, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  PlusCircle,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { userProfile, currentUser } = useAuth();
  const [stats, setStats] = useState({
    resumes: 0,
    reports: 0,
    readiness: 0
  });
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [
          resumesRes,
          reportsRes,
          historyRes
        ] = await Promise.all([
          supabase
            .from('resumes')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUser.id),

          supabase
            .from('ats_reports')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUser.id),

          supabase
            .from('activity_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(4)
        ]);

        setStats({
          resumes: resumesRes.count || 0,
          reports: reportsRes.count || 0,
          readiness: Math.min(Math.round(((resumesRes.count || 0) + (reportsRes.count || 0)) * 8.5), 95)
        });

        if (historyRes.data) {
          setActivities(historyRes.data);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser.id]);

  // Card style - richer, slightly darker background for high contrast & top readability
  const cardStyle = `
    bg-slate-100/95
    dark:bg-slate-900/90
    backdrop-blur-xl
    border
    border-slate-300/90
    dark:border-slate-700/80
    shadow-[0_10px_30px_rgba(0,0,0,0.07)]
    dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
    hover:-translate-y-1.5
    hover:shadow-[0_20px_40px_rgba(99,102,241,0.22)]
    transition-all
    duration-500
    rounded-3xl
    overflow-hidden
    relative
  `;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
            Your AI career assistant is ready to optimize your journey.
          </p>
        </div>

        <Link to="/upload">
          <Button className="rounded-full h-12 px-6 gap-2 shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 font-extrabold border-none">
            <PlusCircle size={18} />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resume Card */}
        <Card className="bg-gradient-to-br from-blue-100/90 via-slate-100/95 to-indigo-100/80 dark:from-slate-900/95 dark:via-blue-950/40 dark:to-slate-900/90 border border-blue-300/80 dark:border-blue-700/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(59,130,246,0.12)] hover:-translate-y-1.5 transition-all duration-500 rounded-3xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/25 blur-3xl rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 pb-2 pt-6 px-6">
            <CardTitle className="text-xs sm:text-xs xl:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white whitespace-nowrap">
              Resumes Uploaded
            </CardTitle>
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-700 dark:text-blue-300 font-bold flex-shrink-0 shadow-xs border border-blue-400/30">
              <FileText size={20} />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.resumes}
            </div>
          </CardContent>
        </Card>

        {/* Reports Card */}
        <Card className="bg-gradient-to-br from-purple-100/90 via-slate-100/95 to-fuchsia-100/80 dark:from-slate-900/95 dark:via-purple-950/40 dark:to-slate-900/90 border border-purple-300/80 dark:border-purple-700/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(168,85,247,0.12)] hover:-translate-y-1.5 transition-all duration-500 rounded-3xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-40 h-40 bg-purple-500/25 blur-3xl rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 pb-2 pt-6 px-6">
            <CardTitle className="text-xs sm:text-xs xl:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white whitespace-nowrap">
              Generated Reports
            </CardTitle>
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-700 dark:text-purple-300 font-bold flex-shrink-0 shadow-xs border border-purple-400/30">
              <Target size={20} />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.reports}
            </div>
          </CardContent>
        </Card>

        {/* Readiness Card */}
        <Card className="bg-gradient-to-br from-emerald-100/90 via-slate-100/95 to-teal-100/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-300/80 dark:border-emerald-700/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1.5 transition-all duration-500 rounded-3xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/25 blur-3xl rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 pb-2 pt-6 px-6">
            <CardTitle className="text-xs sm:text-xs xl:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white whitespace-nowrap">
              Career Readiness
            </CardTitle>
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold flex-shrink-0 shadow-xs border border-emerald-400/30">
              <TrendingUp size={20} />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="flex items-end gap-2">
              <span className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white">
                {isLoading ? "..." : `${stats.readiness}%`}
              </span>
              {!isLoading && (
                <span className={`text-xs xl:text-sm mb-1.5 font-black whitespace-nowrap ${
                  stats.readiness >= 80 ? 'text-emerald-700 dark:text-emerald-300' : 
                  stats.readiness >= 60 ? 'text-amber-700 dark:text-amber-300' : 
                  'text-indigo-700 dark:text-indigo-300'
                }`}>
                  {stats.readiness >= 80 ? '🌟 Excellent' : 
                   stats.readiness >= 60 ? '📈 Good' : 
                   '🚀 Improving'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-indigo-100/90 via-slate-100/95 to-blue-100/80 dark:from-slate-900/95 dark:via-indigo-950/40 dark:to-slate-900/90 border border-indigo-300/80 dark:border-indigo-700/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(99,102,241,0.1)] hover:-translate-y-1.5 transition-all duration-500 rounded-3xl overflow-hidden relative">
          <CardHeader className="flex flex-row justify-between items-center gap-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                <Activity size={22} className="text-indigo-600 dark:text-indigo-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-300 font-extrabold text-sm mt-1">
                Your latest AI actions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 items-start p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-slate-700 shadow-xs hover:border-indigo-500/50 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {activity.description}
                      </p>
                      <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                        <Clock size={12} />
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold italic">
                  No activity yet. Start by uploading a resume!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-violet-100/90 via-slate-100/95 to-purple-100/80 dark:from-slate-900/95 dark:via-purple-950/40 dark:to-slate-900/90 border border-violet-300/80 dark:border-violet-700/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(139,92,246,0.1)] hover:-translate-y-1.5 transition-all duration-500 rounded-3xl overflow-hidden relative">
          <CardHeader className="flex flex-row justify-between items-center gap-6">
            <div>
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Next Steps</CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-300 font-extrabold text-sm mt-1">
                Improve your profile with AI tools
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              to="/upload"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-violet-200/80 dark:border-slate-700 hover:border-violet-500/60 hover:scale-[1.01] transition-all duration-300 shadow-xs"
            >
              <div className="flex gap-4 items-center">
                <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-400/30">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Upload Resume</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Start your AI analysis</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </Link>

            <Link
              to="/job-description"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-violet-200/80 dark:border-slate-700 hover:border-violet-500/60 hover:scale-[1.01] transition-all duration-300 shadow-xs"
            >
              <div className="flex gap-4 items-center">
                <div className="p-3 rounded-2xl bg-orange-600/20 text-orange-700 dark:text-orange-300 font-bold border border-orange-400/30">
                  <Target size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Add Job Target</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Match your dream role</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </Link>

            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/35 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-indigo-600/25 text-indigo-700 dark:text-indigo-300 font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Pro Tip</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Upload your resume to get personalized AI feedback</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription/Plan Card */}
      <Card className="bg-gradient-to-br from-amber-100/90 via-slate-100/95 to-yellow-100/80 dark:from-slate-900/95 dark:via-amber-950/40 dark:to-slate-900/90 border border-amber-300/80 dark:border-amber-700/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(245,158,11,0.12)] hover:-translate-y-1.5 transition-all duration-500 rounded-3xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-60 h-60 bg-amber-500/20 blur-3xl rounded-full" />
        <CardContent className="p-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                <Award className="text-amber-600 dark:text-amber-400" size={26} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Free Plan</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Basic features included</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Resumes remaining</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {isLoading ? "..." : Math.max(0, 2 - stats.resumes)}
                </p>
              </div>
              <Link to="/pricing">
                <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 border-none">
                  <Zap size={16} className="mr-2" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}