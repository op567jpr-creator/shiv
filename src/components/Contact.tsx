import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Mail, Send } from 'lucide-react';

interface ContactProps {
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function Contact({ onShowToast }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    roomType: 'Select Type',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      onShowToast('Please fill in Name and Mobile fields! ⚠️', true);
      return;
    }
    onShowToast('Message sent! Our warden will contact you soon. ✅');
    setFormData({
      name: '',
      mobile: '',
      email: '',
      roomType: 'Select Type',
      message: ''
    });
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-3">Reach Us</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] tracking-tight mb-4">Start Your Comfortable Journey</h2>
          <p className="text-gray-500 text-sm sm:text-base">Have any questions about the rooms, food, or payment schedules? Feel free to write our desk.</p>
        </div>

        {/* Form and info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact details */}
          <div className="space-y-6">
            <a 
              href="https://share.google/IUUPX78fyREsSEvbp" 
              target="_blank" 
              rel="noreferrer"
              className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#FF6B35]/35 flex items-start gap-4 transition duration-200 block"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A2E] mb-1">Our Hostel Address</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Near JECRC College, India Gate, Sanganer,<br />
                  Jaipur, Rajasthan - 302033
                </p>
                <span className="text-[10px] text-[#FF6B35] font-semibold tracking-wider uppercase mt-1 block">Tap to open in Google Maps 📍</span>
              </div>
            </a>

            {/* Interactive Map Embed */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:border-[#FF6B35]/35 transition duration-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-black text-[#1A1A2E] bg-[#1A1A2E]/5 px-2 py-0.5 rounded-md uppercase tracking-wider">Hostel Live Location</span>
                </div>
                <a 
                  href="https://share.google/IUUPX78fyREsSEvbp"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-[#FF6B35] hover:underline flex items-center gap-1"
                >
                  View Large Map ↗
                </a>
              </div>
              <div className="h-56 relative bg-gray-100">
                <iframe
                  title="Unity Boys Hostel Location Map"
                  src="https://maps.google.com/maps?q=Near%20JECRC%20College,%20India%20Gate,%20Sanganer,%20Jaipur&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                ></iframe>
              </div>
              <div className="p-4 bg-gray-50/50 text-[11px] text-gray-500 leading-normal flex items-center justify-between">
                <span className="font-medium">📍 Sanganer, Near JECRC College, Jaipur</span>
                <a 
                  href="https://share.google/IUUPX78fyREsSEvbp"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#FF6B35] hover:bg-[#e55a24] text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col gap-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A2E] mb-1">Admission Helpdesk (Phone)</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="hover:text-[#FF6B35] transition font-semibold"><a href="tel:+918209696820">+91 82096 96820</a></p>
                    <p className="hover:text-[#FF6B35] transition font-semibold"><a href="tel:+919521512224">+91 95215 12224</a></p>
                  </div>
                  <span className="text-[10px] text-[#FF6B35] font-semibold tracking-wider uppercase mt-1 block">Tap to call our desk</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col gap-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] flex-shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A2E] mb-1">Chat on WhatsApp</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="hover:text-emerald-500 transition font-semibold">
                      <a href="https://wa.me/918209696820?text=I%20am%20interested%20in%20room%20booking" target="_blank" rel="noreferrer">+91 82096 96820</a>
                    </p>
                    <p className="hover:text-emerald-500 transition font-semibold">
                      <a href="https://wa.me/919521512224?text=I%20am%20interested%20in%20room%20booking" target="_blank" rel="noreferrer">+91 95215 12224</a>
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase mt-1 block">Instant Response</span>
                </div>
              </div>
            </div>

            <a 
              href="mailto:unityhosteljpr@gmail.com" 
              className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#FF6B35]/35 flex items-start gap-4 transition duration-200 block"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A2E] mb-1">Corporate Email</h4>
                <p className="text-xs text-gray-500 font-semibold font-mono">unityhosteljpr@gmail.com</p>
                <span className="text-[10px] text-[#FF6B35] font-semibold tracking-wider uppercase mt-1 block">Tap to send email</span>
              </div>
            </a>
          </div>

          {/* Quick email query form */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-6">Send an Instant Booking Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={formData.mobile} 
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit primary contact"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Desired Sharing Type</label>
                <select 
                  value={formData.roomType} 
                  onChange={e => setFormData({ ...formData, roomType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white cursor-pointer transition"
                >
                  <option>Select Type</option>
                  <option>Double Sharing</option>
                  <option>Triple Sharing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Message / Special Requests</label>
                <textarea 
                  rows={3} 
                  value={formData.message} 
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="When are you looking to move in? Ask any queries..."
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Submit Inquiry Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
