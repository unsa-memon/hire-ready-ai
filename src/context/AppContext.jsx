import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  
  const [theme, setTheme] = useState('dark');
  
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
        return;
      }

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

  return (
    <AppContext.Provider 
      value={{
        theme,
        toggleTheme,
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
