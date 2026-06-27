import React, { useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';

const logoImg = "/src/assets/images/unity_hostel_logo_1781847359405.jpg";

interface HeaderProps {
  onOpenLogin: () => void;
  onScrollTo: (id: string) => void;
  onOpenSelfRegistration: () => void;
  onOpenDuesLookup: () => void;
}

export default function Header({ onOpenLogin, onScrollTo, onOpenSelfRegistration, onOpenDuesLookup }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header id="top-nav-bar" className="fixed top-0 left-0 right-0 z-50 bg-[#1E2022]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <img 
              src={logoImg} 
              alt="Unity Hostel Logo" 
              className="w-12 h-12 rounded-full border border-[#D4AF37] object-contain shadow-md shadow-[#D4AF37]/10"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">Unity Boys Hostel</h1>
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest block mt-1">Jaipur, Rajasthan</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 font-sans">
            {['home', 'about', 'rooms', 'facilities', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => handleNavClick(section)}
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-[#D4AF37] transition duration-200 capitalize active:scale-95 cursor-pointer"
              >
                {section}
              </button>
            ))}
            <button
              onClick={onOpenDuesLookup}
              className="ml-2 px-4 py-2 text-sm font-black border border-[#FF6B35] text-[#FF6B35] rounded-xl hover:bg-[#FF6B35] hover:text-white transition duration-200 cursor-pointer"
            >
              Student Portal 🚪 (स्टूडेंट पैनल)
            </button>
            <button
              onClick={onOpenLogin}
              className="ml-4 px-5 py-2.5 bg-gradient-to-r from-[#B89742] to-[#D4AF37] text-[#1E2022] rounded-xl text-sm font-black shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </button>
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition duration-200 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1E2022] border-b border-[#D4AF37]/20 px-4 py-4 space-y-2">
          {['home', 'about', 'rooms', 'facilities', 'contact'].map((section) => (
            <button
              key={section}
              onClick={() => handleNavClick(section)}
              className="w-full text-left px-4 py-3 rounded-lg text-base font-semibold text-gray-300 hover:text-[#D4AF37] hover:bg-white/5 transition duration-200 capitalize"
            >
              {section}
            </button>
          ))}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <button
              onClick={() => {
                onOpenDuesLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white rounded-xl text-center font-black transition duration-250 active:scale-[0.98]"
            >
              Student Portal 🚪 (स्टूडेंट पैनल)
            </button>
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#B89742] to-[#D4AF37] text-[#1E2022] rounded-xl text-center font-extrabold shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
