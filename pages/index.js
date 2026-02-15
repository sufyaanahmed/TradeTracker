import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import Head from 'next/head';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [auth, setAuth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        let app;
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const authInstance = getAuth(app);
        const providerInstance = new GoogleAuthProvider();
        
        // Add additional OAuth scopes if needed
        providerInstance.addScope('email');
        providerInstance.addScope('profile');
        
        setAuth(authInstance);
        setProvider(providerInstance);

        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
          setUser(user);
          setAuthInitialized(true);
          
          if (user) {
            // User is signed in, get the ID token
            try {
              const token = await user.getIdToken();
              localStorage.setItem('firebase_token', token);
              localStorage.setItem('user_uid', user.uid);
              localStorage.setItem('user_email', user.email || '');
              localStorage.setItem('user_name', user.displayName || '');
              
              // Redirect to dashboard
              console.log('Redirecting to dashboard...');
              router.push('/dashboard');
            } catch (error) {
              console.error('Error getting ID token:', error);
              setIsLoading(false);
            }
          } else {
            // User is signed out
            localStorage.removeItem('firebase_token');
            localStorage.removeItem('user_uid');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setAuthInitialized(true);
      }
    }
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (!auth || !provider) {
      console.error('Auth or provider not initialized');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting Google sign in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful:', result.user.email);
      // The onAuthStateChanged listener will handle the redirect
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Popup was blocked by browser');
      }
    }
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    // For now, redirect to Google auth
    handleGoogleSignIn();
  };

  return (
    <>
      <Head>
        <title>TradeAI | AI-Powered Trading Journal</title>
      </Head>
      
      <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-[#1a1f2e] antialiased">
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md dark:bg-background-dark/80 dark:border-[#2d3748]">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white flex items-center justify-center">
                <span className="material-symbols-outlined !text-[24px]">insights</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0d121c] dark:text-white">TradeAI</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium text-[#49659c] hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium text-[#49659c] hover:text-primary transition-colors" href="#about">About</a>
              <a className="text-sm font-medium text-[#49659c] hover:text-primary transition-colors" href="/dashboard">Dashboard</a>
              <a className="text-sm font-medium text-[#49659c] hover:text-primary transition-colors" href="/research">Research</a>
            </nav>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleGoogleSignIn}
                className="text-sm font-semibold text-[#49659c] hover:text-primary px-4 py-2"
              >
                Sign In
              </button>
              <button 
                onClick={handleGoogleSignIn}
                className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow hero-pattern">
          <div className="container mx-auto px-6 pt-16 pb-24 flex flex-col items-center">
            {/* Hero Value Prop */}
            <div className="max-w-3xl text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-symbols-outlined !text-[14px]">bolt</span>
                AI-Powered Analysis
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-[#0d121c] leading-[1.1] mb-6 tracking-tight dark:text-white">
                Elevate your trading with <span className="text-primary">AI-powered insights</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#49659c] leading-relaxed dark:text-slate-400">
                Automatically sync your trades, identify psychological triggers, and optimize your edge with our advanced analytics engine.
              </p>
            </div>

            {/* Firebase-inspired Login Card */}
            <div className="w-full max-w-md bg-white dark:bg-[#1a202c] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#e2e8f0] dark:border-[#2d3748] p-8 md:p-10">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-[#0d121c] dark:text-white mb-2">Start Journaling for Free</h3>
                <p className="text-sm text-[#49659c] dark:text-slate-400">Join 10,000+ traders mastering their psychology.</p>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f8fafc] dark:bg-transparent dark:hover:bg-white/5 border border-[#e2e8f0] dark:border-[#2d3748] rounded-lg py-3 px-4 transition-all duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-semibold text-[#0d121c] dark:text-white">
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </span>
                </button>
                
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-[#e2e8f0] dark:border-[#2d3748]"></div>
                  <span className="flex-shrink mx-4 text-xs font-medium text-[#94a3b8] uppercase">or</span>
                  <div className="flex-grow border-t border-[#e2e8f0] dark:border-[#2d3748]"></div>
                </div>
                
                <form onSubmit={handleEmailSignUp} className="space-y-3">
                  <input 
                    className="w-full px-4 py-3 rounded-lg border border-[#e2e8f0] dark:border-[#2d3748] bg-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
                  >
                    Create Account
                  </button>
                </form>
              </div>
              
              <p className="mt-6 text-center text-[12px] text-[#94a3b8]">
                By signing up, you agree to our <a className="underline" href="#">Terms</a> and <a className="underline" href="#">Privacy Policy</a>.
                <br/>
                <span className="mt-2 block font-medium text-[#49659c] dark:text-slate-400">No credit card required.</span>
              </p>
            </div>

            {/* Feature Micro-Grid */}
            <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
              <div className="flex flex-col items-start p-6 rounded-xl bg-white/50 dark:bg-white/5 border border-[#e2e8f0]/50 dark:border-white/10">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">sync_alt</span>
                </div>
                <h4 className="font-bold text-[#0d121c] dark:text-white mb-2">Auto-Sync Trades</h4>
                <p className="text-sm text-[#49659c] dark:text-slate-400 leading-relaxed">
                  Connect your broker directly. We sync your history in real-time without manual logs.
                </p>
              </div>
              
              <div className="flex flex-col items-start p-6 rounded-xl bg-white/50 dark:bg-white/5 border border-[#e2e8f0]/50 dark:border-white/10">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <h4 className="font-bold text-[#0d121c] dark:text-white mb-2">Psychology Insights</h4>
                <p className="text-sm text-[#49659c] dark:text-slate-400 leading-relaxed">
                  Identify emotional patterns that lead to over-trading or revenge trading with AI.
                </p>
              </div>
              
              <div className="flex flex-col items-start p-6 rounded-xl bg-white/50 dark:bg-white/5 border border-[#e2e8f0]/50 dark:border-white/10">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">query_stats</span>
                </div>
                <h4 className="font-bold text-[#0d121c] dark:text-white mb-2">Pattern Recognition</h4>
                <p className="text-sm text-[#49659c] dark:text-slate-400 leading-relaxed">
                  Automatically tag setups and find which strategies actually have a positive expectancy.
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-24 w-full text-center">
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-8">Trusted by Traders Using</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-[28px]">account_balance</span>
                  <span className="font-black text-xl italic tracking-tighter">TD Ameritrade</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-[28px]">shield</span>
                  <span className="font-black text-xl italic tracking-tighter">MetaTrader 5</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-[28px]">rocket_launch</span>
                  <span className="font-black text-xl italic tracking-tighter">Interactive Brokers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-[28px]">currency_exchange</span>
                  <span className="font-black text-xl italic tracking-tighter">Coinbase</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Product Preview/Abstract Section */}
        <section id="about" className="bg-white dark:bg-[#0d121c] py-20 border-t border-[#e2e8f0] dark:border-[#2d3748]">
          <div className="container mx-auto px-6">
            <div className="bg-primary/5 rounded-2xl p-4 md:p-8 border border-primary/10 shadow-inner overflow-hidden">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl font-black text-[#0d121c] dark:text-white">Designed for clarity.</h2>
                  <p className="text-[#49659c] dark:text-slate-400">
                    Stop guessing what went wrong. Our dashboard gives you a bird&apos;s eye view of your trading performance across all accounts.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-sm font-medium text-[#0d121c] dark:text-white">
                      <span className="material-symbols-outlined text-primary !text-[20px]">check_circle</span>
                      Equity Curve Visualization
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium text-[#0d121c] dark:text-white">
                      <span className="material-symbols-outlined text-primary !text-[20px]">check_circle</span>
                      Risk Management Scorecard
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium text-[#0d121c] dark:text-white">
                      <span className="material-symbols-outlined text-primary !text-[20px]">check_circle</span>
                      Mistake Tracking &amp; Tagging
                    </li>
                  </ul>
                </div>
                
                <div className="flex-1 w-full">
                  <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl border border-[#e2e8f0] dark:border-[#2d3748] p-1 h-64 md:h-96 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                    <div className="p-6 h-full flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-[#e2e8f0] dark:bg-white/10 rounded"></div>
                        <div className="h-4 w-12 bg-primary/20 rounded"></div>
                      </div>
                      <div className="flex-grow flex items-end gap-2">
                        <div className="h-2/3 flex-1 bg-primary/30 rounded-t"></div>
                        <div className="h-1/2 flex-1 bg-primary/20 rounded-t"></div>
                        <div className="h-3/4 flex-1 bg-primary/40 rounded-t"></div>
                        <div className="h-5/6 flex-1 bg-primary/60 rounded-t"></div>
                        <div className="h-full flex-1 bg-primary rounded-t"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background-light dark:bg-background-dark py-12 border-t border-[#e2e8f0] dark:border-[#2d3748]">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-1 rounded text-primary">
                  <span className="material-symbols-outlined !text-[20px]">insights</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-[#0d121c] dark:text-white">TradeAI</span>
              </div>
              
              <div className="flex gap-8">
                <a className="text-xs font-semibold text-[#94a3b8] hover:text-primary uppercase tracking-widest transition-colors" href="#">Twitter</a>
                <a className="text-xs font-semibold text-[#94a3b8] hover:text-primary uppercase tracking-widest transition-colors" href="#">Discord</a>
                <a className="text-xs font-semibold text-[#94a3b8] hover:text-primary uppercase tracking-widest transition-colors" href="#">GitHub</a>
                <a className="text-xs font-semibold text-[#94a3b8] hover:text-primary uppercase tracking-widest transition-colors" href="#">Contact</a>
              </div>
              
              <p className="text-sm text-[#94a3b8]">© 2024 TradeAI Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
