import React, { useState } from 'react';
import { Settings, Save, Trash2, Download, Upload, HelpCircle, ShieldAlert, Copy, Check, FileText } from 'lucide-react';
import { HostelSettings, Student, Payment, Complaint, Visitor } from '../types';
import { generateStandaloneHTML } from '../utils/standaloneHTML';
import { getLiveAppUrl } from '../utils/url';

// Raw source files imported as strings via Vite raw loader
// @ts-ignore
import appCode from '../App.tsx?raw';
// @ts-ignore
import dueCode from './DuePayments.tsx?raw';
// @ts-ignore
import typesCode from '../types.ts?raw';
// @ts-ignore
import dashCode from './DashboardHome.tsx?raw';
// @ts-ignore
import mockCode from '../mockData.ts?raw';
// @ts-ignore
import receiptCode from './ReceiptPrinter.tsx?raw';
// @ts-ignore
import studentCode from './StudentManagement.tsx?raw';
// @ts-ignore
import paymentCode from './PaymentManagement.tsx?raw';

interface SettingsPanelProps {
  settings: HostelSettings;
  onSaveSettings: (updated: HostelSettings) => void;
  onClearAllData: () => void;
  onBackupAllData: () => void;
  onRestoreAllData: (importedDB: any) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  students: Student[];
  payments: Payment[];
  complaints: Complaint[];
  visitors: Visitor[];
}

