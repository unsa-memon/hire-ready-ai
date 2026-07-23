import React, { useState } from 'react';
import { Zap, Check, Sparkles, CreditCard, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Pricing() {
  const navigate = useNavigate();
  const { userPlan, setUserPlan, PLAN_LIMITS, resumesCount, activePlanInfo } = useAppContext();
  const [selectedPlanKey, setSelectedPlanKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  const handleSelectPlan = (planKey) => {
    if (planKey === userPlan) return;
    if (planKey === 'free') {
      setUserPlan('free');
      toast.success("Switched to Free Plan.");
      setSelectedPlanKey(null);
      return;
    }
    setSelectedPlanKey(planKey);
  };

  const handlePayAndUpgrade = () => {
    if (!selectedPlanKey) return;
    setIsProcessing(true);

    setTimeout(() => {
      setUserPlan(selectedPlanKey);
      setIsProcessing(false);
      const planName = PLAN_LIMITS[selectedPlanKey].name;
      const price = PLAN_LIMITS[selectedPlanKey].price;
      toast.success(`🎉 Payment Successful! Upgraded to ${planName} (${price}/mo)`);
      setSelectedPlanKey(null);
    }, 1500);
  };

  const checkoutPlan = selectedPlanKey ? PLAN_LIMITS[selectedPlanKey] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Subscription Plans <Zap className="text-amber-500 fill-amber-500/20" size={28} />
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose the right plan to increase your resume upload limits & access advanced AI career tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-foreground bg-surface-100/90 dark:bg-surface-800/90 border border-border shadow-sm hover:shadow-md hover:border-primary/50 hover:text-primary transition-all duration-300 hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Usage Overview Banner */}
      <Card className="glass-card bg-gradient-to-r from-primary/10 via-surface-100/50 to-primary/5 dark:from-primary/20 dark:via-surface-900/60 dark:to-primary/10 border-primary/20 shadow-md">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-black text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-foreground">Current Active Plan: {activePlanInfo.name} ({activePlanInfo.price})</h3>
              <p className="text-sm text-muted-foreground">
                You have uploaded <strong className="text-foreground">{resumesCount}</strong> of <strong className="text-foreground">{activePlanInfo.maxResumes}</strong> resumes permitted on your current tier.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {Object.values(PLAN_LIMITS).map((plan) => {
          const isCurrent = userPlan === plan.id;
          const isPro = plan.id === 'pro';
          const isPremium = plan.id === 'premium';
          const isSelected = selectedPlanKey === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 ${
                isCurrent
                  ? 'border-primary bg-primary/5 shadow-xl ring-2 ring-primary/40'
                  : isSelected
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-xl ring-2 ring-emerald-500/50'
                  : isPremium
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-purple-500/5 hover:border-amber-500 shadow-md hover:shadow-xl'
                  : 'border-border/60 bg-card hover:border-primary/50 shadow-sm hover:shadow-md'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black tracking-wider uppercase shadow-md">
                  Active Plan
                </div>
              )}
              {isPremium && !isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                  <Sparkles size={14} /> Best Value
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{plan.desc}</p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-sm font-bold text-muted-foreground">{plan.period}</span>
                </div>

                {/* Feature Checkmarks */}
                <div className="pt-4 border-t border-border/50 space-y-3.5 text-xs font-medium">
                  <div className="flex items-center gap-2.5 text-foreground font-extrabold text-sm">
                    <Check size={18} className="text-emerald-500 flex-shrink-0" />
                    <span>Up to <strong>{plan.maxResumes} Resumes</strong> Limit</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Check size={18} className="text-emerald-500 flex-shrink-0" />
                    <span>AI ATS Heuristic Scoring</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Check size={18} className="text-emerald-500 flex-shrink-0" />
                    <span>{isPro || isPremium ? 'Full Skill Gap & Career Roadmap' : 'Basic Skill Gap Overview'}</span>
                  </div>
                  {(isPro || isPremium) && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Check size={18} className="text-emerald-500 flex-shrink-0" />
                      <span>Executive Summary & Cover Letter</span>
                    </div>
                  )}
                  {isPremium && (
                    <div className="flex items-center gap-2.5 text-amber-500 font-bold">
                      <Sparkles size={18} className="text-amber-500 flex-shrink-0" />
                      <span>AI Mock Interview Coach</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  variant={isCurrent ? 'outline' : isPremium ? 'default' : 'secondary'}
                  className={`w-full h-12 rounded-xl font-extrabold text-sm transition-all ${
                    isCurrent
                      ? 'cursor-default opacity-80'
                      : isPremium
                      ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl'
                      : ''
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.price === '$0' ? 'Switch to Free' : `Upgrade (${plan.price}/mo)`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Drawer Section (Renders when an upgrade plan is selected) */}
      {selectedPlanKey && checkoutPlan && (
        <Card className="glass-card border-emerald-500/40 bg-gradient-to-br from-surface-50 via-background to-emerald-500/5 dark:from-surface-900 dark:via-background dark:to-emerald-950/20 shadow-2xl animate-in slide-in-from-bottom-6 duration-300 mt-8">
          <CardContent className="p-8 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-extrabold uppercase tracking-wider">
                <Lock size={14} /> Simulated Demo Checkout
              </span>
              <h3 className="text-2xl font-black text-foreground">Confirm Upgrade to {checkoutPlan.name}</h3>
              <p className="text-xs text-muted-foreground">Test payment authorization — no actual money will be charged.</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100/80 dark:bg-surface-900 border border-border space-y-3">
              <div className="flex justify-between items-center text-sm font-bold border-b border-border/50 pb-3">
                <span>{checkoutPlan.name} ({checkoutPlan.maxResumes} Resumes Limit)</span>
                <span className="text-foreground">{checkoutPlan.price} / month</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Estimated Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center text-base font-black text-foreground pt-1">
                <span>Total Due Today</span>
                <span className="text-emerald-500 text-lg">{checkoutPlan.price}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Demo Payment Card</span>
                <span className="text-emerald-500 text-[10px] flex items-center gap-1"><ShieldCheck size={12} /> Test Card Approved</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full h-12 px-4 pl-11 rounded-xl bg-background border border-border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <CreditCard size={18} className="absolute left-3.5 top-3.5 text-muted-foreground" />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPlanKey(null)}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayAndUpgrade}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25"
              >
                {isProcessing ? 'Authorizing Payment...' : `Pay ${checkoutPlan.price} & Upgrade Now`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
