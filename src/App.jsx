import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { CheckEmail } from './pages/CheckEmail';
import { Dashboard } from './pages/Dashboard';
import { ResumeUpload } from './pages/ResumeUpload';
import { JobDescription } from './pages/JobDescription';
import { ResumeAnalysis } from './pages/ResumeAnalysis';
import { AtsScore } from './pages/AtsScore';
import { SkillGap } from './pages/SkillGap';
import { CoverLetter } from './pages/CoverLetter';
import { InterviewCoach } from './pages/InterviewCoach';
import { FinalReport } from './pages/FinalReport';
import { History } from './pages/History';
import { Pricing } from './pages/Pricing';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'dark:bg-surface-900 dark:text-white border dark:border-surface-800',
              duration: 4000,
            }}
          />
          <Routes>
            {/* Public Routes without Sidebar */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/check-email" element={<CheckEmail />} />
            
            {/* Protected Routes with Sidebar Layout */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<ResumeUpload />} />
              <Route path="/job-description" element={<JobDescription />} />
              <Route path="/analysis" element={<ResumeAnalysis />} />
              <Route path="/ats" element={<AtsScore />} />
              <Route path="/skills" element={<SkillGap />} />
              <Route path="/cover-letter" element={<CoverLetter />} />
              <Route path="/interview" element={<InterviewCoach />} />
              <Route path="/report" element={<FinalReport />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
