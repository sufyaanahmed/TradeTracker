import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Chrome, TrendingUp, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Initialize Firebase on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!firebaseConfig.apiKey) {
          throw new Error('Firebase configuration incomplete');
        }
        
        let app;
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        
        const authInstance = getAuth(app);
        const providerInstance = new GoogleAuthProvider();
        
        setAuth(authInstance);
        setProvider(providerInstance);
        setFirebaseReady(true);
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!firebaseReady || !auth || !provider) {
      alert('Authentication is still initializing. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;
      const uname = user.displayName;
      const accessToken = await user.getIdToken();
      
      // Store user data
      localStorage.setItem('uid', uid);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('uname', uname);

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-api-key') {
        alert('Firebase configuration error. Please check your environment variables.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert('Login cancelled by user.');
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'linear-gradient(to bottom right, var(--cyber-darker), var(--cyber-dark), var(--cyber-light))',
    position: 'relative'
  };

  const gridBackgroundStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    opacity: 0.2
  };

  const contentStyle = {
    width: '100%',
    maxWidth: '1152px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10
  };

  const heroStyle = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const subtitleStyle = {
    fontSize: '1.25rem',
    color: 'hsl(var(--muted-foreground))',
    marginBottom: '32px',
    maxWidth: '500px',
    margin: '0 auto 32px'
  };

  const featuresStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  };

  const featureCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px'
  };

  const loginCardStyle = {
    maxWidth: '400px',
    margin: '0 auto'
  };

  return (
    <div style={containerStyle}>
      <div style={gridBackgroundStyle}></div>
      
      <div style={contentStyle}>
        {/* Hero Section */}
        <div style={heroStyle}>
          <h1 style={titleStyle}>
            <span className="glow-text">TradeTracker Pro</span>
          </h1>
          <p style={subtitleStyle}>
            AI-Powered Trading Journal & Equity Research Assistant
          </p>

          <div style={featuresStyle}>
            <div className="glass-effect" style={featureCardStyle}>
              <TrendingUp size={32} style={{color: 'var(--neon-blue)'}} />
              <div>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>Track Trades</h3>
                <p style={{fontSize: '12px', color: 'hsl(var(--muted-foreground))'}}>Monitor P&L</p>
              </div>
            </div>
            <div className="glass-effect" style={featureCardStyle}>
              <Zap size={32} style={{color: 'var(--neon-purple)'}} />
              <div>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>AI Analysis</h3>
                <p style={{fontSize: '12px', color: 'hsl(var(--muted-foreground))'}}>Smart Insights</p>
              </div>
            </div>
            <div className="glass-effect" style={featureCardStyle}>
              <Shield size={32} style={{color: 'var(--neon-green)'}} />
              <div>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>Secure</h3>
                <p style={{fontSize: '12px', color: 'hsl(var(--muted-foreground))'}}>Protected Data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div style={loginCardStyle}>
          <Card>
            <CardHeader style={{textAlign: 'center'}}>
              <CardTitle style={{fontSize: '1.5rem', marginBottom: '8px'}}>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your trading dashboard
              </CardDescription>
            </CardHeader>
            <CardContent style={{paddingTop: 0}}>
              <div style={{marginBottom: '24px', textAlign: 'center'}}>
                <p style={{fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px'}}>
                  Get started with your secure Google account
                </p>
                
                <button 
                  onClick={handleLogin} 
                  disabled={isLoading || !firebaseReady}
                  className="cyber-button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    opacity: (isLoading || !firebaseReady) ? 0.7 : 1
                  }}
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : !firebaseReady ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <Chrome size={20} />
                  )}
                  {isLoading ? 'Signing in...' : !firebaseReady ? 'Initializing...' : 'Sign in with Google'}
                </button>
              </div>

              <div style={{paddingTop: '24px', borderTop: '1px solid hsl(var(--border))'}}>
                <h4 style={{fontSize: '14px', fontWeight: '500', textAlign: 'center', marginBottom: '16px'}}>
                  Why TradeTracker Pro?
                </h4>
                <div style={{fontSize: '12px', color: 'hsl(var(--muted-foreground))'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <div style={{width: '4px', height: '4px', backgroundColor: 'var(--neon-blue)', borderRadius: '50%'}}></div>
                    <span>Track all your trades in one place</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <div style={{width: '4px', height: '4px', backgroundColor: 'var(--neon-purple)', borderRadius: '50%'}}></div>
                    <span>AI-powered stock analysis</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <div style={{width: '4px', height: '4px', backgroundColor: 'var(--neon-green)', borderRadius: '50%'}}></div>
                    <span>Real-time market insights</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: '4px', height: '4px', backgroundColor: 'var(--neon-pink)', borderRadius: '50%'}}></div>
                    <span>Portfolio performance analytics</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Elements */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '8px',
        height: '8px',
        backgroundColor: 'var(--neon-blue)',
        borderRadius: '50%',
        animation: 'pulse-neon 2s infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '75%',
        right: '25%',
        width: '4px',
        height: '4px',
        backgroundColor: 'var(--neon-purple)',
        borderRadius: '50%',
        animation: 'pulse-neon 2s infinite',
        animationDelay: '1s'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '33%',
        width: '6px',
        height: '6px',
        backgroundColor: 'var(--neon-pink)',
        borderRadius: '50%',
        animation: 'pulse-neon 2s infinite',
        animationDelay: '2s'
      }}></div>
    </div>
  );
} 