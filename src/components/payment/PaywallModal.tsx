/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, Check, Sparkles, ShieldCheck, CreditCard, 
  Tv, Database, HelpCircle, ArrowRight, Loader2,
  Smartphone, Wallet, Lock, Key, Info, RefreshCw
} from "lucide-react";
import { PaymentPlan } from "../../types";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (planId: string) => void;
  usageLimitReached: boolean;
}

const PLANS: PaymentPlan[] = [
  {
    id: "daily",
    name: "Daily Power Pass",
    price: 29,
    period: "24-Hour Access",
    benefits: [
      "Completely unlimited PDF processes",
      "Process up to 150MB per document",
      "High performance multi-format engine",
      "UPI & Credit/Debit Card support"
    ]
  },
  {
    id: "weekly",
    name: "Weekly Project Pass",
    price: 99,
    period: "7-Day Period",
    popular: true,
    benefits: [
      "All Daily Pass premium access",
      "Optimized ultra-high compression priority",
      "Direct Priority rendering core",
      "Full premium multi-device priority"
    ]
  },
  {
    id: "monthly",
    name: "Monthly Infinite Pro",
    price: 299,
    period: "30-Day Period",
    benefits: [
      "Continuous premium browser assets",
      "VIP multi-document parallel queues",
      "Full access to experimental beta tools",
      "Instant dedicated webhook endpoints"
    ]
  }
];

