import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Target, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function CheckEmail() {
  const location = useLocation();
  const { resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  
  const email = location.state?.email || 'your email address';

  const handleResend = async () => {
    setIsResending(true);
    const { success, error } = await resendVerification(email);
    setIsResending(false);
    
    if (success) {
      toast.success("Verification email resent successfully! Check your inbox.");
    } else {
      toast.error(error || "Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
      
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <Target size={24} />
            </div>
            HireReady AI
          </Link>
        </div>
        
        <Card className="border-border/50 shadow-xl glass-card backdrop-blur-2xl">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base text-foreground/80">
              We've sent a verification email to <strong>{email}</strong>. Please verify your email before signing in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <Button 
              className="w-full" 
              onClick={handleResend} 
              disabled={isResending || !location.state?.email}
            >
              {isResending ? "Resending..." : "Resend Verification Email"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-6">
            <Link to="/login" className="text-sm flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
