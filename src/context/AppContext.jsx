import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export const PLAN_LIMITS = {
  free: { id: 'free', name: 'Free Plan', price: '$0', priceValue: 0, period: 'Forever Free', maxResumes: 2, badge: 'Free Tier', color: 'from-slate-600 to-slate-800', desc: 'Basic resume parsing & ATS check' },
  pro: { id: 'pro', name: 'Pro Plan', price: '$9.99', priceValue: 9.99, period: '/month', maxResumes: 5, badge: 'Pro Tier', color: 'from-blue-600 to-indigo-600', desc: 'Full AI analysis & skill gap roadmap' },
  premium: { id: 'premium', name: 'Premium Plan', price: '$19.99', priceValue: 19.99, period: '/month', maxResumes: 10, badge: 'Premium Tier', color: 'from-amber-500 to-purple-600', desc: 'Unlimited AI re-scans & interview coach' }
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  
  const [theme, setTheme] = useState('dark');
  
  // 3-Tier Plan Management (free: 2, pro: 5, premium: 10)
  const [userPlan, setUserPlanState] = useState(() => {
    return localStorage.getItem('hireready_user_plan') || 'free';
  });
  const [resumesCount, setResumesCount] = useState(0);

  const setUserPlan = (planKey) => {
    if (PLAN_LIMITS[planKey]) {
      setUserPlanState(planKey);
      localStorage.setItem('hireready_user_plan', planKey);
    }
  };

  const fetchResumesCount = async () => {
    if (!currentUser?.id) {
      setResumesCount(0);
      return;
    }
    try {
      const { count, error } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      if (!error && count !== null) {
        setResumesCount(count);
      }
    } catch (e) {
      console.error("Failed to fetch resume count", e);
    }
  };
  
  // Track raw IDs for legacy connections
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  
  // Track detailed objects for UI presentation natively
  const [activeResumeDetails, setActiveResumeDetails] = useState(null);
  const [activeJobDetails, setActiveJobDetails] = useState(null);
  
  // Context Restoration Hook
  useEffect(() => {
    const restoreContext = async () => {
      if (!currentUser?.id) {
        setActiveResumeId(null);
        setActiveResumeDetails(null);
        setActiveJobId(null);
        setActiveJobDetails(null);
        setResumesCount(0);
        return;
      }

      fetchResumesCount();

      // 1. Unlinked Independent Fetch for Resumes
      try {
        const { data: resumeData, error: resumeErr } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Safe fetch! Prevents abortion if empty
          
        if (resumeData) {
          setActiveResumeId(resumeData.id);
          setActiveResumeDetails(resumeData);
        }
      } catch (error) {
        console.error("Resume persistence lookup failed", error);
      }

      // 2. Unlinked Independent Fetch for Job Descriptions
      try {
        const { data: jobData, error: jobErr } = await supabase
          .from('job_descriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Safe fetch! Prevents abortion if empty
          
        if (jobData) {
          setActiveJobId(jobData.id);
          setActiveJobDetails(jobData);
        }
      } catch (error) {
        console.error("Job context lookup failed", error);
      }
    };
    
    restoreContext();
  }, [currentUser?.id]);
  
  // Explicit Setters
  const updateActiveResume = (resumeObj) => {
    if (resumeObj) {
      setActiveResumeId(resumeObj.id);
      setActiveResumeDetails(resumeObj);
    } else {
      setActiveResumeId(null);
      setActiveResumeDetails(null);
    }
  };

  const updateActiveJob = (jobObj) => {
    if (jobObj) {
      setActiveJobId(jobObj.id);
      setActiveJobDetails(jobObj);
    } else {
      setActiveJobId(null);
      setActiveJobDetails(null);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      return newTheme;
    });
  };

  const activePlanInfo = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

  return (
    <AppContext.Provider 
      value={{
        theme,
        toggleTheme,
        userPlan,
        setUserPlan,
        resumesCount,
        refreshResumesCount: fetchResumesCount,
        activePlanInfo,
        PLAN_LIMITS,
        activeResumeId,
        setActiveResumeId: updateActiveResume, 
        activeResumeDetails,
        activeJobId,
        setActiveJobId: updateActiveJob,     
        activeJobDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
