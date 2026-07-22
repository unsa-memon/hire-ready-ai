import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Target, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { success, error } = await resetPassword(email);
    setIsLoading(false);
    
    if (success) {
      setIsSent(true);
      toast.success("Password reset link sent!");
    } else {
      toast.error(error || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      
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
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
            <CardDescription>
              {isSent 
                ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder." 
                : "Enter your email address and we will send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSent && (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email address</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button className="w-full mt-2" type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-6">
            <Link to="/login" className="text-sm flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Back to log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