export default function SettingsPanel({
  settings,
  onSaveSettings,
  onClearAllData,
  onBackupAllData,
  onRestoreAllData,
  onShowToast,
  students,
  payments,
  complaints,
  visitors
}: SettingsPanelProps) {
  const [form, setForm] = useState<HostelSettings>({ ...settings });

  React.useEffect(() => {
    setForm({ ...settings });
  }, [settings]);
  
  // Credentials modification state
  const [masterUser, setMasterUser] = useState(localStorage.getItem('ubh_creds_master_u') || 'admin');
  const [masterPass, setMasterPass] = useState(localStorage.getItem('ubh_creds_master_p') || 'admin123');
  const [staffUser, setStaffUser] = useState(localStorage.getItem('ubh_creds_staff_u') || 'staff');
  const [staffPass, setStaffPass] = useState(localStorage.getItem('ubh_creds_staff_p') || 'staff123');
  const [recoveryKey, setRecoveryKey] = useState(localStorage.getItem('ubh_creds_recovery_key') || 'A040619932024Z');

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterUser || !masterPass || !staffUser || !staffPass) {
      onShowToast('Credentials cannot be empty! ⚠️', true);
      return;
    }
    if (!recoveryKey.trim()) {
      onShowToast('Recovery verification key cannot be empty! ⚠️', true);
      return;
    }
    localStorage.setItem('ubh_creds_master_u', masterUser);
    localStorage.setItem('ubh_creds_master_p', masterPass);
    localStorage.setItem('ubh_creds_staff_u', staffUser);
    localStorage.setItem('ubh_creds_staff_p', staffPass);
    localStorage.setItem('ubh_creds_recovery_key', recoveryKey.trim());
    onShowToast('Login Credentials & Recovery Key successfully updated in storage! 🔐');
  };

  // Notepad export custom state
  const [selectedCodeFileName, setSelectedCodeFileName] = useState('App.tsx');
  const [copiedFileStatus, setCopiedFileStatus] = useState<string | null>(null);
  const [copiedDataStatus, setCopiedDataStatus] = useState<string | null>(null);
  const [copiedStandaloneStatus, setCopiedStandaloneStatus] = useState(false);

  const handleCopyStandaloneHTML = () => {
    onShowToast('Preparing standalone HTML copy... ⚙️');
    try {
      const htmlCont = generateStandaloneHTML(students, payments, settings, complaints, visitors);
      navigator.clipboard.writeText(htmlCont).then(() => {
        setCopiedStandaloneStatus(true);
        onShowToast('Standalone HTML App Copied! Paste in Notepad and save as "hostel.html" 🚀');
        setTimeout(() => setCopiedStandaloneStatus(false), 3000);
      }).catch(() => {
        onShowToast('Could not copy HTML content! ⚠️', true);
      });
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate template! ⚠️', true);
    }
  };

  const handleDownloadStandaloneHTML = () => {
    onShowToast('Preparing standalone HTML download... 📂');
    try {
      const htmlCont = generateStandaloneHTML(students, payments, settings, complaints, visitors);
      const blob = new Blob([htmlCont], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'unity_boys_hostel_offline.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Downloaded unity_boys_hostel_offline.html successfully! 📂 Double-click to run!');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download standalone file! ⚠️', true);
    }
  };

  const handleDownloadIndexHtml = () => {
    onShowToast('Preparing index.html download... 📂');
    try {
      const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Unity Boys Hostel - Premium Student Accommodation Jaipur</title>
  </head>
  <body>
    <div id="root"></div>
    <script id="offline-data-layer">window.OFFLINE_DB = null;</script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
      const blob = new Blob([indexHtmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'index.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('index.html downloaded successfully! 📂');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download index.html! ⚠️', true);
    }
  };

  const codeFiles = [
    { name: 'App.tsx', path: '/src/App.tsx', content: appCode || '', desc: 'Controls admin sessions, local storage persistence, tabs routing, status updates.' },
    { name: 'DuePayments.tsx', path: '/src/components/DuePayments.tsx', content: dueCode || '', desc: 'Main dues planner, payment schedules calculated from Student joining dates.' },
    { name: 'DashboardHome.tsx', path: '/src/components/DashboardHome.tsx', content: dashCode || '', desc: 'Visual analytics dashboard, quick action counters for cash flow.' },
    { name: 'types.ts', path: '/src/types.ts', content: typesCode || '', desc: 'Strict TypeScript interface safety models, Student/Payment state types.' },
    { name: 'mockData.ts', path: '/src/mockData.ts', content: mockCode || '', desc: 'Default startup registers, pre-seeded room occupancies.' },
    { name: 'ReceiptPrinter.tsx', path: '/src/components/ReceiptPrinter.tsx', content: receiptCode || '', desc: 'Voucher generator with high-fidelity printer layouts.' },
    { name: 'StudentManagement.tsx', path: '/src/components/StudentManagement.tsx', content: studentCode || '', desc: 'Active student directory management panel.' },
    { name: 'PaymentManagement.tsx', path: '/src/components/PaymentManagement.tsx', content: paymentCode || '', desc: 'Logs new collections and maintains payment diaries.' }
  ];

  const currentSelectedFile = codeFiles.find(f => f.name === selectedCodeFileName) || codeFiles[0];

  const handleCopyCodeToNotepad = () => {
    if (!currentSelectedFile.content) {
      onShowToast('Could not extract file content! ⚠️', true);
      return;
    }
    navigator.clipboard.writeText(currentSelectedFile.content).then(() => {
      setCopiedFileStatus(currentSelectedFile.name);
      onShowToast(`Successfully copied ${currentSelectedFile.name} code! Paste in Notepad 📝`);
      setTimeout(() => setCopiedFileStatus(null), 3000);
    }).catch(err => {
      onShowToast('Failed to copy to clipboard! ⚠️', true);
    });
  };

  const handleCopyDataToNotepad = (dataString: string, typeName: string) => {
    navigator.clipboard.writeText(dataString).then(() => {
      setCopiedDataStatus(typeName);
      onShowToast(`Copied ${typeName} register! Paste in Notepad 📝`);
      setTimeout(() => setCopiedDataStatus(null), 3000);
    }).catch(err => {
      onShowToast('Failed to copy! ⚠️', true);
    });
  };

  const generateStudentsText = () => {
    let t = `==========================================================\n`;
    t += `       UNITY BOYS HOSTEL - STUDENTS DIRECTORY REGISTER\n`;
    t += `==========================================================\n`;
    t += `Total Students Active: ${students.length}\n`;
    t += `Generated Stamp: ${new Date().toLocaleString('en-IN')}\n`;
    t += `----------------------------------------------------------\n\n`;
    students.forEach((s, idx) => {
      t += `[${idx + 1}] Lodger Name  : ${s.name}\n`;
      t += `    Room Assigned: Room ${s.room} (Status: ${s.status})\n`;
      t += `    Join Date    : ${s.joinDate || 'N/A'}\n`;
      t += `    Contact Mon  : +91 ${s.mobile || 'N/A'}\n`;
      t += `    Father Name  : ${s.father || 'N/A'}\n`;
      t += `    Father Mobile: +91 ${s.fatherMob || 'N/A'}\n`;
      t += `    Monthly Rent : ₹${s.fee.toLocaleString('en-IN')}\n`;
      t += `    Amount Paid  : ₹${s.paid.toLocaleString('en-IN')}\n`;
      t += `    Outstanding  : ₹${s.due.toLocaleString('en-IN')}\n`;
      t += `    Emergency No : ${s.emergencyMobile || 'N/A'}\n`;
      t += `----------------------------------------------------------\n`;
    });
    return t;
  };

  const generatePaymentsText = () => {
    let t = `==========================================================\n`;
    t += `       UNITY BOYS HOSTEL - PAYMENT TRANSACTIONS JOURNAL\n`;
    t += `==========================================================\n`;
    t += `Total Completed: ${payments.length} transactions\n`;
    t += `Generated Stamp: ${new Date().toLocaleString('en-IN')}\n`;
    t += `----------------------------------------------------------\n\n`;
    payments.forEach((p, idx) => {
      t += `[#${p.receipt}] Date: ${p.date}\n`;
      t += `    Billing Tenant : ${p.studentName}\n`;
      t += `    Room ID        : Room ${p.room}\n`;
      t += `    Month Segment  : ${p.month}\n`;
      t += `    Amount Logged  : ₹${p.amount.toLocaleString('en-IN')}\n`;
      t += `    Payment Mode   : ${p.mode}\n`;
      t += `----------------------------------------------------------\n`;
    });
    return t;
  };

  const generateRoomsMapText = () => {
    let t = `==========================================================\n`;
    t += `         UNITY BOYS HOSTEL - ROOM OCCUPANCY MAP\n`;
    t += `==========================================================\n`;
    t += `Generated Stamp: ${new Date().toLocaleString('en-IN')}\n\n`;
    
    // Group students by room
    const occupancy: { [key: string]: Student[] } = {};
    students.forEach(s => {
      if (!occupancy[s.room]) occupancy[s.room] = [];
      occupancy[s.room].push(s);
    });

    // Create floors list (101 to 145/201 etc)
    const listRooms = Array.from({ length: 45 }, (_, i) => {
      const roomNum = (100 + i + 1).toString();
      const tenants = occupancy[roomNum] || [];
      return { roomNum, tenants };
    });

    listRooms.forEach(r => {
      const status = r.tenants.length === 0 ? 'VACANT' : r.tenants.length >= 2 ? 'FULLY OCCUPIED' : 'PARTIALLY OCCUPIED';
      t += `Room #${r.roomNum} : Status: ${status} [${r.tenants.length}/2 beds occupied]\n`;
      if (r.tenants.length > 0) {
        t += `    Beds taken by : ` + r.tenants.map(tn => `${tn.name} (Mob: ${tn.mobile}, Due: ₹${tn.due})`).join('  |  ') + `\n`;
      }
      t += `----------------------------------------------------------\n`;
    });
    return t;
  };

  const handleTextChange = (field: keyof HostelSettings, val: string | number | boolean) => {
    setForm({
      ...form,
      [field]: val
    });
  };

  const handleCheckboxChange = (field: keyof HostelSettings, checked: boolean) => {
    setForm({
      ...form,
      [field]: checked
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      onShowToast('Please fill out Name, Phone, and Email configs! ⚠️', true);
      return;
    }
    onSaveSettings({ ...form });
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && (json.students || json.payments || json.complaints || json.visitors)) {
          onRestoreAllData(json);
          // Refresh configuration state form
          if (json.settings) {
            setForm({ ...json.settings });
          }
        } else {
          onShowToast('Invalid JSON backup file structure! ❌', true);
        }
      } catch (err) {
        onShowToast('Failed to parse selected JSON file! ❌', true);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      onShowToast('QR image size should be less than 1MB for storage safety! ⚠️', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(prev => ({ ...prev, upiQrUrl: base64 }));
      onShowToast('Custom QR Code image uploaded! Save settings to apply. 📸');
    };
    reader.readAsDataURL(file);
  };

  const handleClearQr = () => {
    setForm(prev => ({ ...prev, upiQrUrl: '' }));
    onShowToast('Custom QR Code cleared. Auto-generated UPI QR will be used! 🔄');
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Form wrapper */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#FF6B35]" />
          Hostel System General Settings
        </h4>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hostel Name config</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleTextChange('name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Admission Phone Helpdesk</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => handleTextChange('phone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-semibold">Campus Address specifications</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={e => handleTextChange('address', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Target WhatsApp Contact link</label>
              <input
                type="text"
                value={form.wa}
                onChange={e => handleTextChange('wa', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Corporate Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleTextChange('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">Default UPI ID (For Fee collection receipts)</label>
              <input
                type="text"
                value={form.upi}
                onChange={e => handleTextChange('upi', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">UPI Payee / Merchant Name</label>
              <input
                type="text"
                value={form.upiPayeeName || ''}
                onChange={e => handleTextChange('upiPayeeName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
                placeholder="e.g. Unity Boys Hostel"
              />
            </div>
          </div>

          {/* Custom QR Code upload/replacement option */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-3">
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              🖼️ Custom Payment QR Code (कस्टम भुगतान क्यूआर कोड)
            </h5>
            <p className="text-[11px] text-slate-500 mb-3 font-medium leading-relaxed">
              If you have a customized static QR from PhonePe, Paytm or Google Pay standee, upload it here.
              If empty, the system will dynamically generate a clean verified QR code from your default UPI ID above.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                  id="custom-qr-upload-input"
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="custom-qr-upload-input"
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-black tracking-tight cursor-pointer shadow-sm transition active:scale-95"
                  >
                    Select QR Image File
                  </label>
                  {form.upiQrUrl && (
                    <button
                      type="button"
                      onClick={handleClearQr}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black border border-rose-100 transition active:scale-95 cursor-pointer"
                    >
                      Remove Custom QR
                    </button>
                  )}
                </div>
              </div>
              {form.upiQrUrl ? (
                <div className="w-24 h-24 bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden group">
                  <img
                    src={form.upiQrUrl}
                    alt="Custom QR Preview"
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black tracking-wide uppercase text-center py-0.5">Active</span>
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                  <span className="text-lg">⚡</span>
                  <span className="text-[9px] font-bold">Auto-Gen Active</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-100 my-4 pt-4 space-y-6">
            <h5 className="text-xs font-black text-[#FF6B35] uppercase tracking-wider flex items-center gap-1.5">
              ⚙️ Dynamic System controls (सिस्टम सेटअप नियंत्रक)
            </h5>
            
            {/* CAPACITY INCREMENT / DECREMENT BUTTON GROUPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Control 1: Total Beds Control */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Total Bed Capacity</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalBeds', Math.max(1, (form.totalBeds || 100) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.totalBeds || 100} beds</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalBeds', (form.totalBeds || 100) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Control 2: Double Rooms Count */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Double Sharing (दुवाल रूम संख्या)</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('doubleRoomsCount', Math.max(1, (form.doubleRoomsCount || 25) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.doubleRoomsCount || 25} Rooms</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('doubleRoomsCount', (form.doubleRoomsCount || 25) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Control 3: Triple Rooms Count */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Triple Sharing (त्रिपल रूम संख्या)</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('tripleRoomsCount', Math.max(1, (form.tripleRoomsCount || 15) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.tripleRoomsCount || 15} Rooms</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('tripleRoomsCount', (form.tripleRoomsCount || 15) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Control 4: Total Rooms Setup */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Total Rooms (कमरा संख्या नियंत्रक)</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalRoomsCount', Math.max(1, (form.totalRoomsCount || 45) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.totalRoomsCount || 45} Rooms</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalRoomsCount', (form.totalRoomsCount || 45) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* CUSTOM SELECTION OPTIONS FOR THEME & FORM TEMPLATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sidebar Theme Changer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Side Theme Change (साइडबार बैकग्राउंड कलर थीम)</label>
                <select
                  value={form.sidebarTheme || 'dark'}
                  onChange={e => handleTextChange('sidebarTheme', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] bg-white font-extrabold text-gray-700 cursor-pointer outline-none"
                >
                  <option value="dark">Classic Charcoal Dark (डार्क चारकोल)</option>
                  <option value="coal">Rich Obsidian Black (कोजी चारकोल ब्लैक)</option>
                  <option value="orange">Vibrant Sunset Orange (सूर्यास्त नारंगी)</option>
                  <option value="indigo">Deep Ocean Indigo (शाही इंडिगो नीला)</option>
                  <option value="emerald">Lush Emerald Forest (पन्ना हरा)</option>
                </select>
              </div>

              {/* Form Template Changer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Form Template Option (रजिस्ट्रेशन फॉर्म विकल्प)</label>
                <select
                  value={form.registrationFormTemplate || 'Bilingual'}
                  onChange={e => handleTextChange('registrationFormTemplate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] bg-white font-extrabold text-gray-700 cursor-pointer outline-none"
                >
                  <option value="Bilingual">Bilingual Hindi-English (हिन्दी एवं English)</option>
                  <option value="English">Pure English / Standard (केवल अंग्रेज़ी)</option>
                  <option value="Simplified">Simplified Minimalist (सरलीकृत सामान्य प्रारूप)</option>
                </select>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-dashed border-gray-100 pb-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">Default Late Fee Charge per day (₹)</label>
              <input
                type="number"
                value={form.lateFee}
                onChange={e => handleTextChange('lateFee', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">Standard Electricity Tariff per unit (₹)</label>
              <input
                type="number"
                step="0.1"
                value={form.standardElecRate || 10}
                onChange={e => handleTextChange('standardElecRate', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
          </div>

          {/* 🚪 Student Portal Dynamic Master Control Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2 space-y-3">
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              🚪 Student Portal Controls (स्टूडेंट पोर्टल नियंत्रण)
            </h5>
            <p className="text-[11px] text-slate-500 font-medium">
              Manage student portal availability and permissions globally. These settings take effect instantly for all students.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Toggle 1: Student Portal Live */}
              <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                <input
                  type="checkbox"
                  checked={form.isStudentPortalLive !== false} // default true
                  onChange={e => handleCheckboxChange('isStudentPortalLive', e.target.checked)}
                  className="mt-1 accent-[#FF6B35] h-4 w-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Student Portal Live 🌐 (स्टूडेंट पोर्टल चालू रखें)
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Uncheck to disable student login and dues lookup globally. Students will see a "Maintenance" notice.
                  </span>
                </div>
              </label>

              {/* Toggle 2: Block Password/PIN Change */}
              <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                <input
                  type="checkbox"
                  checked={!!form.blockStudentPasswordChange}
                  onChange={e => handleCheckboxChange('blockStudentPasswordChange', e.target.checked)}
                  className="mt-1 accent-[#FF6B35] h-4 w-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Block Password/PIN Changes 🔒 (पासवर्ड बदलाव ब्लॉक करें)
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Check this to block students from changing their portal login passwords or PIN codes.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 📢 Banner / Advertisement Master Control Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-4 space-y-3">
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              📢 Website Background Banner Slider & Ads (मल्टीपल फोटो बैकग्राउंड एवं विज्ञापन सेटिंग्स)
            </h5>
            <p className="text-[11px] text-slate-500 font-medium">
              अपनी मुख्य वेबसाइट (Landing Page) के बैकग्राउंड में एक अत्यंत व्यावसायिक स्लाइडर (Professional Slideshow/Carousel) बनाने के लिए यहाँ कई तस्वीरें अपलोड करें। ये आपकी वेबसाइट को एक आकर्षक प्रीमियम लुक देंगी।
            </p>
            
            <div className="space-y-4 pt-1">
              {/* Toggle: Show Banner */}
              <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                <input
                  type="checkbox"
                  checked={!!form.showAdBanner}
                  onChange={e => handleCheckboxChange('showAdBanner', e.target.checked)}
                  className="mt-1 accent-[#FF6B35] h-4 w-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Show Background Slideshow & Banners 🌐 (वेबसाइट बैकग्राउंड स्लाइडशो चालू करें)
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    इसे चेक करने पर अपलोड की गई फोटोज़ वेबसाइट के मुख्य बैनर/बैकग्राउंड स्लाइडर में प्रदर्शित होंगी।
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Text Field: Banner Caption / Ad Tagline */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Banner Announcement / Caption Text (बैनर का सन्देश / टैगलाइन)
                  </label>
                  <input
                    type="text"
                    value={form.adBannerText || ''}
                    onChange={e => handleTextChange('adBannerText', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 focus:border-[#FF6B35] rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                    placeholder="e.g. Admission Open for 2026 Batch! Call 8209696820"
                  />
                  <span className="text-[9px] text-slate-400 block">
                    This message will be shown as a gorgeous overlay alert box on your website banner.
                  </span>
                </div>

                {/* File Upload: Image & PDF */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Add Payout/Background Photo or PDF (नई फोटो या पीडीएफ जोड़ें - Max 4MB each)
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 rounded-xl cursor-pointer text-slate-800 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-slate-600 animate-bounce" />
                      Upload Photo / PDF Document
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        multiple
                        onChange={e => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            Array.from(files).forEach((file: any) => {
                              if (file.size > 4 * 1024 * 1024) {
                                onShowToast(`"${file.name}" is over 4MB limit! ⚠️`, true);
                                return;
                              }
                              const isPdfFile = file.type === 'application/pdf' || file.name.endsWith('.pdf');
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setForm(prev => {
                                  const currentUrls = prev.adBannerUrls || (prev.adBannerUrl ? [prev.adBannerUrl] : []);
                                  const updatedUrls = [...currentUrls, reader.result as string];
                                  return {
                                    ...prev,
                                    adBannerUrls: updatedUrls,
                                    adBannerUrl: updatedUrls[0],
                                    showAdBanner: true
                                  };
                                });
                                onShowToast(isPdfFile ? "PDF document added to slides! 📄" : "Image successfully added to slides! 📸");
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                    {((form.adBannerUrls && form.adBannerUrls.length > 0) || form.adBannerUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, adBannerUrl: '', adBannerUrls: [] }));
                          onShowToast("All slides and gallery cleared 🗑️");
                        }}
                        className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black border border-rose-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 block">
                    Supports JPG, PNG, WebP, and PDF notices. You can upload multiple files to rotate dynamically.
                  </span>
                </div>
              </div>

              {/* Multiple Banner Images Slides / Grid Preview */}
              {((form.adBannerUrls && form.adBannerUrls.length > 0) || form.adBannerUrl) && (
                <div className="p-4 border border-slate-200 bg-white rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      🖼️ Active Gallery Slideshow ({((form.adBannerUrls && form.adBannerUrls.length > 0) ? form.adBannerUrls.length : 1)} Images)
                    </span>
                    <span className="text-[9px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-full">
                      Slides will auto-rotate dynamically
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(() => {
                      const list = form.adBannerUrls && form.adBannerUrls.length > 0 
                        ? form.adBannerUrls 
                        : (form.adBannerUrl ? [form.adBannerUrl] : []);
                      return list.map((imgUrl, index) => {
                        const isPdf = imgUrl && (imgUrl.startsWith('data:application/pdf') || imgUrl.endsWith('.pdf') || imgUrl.includes('application/pdf'));
                        return (
                          <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm group">
                            {isPdf ? (
                              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-2 text-slate-800">
                                <FileText className="w-8 h-8 text-indigo-600 mb-1" />
                                <span className="text-[10px] font-extrabold uppercase text-center truncate w-full px-2 text-slate-700">PDF Notice</span>
                                <span className="text-[8px] text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded-md mt-0.5">Interactive Slide</span>
                              </div>
                            ) : (
                              <img 
                                src={imgUrl} 
                                className="w-full h-full object-cover" 
                                alt={`Banner Slide ${index + 1}`}
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-[8px] font-black text-white px-1.5 py-0.5 rounded-md">
                              Slide #{index + 1}
                            </div>
                            
                            {/* Remove individual image button */}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedList = list.filter((_, idx) => idx !== index);
                                setForm(prev => ({
                                  ...prev,
                                  adBannerUrls: updatedList,
                                  adBannerUrl: updatedList.length > 0 ? updatedList[0] : ''
                                }));
                                onShowToast(`Deleted Slide #${index + 1} 🗑️`);
                              }}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 hover:scale-105 active:scale-95 transition cursor-pointer shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                              title="Delete this image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {form.adBannerText && (
                    <div className="mt-3 text-center border-t border-slate-100 pt-2.5">
                      <p className="text-xs text-amber-800 font-extrabold px-3 py-1 bg-amber-50 border border-amber-100 rounded-full inline-block">
                        📢 Caption Alert: {form.adBannerText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition flex items-center gap-2 cursor-pointer pt"
          >
            <Save className="w-4 h-4" />
            Save specifications
          </button>
        </form>
      </div>

      {/* 🔮 Login Password Changer (लॉगिन विवरण एवं पासवर्ड बदलें) */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-650 text-indigo-505 text-indigo-500" />
          Update Login Credentials (लॉगिन पासवर्ड बदलें)
        </h4>
        <p className="text-xs text-gray-400 mb-5">
          Configure secure usernames and passwords for both Master Admin and Staff member. These credentials take effect instantly.
        </p>

        <form onSubmit={handleUpdateCreds} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Master credentials card */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
              <span className="text-[10px] bg-indigo-50 border border-indigo-150 inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-indigo-600">
                ⭐ Master Admin privileges
              </span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Master Username</label>
                  <input
                    type="text"
                    value={masterUser}
                    onChange={e => setMasterUser(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Master Password</label>
                  <input
                    type="text"
                    value={masterPass}
                    onChange={e => setMasterPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Warden credentials card */}
            <div className="p-4 bg-orange-50/20 border border-orange-100 rounded-xl space-y-3">
              <span className="text-[10px] bg-orange-50 border border-orange-150 inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[#FF6B35]">
                🔒 Staff Privileges
              </span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-orange-600/70 mb-1 uppercase">Staff Username</label>
                  <input
                    type="text"
                    value={staffUser}
                    onChange={e => setStaffUser(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200/50 rounded-lg text-xs font-semibold focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-orange-600/70 mb-1 uppercase">Staff Password</label>
                  <input
                    type="text"
                    value={staffPass}
                    onChange={e => setStaffPass(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200/50 rounded-lg text-xs font-mono font-bold focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recovery verification key card */}
          <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-xl space-y-3">
            <span className="text-[10px] bg-amber-100/60 border border-amber-200 inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-amber-800">
              🔑 Password Reset / Recovery verification key (ओटीपी रीसेट कोड)
            </span>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-amber-800/80 mb-1 uppercase">Master Reset Key / OTP Code</label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={e => setRecoveryKey(e.target.value)}
                  placeholder="Enter custom reset key"
                  className="w-full md:w-1/2 px-3 py-2 border border-amber-200 rounded-lg text-xs font-mono font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-amber-900"
                />
                <p className="text-[10px] text-amber-700/80 mt-1">
                  ⚠️ <strong>Security Advice:</strong> Change this key from the default to your own custom secret key to prevent code-level leaks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Update Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Advanced Database maintenance */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            System Maintenance & Data Backup
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Maintain local storage backups to prevent data loss due to browser cache clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Backup data */}
          <button
            onClick={onBackupAllData}
            className="px-5 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:shadow-[#0F3460]/20 hover:shadow-lg rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Backup Entire System (JSON)
          </button>

          {/* Restore data */}
          <label className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/20 hover:shadow-lg rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative overflow-hidden">
            <Upload className="w-4 h-4" />
            Restore Database (JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleJSONImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>

          {/* Delete everything */}
          <button
            onClick={onClearAllData}
            className="px-5 py-3.5 bg-gradient-to-r from-rose-650 to-rose-700 text-white hover:bg-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto max-sm:ml-0"
          >
            <Trash2 className="w-4 h-4" />
            Flush and Reset Database
          </button>
        </div>
      </div>

      {/* NEW: VISUAL NOTEPAD BACKUP & CODE CENTER */}
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/30 p-6 shadow-md space-y-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] blink">
              <FileText className="w-5 h-5 text-[#bfa032]" />
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Notepad Backup, Export & Code Center 📝
              </h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Save your entire hostel's statistics, data, and complete source code files directly into your Windows/macOS Notepad!
              </p>
            </div>
          </div>
        </div>

        {/* STANDALONE DOUBLE-CLICK RUNNABLE HTML SECTION */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-2xl p-5 border border-slate-700 space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                LATEST SOLUTION: NOTEPAD DOUBLE-CLICK RUNNER
              </span>
              <h5 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                Offline Standalone HTML Exporter 🚀
              </h5>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded">No Compiler Needed!</span>
          </div>

          <p className="text-xs text-slate-300 leading-normal font-medium">
            <strong>Why TSX doesn't run in Notepad:</strong> Browser directly <code className="bg-slate-800 px-1 py-0.5 rounded text-orange-300 font-mono">App.tsx</code> ya standard React components runtime support nahi karte, kyunki unme TypeScript type safety aur complex modular bundlers imports hote hain!
          </p>

          <p className="text-xs text-slate-300 leading-normal font-semibold bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
            <strong>The Solution:</strong> Humein aapke liye pure application ko dynamic status, fully styled dashboard metrics, lodgers list entries, payment receipt prints, aur browser local persistence storage ke sath <strong>Ek Single self-contained runnable offline .html file</strong> me package kar diya hai. Aap isse double click karke computer ya mobile par bina kisi engine ya compiler ke run kar sakte hain!
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={handleDownloadStandaloneHTML}
              className="py-3 px-5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-orange-500/20"
              title="Downloads ready-to-use HTML file directly which runs on any browser"
            >
              <Download className="w-4 h-4 text-white" />
              Download Standalone HTML file 📁
            </button>

            <button
              onClick={handleDownloadIndexHtml}
              className="py-3 px-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-500/20"
              title="Downloads the standard index.html web configuration file for deployment"
            >
              <Download className="w-4 h-4 text-white" />
              Download index.html File 🌐
            </button>

            <button
              onClick={handleCopyStandaloneHTML}
              className="py-3 px-5 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-100 text-xs font-black uppercase rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              title="Copy entire code so you can paste inside empty notepad of your choice"
            >
              <Copy className="w-4 h-4 text-orange-400" />
              {copiedStandaloneStatus ? 'Copied Standalone Code! 📋' : 'Copy HTML Code for Notepad 📝'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* COLUMN 1: CODE FILES COPILER */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-[#FF6B35] bg-[#FF6B35]/15 px-2.5 py-0.5 rounded-full">
                Step 1: Save System Code Files
              </span>
              <h5 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-2">
                Download & Copy Source Codes
              </h5>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
                Select any code file below to view & copy. Paste inside empty Notepad and save with corresponding file name.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Choose Code File to Copy:</label>
                <select
                  value={selectedCodeFileName}
                  onChange={e => setSelectedCodeFileName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-black text-slate-705 outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  {codeFiles.map(file => (
                    <option key={file.name} value={file.name}>
                      {file.name} (File path: {file.path})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected File Card Details */}
              <div className="p-3.5 bg-white border border-slate-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 truncate">{currentSelectedFile.name}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                    {currentSelectedFile.content ? `${Math.round(currentSelectedFile.content.length / 102.4) / 10} KB` : 'Empty'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed">
                  {currentSelectedFile.desc}
                </p>
              </div>

              {/* Copy action trigger */}
              <button
                onClick={handleCopyCodeToNotepad}
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#e55a24] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                title="Click to copy full code source string so you can paste in Notepad"
              >
                <Copy className="w-4 h-4 text-white" />
                {copiedFileStatus === currentSelectedFile.name ? 'Code Copied! Paste in Notepad 📋' : `Copy ${currentSelectedFile.name} Code 📁`}
              </button>
            </div>
          </div>

          {/* COLUMN 2: ACTIVE DATA TO NOTEPAD EXPORTER */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Step 2: Save Active Hostel Data
              </span>
              <h5 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-2">
                Export Live Database to Notepad
              </h5>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
                Instantly converts database rows into perfectly structured human plain-text logs for seamless paper backups or Notepad editing.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              
              {/* Copy Students register */}
              <button
                onClick={() => handleCopyDataToNotepad(generateStudentsText(), 'Students Register')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scals-95 cursor-pointer shadow-xs"
                title="Copies all registered students, their names, mobile numbers, father contacts, room rents and balances"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                  Students Register Text
                </span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Copy className="w-3 h-3 text-slate-450" />
                  Copy Text
                </span>
              </button>

              {/* Copy room map occupancy */}
              <button
                onClick={() => handleCopyDataToNotepad(generateRoomsMapText(), 'Rooms Occupancy Map')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scals-95 cursor-pointer shadow-xs"
                title="Copies the entire room mapping database showing bed counts, occupied rooms and vacant beds"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  Room Map Occupancy Text
                </span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Copy className="w-3 h-3 text-slate-450" />
                  Copy Text
                </span>
              </button>

              {/* Copy Payments register ledger */}
              <button
                onClick={() => handleCopyDataToNotepad(generatePaymentsText(), 'Payments Ledger')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scals-95 cursor-pointer shadow-xs"
                title="Copy standard ledger list of all completed payments as plain text to clipboard"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Payments Ledger Records
                </span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Copy className="w-3 h-3 text-slate-450" />
                  Copy Text
                </span>
              </button>

              {/* Raw JSON database representation */}
              <button
                onClick={() => handleCopyDataToNotepad(JSON.stringify({ students, payments, complaints, visitors, settings }, null, 2), 'Database Backup JSON')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scals-95 cursor-pointer shadow-xs font-mono"
                title="Copy raw database backup string"
              >
                <span className="flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Database Backup (JSON String)
                </span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Copy className="w-3 h-3 text-slate-450" />
                  Copy JSON String
                </span>
              </button>

            </div>
          </div>

        </div>

        {/* Informational warning help section on how to download files in AI Studio wrapper */}
        <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3.5">
          <HelpCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h6 className="text-[11px] font-black text-sky-950 uppercase">How to back up raw original file folders?</h6>
            <p className="text-[10px] sm:text-xs text-sky-800 leading-normal font-semibold">
              If you want to save the entire source code file tree structure of this project: press <strong>Settings & Exports button (⚙️ Gear Icon)</strong> in the top menu of your Google AI Studio Build system, and select <strong>"Download ZIP Archive"</strong> or <strong>"Export to GitHub"</strong>. This downloads all files, configurations, and packages to your system in a single click!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
