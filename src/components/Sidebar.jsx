import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart,
  Target,
  FileEdit,
  Video,
  Award,
  History,
  Compass,
  Menu,
  ChevronLeft,
  Zap,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ isCollapsed = false, onToggle, className, isMobile = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { userPlan, resumesCount, activePlanInfo } = useAppContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Upload Resume', icon: FileText, path: '/upload' },
    { label: 'Job Description', icon: Briefcase, path: '/job-description' },
    { label: 'Resume Analysis', icon: Target, path: '/analysis' },
    { label: 'ATS Score', icon: BarChart, path: '/ats' },
    { label: 'Skill Gap & Roadmap', icon: Compass, path: '/skills' },
    { label: 'Cover Letter', icon: FileEdit, path: '/cover-letter' },
    { label: 'Interview Coach', icon: Video, path: '/interview' },
    { label: 'Final Report', icon: Award, path: '/report' },
    { label: 'Pricing & Plans', icon: Zap, path: '/pricing' },
    { label: 'History', icon: History, path: '/history' },
  ];

  const maxResumes = activePlanInfo?.maxResumes || 2;
  const usagePercentage = Math.min(100, Math.round((resumesCount / maxResumes) * 100));

  return (
    <aside
      className={cn(
        `
        flex flex-col
        border-r
        border-border/40
        bg-card/80
        backdrop-blur-xl
        ${isMobile ? 'h-full top-0' : 'h-screen top-0'}
        sticky
        z-40
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        `,
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Logo Area & Toggle Button */}
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-4 pt-2 pb-2 relative flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo Icon */}
          <div
            className="
            w-10
            h-10
            rounded-2xl
            bg-gradient-to-br
            from-blue-950
            via-blue-900
            to-indigo-900
            shadow-xl
            shadow-blue-900/30
            flex
            items-center
            justify-center
            border
            border-blue-700/40
            flex-shrink-0
            "
          >
            <Target size={21} strokeWidth={2.5} className="text-blue-200" />
          </div>

          {/* Brand Name & Subtitle - Hidden when collapsed */}
          {!isCollapsed && (
            <div className="flex flex-col leading-tight whitespace-nowrap transition-opacity duration-300">
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                CareerBeam AI
              </span>
              <span className="text-[10px] font-extrabold tracking-[0.18em] text-blue-600 dark:text-blue-400">
                AI CAREER ENGINE
              </span>
            </div>
          )}
        </div>

        {/* Toggle Button (Hidden on Mobile) */}
        {!isMobile && (
          <button
            onClick={onToggle}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-200 dark:hover:bg-surface-800/70 transition-colors flex-shrink-0"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {/* Navigation Links - Scrollable Area */}
      <nav className="flex-1 overflow-y-auto space-y-1.5 p-3 min-h-0">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                `
                group
                flex
                items-center
                rounded-2xl
                text-sm
                font-semibold
                transition-all
                duration-300
                relative
                `,
                isCollapsed
                  ? 'justify-center p-3 w-12 mx-auto'
                  : 'gap-3 px-4 py-3 w-full',

                isActive
                  ? `
                  bg-gradient-to-r
                  from-blue-900
                  to-indigo-800
                  text-white
                  shadow-lg
                  shadow-blue-900/30
                  hover:-translate-y-0.5
                  `
                  : `
                  text-muted-foreground
                  hover:bg-surface-100
                  hover:text-foreground
                  dark:hover:bg-surface-800/50
                  hover:shadow-sm
                  `
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    `
                    flex
                    items-center
                    justify-center
                    transition-transform
                    duration-300
                    flex-shrink-0
                    `,
                    isActive
                      ? 'scale-110 text-blue-200'
                      : 'group-hover:scale-110 text-primary/70 group-hover:text-primary'
                  )}
                >
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Menu Label - Hidden when collapsed */}
                {!isCollapsed && (
                  <span className="whitespace-nowrap truncate font-bold">
                    {item.label}
                  </span>
                )}

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-extrabold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: 3-Tier Plan Widget & Logout - Always Fixed at Bottom */}
      <div className="p-3 space-y-2 border-t border-border/40 flex-shrink-0 bg-card/90">
        {!isCollapsed ? (
          <div className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900/80 dark:to-surface-950/90 p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap size={15} className="text-amber-500 fill-amber-500/20" />
                <div>
                  <span className="font-extrabold text-xs tracking-tight text-foreground block">
                    {activePlanInfo.name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500">
                    {activePlanInfo.price} {activePlanInfo.period}
                  </span>
                </div>
              </div>
              
              {/* Upgrade / Manage Button */}
              <button
                onClick={() => navigate('/pricing')}
                className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                {userPlan === 'free' ? 'Upgrade' : 'Manage'}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground font-medium mb-2">
              <strong className="text-foreground">{resumesCount}</strong> of <strong className="text-foreground">{maxResumes}</strong> Resumes used
            </p>

            <div className="w-full bg-surface-200 dark:bg-black/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${activePlanInfo.color || 'from-blue-600 to-indigo-500'} transition-all duration-500`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/pricing')}
            title={`${activePlanInfo.name} (${activePlanInfo.price}) - ${resumesCount}/${maxResumes} Resumes`}
            className="flex justify-center items-center p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary w-12 mx-auto cursor-pointer group relative"
          >
            <Zap size={18} />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-extrabold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {activePlanInfo.name} ({activePlanInfo.price})
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className={cn(
            "group flex items-center rounded-2xl text-sm font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-950/40 transition-all duration-200 relative",
            isCollapsed ? "justify-center p-3 w-12 mx-auto" : "gap-3 px-4 py-2.5 w-full"
          )}
        >
          <LogOut size={18} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          {!isCollapsed && <span className="font-bold">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-extrabold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}