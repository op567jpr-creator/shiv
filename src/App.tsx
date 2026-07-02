import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Building2, Users, IndianRupee, MapPin, 
  Phone, Globe, Info, Compass, ShieldAlert, Sparkles, Check, FileText, Download, Printer
} from 'lucide-react';
import { downloadBase64File } from './utils/download';

// Core types & fallback startup data
import { Student, Payment, Complaint, Visitor, HostelSettings, UserSession, RoomSharing, StudentStatus, PartnerWithdrawal, HostelExpense, ExpenseCategory } from './types';
import { 
  INITIAL_STUDENTS, INITIAL_PAYMENTS, INITIAL_COMPLAINTS, 
  INITIAL_VISITORS, DEFAULT_SETTINGS, INITIAL_PARTNER_WITHDRAWALS, INITIAL_HOSTEL_EXPENSES
} from './mockData';

// Landing Website Components
import Header from './components/Header';
import NoticeBar from './components/NoticeBar';
import Hero from './components/Hero';
import About from './components/About';
import RoomsSection from './components/RoomsSection';
import Facilities from './components/Facilities';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Warden Portal Entry
import AdminLogin from './components/AdminLogin';

// Warden Panel Dashboard Layout & Sub-Views
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import StudentManagement from './components/StudentManagement';
import PaymentManagement from './components/PaymentManagement';
import DuePayments from './components/DuePayments';
import RoomManagement from './components/RoomManagement';
import ComplaintManagement from './components/ComplaintManagement';
import VisitorManagement from './components/VisitorManagement';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';
import ElectricityManagement from './components/ElectricityManagement';
import PartnerManagement from './components/PartnerManagement';

// Generic widgets
import Modal from './components/Modal';
import ReceiptPrinter from './components/ReceiptPrinter';

// Sub-Modal Forms
import StudentForm from './components/StudentForm';
import PaymentForm from './components/PaymentForm';
import ComplaintForm from './components/ComplaintForm';
import VisitorForm from './components/VisitorForm';
import StudentSelfRegistration from './components/StudentSelfRegistration';
import StudentFeeDuesLookup from './components/StudentFeeDuesLookup';
import MessMenuManagement from './components/MessMenuManagement';

