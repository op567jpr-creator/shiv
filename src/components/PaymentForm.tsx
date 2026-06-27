import React, { useState, useEffect } from 'react';
import { PaymentMode, Student, Payment } from '../types';
import { Search } from 'lucide-react';

interface PaymentFormProps {
  students: Student[];
  onSubmit: (data: { studentId: number; amount: number; mode: PaymentMode; month: string; note: string; paymentType: 'Monthly' | 'Installment'; installmentNo?: string }) => void;
  onCancel: () => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
  paymentToEdit?: Payment;
  upiId?: string;
}

export default function PaymentForm({ students, onSubmit, onCancel, onShowToast, paymentToEdit, upiId }: PaymentFormProps) {
  // Load settings for dynamic UPI configuration
  const getSavedHostelSettings = () => {
    const cached = localStorage.getItem('ubh_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore error
      }
    }
    return {
      upi: 'gpay-12189467181@okbizaxis',
      upiPayeeName: 'Unity Boys Hostel Official'
    };
  };

  const settingsVal = getSavedHostelSettings();
  const dynamicUpiId = settingsVal.upi || 'gpay-12189467181@okbizaxis';
  const dynamicPayeeName = settingsVal.upiPayeeName || 'Unity Boys Hostel Official';
  const customQrUrl = settingsVal.upiQrUrl || '';

  const [studentId, setStudentId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [mode, setMode] = useState<PaymentMode>('UPI');
  const [month, setMonth] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentScheme, setPaymentScheme] = useState<string>('Monthly');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto set current year/month and handle pre-fills for updates
  useEffect(() => {
    if (paymentToEdit) {
      setStudentId(paymentToEdit.studentId);
      setAmount(paymentToEdit.amount);
      setMode(paymentToEdit.mode);
      setNote(paymentToEdit.note || '');
      
      const scheme = paymentToEdit.paymentType === 'Installment' 
        ? (paymentToEdit.installmentNo || '1st Installment') 
        : 'Monthly';
      setPaymentScheme(scheme);
      
      if (paymentToEdit.month && paymentToEdit.month !== 'N/A') {
        setMonth(paymentToEdit.month);
      } else {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        setMonth(`${d.getFullYear()}-${mm}`);
      }
    } else {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      setMonth(`${d.getFullYear()}-${mm}`);
    }
  }, [paymentToEdit]);

  const handleStudentChange = (id: number) => {
    setStudentId(id);
    setErrorMsg(null);
    const s = students.find(x => x.id === id);
    if (s) {
      setAmount(s.due > 0 ? s.due : s.fee);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId === 0 || amount <= 0) {
      const msg = 'Please select a student and input a positive collection amount! ⚠️';
      setErrorMsg(msg);
      if (onShowToast) onShowToast(msg, true);
      return;
    }

    const calculatedPaymentType: 'Monthly' | 'Installment' = paymentScheme === 'Monthly' ? 'Monthly' : 'Installment';
    const calculatedInstallmentNo = paymentScheme === 'Monthly' ? undefined : paymentScheme;

    onSubmit({ 
      studentId, 
      amount, 
      mode, 
      month: calculatedPaymentType === 'Monthly' ? month : 'N/A', 
      note, 
      paymentType: calculatedPaymentType,
      installmentNo: calculatedInstallmentNo
    });
  };

  // Filter students based on search term (name or room)
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesName = s.name?.toLowerCase().includes(term);
    const matchesRoom = s.room?.toLowerCase().includes(term);
    const matchesMobile = s.mobile?.toLowerCase().includes(term);
    return matchesName || matchesRoom || matchesMobile;
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
      {paymentToEdit && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-850 rounded-xl font-bold flex flex-col gap-1 text-[11px] font-sans">
          <span className="text-amber-700 flex items-center gap-1.5 uppercase font-black text-[10px] tracking-wider">
            <span>⚙️</span> Receipt Correction Mode (संशोधन मोड)
          </span>
          <p className="text-gray-650 font-medium font-sans">
            You are correcting receipt <strong className="font-mono text-gray-800">#{paymentToEdit.receipt}</strong>. Any changes will adjust outstanding balances of both modified and previously mapped students safely.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 text-xs">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Student Search and Selection Area */}
      <div className="space-y-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-150">
        <label className="block text-xs font-bold text-gray-700 tracking-tight flex items-center gap-1">
          <Search className="w-3.5 h-3.5 text-[#FF6B35]" /> Search & Select Student (छात्र खोजें और चुनें) *
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type Name, Room No, or Phone to search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none text-xs font-semibold text-gray-800"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-650 font-bold rounded-xl text-xs cursor-pointer transition"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={studentId}
          required
          onChange={e => handleStudentChange(parseInt(e.target.value) || 0)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] bg-white cursor-pointer outline-none font-bold text-gray-800 text-xs"
        >
          <option value="">-- Choose Student From List --</option>
          {filteredStudents.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} (Room {s.room} • Deposit: ₹{s.fee} • Due Amt: ₹{s.due})
            </option>
          ))}
          {filteredStudents.length === 0 && (
            <option disabled value="">No matching students found...</option>
          )}
        </select>
        
        {searchTerm && filteredStudents.length > 0 && (
          <p className="text-[10px] text-[#FF6B35] font-bold">
            Showing {filteredStudents.length} of {students.length} students matching search term.
          </p>
        )}
      </div>

      {/* Payment Type Selection */}
      <div className="space-y-1.5 p-3.5 bg-orange-50/40 border border-orange-100 rounded-2xl">
        <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
          <span>💼</span> Select Payment Category / Scheme (भुगतान प्रकार) *
        </label>
        <select
          value={paymentScheme}
          required
          onChange={e => setPaymentScheme(e.target.value)}
          className="w-full px-3.5 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] bg-white cursor-pointer outline-none font-bold text-gray-800 text-xs sm:text-sm"
        >
          <option value="Monthly">Monthly Rent (मासिक किराया)</option>
          <option value="1st Installment">1st Installment (पहली किस्त)</option>
          <option value="2nd Installment">2nd Installment (दूसरी किस्त)</option>
          <option value="3rd Installment">3rd Installment (तीसरी किस्त)</option>
          <option value="4th Installment">4th Installment (चौथी किस्त)</option>
          <option value="5th Installment">5th Installment (पांचवीं किस्त)</option>
          <option value="Security Deposit">Security Deposit (सुरक्षा निधि)</option>
          <option value="Other Installment">Other / Custom Installment (अन्य किस्त)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Collection Amount (₹) *</label>
          <input
            type="number"
            required
            value={amount}
            onChange={e => setAmount(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-bold text-emerald-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Mode *</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as PaymentMode)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer"
          >
            <option value="UPI">UPI Transfer (PhonePe/GPay)</option>
            <option value="Cash">Cash Handover</option>
            <option value="Bank Transfer">Direct Bank NEFT/IMPS</option>
          </select>
        </div>
      </div>

      {mode === 'UPI' && (
        <div className="p-4 bg-slate-900 border-2 border-[#D4AF37] rounded-2xl text-white flex flex-col items-center gap-3 my-2 relative overflow-hidden shadow-xl font-sans">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF6B35]/25 to-transparent rounded-full blur-xl"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] text-lg">⚡</span>
            <span className="text-[11px] font-black tracking-wider text-amber-400 uppercase">Verified Permanent QR Code</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-4 border-[#D4AF37]/50 shadow-md flex justify-center items-center">
            <img
              src={customQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${dynamicUpiId}&pn=${dynamicPayeeName}${amount > 0 ? `&am=${amount}` : ''}`)}`}
              alt="Scan & Pay QR"
              className="w-[160px] h-[160px] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-center font-sans">
            <p className="text-xs font-bold text-gray-200">
              UPI ID: <span className="font-mono text-[#D4AF37] select-all underline bg-slate-800 px-2.5 py-1 rounded tracking-wide font-black text-xs">{dynamicUpiId}</span>
            </p>
            {amount > 0 && (
              <p className="text-[10px] text-zinc-300 mt-1 font-mono">
                Amount Pre-filled: <span className="text-amber-300 font-extrabold">₹{amount}</span>
              </p>
            )}
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Payee Name: <span className="text-gray-200 font-bold">{dynamicPayeeName}</span>
            </p>
            <p className="text-[11px] text-emerald-400 mt-2 font-semibold">
              ✓ Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
            </p>
          </div>

          <div className="flex gap-3 items-center justify-center p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl w-full max-w-[260px]">
            <span className="text-[10px] font-bold text-gray-400 font-sans">BHIM</span>
            <span className="text-[10px] font-extrabold text-[#FF6B35] font-sans">Google Pay</span>
            <span className="text-[10px] font-extrabold text-[#5f259f] font-sans">PhonePe</span>
            <span className="text-[10px] font-black text-blue-400 font-sans">Paytm</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentScheme === 'Monthly' ? (
          <div>
            <label className="block text-xs font-extrabold text-[#FF6B35] mb-1.5 font-sans">For Rent Month Period (किराया महीना) *</label>
            <input
              type="month"
              required
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full px-4 py-3 border border-[#FF6B35] rounded-xl focus:border-[#FF6B35] outline-none bg-white font-bold font-mono text-xs sm:text-sm"
            />
          </div>
        ) : null}
        <div className={paymentScheme === 'Monthly' ? '' : 'sm:col-span-2'}>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Add Transaction Remarks (टिप्पणी)</label>
          <input
            type="text"
            placeholder="e.g. Paid part, Paytm TxNo"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-650 rounded-xl cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-5 py-2.5 text-white rounded-xl shadow-md cursor-pointer transition ${
            paymentToEdit 
              ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-600/25' 
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:shadow-emerald-600/25'
          } hover:shadow-lg`}
        >
          {paymentToEdit ? 'Save Correction (संशोधन सहेजें)' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}
