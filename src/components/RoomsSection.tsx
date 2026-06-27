import React from 'react';
import { User, Users, Check, Flame } from 'lucide-react';

interface RoomsSectionProps {
  onScrollTo: (id: string) => void;
}

export default function RoomsSection({ onScrollTo }: RoomsSectionProps) {
  const roomTypes = [
    {
      title: "Double Sharing",
      badge: "Most Balanced",
      featured: true,
      icon: <Users className="w-7 h-7 text-[#FF6B35]" />,
      desc: "Spacious premium room shared with one companion. Perfectly blends social life and student economy.",
      features: [
        "2 Independent Beds & Mattresses",
        "Individual Study Desks & Closets",
        "Shared Bathroom facilities",
        "Air Cooling / Fan ventilation",
        "High-Speed High-bandwidth WiFi"
      ],
      price: "₹7,500"
    },
    {
      title: "Triple Sharing",
      badge: "Budget Friendly",
      featured: false,
      icon: <Users className="w-7 h-7 text-gray-700 opacity-80" />,
      desc: "Economical large space shared with two roommates. Affordable, lively, and highly resource-conscious.",
      features: [
        "3 Beds with dedicated closets",
        "Compact study panels & shelves",
        "Common Shared Washrooms",
        "Great ventilation & dual ceiling fans",
        "RO Water & standard supplies"
      ],
      price: "₹7,000"
    }
  ];

  return (
    <section id="rooms" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-3">Our Rooms</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] tracking-tight mb-4">Choose Your Room Sharing Option</h2>
          <p className="text-gray-500 text-sm sm:text-base">We provide beautifully furnished, well-ventilated rooms designed specifically for structural workflow and comfortable living.</p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roomTypes.map((room, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between ${
                room.featured
                  ? 'bg-gradient-to-b from-[#1A1A2E] to-[#0F3460] text-white border-[#FF6B35] shadow-xl shadow-[#1A1A2E]/25 scale-[1.03] lg:scale-[1.05]'
                  : 'bg-white text-gray-800 border-gray-100 hover:border-[#FF6B35]/35 hover:shadow-lg shadow-sm'
              }`}
            >
              {room.featured && (
                <div className="absolute top-0 left-1/3 -translate-y-1/2 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {room.badge}
                </div>
              )}

              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${room.featured ? 'bg-white/10' : 'bg-gray-100'}`}>
                    {room.icon}
                  </div>
                  {!room.featured && (
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                      {room.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-extrabold mb-2 tracking-tight">{room.title}</h3>
                <p className={`text-xs leading-relaxed mb-6 ${room.featured ? 'text-gray-300' : 'text-gray-500'}`}>{room.desc}</p>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {room.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                      <span className={room.featured ? 'text-gray-200' : 'text-gray-700'}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing & Booking Button */}
              <div className="pt-6 border-t border-dashed border-gray-100/20">
                <div className="flex items-baseline justify-between mb-4">
                  <span className={`text-xs ${room.featured ? 'text-gray-400' : 'text-gray-500'}`}>Starting from</span>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${room.featured ? 'text-[#FF6B35]' : 'text-gray-900'}`}>{room.price}</span>
                    <span className={`text-[10px] block ${room.featured ? 'text-gray-400' : 'text-gray-500'}`}>/ month (+ GST)</span>
                  </div>
                </div>
                <button
                  onClick={() => onScrollTo('contact')}
                  className={`w-full py-3.5 rounded-xl text-center font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer ${
                    room.featured
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95'
                      : 'bg-gray-100 hover:bg-[#FF6B35] hover:text-white text-gray-800 hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  Book Secure Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
