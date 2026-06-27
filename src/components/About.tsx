import React from 'react';
import { ShieldCheck, Wifi, Utensils, BookOpen, Layers } from 'lucide-react';

export default function About() {
  const cards = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#FF6B35]" />,
      title: "100% Safe & Secure",
      description: "Equipped with 24/7 CCTV cameras, gate access control, and dedicated security guards to make students feel totally safe."
    },
    {
      icon: <Wifi className="w-6 h-6 text-[#FF6B35]" />,
      title: "High-Speed Internet",
      description: "Uninterrupted 100 Mbps fiber WiFi network covers all corridors, study lounges, and rooms so work/study never pauses."
    },
    {
      icon: <Utensils className="w-6 h-6 text-[#FF6B35]" />,
      title: "Nutritious & Hygienic Meals",
      description: "Daily served fresh, home-style vegetarian breakfast, lunch, and dinner cooked, managed under strict hygiene conditions."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#FF6B35]" />,
      title: "Ideal Study Environment",
      description: "Soundproof common reading halls and study corners designed specifically for competitive exam aspirants."
    }
  ];

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/25 text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-3">About Us</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] tracking-tight mb-4">Why Choose Unity Boys Hostel?</h2>
          <p className="text-gray-500 text-sm sm:text-base">We provide more than just student accommodation — we cook meals with love and build an atmosphere of a warm home.</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((c, i) => (
              <div 
                key={i} 
                className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#FF6B35]/40 hover:-translate-y-1 transition-all duration-350 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="text-base font-bold text-[#1A1A2E] mb-2">{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>

          {/* Right Column: Visual Floor Plan */}
          <div className="bg-[#1A1A2E] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF6B35]/15 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-6 h-6 text-[#FF6B35]" />
              <h3 className="text-xl font-bold">Building Layout Specs</h3>
            </div>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Our building near JECRC College, India Gate, Sanganer, Jaipur is a newly designed multi-floor facility with absolute division of occupancy to maintain proper hygiene and ample space.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-250">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg text-white font-black text-lg flex items-center justify-center">2</div>
                <div>
                  <h4 className="text-sm font-bold">Second Floor</h4>
                  <p className="text-[11px] text-gray-400">11 Premium Rooms (Double sharing & Attached balcony)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-250">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg text-white font-black text-lg flex items-center justify-center">1</div>
                <div>
                  <h4 className="text-sm font-bold">First Floor</h4>
                  <p className="text-[11px] text-gray-400">13 Premium Rooms (Double sharing & Study lounge)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-250">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg text-white font-black text-lg flex items-center justify-center">G</div>
                <div>
                  <h4 className="text-sm font-bold">Ground Floor</h4>
                  <p className="text-[11px] text-gray-400">12 Rooms (Triple sharing, Dining Hall, Warden Room)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