export default function PaywallModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  usageLimitReached
}: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>(PLANS[1]); // Default to weekly (99 INR)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMode, setSuccessMode] = useState(false);
  
  // Custom sandbox-checkout simulator states (shown for fast testing or when keys are absent)
  const [showSandboxUI, setShowSandboxUI] = useState(false);
  const [sandboxOrderDetails, setSandboxOrderDetails] = useState<any>(null);
  const [upiId, setUpiId] = useState("user@okaxis");
  const [payingSandbox, setPayingSandbox] = useState(false);
  const [sandboxSuccessCode, setSandboxSuccessCode] = useState("");

  useEffect(() => {
    // Dynamic loading of Razorpay standard script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isOpen) return null;

  // Primary Checkout Trigger
  const handleCheckoutInitiation = async () => {
    setLoading(true);
    setErrorMessage("");
    setShowSandboxUI(false);

    try {
      // 1. Contact Express server route to generate Razorpay Payment Order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          planId: selectedPlan.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to create payment order from server.");
      }

      const orderData = await res.json();

      if (orderData.isDemo) {
        // Razorpay environment variables are not configure. Trigger sandbox preview mock flow!
        setSandboxOrderDetails(orderData);
        setShowSandboxUI(true);
        setLoading(false);
        return;
      }

      // 2. Real Razorpay standard options and window triggers!
      const RazorpaySDK = (window as any).Razorpay;
      if (!RazorpaySDK) {
        throw new Error("Razorpay billing wrapper loading failed. Check connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: "INR",
        name: "PDF Utility Platform",
        description: `${selectedPlan.name} - ${selectedPlan.period}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify with local backend route
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderData.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                isDemo: false
              }),
            });
            const verification = await verifyRes.json();
            if (verification.success) {
              triggerPaymentSuccess();
            } else {
              setErrorMessage("Transaction verification didn't match.");
            }
          } catch (e: any) {
            setErrorMessage("Payment confirmation validation error.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "Guest Client",
          email: "pdf-guest@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0a0a0a"
        }
      };

      const paymentWindow = new RazorpaySDK(options);
      paymentWindow.open();
      setLoading(false);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong initiating checkout.");
      setLoading(false);
    }
  };

  const triggerPaymentSuccess = () => {
    setSuccessMode(true);
    setTimeout(() => {
      onPaymentSuccess(selectedPlan.id);
      setSuccessMode(false);
      onClose();
    }, 2800);
  };

  // UPI / CARD mock checkout execution for sandbox mode
  const executeSandboxMockPayment = () => {
    setPayingSandbox(true);
    setTimeout(() => {
      setPayingSandbox(false);
      triggerPaymentSuccess();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" id="paywall_modal_overlay">
      
      {/* SUCCESS POPUP SCREEN */}
      {successMode ? (
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-2xl max-w-sm w-full text-center py-12 animate-scale-up" id="payment_success_overlay">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 mx-auto flex items-center justify-center mb-6 animate-bounce">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-xl font-bold font-mono text-neutral-900 mb-2">₹{selectedPlan.price} Paid Successfully!</h2>
          <p className="text-xs text-neutral-500 mb-6">Payment verified and locked via Secure Gateway channels.</p>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <RefreshCw size={12} className="animate-spin" /> Unlocking Premium Workspace...
          </div>
        </div>
      ) : (
        // MAIN WORKSPACE INTERACTIVE MODAL PANEL
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-up" id="main_paywall_checkout_panel">
          
          {/* LEFT AREA: Pricing Plans List & Core benefits */}
          <div className="flex-1 p-6 md:p-8 bg-neutral-50 border-r border-neutral-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] bg-neutral-200 text-neutral-800 font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles size={11} className="text-neutral-900" /> Premium Access Locked
                </span>
                
                {usageLimitReached && (
                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 font-semibold rounded px-2 py-0.5 animate-pulse">
                    Limit of 3 files reached
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold font-mono text-neutral-900 tracking-tight leading-tight">
                Select Premium Pass to Continue
              </h2>
              <p className="text-xs text-neutral-500 mt-1 mb-6">
                Instant checkout. Choose a period and clear your daily limit quota values cleanly.
              </p>

              {/* THREE REUSABLE PLAN TILES */}
              <div className="space-y-3">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowSandboxUI(false);
                      }}
                      className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition-all duration-200 ${
                        isSelected 
                          ? "bg-white border-neutral-900 shadow-sm ring-1 ring-neutral-900" 
                          : "bg-white/40 border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"
                        }`}>
                          {isSelected && <span className="block w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{plan.name}</span>
                            {plan.popular && (
                              <span className="text-[9px] bg-neutral-900 text-white font-mono uppercase font-bold tracking-wide px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{plan.period}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-neutral-950 font-mono">₹{plan.price}</span>
                        <span className="text-[10px] text-neutral-400 block font-mono">GST incl.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRUST CRITERIA SECTION */}
            <div className="mt-6 pt-5 border-t border-neutral-200/50 text-[11px] text-neutral-500 space-y-1.5">
              <p className="flex items-center gap-2 font-mono">
                <Check size={12} className="text-emerald-500" /> Fast processing - high precision outcomes
              </p>
              <p className="flex items-center gap-2 font-mono">
                <Check size={12} className="text-emerald-500" /> Cancel anytime with zero commitment
              </p>
            </div>
          </div>

          {/* RIGHT AREA: Active payment initiator or Sandbox simulator panel */}
          <div className="w-full md:w-80 p-6 md:p-8 flex flex-col justify-between">
            
            {/* Modal Exit Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase">Billing Desk</span>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition cursor-pointer"
                id="close_paywall_modal_btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* ERROR SUMMARY */}
            {errorMessage && (
              <div className="my-3 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 font-medium">
                <Info size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!showSandboxUI ? (
              // PRE-CHECKOUT INITIATE INTERFACE
              <div className="my-auto py-6" id="pre_checkout_pricing_box">
                <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase font-mono block mb-1">Your Selection:</span>
                  <div className="text-sm font-extrabold text-neutral-900 mb-1">{selectedPlan.name}</div>
                  <div className="text-xs text-neutral-500">{selectedPlan.period} access and infinite daily limits.</div>
                  
                  <div className="mt-4 flex items-baseline gap-1.5 border-t border-neutral-200/50 pt-2.5">
                    <span className="text-2xl font-black font-mono text-neutral-950">₹{selectedPlan.price}</span>
                    <span className="text-xs text-neutral-500 font-mono">one-time payment</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 text-xs text-neutral-600">
                  {selectedPlan.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCheckoutInitiation}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-neutral-950 hover:bg-black disabled:bg-neutral-400 rounded-xl py-3 shadow-md transition font-mono cursor-pointer"
                  id="checkout_secure_btn"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Starting Secure Session...
                    </>
                  ) : (
                    <>
                      Pay Securely with UPI/Card <ArrowRight size={14} />
                    </>
                  )}
                </button>
                
                <p className="text-[9px] text-neutral-400 tracking-wide text-center mt-3 flex items-center justify-center gap-1 font-mono">
                  <Lock size={9} /> Secured with Razorpay Encryption Standard
                </p>
              </div>
            ) : (
              // INTERACTIVE HIGH-FIDELITY SANDBOX UPI QR CODE DEMO CHECKOUT MODAL
              // This executes when Razorpay is in keyless mode, allowing testing the model seamlessly!
              <div className="my-auto py-1.5" id="sandbox_payment_simulator">
                
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-700 font-medium mb-3">
                  <span className="font-bold flex items-center gap-1 mb-0.5">
                    <Info size={11} /> Sandbox Demo Active
                  </span>
                  Razorpay credential keys not specified. Showing secure offline payment testing simulator.
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs mb-4">
                  <div className="bg-neutral-900 p-2 text-center text-[10px] text-neutral-400 font-bold font-mono">
                    SECURED INR PAY DESK
                  </div>
                  
                  <div className="p-4 bg-white space-y-3">
                    <div className="text-center font-mono">
                      <span className="text-xs text-neutral-400 block uppercase">PAY TOTAL</span>
                      <span className="text-2xl font-black text-neutral-900">₹{selectedPlan.price}.00</span>
                    </div>

                    {/* QR Code Graphic element */}
                    <div className="bg-neutral-50 p-2 border border-neutral-100 rounded-lg flex flex-col items-center justify-center">
                      <div className="w-28 h-28 border-2 border-neutral-800/80 p-1 bg-white rounded flex flex-col items-center justify-center relative">
                        {/* Dot elements mock QR Code */}
                        <div className="grid grid-cols-4 gap-2 opacity-80 shrink-0">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={`w-3.5 h-3.5 bg-neutral-900 ${i % 3 === 0 ? "rounded-xs" : "opacity-40"}`} />
                          ))}
                        </div>
                        <div className="absolute inset-0 m-auto w-8 h-8 rounded bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-[8px] font-bold">
                          UPI
                        </div>
                      </div>
                      <span className="text-[8px] text-neutral-400 font-mono tracking-wider mt-2">SCAN STATIC PREVIEW QR</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-neutral-500 block">UPI ID / VPA Address:</label>
                      <input 
                        type="text" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full text-[11px] font-mono border border-neutral-200 rounded p-1.5 bg-neutral-50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={executeSandboxMockPayment}
                  disabled={payingSandbox}
                  className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-neutral-900 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg py-2.5 transition font-mono cursor-pointer shadow-2xs"
                  id="sandbox_pay_submit_btn"
                >
                  {payingSandbox ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Verifying UPI Pin...
                    </>
                  ) : (
                    <>
                      Simulate Safe Payment ✓
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Footer Secure Info */}
            <div className="text-[9px] text-neutral-400 font-mono text-center pt-2">
              All transactions safe. Active SSL security.
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
