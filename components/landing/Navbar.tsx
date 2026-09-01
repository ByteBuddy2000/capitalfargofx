import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight, 
  LayoutDashboard, 
  Lock, 
  ArrowUpRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';
import { Button } from '../ui/Button';

interface NavbarProps {
  currentUser?: User | null;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onNavigateAuth?: (mode: 'login' | 'register') => void;
  onNavigateDashboard?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onNavigateAuth,
  onNavigateDashboard,
  onNavigateAdmin,
  onNavigateSection,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuth = (mode: 'login' | 'register') => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else if (onNavigateAuth) {
      onNavigateAuth(mode);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', target: 'hero' },
    { label: 'About', target: 'about' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'Investment Plans', target: 'plans' },
    { label: 'Assets', target: 'assets' },
    { label: 'FAQ', target: 'faq' },
    { label: 'Contact', target: 'contact' },
  ];

  const handleLinkClick = (target: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(target);
    } else {
      const el = document.getElementById(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-3.5'
          : 'bg-gradient-to-b from-slate-950/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('hero')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-white tracking-tight">
                CapitalFargo<span className="text-emerald-400">FX</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">
              Digital Asset Management
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-slate-800 backdrop-blur-md">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link.target)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-full hover:bg-slate-800/70 transition-all cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action / Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {currentUser.role === 'ADMIN' && (
                <Button
                  size="sm"
                  variant="dark"
                  leftIcon={<Lock className="w-3.5 h-3.5 text-amber-400" />}
                  onClick={onNavigateAdmin}
                  className="bg-amber-950/60 hover:bg-amber-900/80 border-amber-600/40 text-amber-200"
                >
                  Admin Console
                </Button>
              )}
              <Button
                size="sm"
                variant="primary"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                onClick={onNavigateDashboard}
                className="shadow-md shadow-blue-600/20"
              >
                Investor Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => handleAuth('login')}
              >
                Login
              </Button>
              <Button
                size="sm"
                variant="primary"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => handleAuth('register')}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 border-none shadow-md shadow-blue-500/20"
              >
                Create Account
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          {currentUser && (
            <Button
              size="sm"
              variant="primary"
              onClick={onNavigateDashboard}
              className="text-xs px-2.5 py-1.5"
            >
              Dashboard
            </Button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 shadow-2xl"
          >
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.target)}
                  className="text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              {currentUser ? (
                <>
                  <Button
                    variant="primary"
                    leftIcon={<LayoutDashboard className="w-4 h-4" />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateDashboard?.();
                    }}
                    className="w-full justify-center"
                  >
                    Open Investor Dashboard
                  </Button>
                  {currentUser.role === 'ADMIN' && (
                    <Button
                      variant="secondary"
                      leftIcon={<Lock className="w-4 h-4 text-amber-500" />}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigateAdmin?.();
                      }}
                      className="w-full justify-center"
                    >
                      Admin Management Console
                    </Button>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAuth('login');
                    }}
                    className="bg-slate-900 border-slate-800 text-slate-200"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAuth('register');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 border-none"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
