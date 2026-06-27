import React from 'react';
import { Facebook, Instagram, Youtube, Phone, ArrowUpRight, GraduationCap } from 'lucide-react';

const logoImg = "/src/assets/images/unity_hostel_logo_1781847359405.jpg";

interface FooterProps {
  onScrollTo: (id: string) => void;
  onOpenLogin: () => void;
}

export default function Footer({ onScrollTo, onOpenLogin }: FooterProps) {
  return (
    <footer className="bg-[#121314] text-white pt-16 pb-8 border-t border-[#D4AF37]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1 - Brand pitch */}
          <div>
            <div className="flex items-center gap-3 cursor-pointer mb-5" onClick={() => onScrollTo('home')}>
              <img 
                src={logoImg} 
                alt="Unity Hostel Logo" 
                className="w-10 h-10 rounded-full border border-[#D4AF37] object-contain shadow bg-[#1E2022]"
                referrerPolicy="no-referrer"
              />
              <h4 className="text-lg font-bold text-white">Unity Boys Hostel</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Sanganer Jaipur's highly rated luxury budget student hostel, located near JECRC College & India Gate. Engineered for safety, comfort, and deep focus for professional, undergraduate, and competitive aspirants.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-white/5 hover:bg-[#D4AF37] hover:text-[#121314] rounded-lg flex items-center justify-center text-white transition duration-200">
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 hover:bg-[#D4AF37] hover:text-[#121314] rounded-lg flex items-center justify-center text-white transition duration-200">
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 hover:bg-[#D4AF37] hover:text-[#121314] rounded-lg flex items-center justify-center text-white transition duration-200">
                <Youtube className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Col 2 - Quick links */}
          <div>
            <h5 className="text-sm font-bold text-gray-200 tracking-wider uppercase mb-5 pb-2 border-b border-white/5">Website Sitemap</h5>
            <ul className="space-y-3">
              {['home', 'about', 'rooms', 'facilities', 'contact'].map((sect) => (
                <li key={sect}>
                  <button 
                    onClick={() => onScrollTo(sect)}
                    className="text-xs text-gray-400 hover:text-[#D4AF37] transition duration-200 flex items-center gap-1 cursor-pointer capitalize"
                  >
                    <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                    {sect}
                  </button>
                </li>
              ))}
              <li>
                <button 
                  onClick={onOpenLogin}
                  className="text-xs text-[#D4AF37] font-bold hover:underline transition duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  Staff / Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 - Services offered */}
          <div>
            <h5 className="text-sm font-bold text-gray-200 tracking-wider uppercase mb-5 pb-2 border-b border-white/5">Accommodations</h5>
            <ul className="space-y-3 text-xs text-gray-400">
              <li>• Double Sharing Air Cooling Rooms</li>
              <li>• Double Sharing Attached Balcony Suite</li>
              <li>• Triple Sharing Budget Room</li>
              <li>• AC executive rooms (On request)</li>
              <li>• Multi-meal vegetarian Mess service</li>
              <li>• Daily washroom sanitization sweep</li>
            </ul>
          </div>

          {/* Col 4 - Direct timings */}
          <div>
            <h5 className="text-sm font-bold text-gray-200 tracking-wider uppercase mb-5 pb-2 border-b border-white/5">Helpdesk timelines</h5>
            <ul className="space-y-3.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Call 24/7 Helpline</p>
                  <p className="text-[11px] text-gray-400">+91 82096 96820, +91 95215 12224</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Warden Gate Closing</p>
                  <p className="text-[11px] text-gray-400">Daily sharp 10:00 PM</p>
                </div>
              </li>
              <li className="text-[11px] text-gray-500 leading-relaxed pt-2">
                Visiting hours for family/guests are allowed between 10:00 AM - 6:00 PM upon proper register logging.
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Bottom alignment */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 text-xs text-gray-500">
          <p>© 2026 Unity Boys Hostel, Near JECRC College, Sanganer, Jaipur. All Rights Reserved.</p>
          <p>
            Made with <span className="text-[#D4AF37] font-bold">♥</span> for Students & competitive aspirants.
          </p>
        </div>
      </div>
    </footer>
  );
}
