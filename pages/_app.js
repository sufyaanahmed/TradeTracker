import '../styles/globals.css';
import Head from 'next/head';
import { AuthProvider } from '../lib/AuthContext';
import { initializeApp } from 'firebase/app';
import { useEffect } from 'react';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

if (typeof window !== 'undefined') {
  initializeApp(firebaseConfig);
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Suppress MetaMask and other browser extension errors
    const handleError = (event) => {
      // Check if error is from browser extension
      if (event.filename && event.filename.includes('chrome-extension://')) {
        console.warn('Suppressed browser extension error:', event.message);
        event.preventDefault();
        return true;
      }
      // Check for MetaMask-specific errors
      if (event.message && event.message.toLowerCase().includes('metamask')) {
        console.warn('Suppressed MetaMask error:', event.message);
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event) => {
      // Check if rejection is from browser extension or MetaMask
      if (event.reason && event.reason.message && 
          (event.reason.message.toLowerCase().includes('metamask') || 
           event.reason.message.toLowerCase().includes('connect'))) {
        console.warn('Suppressed extension promise rejection:', event.reason.message);
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Palrin | AI-Powered Trading Intelligence Platform</title>
        <link rel="icon" href="/Palrin.png" />
        <link rel="apple-touch-icon" href="/Palrin.png" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
} 