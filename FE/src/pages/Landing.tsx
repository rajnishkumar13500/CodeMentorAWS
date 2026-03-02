import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeProvider from '../components/ThemeProvider';
import { Code2, Sparkles, Save, Image, Zap, Brain, Play, FileCode, LayoutDashboard, LogIn } from 'lucide-react';

interface User {
  displayName: string;
  email?: string;
  id?: string;
}

export default function Landing() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${BACKEND_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => {
        // User not logged in
      });
  }, [BACKEND_URL]);

  const features = [
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "Multi-Language Support",
      description: "Write code in C++, Python, Java, JavaScript. Switch languages seamlessly with intelligent code templates."
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Instant Code Execution",
      description: "Run your code instantly with our powerful compiler. Get real-time output and error messages."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Hints",
      description: "Stuck on a problem? Get intelligent hints and intuition from our AI assistant to guide you through."
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Visual Diagrams",
      description: "Auto-generate flowcharts and visual diagrams from your code. Understand logic flow at a glance."
    },
    {
      icon: <Save className="w-8 h-8" />,
      title: "Project Management",
      description: "Save and organize your projects. Access your code from anywhere, anytime."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized for speed and performance. Write, compile, and visualize without any lag."
    },
    {
      icon: <FileCode className="w-8 h-8" />,
      title: "Smart Code Editor",
      description: "Monaco-powered editor with syntax highlighting, auto-completion, and intelligent formatting."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Beautiful Interface",
      description: "Modern, clean UI with dark mode support. Focus on what matters - your code."
    }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-slate-900 dark:to-slate-800 opacity-80"></div>
          
          {/* Indian Architecture Background */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end opacity-10">
            <div className="flex items-end gap-2">
              <div className="w-12 h-8 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
              <div className="w-8 h-12 bg-gradient-to-t from-green-400 to-green-300 rounded-t-full"></div>
              <div className="w-16 h-10 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-4 bg-orange-300 rounded-t-full"></div>
              </div>
              <div className="w-8 h-6 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg"></div>
              <div className="w-12 h-14 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
              <div className="w-8 h-8 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg"></div>
              <div className="w-16 h-12 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-20 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-green-100 dark:from-orange-900/30 dark:to-green-900/30 px-4 py-2 rounded-full mb-6 border border-orange-200 dark:border-orange-700">
                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">AI for Bharat Hackathon Project</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-slate-800 to-green-600 bg-clip-text text-transparent">
                CodeMentor for Bharat
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Empowering India's developers with <span className="font-medium text-orange-600">AI-powered coding assistance</span> and <span className="font-medium text-green-600">intelligent learning tools</span>
              </p>

              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Built for the AI for Bharat Hackathon • Powered by AWS • Made with 🧡 for Indian developers
              </p>

              {/* Hackathon Badge */}
              <div className="mb-6 inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-green-500 px-6 py-3 rounded-full text-white shadow-lg">
                <img src="/aws-logo.svg" alt="AWS" className="h-5 filter brightness-0 invert" />
                <span className="text-sm font-bold">AI for Bharat Hackathon</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">2026</span>
              </div>

              {/* Login Status Badge */}
              {user && (
                <div className="mb-6 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Namaste {user.displayName}! 🙏
                  </span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <button
                    className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-7 py-3 rounded-lg text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-7 py-3 rounded-lg text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      onClick={() => navigate('/login')}
                    >
                      <LogIn className="w-5 h-5" />
                      Start Coding for Bharat
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button
                      className="bg-white dark:bg-slate-800 border-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300 px-7 py-3 rounded-lg text-base font-medium transition-all duration-200"
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Explore Features
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Powerful Features for Bharat's Developers
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to code, learn, and grow in the AI era
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-lg p-5 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-green-100 dark:from-orange-900/20 dark:to-green-900/20 rounded-lg flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Hackathon Info Section */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl p-8 text-white max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Built for AI for Bharat Hackathon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <img src="/aws-logo.svg" alt="AWS" className="h-6 filter brightness-0 invert" />
                    </div>
                    <span className="font-medium">Powered by AWS</span>
                    <span className="text-sm opacity-90">Cloud Infrastructure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <Brain className="w-6 h-6" />
                    </div>
                    <span className="font-medium">AI for Bharat</span>
                    <span className="text-sm opacity-90">Innovation Initiative</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Made in India</span>
                    <span className="text-sm opacity-90">For Indian Developers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Coding Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already using CodeMentor to write better code faster.
            </p>
            {!user && (
              <button
                className="bg-white text-blue-600 hover:bg-gray-100 px-7 py-3 rounded-lg text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center gap-2"
                onClick={() => window.location.href = `${BACKEND_URL}/auth/google`}
              >
                <LogIn className="w-5 h-5" />
                Sign Up with Google - It's Free!
              </button>
            )}
            {user && (
              <button
                className="bg-white text-blue-600 hover:bg-gray-100 px-7 py-3 rounded-lg text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center gap-2"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="w-5 h-5" />
                Open Your Dashboard
              </button>
            )}
          </div>
        </section> */}

        <Footer />
      </div>
    </ThemeProvider>
  );
}
