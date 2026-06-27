import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowLeft, Copy, Check, ExternalLink, 
  AlertCircle, Calendar, User, Eye, QrCode, ClipboardList,
  Utensils, Receipt, Hammer, Clock, Sparkles, Printer,
  UserCheck, MapPin, ShieldAlert, CheckSquare, Award, CheckCircle2, ChevronRight, HelpCircle,
  FileText, Upload, Trash2, Download, X
} from 'lucide-react';
import { Student, HostelSettings, Payment, Complaint, MessMenu, MessMenuItem } from '../types';
import { downloadBase64File } from '../utils/download';

interface StudentFeeDuesLookupProps {
  students: Student[];
  payments: Payment[];
  complaints: Complaint[];
  settings: HostelSettings;
  onAddComplaint: (fields: { studentId: number; type: any; priority: any; description: string }) => void;
  onUpdateStudent: (updated: Student) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onGoBack: () => void;
}

const DEFAULT_MENU_FALLBACK: MessMenu = {
  timings: {
    breakfast: '8.00 AM TO 9.00 AM',
    lunch: '11.30 AM TO 1.30 PM',
    dinner: '7.30 PM TO 9.00 PM'
  },
  compulsory: {
    lunch: 'सादा रोटी, सिजनेबल सब्जी',
    dinner: 'सादा रोटी'
  },
  days: {
    Monday: { breakfast: 'प्याज पराठा 2 पिस', lunch: 'मिक्स दाल', dinner: 'सेव टमाटर, दाल, जीरा राईस' },
    Tuesday: { breakfast: 'नमकीन चावल', lunch: 'चने की दाल', dinner: 'कढ़ी, जीरा आलू, राईस' },
    Wednesday: { breakfast: 'आलु पराठा 2 पिस', lunch: 'मसूर की दाल', dinner: 'चोलाई, जीरा राईस' },
    Thursday: { breakfast: 'पास्ता', lunch: 'मुंग की दाल', dinner: 'आलू छोला, राईस' },
    Friday: { breakfast: 'दलिया उपमा', lunch: 'अरहर की दाल', dinner: 'राजमा, राईस' },
    Saturday: { breakfast: 'पोहा', lunch: 'मिक्स दाल', dinner: 'बेसन गटा, जीरा राईस' },
    Sunday: { breakfast: 'चाय', lunch: 'तुर दाल', dinner: 'सण्डे स्पेशल' }
  },
  sundaySpecialNote: 'Sunday स्पेशल में बनने वाला भोजन - पनीर, छोले कुलचे, पूरी, छोले भटूरे, सेवैया खीर, सूजी हलवा, चावल खीर'
};

