import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, CreditCard, Sparkles, Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

export function UpgradeModal({ isOpen, onClose }) {
  const { userPlan, setUserPlan, PLAN_LIMITS } = useAppContext();
  const [selectedPlanKey, setSelectedPlanKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  if (!isOpen) return null;

  const handleSelectPlan = (planKey) => {
    if (planKey === userPlan) return;
    if (planKey === 'free') {
      setUserPlan('free');
      toast.success("Switched to Free Plan.");
      onClose();
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
      onClose();
    }, 1500);
  };

  const checkoutPlan = selectedPlanKey ? PLAN_LIMITS[selectedPlanKey] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-surface-50/50 dark:bg-surface-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Upgrade Subscription</h2>
              <p className="text-xs text-muted-foreground">Unlock higher resume upload limits & advanced AI career features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!selectedPlanKey ? (
            /* Pricing Tier Cards */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(PLAN_LIMITS).map((plan) => {
                const isCurrent = userPlan === plan.id;
                const isPro = plan.id === 'pro';
                const isPremium = plan.id === 'premium';

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                      isCurrent
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : isPremium
                        ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-purple-500/5 hover:border-amber-500 shadow-md'
                        : 'border-border/60 bg-card hover:border-primary/50'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold tracking-wider uppercase">
                        Current Plan
                      </div>
                    )}
                    {isPremium && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-white text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-md">
                        <Sparkles size={12} /> Best Value
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-foreground">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                      </div>

                      {/* Pricing Tag */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tight text-foreground">{plan.price}</span>
                        <span className="text-xs font-bold text-muted-foreground">{plan.period}</span>
                      </div>

                      <div className="pt-2 border-t border-border/40 space-y-2.5 text-xs font-medium">
                        <div className="flex items-center gap-2 text-foreground font-bold">
                          <Check size={16} className="text-emerald-500 flex-shrink-0" />
                          <span>Up to <strong>{plan.maxResumes} Resumes</strong> Limit</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check size={16} className="text-emerald-500 flex-shrink-0" />
                          <span>AI ATS Heuristic Scoring</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check size={16} className="text-emerald-500 flex-shrink-0" />
                          <span>{isPro || isPremium ? 'Full Skill Gap & Career Roadmap' : 'Basic Skill Gap Overview'}</span>
                        </div>
                        {(isPro || isPremium) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Check size={16} className="text-emerald-500 flex-shrink-0" />
                            <span>Executive Summary & Cover Letter</span>
                          </div>
                        )}
                        {isPremium && (
                          <div className="flex items-center gap-2 text-amber-500 font-semibold">
                            <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
                            <span>AI Mock Interview Coach</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isCurrent}
                        variant={isCurrent ? 'outline' : isPremium ? 'default' : 'secondary'}
                        className={`w-full h-11 rounded-xl font-bold ${
                          isCurrent
                            ? 'cursor-default'
                            : isPremium
                            ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                            : ''
                        }`}
                      >
                        {isCurrent ? 'Active Plan' : plan.price === '$0' ? 'Switch to Free' : `Upgrade (${plan.price}/mo)`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Simulated Payment Checkout View */
            <div className="max-w-md mx-auto space-y-6 py-2 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                  <Lock size={12} /> Secure Demo Checkout
                </span>
                <h3 className="text-2xl font-black text-foreground">Confirm Your Subscription</h3>
                <p className="text-xs text-muted-foreground">Simulated payment authorization for {checkoutPlan.name}</p>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-border/60 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold border-b border-border/40 pb-3">
                  <span>{checkoutPlan.name} ({checkoutPlan.maxResumes} Resumes)</span>
                  <span className="text-foreground">{checkoutPlan.price} / mo</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center text-base font-extrabold text-foreground pt-1">
                  <span>Total Due Now</span>
                  <span className="text-emerald-500">{checkoutPlan.price}</span>
                </div>
              </div>

              {/* Payment Input Simulation */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Payment Card (Demo Card)</span>
                  <span className="text-emerald-500 text-[10px] flex items-center gap-1"><ShieldCheck size={12} /> Test Mode</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-11 px-4 pl-11 rounded-xl bg-background border border-border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <CreditCard size={18} className="absolute left-3.5 top-3 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">No real money will be charged. Clicking below simulates instant payment completion.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlanKey(null)}
                  disabled={isProcessing}
                  className="flex-1 h-12 rounded-xl font-bold"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayAndUpgrade}
                  disabled={isProcessing}
                  className="flex-1 h-12 rounded-xl font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25"
                >
                  {isProcessing ? 'Processing Payment...' : `Pay ${checkoutPlan.price} & Upgrade`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
