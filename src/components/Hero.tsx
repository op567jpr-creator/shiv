import React, { useState, useEffect } from 'react';
import { Phone, UserCheck, Shield, Star, Award, Volume2, FileText, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HostelSettings } from '../types';

interface HeroProps {
  onScrollTo: (id: string) => void;
  onOpenLogin: () => void;
  onOpenDuesLookup: () => void;
  onOpenSelfRegistration: () => void;
  settings?: HostelSettings;
}

export default function Hero({ onScrollTo, onOpenLogin, onOpenDuesLookup, onOpenSelfRegistration, settings }: HeroProps) {
  // Extract background banner images list
  const bannerImages = settings?.adBannerUrls && settings.adBannerUrls.length > 0
    ? settings.adBannerUrls
    : (settings?.adBannerUrl ? [settings.adBannerUrl] : []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfName, setViewingPdfName] = useState<string>('');

  // Auto-rotate the background slide show every 5 seconds
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const hasBackgroundSlides = bannerImages.length > 0;
  const activeSlideUrl = bannerImages[activeIndex];
  const isActiveSlidePdf = activeSlideUrl && (activeSlideUrl.startsWith('data:application/pdf') || activeSlideUrl.endsWith('.pdf') || activeSlideUrl.includes('application/pdf'));

  return (
    <section 
      id="home" 
      className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16 overflow-hidden transition-all duration-1000 bg-gradient-to-b from-[#1E2022] to-[#121314]"
    >
      {/* 🖼️ Premium Full-Backdrop Slideshow (मल्टीपल फोटो बैकग्राउंड स्लाइडर) */}
      {hasBackgroundSlides && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Dark Professional Gradient Overlays for High Contrast Readability */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/35 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#121314]/90 z-10"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/15 to-black/60 z-10"></div>
          
          {bannerImages.map((imgUrl, idx) => {
            const isPdf = imgUrl && (imgUrl.startsWith('data:application/pdf') || imgUrl.endsWith('.pdf') || imgUrl.includes('application/pdf'));
            return (
              <div 
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                  idx === activeIndex 
                    ? 'opacity-100 scale-105 rotate-0' 
                    : 'opacity-0 scale-100 rotate-1'
                }`}
              >
                {isPdf ? (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative">
                    <iframe 
                      src={`${imgUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                      title={`Hostel Background PDF Slide ${idx + 1}`}
                      className="w-full h-full border-0 select-none opacity-85"
                    />
                    <div className="absolute inset-0 bg-slate-950/5 pointer-events-none"></div>
                  </div>
                ) : (
                  <img 
                    src={imgUrl} 
                    alt={`Hostel Background Slide ${idx + 1}`} 
                    className="w-full h-full object-cover select-none filter brightness-[0.95] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decorative ambient blobs (only visible when not using background slides to prevent clutter) */}
      {!hasBackgroundSlides && (
        <>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        </>
      )}

      {/* 📄 Floating helper button for PDF background slides */}
      {hasBackgroundSlides && isActiveSlidePdf && (
        <div className="absolute bottom-6 right-6 z-30 animate-bounce">
          <button
            type="button"
            onClick={() => {
              setViewingPdfUrl(activeSlideUrl);
              setViewingPdfName(`Hostel Slide Document #${activeIndex + 1}`);
              setShowPdfViewer(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xs uppercase cursor-pointer border border-amber-400"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>Read Background PDF 👁️</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* 📢 Custom Interactive Announcement Caption Badge */}
        {settings?.showAdBanner && (settings?.adBannerText || settings?.adBannerPdfUrl) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8 max-w-3xl mx-auto rounded-2xl sm:rounded-full bg-gradient-to-r from-amber-500/20 via-slate-950/95 to-amber-500/20 hover:from-amber-500/25 hover:via-slate-950 hover:to-amber-500/25 border-2 border-amber-400/60 p-3.5 sm:py-3 sm:px-6 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-200 text-sm font-bold tracking-wide leading-tight group transition-all duration-350"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <Volume2 className="w-5 h-5 text-amber-400 animate-bounce group-hover:scale-125 transition shrink-0" />
              <div className="text-left">
                <span className="uppercase tracking-widest text-[10px] font-black text-amber-400 block sm:inline-block sm:mr-2">Important Notice:</span>
                <span className="text-white text-xs sm:text-sm font-black leading-snug">
                  {settings.adBannerText || "Special announcement or digital brochure is active!"}
                </span>
              </div>
            </div>
            
            {settings.adBannerPdfUrl && (
              <button 
                type="button"
                onClick={() => {
                  setViewingPdfUrl(settings.adBannerPdfUrl || null);
                  setViewingPdfName(settings.adBannerPdfName || "Notice Bulletin / Brochure");
                  setShowPdfViewer(true);
                }}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-amber-400 to-amber-550 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-xs uppercase shrink-0 border border-amber-300 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View Notice PDF 👁️
              </button>
            )}
          </motion.div>
        )}

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-xs"
        >
          <Star className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
          <span>Jaipur's Premium Boys Hostel</span>
          <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-md"
        >
          Your Home Away <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B89742] to-[#D4AF37]">
            From Home
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-lg text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-semibold bg-black/20 md:bg-transparent p-3 md:p-0 rounded-2xl backdrop-blur-xs"
        >
          Experience comfortable, safe & highly affordable living at Unity Boys Hostel. Modern facilities, delicious hygiene meals, and a peaceful study environment.
        </motion.p>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mb-14"
        >
          <button
            onClick={onOpenDuesLookup}
            className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FB5A18] text-white rounded-xl font-extrabold hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer border border-[#FF6B35]"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            Student Portal 🚪 (स्टूडेंट पैनल)
          </button>
          <button
            onClick={() => onScrollTo('contact')}
            className="px-8 py-4 bg-gradient-to-r from-[#B89742] to-[#D4AF37] text-[#1E2022] rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            Enquire Now
          </button>
          <button
            onClick={onOpenLogin}
            className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
          >
            <UserCheck className="w-5 h-5 text-[#D4AF37]" />
            Go to Admin Dashboard
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
        >
          <div className="flex flex-col items-center p-3 border-r border-white/10 last:border-0 max-sm:border-r-0 max-sm:border-b max-sm:pb-4 max-sm:odd:border-r animate-fade-in">
            <span className="text-3xl font-extrabold text-[#D4AF37]">90+</span>
            <span className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-semibold">Total Beds Available</span>
          </div>
          <div className="flex flex-col items-center p-3 border-r border-white/10 last:border-0 max-sm:border-r-0 max-sm:border-b max-sm:pb-4 max-sm:even:border-l-0">
            <span className="text-3xl font-extrabold text-[#D4AF37]">36</span>
            <span className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-semibold">Spacious Rooms</span>
          </div>
          <div className="flex flex-col items-center p-3 border-r border-white/10 last:border-0 max-sm:border-r-0 max-sm:pt-4 max-sm:odd:border-r">
            <span className="text-3xl font-extrabold text-[#D4AF37]">3</span>
            <span className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-semibold">Floors of Space</span>
          </div>
          <div className="flex flex-col items-center p-3 last:border-0 max-sm:pt-4">
            <span className="text-3xl font-extrabold text-[#D4AF37] flex items-center gap-1">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              24/7
            </span>
            <span className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-semibold">CCTV & security guard</span>
          </div>
        </motion.div>
      </div>

      {/* 📄 Elegant Inline Interactive PDF Viewer Modal */}
      <AnimatePresence>
        {showPdfViewer && (viewingPdfUrl || settings?.adBannerPdfUrl) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => {
              setShowPdfViewer(false);
              setViewingPdfUrl(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <FileText className="w-5 h-5" />
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white uppercase">
                      {viewingPdfName || settings?.adBannerPdfName || "Notice Bulletin / Brochure"}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono block">Interactive Background Document Viewer</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfViewer(false);
                    setViewingPdfUrl(null);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PDF Content Area */}
              <div className="flex-1 bg-slate-950 relative p-1">
                <iframe
                  src={`${viewingPdfUrl || settings?.adBannerPdfUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0 rounded-b-xl"
                  title="Hostel Notice Board Document"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