export default function StudentFeeDuesLookup({ 
  students, 
  payments, 
  complaints, 
  settings, 
  onAddComplaint, 
  onUpdateStudent,
  onShowToast, 
  onGoBack 
}: StudentFeeDuesLookupProps) {
  // Input fields
  const [searchName, setSearchName] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [searchMotherName, setSearchMotherName] = useState('');
  const [searchDob, setSearchDob] = useState('');
  const [searchPassword, setSearchPassword] = useState('');

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Portal States
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Student Portal tab
  // 'dashboard' | 'mess' | 'ledger' | 'complaints' | 'documents' | 'security'
  const [portalTab, setPortalTab] = useState<'dashboard' | 'mess' | 'ledger' | 'complaints' | 'documents' | 'security'>('dashboard');

  // Interactive payment
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // New Complaint state in student dashboard
  const [complaintType, setComplaintType] = useState<'WiFi' | 'Electricity' | 'Plumbing' | 'Cleaning' | 'Other'>('WiFi');
  const [complaintPriority, setComplaintPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfName, setViewingPdfName] = useState<string>('');

  // Handle student login / verification
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSearchError(null);
    setMatchedStudent(null);

    // Global Portal Live check
    if (settings.isStudentPortalLive === false) {
      setSearchError('स्टूडेंट पोर्टल वर्तमान में एडमिन द्वारा बंद (Maintenance Mode) किया गया है। 🚪');
      return;
    }

    if (!searchName.trim() || !searchMobile.trim() || !searchMotherName.trim() || !searchDob.trim()) {
      setSearchError('कृपया सभी 4 विवरण (नाम, मोबाइल नंबर, माता का नाम, और जन्म तिथि) दर्ज करें।');
      return;
    }

    const normSearchName = searchName.toLowerCase().replace(/\s+/g, '');
    const normSearchMobile = searchMobile.replace(/\D/g, '');
    const normSearchMotherName = searchMotherName.toLowerCase().replace(/\s+/g, '');

    const found = students.find(s => {
      if (!s.name || !s.mobile || !s.motherName || !s.dob) {
        return false;
      }

      const studentNameNorm = s.name.toLowerCase().replace(/\s+/g, '');
      const studentMobileNorm = s.mobile.replace(/\D/g, '');
      const studentFatherMobNorm = s.fatherMob ? s.fatherMob.replace(/\D/g, '') : '';
      const studentMotherNorm = s.motherName.toLowerCase().replace(/\s+/g, '');
      
      const isNameMatch = studentNameNorm.includes(normSearchName) || normSearchName.includes(studentNameNorm);
      const isMobileMatch = studentMobileNorm.includes(normSearchMobile) || 
                            studentFatherMobNorm.includes(normSearchMobile) ||
                            normSearchMobile.includes(studentMobileNorm);
      const isMotherMatch = studentMotherNorm.includes(normSearchMotherName) || normSearchMotherName.includes(studentMotherNorm);
      const isDobMatch = s.dob === searchDob;

      return isNameMatch && isMobileMatch && isMotherMatch && isDobMatch;
    });

    if (found) {
      // 1. Check if specific student is blocked
      if (found.portalBlocked) {
        setSearchError('आपका स्टूडेंट पोर्टल एक्सेस एडमिन द्वारा ब्लॉक/सस्पेंड किया गया है। कृपया वार्डन से संपर्क करें। ❌');
        return;
      }

      // 2. Check password if password is set on record
      if (found.portalPassword && found.portalPassword.trim() !== '') {
        if (!searchPassword.trim()) {
          setSearchError('इस अकाउंट के लिए पासवर्ड सेट है। कृपया पासवर्ड भी दर्ज करें। 🔑');
          return;
        }
        if (found.portalPassword !== searchPassword) {
          setSearchError('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें। (Incorrect Password) ❌');
          return;
        }
      }

      setMatchedStudent(found);
      setCustomAmount(found.due > 0 ? found.due.toString() : found.fee.toString());
      setPortalTab('dashboard');
      onShowToast(`Welcome back, ${found.name}! 👋`);
    } else {
      setSearchError(
        'रिकॉर्ड नहीं मिला! कृपया सुनिश्चित करें कि नाम, मोबाइल नंबर, माता का नाम, और जन्म तिथि चारों बिलकुल सही हैं।'
      );
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upi || 'gpay-12189467181@okbizaxis');
    setCopiedUpi(true);
    onShowToast('Official UPI ID Copied! 📋');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getWhatsAppReceiptURL = () => {
    if (!matchedStudent) return '';
    const amountPaid = customAmount || matchedStudent.due || matchedStudent.fee;
    const text = `Hello Unity Boys Hostel Warden,\n\nI have completed my UPI Hostel fee payment of ₹${amountPaid} for:\n*Student:* ${matchedStudent.name}\n*Room Number:* Room #${matchedStudent.room || 'Pending'}\n*Registered Mobile:* ${matchedStudent.mobile}\n\nAttached is my payment transaction snapshot for reference. Please inspect and approve my receipt. Thank you!`;
    const cleanPhone = settings.phone ? settings.phone.split(',')[0].replace(/\D/g, '') : '8209696820';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // UPI Link generation
  const payAmount = customAmount || (matchedStudent ? matchedStudent.due.toString() : '');
  const upiUrl = `upi://pay?pa=${settings.upi || 'gpay-12189467181@okbizaxis'}&pn=${encodeURIComponent(settings.upiPayeeName || 'Unity Boys Hostel')}&am=${payAmount}&cu=INR&tn=Hostel-Fee-${matchedStudent?.name.replace(/\s+/g, '-')}`;

  // Log Out from Student Portal
  const handleLogout = () => {
    setMatchedStudent(null);
    setHasSearched(false);
    setSearchName('');
    setSearchMobile('');
    setSearchMotherName('');
    setSearchDob('');
    setSearchPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    onShowToast('Logged out of Student Portal 🔐');
  };

  // Submit Complaint from Student Portal
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedStudent) return;
    if (!complaintDesc.trim()) {
      onShowToast('कृपया शिकायत विवरण दर्ज करें (Please write description)', true);
      return;
    }

    onAddComplaint({
      studentId: matchedStudent.id,
      type: complaintType,
      priority: complaintPriority,
      description: complaintDesc
    });

    setComplaintDesc('');
    onShowToast('Complaint filed successfully! Warden will review it. 🛠️');
  };

  // Update Portal password / PIN specifically
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedStudent) return;

    const isLocked = !!settings.blockStudentPasswordChange || !!matchedStudent.blockPasswordChange;
    if (isLocked) {
      onShowToast('आपका पासवर्ड परिवर्तन एडमिन द्वारा लॉक किया गया है। 🔒', true);
      return;
    }

    if (!newPassword.trim()) {
      onShowToast('नया पासवर्ड खाली नहीं हो सकता! ⚠️', true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      onShowToast('दोनों पासवर्ड मेल नहीं खाते! ❌', true);
      return;
    }

    const updated: Student = {
      ...matchedStudent,
      portalPassword: newPassword.trim()
    };
    
    onUpdateStudent(updated);
    setMatchedStudent(updated);
    setNewPassword('');
    setConfirmNewPassword('');
    onShowToast('पासवर्ड सफलतापूर्वक अपडेट किया गया! 🔑');
  };

  // Fetch student payments specifically
  const studentPayments = matchedStudent 
    ? payments.filter(p => p.studentId === matchedStudent.id)
    : [];

  // Fetch student complaints specifically
  const studentComplaints = matchedStudent
    ? complaints.filter(c => c.studentId === matchedStudent.id)
    : [];

  const isDocUploaded = (val?: string) => {
    if (!val) return false;
    return val.startsWith('data:') || val.toLowerCase().includes('received') || val.toLowerCase() === 'yes';
  };

  const docKeys: { key: 'policeVerification' | 'hostelForm' | 'agreementDoc' | 'studentAadhaarDoc' | 'fatherAadhaarDoc'; label: string; labelHi: string }[] = [
    { key: 'policeVerification', label: 'Police Verification', labelHi: 'पुलिस सत्यापन पत्र' },
    { key: 'hostelForm', label: 'Hostel Admission Form', labelHi: 'हॉस्टल प्रवेश फॉर्म' },
    { key: 'agreementDoc', label: 'Lease Stay Agreement', labelHi: 'एग्रीमेंट पत्र / डीड' },
    { key: 'studentAadhaarDoc', label: 'Student Aadhaar Card', labelHi: 'स्वयं का आधार कार्ड' },
    { key: 'fatherAadhaarDoc', label: "Father's Aadhaar Card", labelHi: 'पिता का आधार कार्ड' }
  ];

  const handlePortalDocUpload = (fieldName: 'policeVerification' | 'hostelForm' | 'agreementDoc' | 'studentAadhaarDoc' | 'fatherAadhaarDoc', file: File | null) => {
    if (!matchedStudent) return;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("File size must be less than 2MB! ⚠️", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated: Student = {
          ...matchedStudent,
          [fieldName]: reader.result as string
        };
        onUpdateStudent(updated);
        setMatchedStudent(updated);
        onShowToast("दस्तावेज सफलतापूर्वक अपलोड किया गया! 📂");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortalDocRemove = (fieldName: 'policeVerification' | 'hostelForm' | 'agreementDoc' | 'studentAadhaarDoc' | 'fatherAadhaarDoc') => {
    if (!matchedStudent) return;
    const updated: Student = {
      ...matchedStudent,
      [fieldName]: 'Pending'
    };
    onUpdateStudent(updated);
    setMatchedStudent(updated);
    onShowToast("दस्तावेज हटा दिया गया! 🗑️");
  };

  const uploadedDocsCount = matchedStudent 
    ? docKeys.filter(d => isDocUploaded(matchedStudent[d.key])).length
    : 0;

  const activeMessMenu: MessMenu = settings.messMenu && typeof settings.messMenu === 'object' && settings.messMenu.days
    ? settings.messMenu
    : DEFAULT_MENU_FALLBACK;

  const daysList: Array<keyof MessMenu['days']> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const daysHindi: Record<string, string> = {
    Monday: 'सोमवार',
    Tuesday: 'मंगलवार',
    Wednesday: 'बुधवार',
    Thursday: 'गुरुवार',
    Friday: 'शुक्रवार',
    Saturday: 'शनिवार',
    Sunday: 'रविवार'
  };

  // Print transaction voucher
  const handlePrintVoucher = (p: Payment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onShowToast('Print blocked. Please allow popups! ⚠️', true);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt Voucher #${p.receipt}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+Devanagari:wght@400;700;900&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1a1a2e;
            background-color: #ffffff;
          }
          .receipt-box {
            border: 2px solid #1a1a2e;
            padding: 24px;
            max-width: 580px;
            margin: 0 auto;
            border-radius: 12px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #ddd;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .hostel-title {
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .header p {
            margin: 2px 0;
            font-size: 11px;
            color: #666;
          }
          .voucher-title {
            font-size: 14px;
            font-weight: 800;
            background: #1a1a2e;
            color: white;
            display: inline-block;
            padding: 4px 14px;
            border-radius: 4px;
            margin-top: 10px;
            letter-spacing: 0.5px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .label {
            color: #666;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
          }
          .value {
            font-weight: 700;
            color: #111;
          }
          .total-section {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 25px;
          }
          .total-amount {
            font-size: 24px;
            font-weight: 900;
            color: #1a1a2e;
          }
          .footer {
            border-top: 1px solid #edf2f7;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #a0aec0;
          }
          .stamp {
            border: 3px double #38a169;
            color: #38a169;
            font-weight: 900;
            font-size: 11px;
            padding: 4px 8px;
            display: inline-block;
            transform: rotate(-5deg);
            border-radius: 4px;
            margin-top: 10px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body onload="window.print()">
        <div class="receipt-box">
          <div class="header">
            <h1 class="hostel-title">${settings.name}</h1>
            <p>${settings.address}</p>
            <p>Phone: ${settings.phone} | Email: ${settings.email}</p>
            <div class="voucher-title">OFFICIAL FEE RECEIPT (रसीद)</div>
          </div>

          <div class="grid">
            <div>
              <span class="label">Receipt Number</span>
              <span class="value">#${p.receipt}</span>
            </div>
            <div>
              <span class="label">Payment Date</span>
              <span class="value">${p.date}</span>
            </div>
            <div>
              <span class="label">Student Name</span>
              <span class="value">${p.studentName}</span>
            </div>
            <div>
              <span class="label">Father Name</span>
              <span class="value">${p.fatherName || matchedStudent?.father || 'N/A'}</span>
            </div>
            <div>
              <span class="label">Room / Bed</span>
              <span class="value">Room ${p.room}</span>
            </div>
            <div>
              <span class="label">Transaction Month</span>
              <span class="value">${p.month}</span>
            </div>
            <div>
              <span class="label">Payment Mode</span>
              <span class="value">${p.mode}</span>
            </div>
            <div>
              <span class="label">Payment Status</span>
              <div><span class="stamp">PAID & VERIFIED</span></div>
            </div>
          </div>

          <div class="total-section">
            <span class="label">Total Amount Paid</span>
            <div class="total-amount">₹${p.amount.toLocaleString('en-IN')}</div>
          </div>

          <div class="footer">
            Thank you for staying with us! &bull; Autogenerated by ${settings.name} Student Portal
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#121315] text-white selection:bg-[#FF6B35]/20 font-sans pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Portal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
          <button 
            onClick={onGoBack}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition duration-200 uppercase tracking-widest focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-[#D4AF37]" />
            Exit Student Portal (बाहर जाएं)
          </button>
          
          {matchedStudent && (
            <button
              onClick={handleLogout}
              className="py-1.5 px-3.5 bg-red-950/40 hover:bg-red-900 border border-red-500/30 rounded-xl text-red-200 text-xs font-bold transition cursor-pointer"
            >
              🔐 Log Out ({matchedStudent.name.split(' ')[0]})
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!matchedStudent ? (
            /* ==================== SECURE LOGIN SCREEN ==================== */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-3">
                  🔐 STUDENT ACCESS PORTAL
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Student Portal <span className="text-[#D4AF37] font-black block mt-1 font-sans underline decoration-[#FF6B35]/50">(स्टूडेंट पैनल)</span>
                </h2>
                <p className="text-gray-400 text-xs mt-2.5 leading-relaxed">
                  सुरक्षा कारणों से, कृपया नीचे दिए गए चारों विवरण भरें ताकि आप अपना फीस लेजर, रसीद, लाइव मेस मेनू और शिकायत डैशबोर्ड एक्सेस कर सकें।
                </p>
              </div>

              <div className="bg-[#1E2021] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl shadow-black/45 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Student Full Name (विद्यार्थी का नाम) <span className="text-[#FF6B35]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        className="w-full bg-[#161718] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Registered Mobile Number (मोबाइल नंबर) <span className="text-[#FF6B35]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-500 font-mono">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10 digit mobile number"
                        value={searchMobile}
                        onChange={e => setSearchMobile(e.target.value)}
                        className="w-full bg-[#161718] border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono font-semibold focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Mother's Name (माता का नाम) <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suman Devi"
                      value={searchMotherName}
                      onChange={e => setSearchMotherName(e.target.value)}
                      className="w-full bg-[#161718] border border-slate-700 rounded-xl py-2.5 px-4 text-xs font-semibold focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Date of Birth (जन्म तिथि) <span className="text-[#FF6B35]">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute right-3.5 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={searchDob}
                        onChange={e => setSearchDob(e.target.value)}
                        className="w-full bg-[#161718] border border-slate-700 rounded-xl py-2.5 px-4 text-xs font-sans font-semibold focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Password / PIN (पासवर्ड या पिन - यदि सेट किया हो)
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank if not set (नहीं सेट किया तो खाली छोड़ें)"
                      value={searchPassword}
                      onChange={e => setSearchPassword(e.target.value)}
                      className="w-full bg-[#161718] border border-slate-700 rounded-xl py-2.5 px-4 text-xs font-semibold focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition duration-200"
                    />
                    <span className="text-[9px] text-gray-500 mt-1 block leading-tight">
                      यदि आपने एडमिन पैनल या प्रोफाइल से पासवर्ड सेट किया है, तो दर्ज करें। अन्यथा खाली छोड़ें।
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-gradient-to-r from-[#B89742] to-[#D4AF37] text-[#1E2022] font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    Verify and Enter Portal (प्रवेश करें)
                  </button>
                </form>

                {searchError && (
                  <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-semibold">{searchError}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ==================== LOGGED IN STUDENT PORTAL ==================== */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Profile Bar Card */}
              <div className="bg-[#1E2021] rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 py-1.5 px-4 bg-[#FF6B35] text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
                  {matchedStudent.status} Resident
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest block mb-1">
                      Welcome, Lodger
                    </span>
                    <h3 className="text-2xl font-black text-white leading-none mb-1.5">{matchedStudent.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                      Room #{matchedStudent.room || '--'} &bull; Bed {matchedStudent.bedNumber || 'Allocated'} &bull; ({matchedStudent.sharing} Bedding)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
                    <div className="bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-2xl">
                      <span className="text-[9px] font-black text-gray-500 uppercase block mb-0.5">Rent Plan</span>
                      <span className="text-xs font-black text-gray-200">₹{matchedStudent.fee}/mo</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-2xl">
                      <span className="text-[9px] font-black text-gray-500 uppercase block mb-0.5">Deposit</span>
                      <span className="text-xs font-black text-gray-200">₹{matchedStudent.securityDeposit || 0}</span>
                    </div>
                    <div className="bg-[#34A853]/10 border border-[#34A853]/20 p-2.5 rounded-2xl">
                      <span className="text-[9px] font-black text-[#34A853] uppercase block mb-0.5">Total Paid</span>
                      <span className="text-xs font-black text-[#34A853]">₹{(matchedStudent.paid || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-2xl">
                      <span className="text-[9px] font-black text-rose-400 uppercase block mb-0.5">Dues Pending</span>
                      <span className="text-xs font-black text-rose-400">₹{(matchedStudent.due || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(!matchedStudent.portalPassword || matchedStudent.portalPassword.trim() === '') ? (
                <div className="max-w-md mx-auto bg-[#1E2021] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 my-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black uppercase text-gray-200 tracking-wider">
                      Create Portal Password (पासवर्ड सेटअप करें)
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      सुरक्षा कारणों से, पहली बार लॉगिन करने पर आपको अपना पासवर्ड सेट करना अनिवार्य है। भविष्य में इस पोर्टल में प्रवेश करने के लिए आपको इसी पासवर्ड की आवश्यकता होगी।
                    </p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                          New Password / PIN (नया पासवर्ड या पिन कोड)
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                          placeholder="Choose a secure password"
                          className="w-full p-3 bg-[#161718] border border-slate-700 focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-white outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                          Confirm Password (पासवर्ड दोबारा दर्ज करें)
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          required
                          placeholder="Repeat your password"
                          className="w-full p-3 bg-[#161718] border border-slate-700 focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-white outline-none transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#B89742] to-[#D4AF37] text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Password & Continue (पासवर्ड सुरक्षित करें)
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Portal Navigation Tabs */}
                  <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 select-none">
                <button
                  onClick={() => setPortalTab('dashboard')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-2xl transition duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer border-b-2 ${
                    portalTab === 'dashboard' 
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-slate-800/30' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Fees & QR Pay (फीस एवं भुगतान)
                </button>
                <button
                  onClick={() => setPortalTab('mess')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-2xl transition duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer border-b-2 ${
                    portalTab === 'mess' 
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-slate-800/30' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  Mess Menu (मैस मेनू)
                </button>
                <button
                  onClick={() => setPortalTab('ledger')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-2xl transition duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer border-b-2 ${
                    portalTab === 'ledger' 
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-slate-800/30' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  My Receipts ({studentPayments.length})
                </button>
                <button
                  onClick={() => setPortalTab('complaints')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-2xl transition duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer border-b-2 ${
                    portalTab === 'complaints' 
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-slate-800/30' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  Room Complaints ({studentComplaints.length})
                </button>
                <button
                  onClick={() => setPortalTab('documents')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-2xl transition duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer border-b-2 ${
                    portalTab === 'documents' 
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-slate-800/30' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Documents ({uploadedDocsCount}/5) 📁
                </button>
                <button
                  onClick={() => setPortalTab('security')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-2xl transition duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer border-b-2 ${
                    portalTab === 'security' 
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-slate-800/30' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800/10'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Portal Password 🔐 (पासवर्ड सेटअप)
                </button>
              </div>

              {/* Tab Contents */}
              <div className="bg-[#161718] border border-slate-800 p-6 sm:p-8 rounded-3xl min-h-[400px]">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: FEES & QR PAY */}
                  {portalTab === 'dashboard' && (
                    <motion.div
                      key="tab-dashboard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                      {/* Full-width Promo/Ad Banner */}
                      {settings?.showAdBanner && settings?.adBannerUrl && (
                        <div className="lg:col-span-12 bg-slate-900/40 border border-amber-500/20 p-2.5 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
                          <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
                            {settings.adBannerUrl.startsWith('data:application/pdf') || settings.adBannerUrl.endsWith('.pdf') || settings.adBannerUrl.includes('application/pdf') ? (
                              <div className="w-full md:w-48 h-28 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center p-2 text-indigo-300">
                                <FileText className="w-8 h-8 text-[#D4AF37] mb-1 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-center truncate w-full px-1">PDF Notice / Document</span>
                              </div>
                            ) : (
                              <img 
                                src={settings.adBannerUrl} 
                                alt="Promotional Banner" 
                                className="w-full md:w-48 h-28 object-cover rounded-2xl border border-slate-800" 
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="text-center md:text-left space-y-1">
                              <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20 text-[9px] uppercase tracking-wider">
                                Announcement / विज्ञापन 📢
                              </span>
                              <h4 className="text-sm font-extrabold text-gray-100 mt-1">
                                {settings.adBannerText || "Special notice from hostel management"}
                              </h4>
                              {(() => {
                                const isBannerPdf = settings.adBannerUrl.startsWith('data:application/pdf') || settings.adBannerUrl.endsWith('.pdf') || settings.adBannerUrl.includes('application/pdf');
                                if (isBannerPdf || settings.adBannerPdfUrl) {
                                  return (
                                    <div className="pt-1.5 flex flex-wrap justify-center md:justify-start gap-2 items-center">
                                      <span className="text-[11px] text-gray-400">
                                        Official notice is active.
                                      </span>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setViewingPdfUrl(isBannerPdf ? settings.adBannerUrl : (settings.adBannerPdfUrl || ''));
                                          setViewingPdfName(isBannerPdf ? "Official Slide Notice" : (settings.adBannerPdfName || "Notice Document"));
                                          setShowPdfViewer(true);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-full text-[10px] uppercase shadow-md hover:scale-105 active:scale-95 transition cursor-pointer border border-amber-400"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        View PDF Notice 👁️
                                      </button>
                                    </div>
                                  );
                                }
                                return (
                                  <p className="text-[11px] text-gray-400">
                                    This banner is configured by the master hostel administration team.
                                  </p>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="hidden md:block pr-4 text-right">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block">Hostel Info</span>
                            <span className="text-xs font-bold text-[#D4AF37]">{settings.name || "Unity Boys Hostel"}</span>
                          </div>
                        </div>
                      )}

                      {/* Left: General instructions and balances info */}
                      <div className="lg:col-span-6 space-y-6">
                        <div className="bg-slate-900/50 p-5 border border-slate-800 rounded-2xl">
                          <h4 className="text-sm font-black text-[#D4AF37] uppercase mb-2">💡 Quick Payment Steps:</h4>
                          <ul className="space-y-2 text-xs text-gray-300 font-medium">
                            <li className="flex items-start gap-2">
                              <span className="text-[#D4AF37] font-black">1.</span>
                              <span>Enter the amount you wish to transfer in the custom field (your outstanding dues amount is selected by default).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#D4AF37] font-black">2.</span>
                              <span>Scan the auto-generated Google Pay card QR Code with any payment app (GPay, PhonePe, Paytm, BHIM).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#D4AF37] font-black">3.</span>
                              <span>Submit your payment transaction, take a screenshot, and click the **"Send Screenshot to Staff/Office"** button to dispatch it directly to Staff WhatsApp line.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Additional student details panel */}
                        <div className="border border-slate-800 rounded-2xl p-5 space-y-4">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Registration Profile details:</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                            <div>
                              <span className="text-gray-500 block text-[9px] font-bold uppercase">Father's Name</span>
                              <span className="font-extrabold text-gray-200">{matchedStudent.father}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] font-bold uppercase">Father Mobile</span>
                              <span className="font-mono text-gray-200 font-extrabold">{matchedStudent.fatherMob || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] font-bold uppercase">Date of Joining</span>
                              <span className="font-mono text-gray-200 font-extrabold">{matchedStudent.joinDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] font-bold uppercase">Emergency Contact</span>
                              <span className="font-mono text-gray-200 font-extrabold">{matchedStudent.emergencyMobile || matchedStudent.fatherMob || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment QR generation card */}
                      <div className="lg:col-span-6 flex flex-col items-center">
                        <div className="bg-[#1E2021] rounded-3xl border-2 border-[#D4AF37] p-6 w-full max-w-[360px] flex flex-col items-center shadow-xl">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[#D4AF37]">⚡</span>
                            <span className="text-[9px] font-black tracking-widest text-[#D4AF37] uppercase">Official Payment Card</span>
                          </div>

                          {/* GPAY STYLE EMBEDDED CONTAINER */}
                          <div className="w-full bg-white rounded-2xl p-4 text-slate-900 flex flex-col items-center">
                            <div className="flex items-center justify-center gap-1.5 mb-3">
                              <span className="text-[14px] font-extrabold tracking-tighter text-[#4285F4]">G</span>
                              <span className="text-[14px] font-extrabold tracking-tighter text-[#EA4335]">o</span>
                              <span className="text-[14px] font-extrabold tracking-tighter text-[#FBBC05]">o</span>
                              <span className="text-[14px] font-extrabold tracking-tighter text-[#4285F4]">g</span>
                              <span className="text-[14px] font-extrabold tracking-tighter text-[#34A853]">l</span>
                              <span className="text-[14px] font-extrabold tracking-tighter text-[#EA4335]">e</span>
                              <span className="text-[13px] font-mono font-black text-slate-700 ml-1 uppercase">Pay</span>
                            </div>

                            <div className="w-full border-t border-slate-200 mb-3"></div>

                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase mb-2">UPI SCAN & PAY</span>

                            {/* Live QR Code Generator */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-center mb-3">
                              <img
                                src={settings.upiQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`}
                                alt="Security Payment QR"
                                className="w-[160px] h-[160px] object-contain rounded-md"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <span className="text-[9px] font-bold text-slate-400 mb-0.5">UPI PAYEE:</span>
                            <span className="text-[11px] font-black text-slate-800 mb-2 truncate max-w-xs">{settings.upiPayeeName || 'Unity Boys Hostel'}</span>

                            <span className="text-[9px] font-mono text-slate-500 bg-slate-100 py-1 px-2 rounded-md break-all text-center w-full max-w-[220px]">
                              {settings.upi || 'gpay-12189467181@okbizaxis'}
                            </span>
                          </div>

                          {/* Interactive Adjuster */}
                          <div className="mt-5 w-full">
                            <label className="block text-[9px] font-black uppercase text-gray-400 text-center mb-1.5">
                              Custom Transfer Amount (₹):
                            </label>
                            <div className="relative max-w-[160px] mx-auto mb-4">
                              <span className="absolute left-3.5 top-1.5 text-xs font-black text-gray-500">₹</span>
                              <input
                                type="number"
                                value={customAmount}
                                onChange={e => setCustomAmount(e.target.value)}
                                className="w-full text-center bg-[#161718] border border-slate-700 rounded-lg py-1 px-4 text-xs font-black text-[#FF6B35] focus:border-[#D4AF37] focus:outline-none"
                              />
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                              <button
                                onClick={handleCopyUpi}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedUpi ? 'UPI ID Copied!' : 'Copy UPI ID'}
                              </button>
                              <a
                                href={getWhatsAppReceiptURL()}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/15"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-white" />
                                Send Screenshot to Staff/Office 💬
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: LIVE MESS MENU */}
                  {portalTab === 'mess' && (
                    <motion.div
                      key="tab-mess"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <h4 className="text-base font-black text-[#D4AF37] flex items-center gap-1.5">
                            <Utensils className="w-5 h-5 text-[#FF6B35]" />
                            MESS MENU (मैस मेनू) - Unity Hostel
                          </h4>
                          <p className="text-xs text-gray-400">Live mess menu schedule configured dynamically by Warden Office</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-300 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800/80">
                          <div>⏰ Breakfast: <span className="text-amber-400">{activeMessMenu.timings.breakfast}</span></div>
                          <div>⏰ Lunch: <span className="text-amber-400">{activeMessMenu.timings.lunch}</span></div>
                          <div>⏰ Dinner: <span className="text-amber-400">{activeMessMenu.timings.dinner}</span></div>
                        </div>
                      </div>

                      {/* Menu Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Compulsory Items Card */}
                        <div className="bg-[#c53030]/10 border border-[#c53030]/20 rounded-2xl p-4 col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-rose-500" />
                            <span className="text-xs font-black uppercase text-rose-300 tracking-wider">DAILY COMPULSORY ITEMS (रोज मिलने वाला भोजन):</span>
                          </div>
                          <div className="text-xs font-bold text-gray-200">
                            🥗 LUNCH: <span className="text-rose-400 font-extrabold">{activeMessMenu.compulsory.lunch}</span>
                          </div>
                          <div className="text-xs font-bold text-gray-200">
                            🍛 DINNER: <span className="text-rose-400 font-extrabold">{activeMessMenu.compulsory.dinner}</span>
                          </div>
                        </div>

                        {/* Weekly Days Schedule Cards */}
                        {daysList.map(day => {
                          const item = activeMessMenu.days[day];
                          const isSunday = day === 'Sunday';

                          return (
                            <div 
                              key={day} 
                              className={`rounded-2xl p-4 border transition ${
                                isSunday 
                                  ? 'bg-amber-500/5 border-amber-500/25 shadow-md shadow-amber-500/5' 
                                  : 'bg-slate-900/30 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                <span className={`text-xs font-black uppercase tracking-wider ${isSunday ? 'text-rose-500' : 'text-[#D4AF37]'}`}>
                                  {day} ({daysHindi[day]})
                                </span>
                                {isSunday && <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[9px] font-black text-amber-300 uppercase tracking-wider">Sunday Special!</span>}
                              </div>

                              <div className="space-y-2 text-xs font-medium">
                                <div className="flex items-start gap-1.5 text-gray-300">
                                  <span className="text-gray-500 font-bold min-w-[70px]">🍳 Breakfast:</span>
                                  <span className="text-gray-200 font-semibold">{item.breakfast}</span>
                                </div>
                                <div className="flex items-start gap-1.5 text-gray-300">
                                  <span className="text-gray-500 font-bold min-w-[70px]">🍲 Lunch:</span>
                                  <span className="text-gray-200 font-semibold">{item.lunch}</span>
                                </div>
                                <div className="flex items-start gap-1.5 text-gray-300">
                                  <span className="text-gray-500 font-bold min-w-[70px]">🍽️ Dinner:</span>
                                  <span className={`font-semibold ${isSunday ? 'text-indigo-400 font-extrabold' : 'text-gray-200'}`}>
                                    {item.dinner}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Sunday Special Note bottom box */}
                      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                        <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-black uppercase text-amber-300 mb-1">Sunday Feast Items (रविवार स्पेशल मेनू):</h5>
                          <p className="text-xs text-amber-100 font-semibold leading-relaxed">
                            {activeMessMenu.sundaySpecialNote}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: TRANSACTION LEDGER */}
                  {portalTab === 'ledger' && (
                    <motion.div
                      key="tab-ledger"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                        <div>
                          <h4 className="text-base font-black text-[#D4AF37]">Official Receipts Ledger</h4>
                          <p className="text-xs text-gray-400">Total payments registered securely in warden databases</p>
                        </div>
                      </div>

                      {studentPayments.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 text-xs font-medium">
                          No payments have been registered in this billing cycle yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                          <table className="w-full text-left min-w-[600px] border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-gray-400 text-[10px] font-black uppercase border-b border-slate-800">
                                <th className="p-4">Receipt (रसीद)</th>
                                <th className="p-4">Billing Month</th>
                                <th className="p-4">Date of Pay</th>
                                <th className="p-4">Transfer Mode</th>
                                <th className="p-4">Amount Recpt</th>
                                <th className="p-4 text-center rounded-tr-2xl">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 text-xs font-semibold text-gray-200">
                              {studentPayments.map(p => (
                                <tr key={p.id} className="hover:bg-slate-900/35 transition">
                                  <td className="p-4 font-black text-[#D4AF37]">#{p.receipt}</td>
                                  <td className="p-4 font-mono">{p.month}</td>
                                  <td className="p-4 font-mono">{p.date}</td>
                                  <td className="p-4">
                                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-black">
                                      {p.mode}
                                    </span>
                                  </td>
                                  <td className="p-4 font-black text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={() => handlePrintVoucher(p)}
                                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                                      Print Invoice (बिल प्रिंट)
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 4: FILE ROOM COMPLAINT */}
                  {portalTab === 'complaints' && (
                    <motion.div
                      key="tab-complaints"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                      {/* Left Side: Submit Complaint Form */}
                      <form onSubmit={handleSubmitComplaint} className="lg:col-span-5 bg-[#1E2021] border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Hammer className="w-4 h-4 text-[#FF6B35]" />
                          Lodge New Complaint (शिकायत दर्ज करें)
                        </h4>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                            Complaint Type (श्रेणी)
                          </label>
                          <select
                            value={complaintType}
                            onChange={e => setComplaintType(e.target.value as any)}
                            className="w-full bg-[#161718] border border-slate-700 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value="WiFi">📶 WiFi Internet Speed</option>
                            <option value="Electricity">🔌 Electrical Sub-meter / Fan</option>
                            <option value="Plumbing">🚰 Plumbing & Washroom Tap</option>
                            <option value="Cleaning">🧹 Room Cleaning & Dustbin</option>
                            <option value="Other">🛠️ Other General Issues</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                            Priority Level (तीव्रता)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Low', 'Medium', 'High'] as const).map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setComplaintPriority(p)}
                                className={`py-1.5 text-[10px] font-black uppercase rounded-lg border transition ${
                                  complaintPriority === p 
                                    ? 'bg-amber-500/25 border-amber-500 text-amber-300' 
                                    : 'bg-[#161718] border-slate-700 text-gray-400'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                            Problem description (शिकायत का विवरण)
                          </label>
                          <textarea
                            value={complaintDesc}
                            onChange={e => setComplaintDesc(e.target.value)}
                            required
                            rows={3}
                            placeholder="Describe what is broken or needs fixing..."
                            className="w-full p-3 bg-[#161718] border border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition active:scale-95 cursor-pointer"
                        >
                          Submit Ticket to Warden
                        </button>
                      </form>

                      {/* Right Side: Complaints list */}
                      <div className="lg:col-span-7 space-y-4">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                          Prior Complaint Log History:
                        </h4>

                        {studentComplaints.length === 0 ? (
                          <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center text-gray-500 text-xs font-medium">
                            No complaint tickets have been filed from your account. All clear! ✓
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {studentComplaints.map(c => (
                              <div key={c.id} className="bg-[#1E2021]/80 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-[#D4AF37]">Ticket #{c.ticket}</span>
                                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-bold text-gray-300">
                                      {c.type}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                                      c.priority === 'High' ? 'text-rose-400' : c.priority === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                                    }`}>
                                      {c.priority} Priority
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-200 font-semibold">{c.description}</p>
                                  <p className="text-[10px] text-gray-500 font-medium">Logged on: {c.date}</p>
                                </div>

                                <div className="text-right">
                                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-wider ${
                                    c.status === 'Resolved' 
                                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  }`}>
                                    {c.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: DOCUMENTS LIST & MANAGEMENT */}
                  {portalTab === 'documents' && (
                    <motion.div
                      key="tab-documents"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
                        <div>
                          <h4 className="text-base font-black uppercase text-gray-100 tracking-wider flex items-center gap-2">
                            📁 My Uploaded Documents (मेरे दस्तावेज)
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            You can view, download, or upload missing registration documents below. Max file size: 2MB.
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-3">
                          <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Document Progress</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#D4AF37]">{uploadedDocsCount}/5</span>
                            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" 
                                style={{ width: `${(uploadedDocsCount / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {docKeys.map((doc, idx) => {
                          const docValue = matchedStudent[doc.key] as string | undefined;
                          const uploaded = isDocUploaded(docValue);
                          const isBase64 = docValue && docValue.startsWith('data:');

                          return (
                            <div 
                              key={doc.key} 
                              className={`bg-[#1E2021] border rounded-3xl p-5 flex flex-col justify-between h-72 transition duration-200 hover:border-slate-700 ${
                                uploaded ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'border-slate-800'
                              }`}
                            >
                              {/* Header Info */}
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                                    Document #{idx + 1}
                                  </span>
                                  {uploaded ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20 text-[9px] uppercase tracking-wider flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      Received / जमा
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[9px] uppercase tracking-wider">
                                      Pending / बाकी
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-sm font-bold text-gray-200 leading-snug">
                                  {doc.label}
                                </h5>
                                <p className="text-xs text-gray-400 leading-tight">
                                  {doc.labelHi}
                                </p>
                              </div>

                              {/* Body - Display or Upload */}
                              <div className="my-4 flex-1 flex items-center justify-center">
                                {uploaded ? (
                                  isBase64 ? (
                                    <div className="relative group w-28 h-20 rounded-xl overflow-hidden border border-slate-700 bg-black/30">
                                      <img 
                                        src={docValue} 
                                        className="w-full h-full object-cover transition duration-200 group-hover:scale-105" 
                                        referrerPolicy="no-referrer"
                                        alt={doc.label}
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => {
                                            const win = window.open();
                                            if (win) {
                                              win.document.write(`<img src="${docValue}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                                            }
                                          }}
                                          title="View Original Size" 
                                          className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer transition"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => downloadBase64File(docValue || '', `${matchedStudent.name}_${doc.key}.png`)}
                                          title="Download Document" 
                                          className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer transition"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center p-3 rounded-2xl bg-slate-900/30 border border-slate-800/50 w-full">
                                      <p className="text-xs text-emerald-400 font-bold">Physical Hardcopy 📄</p>
                                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                                        Submitted physical document with Warden.
                                      </p>
                                    </div>
                                  )
                                ) : (
                                  <label className="w-full h-24 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-3 text-center group">
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={e => handlePortalDocUpload(doc.key, e.target.files?.[0] || null)}
                                      className="hidden" 
                                    />
                                    <Upload className="w-5 h-5 text-gray-500 group-hover:text-gray-300 mb-1 transition duration-150" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Upload Document</span>
                                    <span className="text-[9px] text-gray-500 block">Click to select image</span>
                                  </label>
                                )}
                              </div>

                              {/* Footer Action */}
                              <div>
                                {uploaded ? (
                                  <div className="flex gap-2">
                                    {isBase64 ? (
                                      <>
                                        <button 
                                          onClick={() => {
                                            const win = window.open();
                                            if (win) {
                                              win.document.write(`<img src="${docValue}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                                            }
                                          }}
                                          className="flex-1 py-1.5 border border-slate-800 text-gray-300 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button 
                                          onClick={() => downloadBase64File(docValue || '', `${matchedStudent.name}_${doc.key}.png`)}
                                          className="flex-1 py-1.5 border border-slate-800 text-[#D4AF37] hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Download className="w-3.5 h-3.5" /> Save
                                        </button>
                                        <button 
                                          onClick={() => handlePortalDocRemove(doc.key)}
                                          className="py-1.5 px-2 border border-rose-950/40 text-rose-400 hover:bg-rose-950/20 rounded-xl transition cursor-pointer"
                                          title="Remove Document"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="text-[9px] text-gray-500 text-center w-full leading-normal italic">
                                        Warden verified handoff. To change, talk to management.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-[9px] text-amber-500/80 text-center leading-normal">
                                    ⚠️ Please upload a front or clear image of the requested document.
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: PORTAL PASSWORD / SECURITY SETTINGS */}
                  {portalTab === 'security' && (
                    <motion.div
                      key="tab-security"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="max-w-md mx-auto bg-[#1E2021] border border-slate-800 rounded-3xl p-6 space-y-6"
                    >
                      <div className="text-center space-y-1.5">
                        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black uppercase text-gray-200 tracking-wider">
                          Portal Security Setup (पासवर्ड सेटअप)
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          Set a secure custom Password/PIN to prevent unauthorized access or dues lookup by other people.
                        </p>
                      </div>

                      {/* Current Status Badge */}
                      <div className="p-3.5 rounded-2xl bg-[#161718] border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-bold">Current Security Mode:</span>
                        {matchedStudent.portalPassword ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-black border border-emerald-500/20 text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Custom Password Set
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-wider">
                            🔑 Default Verification Only
                          </span>
                        )}
                      </div>

                      {/* Check if Locked */}
                      {(settings.blockStudentPasswordChange || matchedStudent.blockPasswordChange) ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center space-y-1.5">
                          <p className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
                            🔒 Password Changes Locked
                          </p>
                          <p className="text-[10px] text-amber-400/80 leading-normal">
                            पासवर्ड बदलना एडमिन द्वारा ब्लॉक किया गया है। अधिक जानकारी के लिए वार्डन से संपर्क करें।
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                New Password / PIN (नया पासवर्ड या पिन कोड)
                              </label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                placeholder="Choose a secure password"
                                className="w-full p-3 bg-[#161718] border border-slate-750 focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-white outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                Confirm New Password (पासवर्ड की पुष्टि करें)
                              </label>
                              <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                                required
                                placeholder="Re-enter same password"
                                className="w-full p-3 bg-[#161718] border border-slate-750 focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-white outline-none transition"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/15 active:scale-95 cursor-pointer mt-2"
                          >
                            Update Password / PIN
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
              </>
            )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 📄 Immersive Interactive Background PDF Viewer Modal */}
      <AnimatePresence>
        {showPdfViewer && (viewingPdfUrl || settings?.adBannerPdfUrl) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
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
              className="relative w-full max-w-5xl h-[85vh] bg-[#121314] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161718]">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <FileText className="w-5 h-5 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white uppercase">
                      {viewingPdfName || settings?.adBannerPdfName || "Notice Document / Brochure"}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono block">Official Student Bulletin Board Document</span>
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

              {/* PDF Viewer Content */}
              <div className="flex-1 bg-black relative p-1">
                <iframe
                  src={`${viewingPdfUrl || settings?.adBannerPdfUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0 rounded-b-xl"
                  title="Official Notice Board Document"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
