import React from 'react';
import { 
  Wifi, Zap, Droplets, Camera, Bike, Sparkles, 
  Shirt, BookOpen, HeartPulse, ShieldAlert, Snowflake, Tv 
} from 'lucide-react';

export default function Facilities() {
  const list = [
    { icon: <Wifi className="w-5 h-5" />, title: "WiFi 24/7", desc: "100 Mbps fiber high-speed internet connection." },
    { icon: <Zap className="w-5 h-5" />, title: "Power Backup", desc: "Automatic heavy generators ensure zero dark hours." },
    { icon: <Droplets className="w-5 h-5" />, title: "RO Purified Water", desc: "Dedicated cold RO water dispenser on each floor." },
    { icon: <Camera className="w-5 h-5" />, title: "CCTV Surveillance", desc: "Continuous recording covering lobbies & hallways." },
    { icon: <Bike className="w-5 h-5" />, title: "Safe Vehicle Parking", desc: "Dedicated spacious parking area for bikes & cycles." },
    { icon: <Sparkles className="w-5 h-5" />, title: "Daily Housekeeping", desc: "Regular corridor cleaning, washroom deep sanitization." },
    { icon: <Shirt className="w-5 h-5" />, title: "Self Laundry Units", desc: "Installed top-load washing machines for easy laundry." },
    { icon: <BookOpen className="w-5 h-5" />, title: "Reading Lounges", desc: "Quiet study lounge with proper tube lighting grids." },
    { icon: <HeartPulse className="w-5 h-5" />, title: "24x7 First Aid Box", desc: "Full medical kit, contacts for emergency ambulance." },
    { icon: <ShieldAlert className="w-5 h-5" />, title: "Complete Fire Safety", desc: "Refilled fire extinguishers distributed, fire alarms." },
    { icon: <Snowflake className="w-5 h-5" />, title: "AC Option Rooms", desc: "Air-conditioned rooms available upon direct request." },
    { icon: <Tv className="w-5 h-5" />, title: "Entertainment Hall", desc: "Spacious dining hall with LED satellite TV." }
  ];

  return (
    <section id="facilities" className="py-24 bg-gradient-to-b from-[#1A1A2E] to-[#0F3460] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-3">Amenities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Complete Premium Facilities Suite</h2>
          <p className="text-gray-400 text-sm sm:text-base">Everything you need for a comfortable stay and outstanding focus is fully arranged within our campus.</p>
        </div>

        {/* Grid Setup */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((item, id) => (
            <div 
              key={id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6B35]/45 hover:bg-[#FF6B35]/10 transform transition duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] mb-4">
                {item.icon}
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
