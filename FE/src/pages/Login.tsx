import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeProvider from '../components/ThemeProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LogIn, Code2, Sparkles, Shield, Zap, Mail, Lock, User, ArrowRight, Loader2, KeyRound } from 'lucide-react';

type AuthView = 'login' | 'register' | 'verify-otp';

export default function Login() {
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${BACKEND_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            navigate('/dashboard');
          }
        })
        .catch(() => { });
    }
  }, [navigate, BACKEND_URL]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      setSuccess('OTP sent to your email! Please check your inbox.');
      setView('verify-otp');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'OTP verification failed');
        return;
      }

      // Save token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Email verified! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to resend OTP');
        return;
      }

      setSuccess('OTP resent! Check your inbox.');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // If email not verified, show OTP view
        if (data.needsVerification) {
          setView('verify-otp');
          setSuccess('Your email is not verified. Enter the OTP sent to your email.');
          return;
        }
        setError(data.message || 'Login failed');
        return;
      }

      // Save token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError('');
    setSuccess('');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <div className="bg-card border border-border rounded-lg shadow-lg p-8">
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-foreground">
                  {view === 'login' && 'Welcome Back'}
                  {view === 'register' && 'Create Account'}
                  {view === 'verify-otp' && 'Verify Email'}
                </h2>
                <p className="text-muted-foreground">
                  {view === 'login' && 'Sign in to continue coding with AI'}
                  {view === 'register' && 'Join CodeMentor and start coding'}
                  {view === 'verify-otp' && `Enter the OTP sent to ${email}`}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                  {success}
                </div>
              )}

              {/* Login Form */}
              {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Sign In
                  </button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* Register Form */}
              {view === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Create Account
                  </button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              {/* OTP Verification Form */}
              {view === 'verify-otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm text-center tracking-[0.3em] font-mono text-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Verify Email
                  </button>

                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-orange-600 dark:text-orange-400 hover:underline font-medium disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Back to Register
                    </button>
                  </div>
                </form>
              )}

              {/* Benefits - shown only on login/register */}
              {view !== 'verify-otp' && (
                <div className="space-y-3 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-muted-foreground">AI-powered hints and intuition</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-muted-foreground">Instant code compilation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-muted-foreground">Secure project management</span>
                  </div>
                </div>
              )}
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
