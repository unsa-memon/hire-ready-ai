import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  Target,
  FileText,
  Briefcase,
  Video,
  CheckCircle2,
  ChevronRight,
  Star,
  Sparkles,
  Brain,
  TrendingUp,
  Rocket,
  Zap,
  Award,
  ShieldCheck,
  Compass,
  BarChart,
  FileEdit
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      title: "AI Resume Analysis",
      desc: "Instant multi-dimensional feedback, structure optimization, and strengths/weaknesses identification.",
      icon: Target,
      cardBg: "bg-gradient-to-br from-emerald-100/90 via-slate-100/95 to-teal-100/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border-emerald-300/80 dark:border-emerald-700/60 shadow-[0_10px_30px_rgba(16,185,129,0.15)]",
      iconBg: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30",
      badgeColor: "bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border-emerald-400/30"
    },
    {
      title: "Smart ATS Score Dial",
      desc: "Calculate exact keyword match percentages against your target job descriptions.",
      icon: BarChart,
      cardBg: "bg-gradient-to-br from-blue-100/90 via-slate-100/95 to-indigo-100/80 dark:from-slate-900/95 dark:via-blue-950/40 dark:to-slate-900/90 border-blue-300/80 dark:border-blue-700/60 shadow-[0_10px_30px_rgba(59,130,246,0.15)]",
      iconBg: "bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-400/30",
      badgeColor: "bg-blue-600/20 text-blue-800 dark:text-blue-300 border-blue-400/30"
    },
    {
      title: "Skill Gap & Roadmap",
      desc: "Discover missing technical skills for target roles and generate a step-by-step execution roadmap.",
      icon: Compass,
      cardBg: "bg-gradient-to-br from-purple-100/90 via-slate-100/95 to-fuchsia-100/80 dark:from-slate-900/95 dark:via-purple-950/40 dark:to-slate-900/90 border-purple-300/80 dark:border-purple-700/60 shadow-[0_10px_30px_rgba(168,85,247,0.15)]",
      iconBg: "bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-400/30",
      badgeColor: "bg-purple-600/20 text-purple-800 dark:text-purple-300 border-purple-400/30"
    },
    {
      title: "AI Cover Letter",
      desc: "Generate custom-tailored cover letters incorporating your unique achievements and tone preferences.",
      icon: FileEdit,
      cardBg: "bg-gradient-to-br from-amber-100/90 via-slate-100/95 to-orange-100/80 dark:from-slate-900/95 dark:via-amber-950/40 dark:to-slate-900/90 border-amber-300/80 dark:border-amber-700/60 shadow-[0_10px_30px_rgba(245,158,11,0.15)]",
      iconBg: "bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-400/30",
      badgeColor: "bg-amber-600/20 text-amber-800 dark:text-amber-300 border-amber-400/30"
    },
    {
      title: "AI Interview Simulation",
      desc: "Simulate a live technical interview session with instant performance scoring and detailed feedback.",
      icon: Video,
      cardBg: "bg-gradient-to-br from-indigo-100/90 via-slate-100/95 to-purple-100/80 dark:from-slate-900/95 dark:via-indigo-950/40 dark:to-slate-900/90 border-indigo-300/80 dark:border-indigo-700/60 shadow-[0_10px_30px_rgba(99,102,241,0.15)]",
      iconBg: "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/30",
      badgeColor: "bg-indigo-600/20 text-indigo-800 dark:text-indigo-300 border-indigo-400/30"
    },
    {
      title: "Executive Final Report",
      desc: "Synthesize all career data, ATS scores, and interview performance into a downloadable PDF summary report.",
      icon: Award,
      cardBg: "bg-gradient-to-br from-rose-100/90 via-slate-100/95 to-pink-100/80 dark:from-slate-900/95 dark:via-rose-950/40 dark:to-slate-900/90 border-rose-300/80 dark:border-rose-700/60 shadow-[0_10px_30px_rgba(244,63,94,0.15)]",
      iconBg: "bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-400/30",
      badgeColor: "bg-rose-600/20 text-rose-800 dark:text-rose-300 border-rose-400/30"
    }
  ];

  const stats = [
    {
      value: "94% ATS Score",
      label: "Keyword Optimization Accuracy",
      icon: TrendingUp,
      cardBg: "bg-gradient-to-br from-emerald-100/90 via-slate-100/95 to-teal-100/80 dark:from-slate-900/95 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-300/80 dark:border-emerald-700/60 shadow-[0_10px_30px_rgba(16,185,129,0.15)]",
      iconBg: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30"
    },
    {
      value: "HireReady AI Engine",
      label: "Instant Real-Time Parsing",
      icon: Brain,
      cardBg: "bg-gradient-to-br from-purple-100/90 via-slate-100/95 to-fuchsia-100/80 dark:from-slate-900/95 dark:via-purple-950/40 dark:to-slate-900/90 border border-purple-300/80 dark:border-purple-700/60 shadow-[0_10px_30px_rgba(168,85,247,0.15)]",
      iconBg: "bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-400/30"
    },
    {
      value: "AI Interview Simulation",
      label: "Live Performance Score & Remarks",
      icon: CheckCircle2,
      cardBg: "bg-gradient-to-br from-blue-100/90 via-slate-100/95 to-indigo-100/80 dark:from-slate-900/95 dark:via-blue-950/40 dark:to-slate-900/90 border border-blue-300/80 dark:border-blue-700/60 shadow-[0_10px_30px_rgba(59,130,246,0.15)]",
      iconBg: "bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-400/30"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer at Google",
      content: "HireReady AI gave me exact ATS feedback and skill gap roadmaps that doubled my interview response rates!",
      cardBg: "bg-gradient-to-br from-emerald-50/90 via-white/95 to-slate-50/90 dark:from-slate-900/90 dark:via-emerald-950/30 dark:to-slate-900/90 border-emerald-200/90 dark:border-emerald-700/50"
    },
    {
      name: "Michael Chen",
      role: "Product Manager at Microsoft",
      content: "The AI interview coach simulation felt like a real hiring manager session. Unbelievable accuracy!",
      cardBg: "bg-gradient-to-br from-purple-50/90 via-white/95 to-slate-50/90 dark:from-slate-900/90 dark:via-purple-950/30 dark:to-slate-900/90 border-purple-200/90 dark:border-purple-700/50"
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist at Amazon",
      content: "Generating a custom cover letter tailored to specific job targets saved me hours. Highly recommended!",
      cardBg: "bg-gradient-to-br from-blue-50/90 via-white/95 to-slate-50/90 dark:from-slate-900/90 dark:via-blue-950/30 dark:to-slate-900/90 border-blue-200/90 dark:border-blue-700/50"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900 selection:bg-indigo-500/20">
      {/* NAVBAR */}
      <header className="sticky top-4 w-[92%] max-w-7xl mx-auto h-16 rounded-2xl flex items-center justify-between px-6 z-50 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-slate-800/60 shadow-lg shadow-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Target size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              HireReady AI
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Your AI-Powered Career Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/login" className="text-sm font-extrabold text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors">
            Login
          </Link>
          <Link to="/signup">
            <Button className="rounded-xl px-5 h-10 bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white font-extrabold text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-300 hover:scale-105 border-none">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative min-h-[80vh] flex items-center justify-center px-6 pt-12 pb-16 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[140px] top-10 pointer-events-none" />
          <div className="absolute w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px] bottom-10 right-10 pointer-events-none" />

          <div className="relative z-10 text-center max-w-4xl mx-auto space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
              Your AI-Powered Career Engine
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Land Your Dream Job <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-primary to-purple-600">
                10x Faster with AI
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-700 dark:text-slate-300 font-bold max-w-xl mx-auto leading-relaxed">
              Analyze resumes, match ATS job scores, uncover skill gaps, and master technical interviews with HireReady AI.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 rounded-2xl px-8 gap-2 bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-white font-black text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 border-none"
                >
                  Start Free Analysis <ChevronRight size={20} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 rounded-2xl px-8 font-black text-base border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-sm">
                  Explore Dashboard
                </Button>
              </Link>
            </div>

            {/* METRIC CARDS - SIDE BY SIDE EMOJI/ICON & HEADING */}
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`${stat.cardBg} rounded-3xl p-6 backdrop-blur-xl hover:-translate-y-1.5 transition-all duration-500 text-center flex flex-col justify-center items-center`}>
                    {/* Icon and Heading together side-by-side on 1 line */}
                    <div className="flex items-center justify-center gap-2.5 mb-2 w-full">
                      <div className={`p-2 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                      <h3 className="font-black text-base xl:text-lg text-slate-900 dark:text-white whitespace-nowrap tracking-tight">
                        {stat.value}
                      </h3>
                    </div>
                    <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 px-6 relative border-t border-border/40">
          <div className="max-w-7xl mx-auto relative z-10 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Rocket size={16} />
                Comprehensive AI Suite
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Everything You Need to Get Hired
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base font-semibold">
                An all-in-one AI career engine designed to optimize every stage of your job application journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={index}
                    className={`${item.cardBg} border rounded-3xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer overflow-hidden relative`}
                  >
                    <CardContent className="p-8 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={26} strokeWidth={2.5} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.badgeColor}`}>
                          AI Module
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-bold leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 px-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-border/40">
          <div className="max-w-6xl mx-auto relative z-10 space-y-14">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                <Award size={16} />
                Proven Results
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                Trusted by Top Professionals
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className={`${testimonial.cardBg} rounded-3xl p-7 border shadow-md flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-300`}>
                  <div className="space-y-4">
                    <div className="flex text-amber-500 gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 text-sm font-bold leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="font-black text-base text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-xs font-black text-indigo-700 dark:text-indigo-400 mt-0.5">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-indigo-900 via-primary to-purple-900 text-white rounded-[2.5rem] p-10 sm:p-14 shadow-2xl shadow-indigo-950/40 relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <Zap className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Ready to Land Your Dream Job?
              </h2>
              
              <p className="text-indigo-100 font-bold text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Start optimizing your resume, matching job descriptions, and mastering AI technical interview questions today.
              </p>
              
              <div className="pt-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="h-13 rounded-2xl px-10 gap-2 bg-white text-indigo-950 hover:bg-slate-100 font-black text-base shadow-xl transition-all duration-300 hover:scale-105 border-none"
                  >
                    Get Started Free <Rocket size={18} />
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs font-bold text-indigo-200/80 tracking-wider uppercase">
                No credit card required • Instant access
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          © 2026 HireReady AI — Your AI-Powered Career Assistant. All rights reserved.
        </p>
      </footer>
    </div>
  );
}