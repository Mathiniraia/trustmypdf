/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Layers, Scissors, FileImage, Trash2, RotateCw, 
  Minimize2, Shield, Gem, HelpCircle, Check, Sparkles, 
  ChevronDown, ChevronRight, Info, Clock, AlertTriangle, 
  ShieldCheck, Heart, ExternalLink, ArrowRight, FileText, 
  Compass, ArrowLeft, RefreshCw, Lock
} from "lucide-react";
import { TOOLS } from "./toolsData";
import { ToolDefinition } from "./types";
import ToolWorkspace from "./components/tools/ToolWorkspace";
import PaywallModal from "./components/payment/PaywallModal";

export default function App() {
  // Custom router state
  const [currentSlug, setCurrentSlug] = useState<string>("");
  
  // Paywall states
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [premiumPlanName, setPremiumPlanName] = useState("");

  // FAQ Accordion states
  const [activeFaqIndices, setActiveFaqIndices] = useState<number[]>([]);

  // Auth States
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("user_email");
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmailInput, setAuthEmailInput] = useState("");

  const handleScrollToTools = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("tools_section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getToolColorStyles = (slug: string) => {
    switch (slug) {
      case "merge-pdf":
        return {
          bg: "bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600",
        };
      case "split-pdf":
        return {
          bg: "bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600",
        };
      case "jpg-to-pdf":
        return {
          bg: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
        };
      case "pdf-to-jpg":
        return {
          bg: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600",
        };
      case "delete-pdf-pages":
        return {
          bg: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
        };
      case "rotate-pdf":
        return {
          bg: "bg-yellow-50 text-yellow-600 border-yellow-200 group-hover:bg-yellow-500 group-hover:text-white group-hover:border-yellow-500",
        };
      case "compress-pdf":
        return {
          bg: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600",
        };
      case "protect-pdf":
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-700 group-hover:text-white group-hover:border-slate-700",
        };
      case "unlock-pdf":
        return {
          bg: "bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600",
        };
      default:
        return {
          bg: "bg-neutral-50 text-neutral-600 border-neutral-100 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-950",
        };
    }
  };

  // Monitor path name for dynamic route mapping
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, "");
      // If valid slug fits, set it, else empty (home screen)
      const exists = TOOLS.some(t => t.slug === path);
      if (exists) {
        setCurrentSlug(path);
      } else {
        setCurrentSlug("");
      }
    };

    // Initial check
    handleLocationChange();

    // Listen to popstate
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Update dynamic route slug cleanly without refreshing
  const navigateToSlug = (slug: string) => {
    const targetPath = slug ? `/${slug}` : "/";
    window.history.pushState(null, "", targetPath);
    // Dispatch fake popstate for trigger
    window.dispatchEvent(new PopStateEvent("popstate"));
    // Scroll to workspace on change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // LOCAL STORAGE DAILY ATTEMPTS HANDLER
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const rawUsage = localStorage.getItem("pdf_app_usage");
    
    if (rawUsage) {
      try {
        const parsed = JSON.parse(rawUsage);
        if (parsed.unlocked) {
          setPremiumUnlocked(true);
          setPremiumPlanName(parsed.plan || "Premium Pass");
        }
        
        if (parsed.date === todayStr) {
          setUsageCount(parsed.count || 0);
        } else {
          // New day, reset counter
          const initData = { date: todayStr, count: 0, unlocked: parsed.unlocked, plan: parsed.plan };
          localStorage.setItem("pdf_app_usage", JSON.stringify(initData));
          setUsageCount(0);
        }
      } catch (e) {
        // Corrupt storage reset
        const initData = { date: todayStr, count: 0, unlocked: false };
        localStorage.setItem("pdf_app_usage", JSON.stringify(initData));
      }
    } else {
      const initData = { date: todayStr, count: 0, unlocked: false };
      localStorage.setItem("pdf_app_usage", JSON.stringify(initData));
    }
  }, []);

  // Check and increment attempt logic
  const handleUsageIncrement = (): boolean => {
    if (premiumUnlocked) return true; // unlimited access

    const todayStr = new Date().toISOString().split("T")[0];
    const rawUsage = localStorage.getItem("pdf_app_usage");
    let currentData = { date: todayStr, count: 0, unlocked: false, plan: "" };

    if (rawUsage) {
      try {
        currentData = JSON.parse(rawUsage);
      } catch (e) { }
    }

    // Intercept on 3rd attempt
    if (currentData.count >= 3) {
      setIsPaywallOpen(true);
      return false; // blocked
    }

    // Increment
    const updatedCount = currentData.count + 1;
    currentData.count = updatedCount;
    currentData.date = todayStr;
    localStorage.setItem("pdf_app_usage", JSON.stringify(currentData));
    setUsageCount(updatedCount);

    // If they just reached 3, open modal proactively to upgrade but let the current compilation process completed successfully
    if (updatedCount >= 3) {
      setTimeout(() => {
        setIsPaywallOpen(true);
      }, 800);
    }

    return true; // allowed
  };

  // Callback on successful checkout payment
  const handlePaymentSuccessUnlock = (planId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const rawUsage = localStorage.getItem("pdf_app_usage");
    let currentData = { date: todayStr, count: 0, unlocked: true, plan: planId };

    if (rawUsage) {
      try {
        currentData = JSON.parse(rawUsage);
      } catch (e) { }
    }

    const planNameLabel = planId === "daily" ? "Daily Pass" : planId === "weekly" ? "Weekly Pass" : "Monthly Pro";
    currentData.unlocked = true;
    currentData.plan = planNameLabel;
    localStorage.setItem("pdf_app_usage", JSON.stringify(currentData));
    
    setPremiumUnlocked(true);
    setPremiumPlanName(planNameLabel);
    setIsPaywallOpen(false);
  };

  // Reset/Revoke Premium license for testing
  const resetPremiumLicenseForDemo = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const initData = { date: todayStr, count: 0, unlocked: false };
    localStorage.setItem("pdf_app_usage", JSON.stringify(initData));
    setPremiumUnlocked(false);
    setPremiumPlanName("");
    setUsageCount(0);
  };

  // Find active tool
  const currentTool = TOOLS.find(t => t.slug === currentSlug);

  const toggleFaq = (idx: number) => {
    setActiveFaqIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col justify-between selection:bg-neutral-900 selection:text-white" id="main_app_canvas">
      
      {/* 1. TOP PREMIUM NAV HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 flex-shrink-0" id="navigation_header_desk">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between relative">
          
          {/* Logo Interface */}
          <button 
            onClick={() => navigateToSlug("")}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
            id="logo_brand_btn"
          >
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-neutral-900 block leading-tight">PDF Easy</span>
              <span className="text-[9px] text-neutral-400 font-medium font-mono uppercase block tracking-wider -mt-[1px]">One Tool for Every PDF Need</span>
            </div>
          </button>

          {/* User limit states / Auth status on far right */}
          <div className="flex items-center gap-4">
            {currentUserEmail ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
                  Logged in: <strong className="text-neutral-800 font-bold">{currentUserEmail}</strong>
                </span>
                <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-700 tracking-tight border border-neutral-200">
                  {currentUserEmail.charAt(0).toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem("user_email");
                    setCurrentUserEmail(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setShowAuthModal(true);
                  }}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthModal(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Hidden admin testing restorer */}
            <button 
              onClick={resetPremiumLicenseForDemo}
              title="Reset Usage limits for testing"
              className="p-1 hover:bg-neutral-100 text-neutral-300 hover:text-red-400 rounded transition"
            >
              <RefreshCw size={11} />
            </button>
          </div>

          {/* Premium Google-Style Full Screen Modal Overlay for Sign In & Sign Up */}
          {showAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="google_inspired_auth_modal_container">
              {/* Blur backdrop overlay */}
              <div 
                className="absolute inset-0 bg-neutral-900/45 backdrop-blur-md transition-opacity duration-300"
                onClick={() => setShowAuthModal(false)}
              />
              
              {/* Main Dialog Card */}
              <div className="relative bg-white w-full max-w-md rounded-2xl border border-neutral-150 shadow-2xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-250 select-none z-10" id="auth_overlay_card">
                
                {/* Visual decoration blur orb */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  {/* Google-Style Branding Header */}
                  <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                      P
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                        {authMode === "signin" ? "Sign in to your account" : "Create your Free account"}
                      </h2>
                      <p className="text-xs text-neutral-400 mt-1">
                        One Tool for Every PDF Need
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-xl mb-6">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${authMode === "signin" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${authMode === "signup" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Standard Google Single-Sign On (Social Mock Accent) */}
                  <button
                    type="button"
                    onClick={() => {
                      const email = "mathinirai.a@gmail.com";
                      localStorage.setItem("user_email", email);
                      setCurrentUserEmail(email);
                      setShowAuthModal(false);
                      setAuthEmailInput("");
                    }}
                    className="w-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 rounded-xl px-4 py-3 text-xs font-medium text-neutral-700 flex items-center justify-center gap-3 transition shadow-3xs cursor-pointer mb-6"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <title>Google Logo</title>
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-150" />
                    </div>
                    <span className="relative bg-white px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      or continue with email
                    </span>
                  </div>

                  {/* Standard Credential Fields */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const email = authEmailInput || "mathinirai.a@gmail.com";
                      localStorage.setItem("user_email", email);
                      setCurrentUserEmail(email);
                      setShowAuthModal(false);
                      setAuthEmailInput("");
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="name@company.com"
                        value={authEmailInput || ""}
                        onChange={(e) => setAuthEmailInput(e.target.value)}
                        className="w-full text-sm px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                        autoFocus
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full text-sm px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black bg-neutral-50/50"
                        defaultValue="customsecurepassword"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 rounded-xl text-sm transition shadow-sm cursor-pointer mt-4"
                    >
                      {authMode === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                  </form>
                </div>

                <div className="mt-8 flex items-center justify-between text-xs text-neutral-400">
                  <span className="hover:underline cursor-pointer">Help Center</span>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
                  >
                    Go Back to Tools
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </header>

      {/* DYNAMIC SCROLLABLE SUB-NAVIGATION STRIP */}
      <div className="sticky top-16 z-30 flex-shrink-0 h-12 bg-white border-b border-neutral-200 overflow-x-auto select-none no-scrollbar" id="sub_navigation_toolbar">
        <div className="max-w-7xl mx-auto px-8 flex h-full items-center gap-8">
          <button 
            onClick={() => navigateToSlug("")} 
            className={`tool-link py-3 cursor-pointer h-full flex items-center border-b-2 border-transparent hover:text-neutral-900 ${!currentSlug ? "tool-active text-neutral-900" : ""}`}
          >
            Dashboard
          </button>
          {TOOLS.map((tool) => {
            const isItemActive = currentSlug === tool.slug;
            return (
              <button
                key={tool.slug}
                onClick={() => navigateToSlug(tool.slug)}
                className={`tool-link py-3 cursor-pointer h-full flex items-center border-b-2 border-transparent hover:text-neutral-900 ${isItemActive ? "tool-active text-neutral-900" : ""}`}
              >
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CORE LAYOUT SYSTEM */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" id="body_main_content">
        
        {currentTool ? (
          // WORKSPACE VIEW (Active Slugs: e.g. /merge-pdf)
          <div className="space-y-16" id="tool_active_panel">
            
            {/* Quick Breadcrumb trail */}
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <button onClick={() => navigateToSlug("")} className="hover:text-black hover:underline cursor-pointer">
                Tools Dashboard
              </button>
              <ChevronRight size={10} />
              <span className="text-neutral-700 font-bold">{currentTool.name}</span>
            </div>

            {/* TIER 1: CORE WORKSPACE UTILITY BLOCK */}
            <section id="tier_1_workspace_visualizer">
              <ToolWorkspace 
                key={currentTool.slug}
                tool={currentTool}
                usageCount={usageCount}
                incrementUsage={handleUsageIncrement}
                onLimitExceeded={() => setIsPaywallOpen(true)}
              />
            </section>

            {/* TIER 2: 3-STEP INFORMATIONAL GRID */}
            <section className="border-t border-neutral-200/60 pt-16" id="tier_2_step_grid_section">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block mb-1">Workflow Overview</span>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900">How to process {currentTool.name} in 3 Simple Steps</h3>
                <p className="text-xs text-neutral-500 mt-1">Easily configure and convert your documents in just a few simple steps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {currentTool.steps.map((step, idx) => (
                  <div key={idx} className="glass-panel border-minimal rounded-xl p-4 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neutral-900">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TIER 3: BOTTOM SEO TEXT & ACCORDION FAQs */}
            <section className="border-t border-neutral-200/60 pt-16 max-w-4xl mx-auto" id="tier_3_seo_and_faqs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* SEO Text Panel */}
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase mb-3">Enterprise SEO Index</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-md font-sans">
                    {currentTool.seoText}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-md mt-4 font-sans">
                    Get seamless access to our full suite of tools built to optimize, convert, and organize your files quickly and reliably on any modern workflow.
                  </p>
                  
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-neutral-700">
                    <ShieldCheck size={14} className="text-emerald-500" /> Reliable conversion formats.
                  </div>
                </div>

                {/* FAQ Accordion Section */}
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase mb-4">Frequently Asked Questions</h4>
                  
                  <div className="space-y-3">
                    {currentTool.faqs.map((faq, idx) => {
                      const isExpanded = activeFaqIndices.includes(idx);
                      return (
                        <div key={idx} className="border border-neutral-200 rounded-lg bg-white overflow-hidden transition-all shadow-3xs">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
                          >
                            <span>{faq.q}</span>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-3.5 pt-1 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </section>

          </div>
        ) : (
          // DIRECTORY TOOL SELECTION GRID (Home path View with Split Hero)
          <div className="space-y-16" id="home_directory_view">
            
            {/* TWO-COLUMN SPLIT HERO SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16 max-w-6xl mx-auto" id="split_hero_section">
              {/* Left Column: Typography & Action */}
              <div className="text-left space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-mono text-neutral-600 shadow-3xs">
                  <Compass size={12} className="text-neutral-500" /> Free Web PDF Engine
                </div>
                <h1 className="font-semibold text-4xl md:text-5xl tracking-tight text-neutral-900">
                  Your Complete PDF Workspace
                </h1>
                <p className="text-neutral-500 text-lg mt-4 max-w-md">
                  Powerful PDF tools designed to help you work faster, stay organized, and get more done.
                </p>
                <div>
                  <a
                    href="#tools_section"
                    onClick={handleScrollToTools}
                    className="border border-neutral-200 bg-white shadow-sm font-medium px-5 py-2.5 rounded-xl text-sm mt-6 inline-flex items-center gap-2 transition hover:bg-neutral-50 cursor-pointer"
                  >
                    View All Tools ↓
                  </a>
                </div>
              </div>

              {/* Right Column: Abstract Isometric Graphic Assets Panel */}
              <div className="relative w-full h-80 bg-neutral-100/50 rounded-2xl border border-neutral-200 overflow-hidden flex items-center justify-center p-6" id="workspace_isometric_visual_panel">
                {/* Light technical dots wallpaper in sandbox background */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                  backgroundSize: '16px 16px'
                }} />
                
                {/* Floating soft blurred ambient backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-100/30 rounded-full blur-3xl" />

                {/* Primary window sheet */}
                <div className="relative w-80 h-48 bg-white/95 backdrop-blur-xs rounded-xl border border-neutral-200 shadow-md transform -rotate-3 hover:rotate-0 duration-500 transition-transform flex flex-col overflow-hidden">
                  <div className="h-7 bg-neutral-50 border-b border-neutral-150 px-3 flex items-center justify-between shrink-0 select-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400">easy_document.pdf</span>
                    <div className="w-4" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded">PDF Easy</span>
                        <span className="text-[10px] text-neutral-400 font-mono">2.4 MB</span>
                      </div>
                      <div className="h-2.5 w-11/12 bg-neutral-100 rounded" />
                      <div className="h-2.5 w-2/3 bg-neutral-100 rounded" />
                    </div>
                    {/* Minimal trajectory vector line progress */}
                    <div className="relative h-6 flex items-center mt-3">
                      <div className="absolute left-0 right-0 h-0.5 bg-neutral-100" />
                      <div className="absolute left-0 w-3/4 h-0.5 bg-neutral-900" />
                      <div className="absolute left-3/4 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                  </div>
                </div>

                {/* Secondary accessory document layout */}
                <div className="absolute right-6 bottom-4 w-28 h-20 bg-white border border-neutral-150 rounded-lg shadow-sm transform rotate-6 p-2.5 flex flex-col space-y-1">
                  <span className="text-[8px] font-bold text-neutral-400">PAGE 1</span>
                  <div className="h-1 w-full bg-neutral-100 rounded" />
                  <div className="h-1 w-5/6 bg-neutral-100 rounded" />
                  <div className="h-1 w-4/6 bg-neutral-100 rounded" />
                  <div className="flex justify-between items-center pt-2 text-[8px] text-green-600 font-bold shrink-0">
                    <span>Parsed</span>
                    <span>✓</span>
                  </div>
                </div>

                {/* Interactive cursor label mimic */}
                <div className="absolute top-1/4 right-1/3 transform scale-95 pointer-events-none">
                  <div className="flex items-center gap-1.5 py-1 px-2.5 bg-neutral-950 text-white rounded-full text-[9px] font-bold shadow-md">
                    <span className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" /> Instant PDF Processing
                  </div>
                  <svg className="w-4 h-4 text-neutral-900 fill-current mt-1 -ml-1 drop-shadow-xs" viewBox="0 0 24 24">
                    <path d="M4 4l8 16 3-6 6-3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* INTERACTIVE WORKSPACE MATRIX */}
            <div id="tools_section" className="pt-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-8">One Tool for Every PDF Need</h2>
              
              {/* Dynamic Grid of all 8 core tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="tools_catalog_grid">
                {TOOLS.map((item) => {
                  const colors = getToolColorStyles(item.slug);
                  return (
                    <button
                      key={item.slug}
                      onClick={() => navigateToSlug(item.slug)}
                      className="glass-panel border border-neutral-200/60 p-5 rounded-xl text-left group transition-all duration-200 hover:border-neutral-900 cursor-pointer flex flex-col justify-between h-44"
                      id={`tool_card_${item.slug}`}
                    >
                      <div className="w-full">
                        {/* Muted Pastel container around modern icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors duration-200 border shrink-0 ${colors.bg}`}>
                          {item.slug === "merge-pdf" && <Layers size={16} />}
                          {item.slug === "split-pdf" && <Scissors size={16} />}
                          {item.slug === "jpg-to-pdf" && <FileImage size={16} />}
                          {item.slug === "pdf-to-jpg" && <FileText size={16} />}
                          {item.slug === "delete-pdf-pages" && <Trash2 size={16} />}
                          {item.slug === "rotate-pdf" && <RotateCw size={16} />}
                          {item.slug === "compress-pdf" && <Minimize2 size={16} />}
                          {item.slug === "protect-pdf" && <Shield size={16} />}
                          {item.slug === "unlock-pdf" && <Lock size={16} />}
                        </div>

                        <h3 className="text-sm font-bold text-neutral-900 flex items-center justify-between">
                          {item.name}
                          <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                        </h3>
                        <p className="text-xs text-neutral-500 leading-normal mt-1 block">
                          {item.description}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 font-mono mt-3 self-start">
                        Launch Tool
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MINIMALIST SOCIAL PROOF / TRUST GRID SECTION */}
            <section className="border-t border-neutral-200/60 pt-16 max-w-6xl mx-auto" id="social_proof_trust_section">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase block mb-2">User Testimonials</span>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">What Our Users Say</h3>
                <p className="text-sm text-neutral-500 mt-2">Discover why people around the globe choose PDF Easy daily.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Comment Box 1 */}
                <div className="glass-panel border border-neutral-200/65 bg-white rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xs hover:border-neutral-300 transition-all duration-300">
                  <p className="text-xs text-neutral-600 leading-relaxed italic">
                    "PDF Easy works flawlessly. Choosing to merge and rotate directly in seconds is an incredible upgrade that means zero hassle."
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      AS
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Abhishek Sharma</h4>
                      <p className="text-[10px] text-neutral-400">Independent Engineer, Bengaluru</p>
                    </div>
                  </div>
                </div>

                {/* Comment Box 2 */}
                <div className="glass-panel border border-neutral-200/65 bg-white rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xs hover:border-neutral-300 transition-all duration-300">
                  <p className="text-xs text-neutral-600 leading-relaxed italic">
                    "I build presentation materials and contract proposals daily. Having a clean system with beautiful output is my absolute top priority."
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                      DP
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Deepa Patel</h4>
                      <p className="text-[10px] text-neutral-400">Interaction Designer</p>
                    </div>
                  </div>
                </div>

                {/* Comment Box 3 */}
                <div className="glass-panel border border-neutral-200/65 bg-white rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xs hover:border-neutral-300 transition-all duration-300">
                  <p className="text-xs text-neutral-600 leading-relaxed italic">
                    "The processing speed is unbeatable compared to old heavy enterprise processors. Incredible developer utility that strictly respects modern standards."
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      KN
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Karthik Nair</h4>
                      <p className="text-[10px] text-neutral-400">SaaS Founder & Creator</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* 3. UNIVERSAL BOTTOM LANDING FOOTER - EASY SLEEK MINIMALIST */}
      <footer className="bg-white border-t border-neutral-100 py-8 px-8 sm:px-12 mt-12" id="universal_footer_desk">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="font-bold text-sm tracking-tight text-neutral-900">PDF Easy</span>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <span className="text-xs text-neutral-400">© 2026 PDFKit India. Built for modern remote workflows.</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium">
            <button onClick={() => navigateToSlug("")} className="hover:text-black transition-colors cursor-pointer">All Tools</button>
            <button onClick={() => navigateToSlug("merge-pdf")} className="hover:text-black transition-colors cursor-pointer">Merge</button>
            <button onClick={() => navigateToSlug("split-pdf")} className="hover:text-black transition-colors cursor-pointer">Split</button>
            <button onClick={() => navigateToSlug("compress-pdf")} className="hover:text-black transition-colors cursor-pointer">Compress</button>
            <button onClick={() => navigateToSlug("protect-pdf")} className="hover:text-black transition-colors cursor-pointer">Protect</button>
            <button onClick={() => setIsPaywallOpen(true)} className="hover:text-black transition-colors cursor-pointer text-neutral-600 font-semibold font-mono">Unlock Pro</button>
          </div>
        </div>
      </footer>

      {/* RAZORPAY BILLING AND PAYWALL GATEWAY MODAL */}
      <PaywallModal 
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onPaymentSuccess={handlePaymentSuccessUnlock}
        usageLimitReached={usageCount >= 3}
      />

    </div>
  );
}
