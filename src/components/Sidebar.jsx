import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isCollapsed = false, onToggle, className, isMobile = false }) {
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
    { label: 'History', icon: History, path: '/history' },
  ];

  return (
    <aside
      className={cn(
        `
        flex flex-col
        border-r
        border-border/40
        bg-card/80
        backdrop-blur-xl
        h-[calc(100vh-4rem)]
        lg:h-screen
        fixed
        lg:sticky
        top-16
        lg:top-0
        z-40
        overflow-y-auto
        overflow-x-hidden
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
                HireReady AI
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

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3">
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

      {/* Bottom Pro Card */}
      <div className="p-3 mt-auto">
        {!isCollapsed ? (
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 p-4 shadow-inner">
            <div className="absolute top-0 right-0 -mr-5 -mt-5 w-20 h-20 rounded-full bg-blue-500/10 blur-xl" />
            <h4 className="font-bold text-sm mb-1 text-foreground">Pro Plan Active</h4>
            <p className="text-xs text-muted-foreground mb-3">You have 12 analyses remaining this month.</p>
            <div className="w-full bg-surface-200 dark:bg-black/40 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1.5 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        ) : (
          <div title="Pro Plan Active (12 remaining)" className="flex justify-center items-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 w-12 mx-auto cursor-pointer group relative">
            <Zap size={20} />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-extrabold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Pro Plan Active
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}