import React, { useEffect, useState, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, LogIn, Github, Info, User, ChevronDown } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    fetch(`${BACKEND_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          // Token invalid/expired → clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        setUser(data.user || null);
      })
      .catch(() => {
        setUser(null);
      });
  }, [BACKEND_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur supports-[backdrop-filter]:bg-slate-900/90">
      {/* Hackathon Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 text-center py-1">
        <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-orange-600 font-bold">Innovation partner</span>
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">H2S</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-bold text-lg">AI for Bharat Hackathon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-medium">Namaste Rajnish kumar! 🙏</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Powered by</span>
            <img src="/aws-logo.webp" alt="AWS" className="h-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Media partner</span>
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">YOURSTORY</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="/codementor-logo.png" 
              alt="CodeMentor" 
              className="w-10 h-10 rounded-lg shadow-sm"
              onError={(e) => {
                // Fallback to gradient icon if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">CodeMentor</h1>
            <p className="text-xs text-slate-300">AI for Bharat • Powered by AWS</p>
          </div>
        </Link>

        {/* Indian Architecture Skyline */}
        <div className="hidden lg:flex items-end gap-1 opacity-30 hover:opacity-60 transition-opacity">
          {/* Simplified Indian monuments silhouette */}
          <div className="w-8 h-6 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
          <div className="w-6 h-8 bg-gradient-to-t from-green-400 to-green-300 rounded-t-full"></div>
          <div className="w-10 h-7 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-orange-300 rounded-t-full"></div>
          </div>
          <div className="w-6 h-5 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg"></div>
          <div className="w-8 h-9 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/rajnishkumar13500"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>

          <Link
            to="/about"
            className="hidden sm:flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all text-sm font-medium shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* User Menu Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-700/50 border border-slate-600 hover:bg-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold ring-1 ring-slate-500">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                  </div>
                  <span className="text-sm font-medium text-white hidden md:inline max-w-[120px] truncate">
                    {user.displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all text-sm font-medium shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
