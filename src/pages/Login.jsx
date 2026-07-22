import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Target, Globe, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, currentUser, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in normally without a verify parameter context, send them home.
    if (currentUser && !searchParams.get('code') && !searchParams.get('error')) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate, searchParams]);

  useEffect(() => {
    // Handle Supabase verification redirect parsing
    const errorDesc = searchParams.get('error_description');
    const errorCode = searchParams.get('error');
    
    // In PKCE flow, if a 'code' is present, the auth context will automatically exchange it for a session.
    // If they verify their email, we want to sign them out so they physically type their credentials.
    if (searchParams.get('code') || searchParams.get('type') === 'recovery') {
      if (currentUser) {
        logout().then(() => {
           toast.success("Email verified successfully. Please sign in.");
        });
      } else {
        // If auth context hasn't picked up the session yet, wait a tiny bit or just show toast
        const timer = setTimeout(() => {
          if (currentUser) {
            logout();
          }
          toast.success("Email verified successfully. Please sign in.", { id: 'verify-toast' });
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else if (errorDesc || errorCode) {
      // Decode URL formatted error message (e.g. Email link is invalid or has expired)
      toast.error(errorDesc ? errorDesc.replace(/\+/g, ' ') : "Authentication link is invalid.");
    }
  }, [searchParams, currentUser, logout]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { success, error } = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      toast.success("Successfully logged in!");
      navigate('/dashboard'); 
    } else {
      toast.error(error || "Failed to log in");
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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your email to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" disabled>
                <Globe className="mr-2 h-4 w-4" /> Github
              </Button>
              <Button variant="outline" type="button" disabled>
                <Mail className="mr-2 h-4 w-4" /> Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
