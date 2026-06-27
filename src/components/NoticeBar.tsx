import React from 'react';
import { Megaphone } from 'lucide-react';

export default function NoticeBar() {
  return (
    <div className="bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white py-3 px-4 flex items-center gap-3 overflow-hidden shadow-md">
      <Megaphone className="w-5 h-5 flex-shrink-0 animate-bounce" />
      <div className="relative flex overflow-x-hidden w-full font-medium text-sm">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-sm md:text-base">
          <span>🏠 Admissions Open for 2026-27 session! Special discounts on early-bird reservations.</span>
          <span>📞 Call/WhatsApp: +91 82096 96820, +91 95215 12224 for direct enquiries.</span>
          <span>🔥 Limited beds available! Double and Triple sharing premium rooms in Jaipur, Rajasthan.</span>
          <span>✅ High-speed WiFi (100 Mbps), tasty home-style meals, 24/7 security, power backup included.</span>
        </div>
      </div>
    </div>
  );
}