export default function App() {
  // --- DATABASE LOCAL STATE ENGINE ---
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [partnerWithdrawals, setPartnerWithdrawals] = useState<PartnerWithdrawal[]>([]);
  const [expenses, setExpenses] = useState<HostelExpense[]>([]);
  const [settings, setSettings] = useState<HostelSettings>(DEFAULT_SETTINGS);
  const [session, setSession] = useState<UserSession | null>(null);

  // --- NAVIGATION STATE ROUTER ---
  // curView: 'website' | 'login' | 'dashboard' | 'student-registration' | 'student-dues-lookup'
  const [curView, setCurView] = useState<'website' | 'login' | 'dashboard' | 'student-registration' | 'student-dues-lookup'>('website');
  const [curTab, setCurTab] = useState<string>('dashboard');

  // --- SUB-MODAL WINDOW CONTROLLERS ---
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);

  // --- DETAILS PROFILE POPUP & RECEIPT PRINTER ---
  const [selectedPrintPayment, setSelectedPrintPayment] = useState<Payment | null>(null);
  const [selectedViewStudent, setSelectedViewStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  // --- TOAST NOTIFICATIONS MANAGER ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);

  // --- DATABASE INITIALIZATION ON MOUNT ---
  useEffect(() => {
    // If we have an injected offline database (e.g. inside downloaded standalone file),
    // prime localStorage to carry over that state securely to the standalone runtime environment.
    const offlineDB = (window as any).OFFLINE_DB;
    if (offlineDB && typeof offlineDB === 'object') {
      if (offlineDB.students) localStorage.setItem('ubh_students', JSON.stringify(offlineDB.students));
      if (offlineDB.payments) localStorage.setItem('ubh_payments', JSON.stringify(offlineDB.payments));
      if (offlineDB.complaints) localStorage.setItem('ubh_complaints', JSON.stringify(offlineDB.complaints));
      if (offlineDB.visitors) localStorage.setItem('ubh_visitors', JSON.stringify(offlineDB.visitors));
      if (offlineDB.partnerWithdrawals) localStorage.setItem('ubh_partner_withdrawals', JSON.stringify(offlineDB.partnerWithdrawals));
      if (offlineDB.expenses) localStorage.setItem('ubh_hostel_expenses', JSON.stringify(offlineDB.expenses));
      if (offlineDB.settings) localStorage.setItem('ubh_settings', JSON.stringify(offlineDB.settings));
      if (offlineDB.session) localStorage.setItem('ubh_session', JSON.stringify(offlineDB.session));
      
      // Clear it from memory so page refreshes don't constantly overwrite progress
      try {
        (window as any).OFFLINE_DB = null;
      } catch (e) {}
    }

    // Students
    try {
      const cachedStudents = localStorage.getItem('ubh_students');
      if (cachedStudents) setStudents(JSON.parse(cachedStudents));
      else {
        setStudents(INITIAL_STUDENTS);
        localStorage.setItem('ubh_students', JSON.stringify(INITIAL_STUDENTS));
      }
    } catch (e) {
      console.error('Error loading cached students:', e);
      setStudents(INITIAL_STUDENTS);
    }

    // Payments
    try {
      const cachedPayments = localStorage.getItem('ubh_payments');
      if (cachedPayments) setPayments(JSON.parse(cachedPayments));
      else {
        setPayments(INITIAL_PAYMENTS);
        localStorage.setItem('ubh_payments', JSON.stringify(INITIAL_PAYMENTS));
      }
    } catch (e) {
      console.error('Error loading cached payments:', e);
      setPayments(INITIAL_PAYMENTS);
    }

    // Complaints
    try {
      const cachedComplaints = localStorage.getItem('ubh_complaints');
      if (cachedComplaints) setComplaints(JSON.parse(cachedComplaints));
      else {
        setComplaints(INITIAL_COMPLAINTS);
        localStorage.setItem('ubh_complaints', JSON.stringify(INITIAL_COMPLAINTS));
      }
    } catch (e) {
      console.error('Error loading cached complaints:', e);
      setComplaints(INITIAL_COMPLAINTS);
    }

    // Visitors
    try {
      const cachedVisitors = localStorage.getItem('ubh_visitors');
      if (cachedVisitors) setVisitors(JSON.parse(cachedVisitors));
      else {
        setVisitors(INITIAL_VISITORS);
        localStorage.setItem('ubh_visitors', JSON.stringify(INITIAL_VISITORS));
      }
    } catch (e) {
      console.error('Error loading cached visitors:', e);
      setVisitors(INITIAL_VISITORS);
    }

    // Partner Withdrawals
    try {
      const cachedWithdrawals = localStorage.getItem('ubh_partner_withdrawals');
      if (cachedWithdrawals) setPartnerWithdrawals(JSON.parse(cachedWithdrawals));
      else {
        setPartnerWithdrawals(INITIAL_PARTNER_WITHDRAWALS);
        localStorage.setItem('ubh_partner_withdrawals', JSON.stringify(INITIAL_PARTNER_WITHDRAWALS));
      }
    } catch (e) {
      console.error('Error loading cached withdrawals:', e);
      setPartnerWithdrawals(INITIAL_PARTNER_WITHDRAWALS);
    }

    // Hostel Expenses
    try {
      const cachedExpenses = localStorage.getItem('ubh_hostel_expenses');
      if (cachedExpenses) setExpenses(JSON.parse(cachedExpenses));
      else {
        setExpenses(INITIAL_HOSTEL_EXPENSES);
        localStorage.setItem('ubh_hostel_expenses', JSON.stringify(INITIAL_HOSTEL_EXPENSES));
      }
    } catch (e) {
      console.error('Error loading cached expenses:', e);
      setExpenses(INITIAL_HOSTEL_EXPENSES);
    }

    // Settings
    try {
      const cachedSettings = localStorage.getItem('ubh_settings');
      if (cachedSettings) {
        let parsed = JSON.parse(cachedSettings);
        if (
          !parsed.email || 
          parsed.address?.includes('Pratap Nagar') || 
          !parsed.address?.includes('Near JECRC College') || 
          parsed.email?.includes('info@unityboyshostel.com') ||
          parsed.upi !== 'gpay-12189467181@okbizaxis'
        ) {
          parsed = { ...parsed, ...DEFAULT_SETTINGS, upi: 'gpay-12189467181@okbizaxis' };
        }
        
        // Ensure ALL default key-values (including newly added fields) are merged properly
        parsed = {
          ...DEFAULT_SETTINGS,
          ...parsed
        };
        
        localStorage.setItem('ubh_settings', JSON.stringify(parsed));
        setSettings(parsed);
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('ubh_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (e) {
      console.error('Error loading cached settings:', e);
      setSettings(DEFAULT_SETTINGS);
    }

    // Sessions
    try {
      const cachedSession = localStorage.getItem('ubh_session');
      if (cachedSession) {
        const parsedS = JSON.parse(cachedSession);
        setSession(parsedS);
        setCurView('dashboard');
      }
    } catch (e) {
      console.error('Error loading cached session:', e);
    }

    // Check for self registration form requests
    const uParams = new URLSearchParams(window.location.search);
    if (uParams.get('mode') === 'student-form' || window.location.hash === '#student-form') {
      setCurView('student-registration');
    } else if (uParams.get('mode') === 'check-dues' || window.location.hash === '#check-dues') {
      setCurView('student-dues-lookup');
    }
  }, []);

  // --- ALERT SENDER UTILITY ---
  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // --- DATABASE PERSIST SHIELD ---
  const handleStudentsUpdate = (updated: Student[]) => {
    setStudents(updated);
    localStorage.setItem('ubh_students', JSON.stringify(updated));
  };

  const handlePaymentsUpdate = (updated: Payment[]) => {
    setPayments(updated);
    localStorage.setItem('ubh_payments', JSON.stringify(updated));
  };

  const handleComplaintsUpdate = (updated: Complaint[]) => {
    setComplaints(updated);
    localStorage.setItem('ubh_complaints', JSON.stringify(updated));
  };

  const handleVisitorsUpdate = (updated: Visitor[]) => {
    setVisitors(updated);
    localStorage.setItem('ubh_visitors', JSON.stringify(updated));
  };

  const handlePartnerWithdrawalsUpdate = (updated: PartnerWithdrawal[]) => {
    setPartnerWithdrawals(updated);
    localStorage.setItem('ubh_partner_withdrawals', JSON.stringify(updated));
  };

  const handleAddPartnerWithdrawal = (partner: 'Shiv' | 'Sunny', amount: number, date: string, purpose: string) => {
    const newW: PartnerWithdrawal = {
      id: Date.now(),
      partner,
      amount,
      date,
      purpose,
      recordedBy: session?.name || 'Master Admin'
    };
    handlePartnerWithdrawalsUpdate([...partnerWithdrawals, newW]);
  };

  const handleDeletePartnerWithdrawal = (id: number) => {
    const updated = partnerWithdrawals.filter(w => w.id !== id);
    handlePartnerWithdrawalsUpdate(updated);
  };

  const handleEditPartnerWithdrawal = (id: number, updatedFields: { partner: 'Shiv' | 'Sunny'; amount: number; date: string; purpose: string }) => {
    const updated = partnerWithdrawals.map(w => {
      if (w.id === id) {
        const historyEntry = {
          date: w.date,
          amount: w.amount,
          purpose: w.purpose,
          editedAt: new Date().toLocaleString('en-IN')
        };
        const currentHistory = w.history || [];
        return {
          ...w,
          ...updatedFields,
          isEdited: true,
          history: [...currentHistory, historyEntry]
        };
      }
      return w;
    });
    handlePartnerWithdrawalsUpdate(updated);
  };

  const handleExpensesUpdate = (updated: HostelExpense[]) => {
    setExpenses(updated);
    localStorage.setItem('ubh_hostel_expenses', JSON.stringify(updated));
  };

  const handleAddExpense = (category: ExpenseCategory, amount: number, date: string, purpose: string) => {
    const newE: HostelExpense = {
      id: Date.now(),
      category,
      amount,
      date,
      purpose,
      recordedBy: session?.name || 'Master Admin'
    };
    handleExpensesUpdate([...expenses, newE]);
  };

  const handleDeleteExpense = (id: number) => {
    const updated = expenses.filter(e => e.id !== id);
    handleExpensesUpdate(updated);
  };

  const handleEditExpense = (id: number, updatedFields: { category: ExpenseCategory; amount: number; date: string; purpose: string }) => {
    const updated = expenses.map(e => {
      if (e.id === id) {
        const historyEntry = {
          date: e.date,
          amount: e.amount,
          purpose: e.purpose,
          editedAt: new Date().toLocaleString('en-IN')
        };
        const currentHistory = e.history || [];
        return {
          ...e,
          ...updatedFields,
          isEdited: true,
          history: [...currentHistory, historyEntry]
        };
      }
      return e;
    });
    handleExpensesUpdate(updated);
  };

  // --- UTILITY TO SCROLL SMOOTHLY ---
  const handleScrollTo = (id: string) => {
    setCurView('website');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSessionLogin = (sessionData: UserSession) => {
    setSession(sessionData);
    localStorage.setItem('ubh_session', JSON.stringify(sessionData));
    setCurView('dashboard');
    setCurTab('dashboard');
  };

  const handleSessionLogout = () => {
    setSession(null);
    localStorage.removeItem('ubh_session');
    setCurView('website');
  };

  // --- CRUD BUSINESS HANDLERS ---

  // Registering fresh students or editing existing ones
  const handleAddStudent = (fields: Omit<Student, 'id' | 'paid' | 'due' | 'joinDate'> & { id?: number; paid?: number; due?: number; joinDate?: string }) => {
    if (fields.id) {
      // Edit mode!
      const updated = students.map(s => {
        if (s.id === fields.id) {
          const finalPayable = fields.finalPayableAmount !== undefined ? fields.finalPayableAmount : fields.fee;
          return {
            ...s,
            ...fields,
            due: Math.max(0, finalPayable - (s.paid || 0))
          } as Student;
        }
        return s;
      });
      handleStudentsUpdate(updated);
      setIsStudentModalOpen(false);
      setStudentToEdit(null);
      showToast(`Updated student profile for "${fields.name}" successfully! ✏️`);
    } else {
      // Add mode!
      const defaultDue = fields.finalPayableAmount !== undefined ? fields.finalPayableAmount : fields.fee;
      const freshStudent: Student = {
        ...fields,
        id: Date.now(),
        paid: 0,
        due: defaultDue,
        joinDate: new Date().toLocaleDateString('en-IN')
      } as Student;

      const newArr = [...students, freshStudent];
      handleStudentsUpdate(newArr);
      setIsStudentModalOpen(false);
      showToast(`Registered lodger: "${fields.name}" in Room ${fields.room}! 🏠`);
    }
  };

  // --- ELECTRICITY METER READING AGENT ---
  const handleUpdateStudentElectricity = (
    studentId: number, 
    newReading: number, 
    readingDate: string, 
    billAmount: number, 
    addToDues: boolean,
    historyJsonStr: string
  ) => {
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        const nextDue = addToDues ? (s.due + billAmount) : s.due;
        return {
          ...s,
          elecLastReading: newReading,
          elecLastReadingDate: readingDate,
          elecHistoryJson: historyJsonStr,
          due: nextDue
        };
      }
      return s;
    });

    handleStudentsUpdate(updatedStudents);
    showToast(`Saved meter reading. ${addToDues ? `₹${billAmount.toLocaleString('en-IN')} added to student dues. ⚡` : 'Reading successfully logged! ⚡'}`);
  };

  // Deleting records
  const handleDeleteStudent = (id: number) => {
    const studentName = students.find(s => s.id === id)?.name || 'Student';
    const newArr = students.filter(s => s.id !== id);
    handleStudentsUpdate(newArr);
    
    // Also optional: let's filter related logs but preserve transaction numbers to avoid breaking historical totals
    showToast(`Removed registration file for ${studentName}. 🗑️`);
  };

  // Registering or Correcting payment collections
  const handleRecordPayment = (fields: { studentId: number; amount: number; mode: any; month: string; note: string; paymentType?: 'Monthly' | 'Installment'; installmentNo?: string }) => {
    const matchingStudentObj = students.find(s => s.id === fields.studentId);
    if (!matchingStudentObj) {
      showToast('Lodger not mapped in dataset! ⚠️', true);
      return;
    }

    if (paymentToEdit) {
      // Revert old payment balances off the previous student
      const undoneStudents = students.map(s => {
        if (s.id === paymentToEdit.studentId) {
          const nextPaidSum = Math.max(0, s.paid - paymentToEdit.amount);
          return {
            ...s,
            paid: nextPaidSum,
            due: Math.max(0, s.fee - nextPaidSum)
          };
        }
        return s;
      });

      // Apply new payment balances to current selected student
      const updatedStudents = undoneStudents.map(s => {
        if (s.id === fields.studentId) {
          const nextPaidSum = s.paid + fields.amount;
          return {
            ...s,
            paid: nextPaidSum,
            due: Math.max(0, s.fee - nextPaidSum)
          };
        }
        return s;
      });

      // Update payment array, preserving internal ID, Receipt code, and Original creation date
      const updatedPayments = payments.map(p => {
        if (p.id === paymentToEdit.id) {
          return {
            ...p,
            studentId: fields.studentId,
            studentName: matchingStudentObj.name,
            room: matchingStudentObj.room,
            amount: fields.amount,
            mode: fields.mode,
            month: fields.month,
            note: fields.note,
            paymentType: fields.paymentType || 'Monthly',
            installmentNo: fields.installmentNo,
            fatherName: matchingStudentObj.father
          };
        }
        return p;
      });

      handleStudentsUpdate(updatedStudents);
      handlePaymentsUpdate(updatedPayments);
      setIsPaymentModalOpen(false);
      setPaymentToEdit(null);
      showToast(`Receipt #${paymentToEdit.receipt} corrected successfully. 🧾`);
      return;
    }

    // New payment flow
    const pay: Payment = {
      id: Date.now(),
      receipt: 'UBH' + Date.now().toString().slice(-6),
      studentId: fields.studentId,
      studentName: matchingStudentObj.name,
      room: matchingStudentObj.room,
      amount: fields.amount,
      mode: fields.mode,
      month: fields.month,
      date: new Date().toLocaleDateString('en-IN'),
      note: fields.note,
      paymentType: fields.paymentType || 'Monthly',
      installmentNo: fields.installmentNo,
      fatherName: matchingStudentObj.father
    };

    // Update balances of student in registration register
    const updatedStudents = students.map(s => {
      if (s.id === fields.studentId) {
        const nextPaidSum = s.paid + fields.amount;
        return {
          ...s,
          paid: nextPaidSum,
          due: Math.max(0, s.fee - nextPaidSum)
        };
      }
      return s;
    });

    handleStudentsUpdate(updatedStudents);
    handlePaymentsUpdate([...payments, pay]);
    setIsPaymentModalOpen(false);
    showToast(`Fee logs registered for Room ${matchingStudentObj.room}. Receipt: #${pay.receipt} 🧾`);
    
    // Auto launch receipt print window on completion
    setTimeout(() => {
      setSelectedPrintPayment(pay);
    }, 400);
  };

  // Voiding / Deleting a specific recorded payment completely
  const handleDeletePayment = (paymentId: number) => {
    const pay = payments.find(p => p.id === paymentId);
    if (!pay) return;

    // Reset customer dues and collections
    const revertedStudents = students.map(s => {
      if (s.id === pay.studentId) {
        const nextPaidSum = Math.max(0, s.paid - pay.amount);
        return {
          ...s,
          paid: nextPaidSum,
          due: Math.max(0, s.fee - nextPaidSum)
        };
      }
      return s;
    });

    const filteredPayments = payments.filter(p => p.id !== paymentId);
    handleStudentsUpdate(revertedStudents);
    handlePaymentsUpdate(filteredPayments);
    showToast(`Voided receipt #${pay.receipt} completely. Balances reverted. 🗑️`);
  };

  // Filing active complaints
  const handleRegisterComplaint = (fields: { studentId: number; type: any; priority: any; description: string }) => {
    const matchingStudentObj = students.find(s => s.id === fields.studentId);
    if (!matchingStudentObj) {
      showToast('Lodger not matched! ⚠️', true);
      return;
    }

    const comp: Complaint = {
      id: Date.now(),
      ticket: 'T' + Date.now().toString().slice(-5),
      studentId: fields.studentId,
      studentName: matchingStudentObj.name,
      room: matchingStudentObj.room,
      type: fields.type,
      priority: fields.priority,
      description: fields.description,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-IN')
    };

    handleComplaintsUpdate([...complaints, comp]);
    setIsComplaintModalOpen(false);
    showToast(`Maintenance Ticket filed: #${comp.ticket}! 🛠️`);
  };

  // Resolving complaint tickets
  const handleResolveComplaint = (id: number) => {
    const updated = complaints.map(c => {
      if (c.id === id) return { ...c, status: 'Resolved' as const };
      return c;
    });
    handleComplaintsUpdate(updated);
    showToast('Complaint ticket cleared & resolved! ✓');
  };

  // Check-in guest logs
  const handleRegisterVisitor = (fields: { name: string; contact: string; studentId: number; purpose: string; relation: string }) => {
    const matchingStudentObj = students.find(s => s.id === fields.studentId);
    if (!matchingStudentObj) {
      showToast('Student missing! ⚠️', true);
      return;
    }

    const vis: Visitor = {
      id: Date.now(),
      name: fields.name,
      contact: fields.contact,
      studentId: fields.studentId,
      studentName: matchingStudentObj.name,
      room: matchingStudentObj.room,
      purpose: fields.purpose,
      relation: fields.relation,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    handleVisitorsUpdate([...visitors, vis]);
    setIsVisitorModalOpen(false);
    showToast(`Warden visitor register logged for "${fields.name}"! 🚪`);
  };

  // Saving settings
  const handleSaveSettings = (updated: HostelSettings) => {
    setSettings(updated);
    localStorage.setItem('ubh_settings', JSON.stringify(updated));
    showToast('Hostel configurations saved successfully! ⚙️');
  };

  // Clearing all records (Flush system DB)
  const handleClearAllData = () => {
    if (confirm('⚠️ WARNING: This will completely delete all registered students, payments, complaints, partner withdrawals, expenses, and visitors logs! Click OK to format.')) {
      setStudents([]);
      setPayments([]);
      setComplaints([]);
      setVisitors([]);
      setPartnerWithdrawals([]);
      setExpenses([]);
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('ubh_students');
      localStorage.removeItem('ubh_payments');
      localStorage.removeItem('ubh_complaints');
      localStorage.removeItem('ubh_visitors');
      localStorage.removeItem('ubh_partner_withdrawals');
      localStorage.removeItem('ubh_hostel_expenses');
      localStorage.setItem('ubh_settings', JSON.stringify(DEFAULT_SETTINGS));
      showToast('Database wiped out successfully!');
    }
  };

  // Backup dataset download
  const handleBackupAllData = () => {
    try {
      const fullDB = {
        students,
        payments,
        complaints,
        visitors,
        partnerWithdrawals,
        expenses,
        settings
      };
      const rawText = JSON.stringify(fullDB, null, 2);
      const blob = new Blob([rawText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ubh-hostel-backup-${Date.now()}.json`;
      link.click();
      showToast('Hostel JSON backup downloaded successfully! 📥');
    } catch (e) {
      showToast('Failed to download database backup! ❌', true);
    }
  };

  // Restoring backup
  const handleRestoreAllData = (importedDB: any) => {
    try {
      if (importedDB.students) {
        setStudents(importedDB.students);
        localStorage.setItem('ubh_students', JSON.stringify(importedDB.students));
      }
      if (importedDB.payments) {
        setPayments(importedDB.payments);
        localStorage.setItem('ubh_payments', JSON.stringify(importedDB.payments));
      }
      if (importedDB.complaints) {
        setComplaints(importedDB.complaints);
        localStorage.setItem('ubh_complaints', JSON.stringify(importedDB.complaints));
      }
      if (importedDB.visitors) {
        setVisitors(importedDB.visitors);
        localStorage.setItem('ubh_visitors', JSON.stringify(importedDB.visitors));
      }
      if (importedDB.partnerWithdrawals) {
        setPartnerWithdrawals(importedDB.partnerWithdrawals);
        localStorage.setItem('ubh_partner_withdrawals', JSON.stringify(importedDB.partnerWithdrawals));
      }
      if (importedDB.expenses) {
        setExpenses(importedDB.expenses);
        localStorage.setItem('ubh_hostel_expenses', JSON.stringify(importedDB.expenses));
      }
      if (importedDB.settings) {
        setSettings(importedDB.settings);
        localStorage.setItem('ubh_settings', JSON.stringify(importedDB.settings));
      }
      showToast('Hostel backup restored successfully! Database synchronized. ✅');
    } catch (e) {
      showToast('Failed to parse database backup template! ❌', true);
    }
  };

  const openQuickActionModal = (type: string) => {
    if (type === 'student') {
      setStudentToEdit(null);
      setIsStudentModalOpen(true);
    }
    else if (type === 'payment') setIsPaymentModalOpen(true);
    else if (type === 'complaint') setIsComplaintModalOpen(true);
    else if (type === 'visitor') setIsVisitorModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white select-none selection:bg-[#FF6B35]/20 text-gray-800 antialiased font-sans">
      
      {/* ==================== 1. PUBLIC WEBSITE PERSPECTIVE ==================== */}
      {curView === 'website' && (
        <div className="flex flex-col min-h-screen font-sans">
          <Header 
            onOpenLogin={() => setCurView('login')} 
            onScrollTo={handleScrollTo} 
            onOpenSelfRegistration={() => setCurView('student-registration')}
            onOpenDuesLookup={() => setCurView('student-dues-lookup')}
          />
          <main className="flex-1">
            <Hero 
              onScrollTo={handleScrollTo} 
              onOpenLogin={() => setCurView('login')} 
              onOpenDuesLookup={() => setCurView('student-dues-lookup')}
              onOpenSelfRegistration={() => setCurView('student-registration')}
              settings={settings}
            />
            <NoticeBar />
            <About />
            <RoomsSection onScrollTo={handleScrollTo} />
            <Facilities />
            <Contact onShowToast={showToast} />
          </main>
          <Footer 
            onScrollTo={handleScrollTo} 
            onOpenLogin={() => setCurView('login')} 
          />
          
          {/* Floating WhatsApp chat */}
          <a
            href="https://wa.me/918209696820?text=I%20am%20interested%20in%20booking%20hostel%20accommodation!"
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white flex items-center gap-2 px-5 py-3 rounded-full hover:shadow-lg hover:shadow-emerald-500/35 hover:-translate-y-0.5 transition duration-200 cursor-pointer font-bold text-xs"
          >
            <MessageSquareChat className="w-5 h-5 fill-current" />
            Chat with
          </a>
        </div>
      )}

      {/* ==================== 1B. STUDENT SELF-REGISTRATION PORTAL ==================== */}
      {curView === 'student-registration' && (
        <StudentSelfRegistration
          students={students}
          settings={settings}
          onAddStudent={(newLodger) => {
            handleAddStudent(newLodger);
          }}
          onGoBack={() => {
            setCurView('website');
            // Flush url search query state clean safely
            try {
              window.history.pushState({}, '', window.location.origin || '/');
            } catch (e) {
              console.warn('History pushState is not available in this environment:', e);
            }
          }}
          onShowToast={showToast}
        />
      )}

      {/* ==================== 1C. STUDENT DUES LOOKUP & UPI PORTAL ==================== */}
      {curView === 'student-dues-lookup' && (
        <StudentFeeDuesLookup
          students={students}
          payments={payments}
          complaints={complaints}
          settings={settings}
          onAddComplaint={handleRegisterComplaint}
          onUpdateStudent={(updatedStudent: Student) => {
            const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
            handleStudentsUpdate(updatedList);
          }}
          onShowToast={showToast}
          onGoBack={() => {
            setCurView('website');
            try {
              window.history.pushState({}, '', window.location.origin || '/');
            } catch (e) {
              console.warn('History pushState is not available in this environment:', e);
            }
          }}
        />
      )}

      {/* ==================== 2. ADMIN LOGIN GATEWAY ==================== */}
      {curView === 'login' && (
        <AdminLogin
          onClose={() => setCurView('website')}
          onLoginSuccess={handleSessionLogin}
          onShowToast={showToast}
        />
      )}

      {/* ==================== 3. WARDEN PANEL DASHBOARD SYSTEM ==================== */}
      {curView === 'dashboard' && session && (
        <DashboardLayout
          session={session}
          students={students}
          payments={payments}
          complaints={complaints}
          visitors={visitors}
          settings={settings}
          onLogout={handleSessionLogout}
          onGoToWebsite={() => setCurView('website')}
          currentTab={curTab}
          onChangeTab={setCurTab}
          onOpenQuickModal={(type) => openQuickActionModal(type)}
        >
          {/* Dashboard router Tab rendering */}
          {curTab === 'dashboard' && (
            <DashboardHome
              session={session}
              students={students}
              payments={payments}
              complaints={complaints}
              visitors={visitors}
              settings={settings}
              onNavigateTab={setCurTab}
              onOpenQuickModal={(type) => openQuickActionModal(type)}
              onShowToast={showToast}
              onEditStudent={(s) => {
                setStudentToEdit(s);
                setIsStudentModalOpen(true);
              }}
            />
          )}

          {curTab === 'students' && (
            <StudentManagement
              students={students}
              onDeleteStudent={handleDeleteStudent}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setIsStudentModalOpen(true);
              }}
              onViewDetails={(s) => setSelectedViewStudent(s)}
              onShowToast={showToast}
              onEditStudent={(s) => {
                setStudentToEdit(s);
                setIsStudentModalOpen(true);
              }}
            />
          )}

          {curTab === 'payments' && (
            <PaymentManagement
              payments={payments}
              students={students}
              onOpenReceivePayment={() => {
                setPaymentToEdit(null);
                setIsPaymentModalOpen(true);
              }}
              onPrintReceipt={(p) => setSelectedPrintPayment(p)}
              onEditPayment={(p) => {
                setPaymentToEdit(p);
                setIsPaymentModalOpen(true);
              }}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {curTab === 'due' && (
            <DuePayments
              students={students}
            />
          )}

          {curTab === 'electricity' && (
            <ElectricityManagement
              students={students}
              onUpdateStudentElectricity={handleUpdateStudentElectricity}
              onShowToast={showToast}
            />
          )}

          {curTab === 'rooms' && (
            <RoomManagement
              students={students}
            />
          )}

          {curTab === 'complaints' && (
            <ComplaintManagement
              complaints={complaints}
              onResolveComplaint={handleResolveComplaint}
              onOpenAddComplaint={() => setIsComplaintModalOpen(true)}
            />
          )}

          {curTab === 'visitors' && (
            <VisitorManagement
              visitors={visitors}
              onOpenAddVisitor={() => setIsVisitorModalOpen(true)}
            />
          )}

          {curTab === 'mess' && (
            <MessMenuManagement
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onShowToast={showToast}
            />
          )}

          {curTab === 'partners' && (
            <PartnerManagement
              partnerWithdrawals={partnerWithdrawals}
              payments={payments}
              onAddWithdrawal={handleAddPartnerWithdrawal}
              onDeleteWithdrawal={handleDeletePartnerWithdrawal}
              onEditWithdrawal={handleEditPartnerWithdrawal}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
              onShowToast={showToast}
            />
          )}

          {curTab === 'reports' && (
            <ReportsPanel
              students={students}
              payments={payments}
              complaints={complaints}
              visitors={visitors}
              onShowToast={showToast}
            />
          )}

          {curTab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onClearAllData={handleClearAllData}
              onBackupAllData={handleBackupAllData}
              onRestoreAllData={handleRestoreAllData}
              onShowToast={showToast}
              students={students}
              payments={payments}
              complaints={complaints}
              visitors={visitors}
            />
          )}
        </DashboardLayout>
      )}

      {/* ==================== 4. GENERAL WINDOW TOASTS ALERTER ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 80, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`fixed top-24 right-5 sm:right-8 z-50 px-6 py-4 rounded-xl shadow-xl font-bold flex items-center gap-3 text-xs sm:text-sm text-white ${
              toastError 
                ? 'bg-rose-600 shadow-rose-600/20' 
                : 'bg-emerald-600 shadow-emerald-600/20'
            }`}
          >
            {!toastError && <Check className="w-5 h-5 flex-shrink-0" />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 5. MODAL POPUP WINDOW WRAPPERS ==================== */}
      
      {/* Student Form Modal */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        title={studentToEdit ? "Edit Student Profile Details" : "Check-In Student Registration"}
      >
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => {
            setIsStudentModalOpen(false);
            setStudentToEdit(null);
          }}
          onShowToast={showToast}
          studentToEdit={studentToEdit || undefined}
        />
      </Modal>

      {/* Fee Payment Form Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentToEdit(null);
        }}
        title={paymentToEdit ? `Correct Fee Payment Receipt #${paymentToEdit.receipt}` : "Log Received Ledger Fee Payment"}
      >
        <PaymentForm
          students={students}
          onSubmit={handleRecordPayment}
          onCancel={() => {
            setIsPaymentModalOpen(false);
            setPaymentToEdit(null);
          }}
          onShowToast={showToast}
          paymentToEdit={paymentToEdit || undefined}
          upiId={settings.upi}
        />
      </Modal>

      {/* Complaint Form Modal */}
      <Modal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        title="File Maintenance Issue Ticket"
      >
        <ComplaintForm
          students={students}
          onSubmit={handleRegisterComplaint}
          onCancel={() => setIsComplaintModalOpen(false)}
          onShowToast={showToast}
        />
      </Modal>

      {/* Visitor Form Modal */}
      <Modal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        title="Log Guest Visitors Entry"
      >
        <VisitorForm
          students={students}
          onSubmit={handleRegisterVisitor}
          onCancel={() => setIsVisitorModalOpen(false)}
          onShowToast={showToast}
        />
      </Modal>

      {/* Voucher Printer Modal */}
      <ReceiptPrinter
        payment={selectedPrintPayment}
        settings={settings}
        onClose={() => setSelectedPrintPayment(null)}
      />

      {/* Student Profile details card popup */}
      <Modal
        isOpen={selectedViewStudent !== null}
        onClose={() => setSelectedViewStudent(null)}
        title="Lodger Profile Sheet Summary"
      >
        {selectedViewStudent && (
          <div className="space-y-4 font-sans text-xs sm:text-sm max-h-[80vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-105 shadow-md shadow-[#FF6B35]/15">
                  {selectedViewStudent.profilePic ? (
                    <img src={selectedViewStudent.profilePic} alt={selectedViewStudent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#1A1A2E] to-[#FF6B35] flex items-center justify-center font-black text-xl text-white">
                      {selectedViewStudent.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="text-base sm:text-lg font-black text-gray-800 leading-tight">{selectedViewStudent.name}</h5>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[10px] sm:text-xs font-bold text-white bg-[#FF6B35] px-2.5 py-0.5 rounded-full">Room {selectedViewStudent.room}</span>
                    <span className="text-[10px] sm:text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{selectedViewStudent.sharing} sharing</span>
                    {selectedViewStudent.acType && (
                      <span className="text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">{selectedViewStudent.acType}</span>
                    )}
                    {selectedViewStudent.status && (
                      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedViewStudent.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {selectedViewStudent.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* HIGH FIDELITY PRINT BUTTON */}
              <button
                onClick={() => {
                  const win = window.open('', '_blank');
                  if (!win) return;
                  const profileHtml = `
                    <html>
                      <head>
                        <title>Admission Form - ${selectedViewStudent.name}</title>
                        <style>
                          body { font-family: 'Inter', sans-serif; color: #333; margin: 0; padding: 25px; line-height: 1.5; }
                          .header { border-bottom: 2.5px solid #FF6B35; padding-bottom: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
                          .logo-text { font-size: 22px; font-weight: 900; color: #1A1A2E; letter-spacing: -0.5px; }
                          .logo-sub { font-size: 9px; text-transform: uppercase; color: #666; font-weight: 800; letter-spacing: 1.2px; margin-top: 2px; }
                          .form-title { font-size: 14px; font-weight: 900; text-align: center; background: #FFF5F2; border: 1.5px solid #FFD6C9; padding: 8px; margin: 15px 0; border-radius: 10px; color: #FF6B35; text-transform: uppercase; letter-spacing: 0.5px; }
                          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                          .section { padding: 12px 14px; background: #FAF9F6; border: 1px solid #EAE6DF; border-radius: 12px; }
                          .section-title { font-size: 11px; font-weight: 900; color: #1A1A2E; border-bottom: 1px dashed #D1CFC7; padding-bottom: 5px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
                          .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
                          .label { color: #6B7280; font-weight: 600; }
                          .value { color: #111827; font-weight: 700; }
                          .pic-container { text-align: center; margin-bottom: 12px; }
                          .profile-pic { width: 100px; height: 100px; border-radius: 14px; object-fit: cover; border: 2.5px solid #FF6B35; box-shadow: 0 3px 6px rgba(255,107,53,0.15); }
                          .footer { margin-top: 25px; text-align: center; font-size: 9px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; }
                          .signatures { display: flex; justify-content: space-between; margin-top: 35px; padding: 0 15px; }
                          .sig-line { width: 160px; border-top: 1px solid #444; text-align: center; padding-top: 5px; font-size: 11px; font-weight: 700; color: #4B5563; }
                          .annexure { page-break-before: always; margin-top: 20px; text-align: center; }
                          .annexure-title { font-size: 13px; font-weight: 950; color: #1A1A2E; border-bottom: 1.5px solid #FF6B35; padding-bottom: 6px; text-transform: uppercase; margin-bottom: 15px; }
                          .annexure-img { max-width: 90%; max-height: 80vh; border-radius: 12px; border: 2px solid #D1CFC7; margin-top: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                          @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                          }
                        </style>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
                      </head>
                      <body>
                        <div class="header">
                          <div>
                            <div class="logo-text">UNITY BOYS HOSTEL</div>
                            <div class="logo-sub">Premium Lodging Premises • Sanganer Jaipur Campus</div>
                          </div>
                          <div style="text-align: right; font-size: 9px; color: #666; font-weight: 750; line-height: 1.3;">
                            Warden Registry No: #${selectedViewStudent.id || 'N/A'}<br/>
                            Report Date: ${new Date().toLocaleDateString('en-IN')}
                          </div>
                        </div>

                        <div class="pic-container">
                          ${selectedViewStudent.profilePic ? `<img src="${selectedViewStudent.profilePic}" class="profile-pic" referrerPolicy="no-referrer" />` : `<div style="width:100px; height:100px; margin:auto; background:#F3F4F6; border:2.5px solid #FF6B35; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:900; color:#FF6B35; font-size:24px;">${selectedViewStudent.name.charAt(0).toUpperCase()}</div>`}
                          <div style="font-size:18px; font-weight:900; color:#1A1A2E; margin-top:6px;">${selectedViewStudent.name}</div>
                          <div style="font-size:10px; font-weight:800; color:#FF6B35; margin-top:1px; text-transform:uppercase; letter-spacing:0.8px;">Provisional Student Roll (प्रवेश पंजीयन)</div>
                        </div>

                        <div class="form-title">Student Admission Record Summary</div>

                        <div class="grid">
                          <div class="section">
                            <div class="section-title">👤 Basic Lodger Details</div>
                            <div class="row"><span class="label">Full Name:</span><span class="value">${selectedViewStudent.name}</span></div>
                            <div class="row"><span class="label">Mobile Number:</span><span class="value">${selectedViewStudent.mobile}</span></div>
                            <div class="row"><span class="label">Aadhaar Card:</span><span class="value">${selectedViewStudent.aadhaar || 'Pending'}</span></div>
                            <div class="row"><span class="label">Date of Birth:</span><span class="value">${selectedViewStudent.dob || 'Pending'}</span></div>
                            <div class="row"><span class="label">Blood Group / Sex:</span><span class="value">${selectedViewStudent.bloodGroup || 'N/A'} / ${selectedViewStudent.gender || 'Male'}</span></div>
                            <div class="row"><span class="label">Email Address:</span><span class="value">${selectedViewStudent.email || 'N/A'}</span></div>
                          </div>

                          <div class="section">
                            <div class="section-title">👨‍👩‍👦 FAMILY & SOS GUARDIANS</div>
                            <div class="row"><span class="label">Father Name:</span><span class="value">${selectedViewStudent.father || 'N/A'}</span></div>
                            <div class="row"><span class="label">Father Mobile:</span><span class="value">${selectedViewStudent.fatherMob || 'N/A'}</span></div>
                            <div class="row"><span class="label">Father Job:</span><span class="value">${selectedViewStudent.fatherOccupation || 'N/A'}</span></div>
                            <div class="row"><span class="label">Mother Name:</span><span class="value">${selectedViewStudent.motherName || 'N/A'}</span></div>
                            <div class="row"><span class="label">Mother Mobile:</span><span class="value">${selectedViewStudent.motherMobile || 'N/A'}</span></div>
                            <div class="row" style="color:#FF6B35;"><span class="label" style="color:#FF6B35;">Emergency contact:</span><span class="value">${selectedViewStudent.emergencyMobile || 'N/A'}</span></div>
                          </div>
                        </div>

                        <div class="grid">
                          <div class="section">
                            <div class="section-title">🏠 ROOM & ACCOMMODATION</div>
                            <div class="row"><span class="label">Room Number:</span><span class="value">Room ${selectedViewStudent.room}</span></div>
                            <div class="row"><span class="label">Sharing Type:</span><span class="value">${selectedViewStudent.sharing} sharing</span></div>
                            <div class="row"><span class="label">AC Specification:</span><span class="value">${selectedViewStudent.acType || 'Non AC'}</span></div>
                            <div class="row"><span class="label">Washroom Type:</span><span class="value">${selectedViewStudent.washroomType || 'Common'}</span></div>
                            <div class="row"><span class="label">Allotment Date:</span><span class="value">${selectedViewStudent.joinDate}</span></div>
                          </div>

                          <div class="section">
                            <div class="section-title">💰 FINANCIALS STATEMENTS</div>
                            <div class="row"><span class="label">Standard Month Rent:</span><span class="value">₹${selectedViewStudent.fee.toLocaleString('en-IN')}</span></div>
                            <div class="row"><span class="label">Total Paid Till Date:</span><span class="value" style="color:green;">₹${(selectedViewStudent.paid || 0).toLocaleString('en-IN')}</span></div>
                            <div class="row"><span class="label">Unpaid Dues Balance:</span><span class="value" ${selectedViewStudent.due > 0 ? 'style="color:red;"' : ''}>₹${(selectedViewStudent.due || 0).toLocaleString('en-IN')}</span></div>
                            <div class="row"><span class="label">Security Deposit:</span><span class="value">₹${(selectedViewStudent.securityDeposit || 0).toLocaleString('en-IN')}</span></div>
                            <div class="row"><span class="label">Billing Scheme:</span><span class="value">${selectedViewStudent.feePlan || 'Monthly Plan'}</span></div>
                          </div>
                        </div>

                        <div class="section" style="margin-bottom:16px;">
                          <div class="section-title">🗺️ PERMANENT ADDRESS DETAILS</div>
                          <div style="font-size:12px; font-weight:700; line-height:1.5;">${selectedViewStudent.address || 'N/A'}</div>
                        </div>

                        <div class="section">
                          <div class="section-title">📑 PHYSICAL & DIGITAL DOCUMENTS CHECKLIST</div>
                          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; font-size:10px; text-transform:uppercase; font-weight:800; text-align:center;">
                            <div style="padding:5px; border:1px solid #CCC; border-radius:5px; background:${selectedViewStudent.policeVerification && selectedViewStudent.policeVerification.startsWith('data:') ? '#EEFBF7' : '#F9FAFB'}; color:${selectedViewStudent.policeVerification && selectedViewStudent.policeVerification.startsWith('data:') ? 'green' : '#666'};">Police Verification: ${selectedViewStudent.policeVerification && selectedViewStudent.policeVerification.startsWith('data:') ? '✓ Uploaded' : '✗ Pending'}</div>
                            <div style="padding:5px; border:1px solid #CCC; border-radius:5px; background:${selectedViewStudent.hostelForm && selectedViewStudent.hostelForm.startsWith('data:') ? '#EEFBF7' : '#F9FAFB'}; color:${selectedViewStudent.hostelForm && selectedViewStudent.hostelForm.startsWith('data:') ? 'green' : '#666'};">Hostel Registration: ${selectedViewStudent.hostelForm && selectedViewStudent.hostelForm.startsWith('data:') ? '✓ Uploaded' : '✗ Pending'}</div>
                            <div style="padding:5px; border:1px solid #CCC; border-radius:5px; background:${selectedViewStudent.agreementDoc && selectedViewStudent.agreementDoc.startsWith('data:') ? '#EEFBF7' : '#F9FAFB'}; color:${selectedViewStudent.agreementDoc && selectedViewStudent.agreementDoc.startsWith('data:') ? 'green' : '#666'};">Lease Agreement: ${selectedViewStudent.agreementDoc && selectedViewStudent.agreementDoc.startsWith('data:') ? '✓ Uploaded' : '✗ Pending'}</div>
                            <div style="padding:5px; border:1px solid #CCC; border-radius:5px; background:${selectedViewStudent.studentAadhaarDoc && selectedViewStudent.studentAadhaarDoc.startsWith('data:') ? '#EEFBF7' : '#F9FAFB'}; color:${selectedViewStudent.studentAadhaarDoc && selectedViewStudent.studentAadhaarDoc.startsWith('data:') ? 'green' : '#666'};">Student Aadhaar Card: ${selectedViewStudent.studentAadhaarDoc && selectedViewStudent.studentAadhaarDoc.startsWith('data:') ? '✓ Uploaded' : '✗ Pending'}</div>
                            <div style="padding:5px; border:1px solid #CCC; border-radius:5px; background:${selectedViewStudent.fatherAadhaarDoc && selectedViewStudent.fatherAadhaarDoc.startsWith('data:') ? '#EEFBF7' : '#F9FAFB'}; color:${selectedViewStudent.fatherAadhaarDoc && selectedViewStudent.fatherAadhaarDoc.startsWith('data:') ? 'green' : '#666'};">Parent Aadhaar Card: ${selectedViewStudent.fatherAadhaarDoc && selectedViewStudent.fatherAadhaarDoc.startsWith('data:') ? '✓ Uploaded' : '✗ Pending'}</div>
                          </div>
                        </div>

                        <div class="signatures">
                          <div class="sig-line">Resident Signature</div>
                          <div class="sig-line">Hostel Officer / Warden</div>
                        </div>

                        <div class="footer">
                          Unity Boys Hostel • Near JECRC College, Pratap Nagar, Sanganer, Jaipur • +91 82096 96820 • official registry copy
                        </div>

                        <!-- ANNEXURE COPIES FOR ALL HIGH-RES UPLOADS -->
                        ${[
                          { label: 'Police Verification Proof Document', key: 'policeVerification' },
                          { label: 'Hostel Registration Form', key: 'hostelForm' },
                          { label: 'Rent Lease agreement Contract', key: 'agreementDoc' },
                          { label: 'Student Aadhaar Identification Card', key: 'studentAadhaarDoc' },
                          { label: 'Father / Parent Identity Aadhaar Card', key: 'fatherAadhaarDoc' },
                        ].map(doc => {
                          const rawDoc = (selectedViewStudent as any)[doc.key];
                          if (rawDoc && rawDoc.startsWith('data:')) {
                            return `
                              <div class="annexure">
                                <div class="annexure-title">Annexure Attachment: - ${doc.label}</div>
                                <img src="${rawDoc}" class="annexure-img" />
                              </div>
                            `;
                          }
                          return '';
                        }).join('')}

                        <script>
                          window.onload = function() {
                            setTimeout(function() {
                              window.print();
                            }, 500);
                          }
                        </script>
                      </body>
                    </html>
                  `;
                  win.document.open();
                  win.document.write(profileHtml);
                  win.document.close();
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 transition duration-150 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Details + Docs
              </button>
            </div>

            {/* Financial Status Summary Widget */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-gray-50 border border-gray-150 rounded-2xl">
              <div className="text-center">
                <span className="text-[9px] text-[#FF6B35] font-black block uppercase tracking-wider">Assigned Rent</span>
                <span className="font-extrabold text-gray-700 text-sm sm:text-base mt-0.5 block">₹{selectedViewStudent.fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-center border-x border-gray-200">
                <span className="text-[9px] text-emerald-600 font-black block uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-emerald-600 text-sm sm:text-base mt-0.5 block">₹{selectedViewStudent.paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-rose-600 font-black block uppercase tracking-wider">Balance Due</span>
                <span className="font-extrabold text-rose-600 text-sm sm:text-base mt-0.5 block">₹{selectedViewStudent.due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Accordion / Segmented Sections */}
            <div className="space-y-4">
              
              {/* SECTION 1: PERSONAL & CONTACT */}
              <div className="border border-gray-100 rounded-xl p-3.5 bg-white">
                <h6 className="font-black text-[11px] text-[#1A1A2E] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50">
                  1. Lodger Basic Info & Contacts
                </h6>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Mobile Contact</span>
                    <span className="font-bold text-gray-800 font-mono text-xs">{selectedViewStudent.mobile}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">WhatsApp</span>
                    <span className="font-bold text-gray-800 font-mono text-xs">{selectedViewStudent.whatsapp || 'Same' }</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Date of Birth</span>
                    <span className="font-bold text-gray-850">{selectedViewStudent.dob || 'Not logged'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Blood Group</span>
                    <span className="font-bold text-gray-800">{selectedViewStudent.bloodGroup || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Aadhaar Identification</span>
                    <span className="font-bold text-gray-800 font-mono text-xs">{selectedViewStudent.aadhaar ? selectedViewStudent.aadhaar.match(/.{1,4}/g)?.join(' ') : 'Not logged'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Checked-In Date Detail</span>
                    <span className="font-bold text-gray-850">{selectedViewStudent.joinDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 font-semibold block text-[10px]">Email ID</span>
                    <span className="font-bold text-gray-850 font-mono text-xs">{selectedViewStudent.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADMISSION FAMILY & EMERGENCY CONTACTS */}
              <div className="border border-gray-100 rounded-xl p-3.5 bg-white">
                <h6 className="font-black text-[11px] text-[#1A1A2E] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50">
                  2. Parent & Emergency Information
                </h6>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Father / Guardian Name</span>
                    <span className="font-bold text-gray-800">{selectedViewStudent.father || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px]">Father Contact</span>
                    <span className="font-bold text-gray-800 font-mono text-xs">{selectedViewStudent.fatherMob || 'N/A'}</span>
                  </div>
                  {selectedViewStudent.fatherOccupation && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px]">Father Occupation</span>
                      <span className="font-bold text-gray-800">{selectedViewStudent.fatherOccupation}</span>
                    </div>
                  )}
                  {selectedViewStudent.motherName && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px]">Mother Name</span>
                      <span className="font-bold text-gray-800">{selectedViewStudent.motherName}</span>
                    </div>
                  )}
                  {selectedViewStudent.motherMobile && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px]">Mother Contact</span>
                      <span className="font-bold text-gray-800 font-mono text-xs">{selectedViewStudent.motherMobile}</span>
                    </div>
                  )}
                  {selectedViewStudent.guardianName && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px]">Local Guardian</span>
                      <span className="font-bold text-gray-800">{selectedViewStudent.guardianName}</span>
                    </div>
                  )}
                  {selectedViewStudent.guardianMobile && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px]">Guardian Contact</span>
                      <span className="font-bold text-gray-850 font-mono text-xs">{selectedViewStudent.guardianMobile}</span>
                    </div>
                  )}
                  
                  {/* Emergency box */}
                  <div className="col-span-2 pt-2 border-t border-dashed border-gray-100">
                    <span className="text-rose-500 font-bold block text-[10px] uppercase">⚠️ SOS / Emergency Contact Address</span>
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        <span className="font-bold text-gray-800 block text-xs">{selectedViewStudent.emergencyName || 'N/A'}</span>
                        <span className="text-[10px] text-gray-400 block">Relation: {selectedViewStudent.emergencyRelation || 'N/A'}</span>
                      </div>
                      <span className="font-black text-rose-600 font-mono text-xs bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                        {selectedViewStudent.emergencyMobile || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CORE EDUCATION & DETAILED ALLOCATION */}
              {(selectedViewStudent.collegeName || selectedViewStudent.bedNumber) && (
                <div className="border border-gray-100 rounded-xl p-3.5 bg-white">
                  <h6 className="font-black text-[11px] text-[#1A1A2E] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50">
                    3. Academic details & Room Allocations
                  </h6>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedViewStudent.floor && (
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px]">Floor Assigned</span>
                        <span className="font-bold text-gray-800">{selectedViewStudent.floor} Floor</span>
                      </div>
                    )}
                    {selectedViewStudent.bedNumber && (
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px]">Assigned Bed</span>
                        <span className="font-bold text-gray-800 font-mono">Bed {selectedViewStudent.bedNumber}</span>
                      </div>
                    )}
                    {selectedViewStudent.washroomType && (
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px]">Washroom Type</span>
                        <span className="font-bold text-gray-800">{selectedViewStudent.washroomType}</span>
                      </div>
                    )}
                    <div></div>
                    {selectedViewStudent.collegeName && (
                      <div className="col-span-2 pt-2 border-t border-dashed border-gray-100">
                        <span className="text-gray-400 font-semibold block text-[10px]">College Name & Course</span>
                        <p className="font-bold text-gray-850 text-xs mt-0.5">{selectedViewStudent.collegeName} ({selectedViewStudent.courseName || 'N/A'})</p>
                        <span className="text-[10px] text-gray-500 block">Sem: {selectedViewStudent.semesterYear || 'N/A'} | ID: {selectedViewStudent.collegeId || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: STAY & FINANCIAL BREAKDOWN ADMISSION DETAILS */}
              <div className="border border-gray-100 rounded-xl p-3.5 bg-white">
                <h6 className="font-black text-[11px] text-[#1A1A2E] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50">
                  4. Stay Terms & Billing Calculations
                </h6>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {selectedViewStudent.agreementStartDate && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Agreement Period</span>
                      <span className="font-bold text-gray-800">{selectedViewStudent.agreementStartDate} to {selectedViewStudent.agreementEndDate || 'N/A'}</span>
                    </div>
                  )}
                  {selectedViewStudent.noticePeriod && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Notice Period</span>
                      <span className="font-bold text-gray-800">{selectedViewStudent.noticePeriod}</span>
                    </div>
                  )}
                  {selectedViewStudent.feePlan && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Assigned Plan Term</span>
                      <span className="font-bold text-[#FF6B35] font-mono">{selectedViewStudent.feePlan} ({selectedViewStudent.monthsCount || 1} mo)</span>
                    </div>
                  )}
                  {selectedViewStudent.paymentMode && (
                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Payment Mode</span>
                      <span className="font-bold text-gray-800">{selectedViewStudent.paymentMode} ({selectedViewStudent.installmentType || 'One-Time'})</span>
                    </div>
                  )}
                  {selectedViewStudent.transactionId && (
                    <div className="col-span-2">
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Txn ID / Ref</span>
                      <span className="font-bold text-gray-700 font-mono text-[11px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">{selectedViewStudent.transactionId}</span>
                    </div>
                  )}

                  {/* Complete Billing Breakdown */}
                  <div className="col-span-2 bg-gray-50/70 p-3 rounded-xl border border-gray-150 text-[11px] space-y-1 mt-1">
                    <span className="font-black uppercase text-[9px] tracking-wider text-gray-400 block mb-1">Fee Charges Breakdown</span>
                    <div className="flex justify-between">
                      <span>Monthly Base Rent:</span>
                      <span className="font-bold">₹{selectedViewStudent.fee.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedViewStudent.monthsCount && selectedViewStudent.monthsCount > 1 && (
                      <div className="flex justify-between">
                        <span>Total months calculated ({selectedViewStudent.monthsCount} mo):</span>
                        <span className="font-bold">₹{((selectedViewStudent.totalRent || (selectedViewStudent.fee * selectedViewStudent.monthsCount))).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedViewStudent.discount ? (
                      <div className="flex justify-between text-rose-500">
                        <span>Less: Promotional Discount Offered:</span>
                        <span className="font-bold">-₹{selectedViewStudent.discount.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null}
                    {selectedViewStudent.securityDeposit ? (
                      <div className="flex justify-between">
                        <span>Add: Security Deposit (Refundable):</span>
                        <span className="font-bold">₹{selectedViewStudent.securityDeposit.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null}
                    {selectedViewStudent.electricityCharges ? (
                      <div className="flex justify-between">
                        <span>Add: Electricity Security Advance:</span>
                        <span className="font-bold">₹{selectedViewStudent.electricityCharges.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null}
                    {selectedViewStudent.otherCharges ? (
                      <div className="flex justify-between">
                        <span>Add: Allied Services Charges:</span>
                        <span className="font-bold">₹{selectedViewStudent.otherCharges.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between pt-1.5 border-t border-dashed border-gray-250 font-bold text-gray-800 text-xs balance-line">
                      <span>Final Net Billing Amount:</span>
                      <span className="font-extrabold text-[#FF6B35]">₹{(selectedViewStudent.finalPayableAmount || selectedViewStudent.fee).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Address Details */}
              {selectedViewStudent.address && (
                <div className="border border-gray-100 rounded-xl p-3.5 bg-white">
                  <h6 className="font-black text-[11px] text-[#1A1A2E] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50">
                    5. Full Address Sheet
                  </h6>
                  <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed whitespace-pre-line">{selectedViewStudent.address}</p>
                </div>
              )}

              {/* Hostel Inventory & Amenities Issued (सामान वितरण रिकॉर्ड) */}
              <div className="border border-gray-100 rounded-xl p-3.5 bg-white shadow-xs">
                <h6 className="font-black text-[11px] text-[#FF6B35] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Distributed Amenities Records (वितरित हॉस्टल सामान सूची)
                </h6>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${selectedViewStudent.itemThali ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-gray-55 border-gray-100 text-gray-400 bg-gray-50'}`}>
                    <span className="font-bold">Steel Plate (थाली)</span>
                    <span className="font-black text-[10px] uppercase">{selectedViewStudent.itemThali ? '✓ Issued' : '✗ Pending'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${selectedViewStudent.itemNasteKiPalet ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-gray-55 border-gray-100 text-gray-400 bg-gray-50'}`}>
                    <span className="font-bold">Snack Plate (नाश्ता प्लेट)</span>
                    <span className="font-black text-[10px] uppercase">{selectedViewStudent.itemNasteKiPalet ? '✓ Issued' : '✗ Pending'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${selectedViewStudent.itemChayeKaGilas ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-gray-55 border-gray-100 text-gray-400 bg-gray-50'}`}>
                    <span className="font-bold">Tea Glass (चाय गिलास)</span>
                    <span className="font-black text-[10px] uppercase">{selectedViewStudent.itemChayeKaGilas ? '✓ Issued' : '✗ Pending'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${selectedViewStudent.itemBdaGilas ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-gray-55 border-gray-100 text-gray-400 bg-gray-50'}`}>
                    <span className="font-bold">Water Glass (बड़ा गिलास)</span>
                    <span className="font-black text-[10px] uppercase">{selectedViewStudent.itemBdaGilas ? '✓ Issued' : '✗ Pending'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${selectedViewStudent.itemChamch ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-gray-55 border-gray-100 text-gray-400 bg-gray-50'}`}>
                    <span className="font-bold">Spoon (चम्मच)</span>
                    <span className="font-black text-[10px] uppercase">{selectedViewStudent.itemChamch ? '✓ Issued' : '✗ Pending'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${selectedViewStudent.itemBedsheet ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-gray-55 border-gray-100 text-gray-400 bg-gray-50'}`}>
                    <span className="font-bold">Bedsheet (बेडशीट)</span>
                    <span className="font-black text-[10px] uppercase">{selectedViewStudent.itemBedsheet ? '✓ Issued' : '✗ Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Digital Documents & Verification Actions (दस्तावेज़ और सत्यापन) */}
              <div className="border border-gray-100 rounded-xl p-3.5 bg-white shadow-xs">
                <h6 className="font-black text-[11px] text-[#1A1A2E] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-50 flex items-center gap-1.5 justify-between">
                  <span className="flex items-center gap-1.5">📁 Uploaded Digital Documents (दस्तावेज़)</span>
                  <span className="text-[9px] text-[#FF6B35] lowercase font-normal">click thumbnail to see fullscreen / click to download</span>
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Police Verification Form', key: 'policeVerification', file: 'police_verification' },
                    { label: 'Hostel Registration Form', key: 'hostelForm', file: 'hostel_form' },
                    { label: 'Agreement Contract Doc', key: 'agreementDoc', file: 'agreement_contract' },
                    { label: 'Student Aadhaar Card (UIDAI)', key: 'studentAadhaarDoc', file: 'student_aadhaar' },
                    { label: 'Father / Parent Aadhaar Card', key: 'fatherAadhaarDoc', file: 'father_aadhaar' },
                  ].map(doc => {
                    const rawDoc = (selectedViewStudent as any)[doc.key];
                    const hasDoc = rawDoc && rawDoc.startsWith('data:');
                    return (
                      <div key={doc.key} className="p-3 bg-gray-50/70 border border-gray-150 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex gap-2 items-center flex-1 min-w-0">
                          {hasDoc ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                              <img src={rawDoc} alt={doc.label} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition duration-150" onClick={() => {
                                const win = window.open();
                                if (win) {
                                  win.document.write(`<img src="${rawDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                                }
                              }} referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0">
                              N/A
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-gray-700 block text-[10px] truncate">{doc.label}</span>
                            <span className={`text-[8px] font-extrabold uppercase ${hasDoc ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {hasDoc ? 'Digital Copy Received' : 'Pending Submission'}
                            </span>
                          </div>
                        </div>
                        {hasDoc && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                const matches = rawDoc.match(/^data:(image\/[a-z]+|pdf|application\/[a-z\-]+);base64,/);
                                const ext = matches ? matches[1].split('/')[1] || 'png' : 'png';
                                const filename = `${selectedViewStudent.name.replace(/\s+/g, '_')}_${doc.file}.${ext}`;
                                downloadBase64File(rawDoc, filename);
                              }}
                              className="p-1.5 bg-white border border-gray-250 text-gray-650 rounded-lg hover:bg-gray-100 hover:text-black transition cursor-pointer"
                              title="Download Doc Proof"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                             <button
                              onClick={() => {
                                const win = window.open();
                                if (win) {
                                  win.document.write(`<iframe src="${rawDoc}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                }
                              }}
                              className="p-1.5 bg-white border border-gray-250 text-gray-650 rounded-lg hover:bg-gray-100 hover:text-black transition cursor-pointer"
                              title="See Doc Fullscreen"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const win = window.open('', '_blank');
                                if (win) {
                                  win.document.write(`
                                    <html>
                                      <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#fff;">
                                        <img src="${rawDoc}" style="max-width:100%; max-height:100%; object-fit:contain;" />
                                        <script>
                                          window.onload = function() {
                                            setTimeout(function() {
                                              window.print();
                                              window.close();
                                            }, 300);
                                          }
                                        </script>
                                      </body>
                                    </html>
                                  `);
                                  win.document.close();
                                }
                              }}
                              className="p-1.5 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition cursor-pointer"
                              title="Print Document Proof"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end sticky bottom-0 bg-white z-10 pb-1">
              <button
                onClick={() => setSelectedViewStudent(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer hover:shadow-lg transition active:scale-95"
              >
                Close Profile Card
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

// Compact WhatsApp SVG icon wrapper because of standard lucide limits
function MessageSquareChat(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.593-.487-.51-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
