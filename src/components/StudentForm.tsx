import React, { useState, useEffect, useRef } from 'react';
import { Student, RoomSharing, StudentStatus } from '../types';
import { User, MapPin, ShieldAlert, BookOpen, GraduationCap, DollarSign, Calendar, Landmark, CreditCard, ChevronRight, ChevronLeft, Camera, Upload, Trash2, Check, RefreshCw, X, FileSpreadsheet, FileText } from 'lucide-react';

const convertDDMMYYYYToYYYYMMDD = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const convertYYYYMMDDToDDMMYYYY = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

interface StudentFormProps {
  onSubmit: (student: Omit<Student, 'id' | 'paid' | 'due' | 'joinDate'> & { id?: number; paid?: number; due?: number; joinDate?: string }) => void;
  onCancel: () => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
  studentToEdit?: Student;
}

export default function StudentForm({ onSubmit, onCancel, onShowToast, studentToEdit }: StudentFormProps) {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeStream]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } }
      });
      setActiveStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast("Camera access refused or unavailable! Please upload from files instead. ⚠️", true);
    }
  };

  const stopCamera = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setForm((prev: any) => ({ ...prev, profilePic: dataUrl }));
        if (onShowToast) onShowToast("Selfie captured successfully! 🤳📸");
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (onShowToast) onShowToast("Image size must be less than 2MB! ⚠️", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({ ...prev, profilePic: reader.result as string }));
        if (onShowToast) onShowToast("Profile photo uploaded successfully! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setForm((prev: any) => ({ ...prev, profilePic: '' }));
    if (onShowToast) onShowToast("Profile photo removed.");
  };

  const handleDocUpload = (fieldName: string, file: File | null) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (onShowToast) onShowToast("File size must be less than 2MB! ⚠️", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({ ...prev, [fieldName]: reader.result as string }));
        if (onShowToast) onShowToast("Document loaded successfully! 📂");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDoc = (fieldName: string) => {
    setForm((prev: any) => ({ ...prev, [fieldName]: 'Pending' }));
    if (onShowToast) onShowToast("Document status reset.");
  };

  // Load Hostel Settings for dynamic rent and sharing rates
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
      singleRent: 8500,
      doubleRent: 6500,
      tripleRent: 5500,
      standardElecRate: 10
    };
  };

  const savedSettings = getSavedHostelSettings();
  const defaultDoubleRent = savedSettings.doubleRent || 6500;

  const [form, setForm] = useState<any>({
    id: undefined,
    name: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    aadhaar: '',
    mobile: '',
    whatsapp: '',
    email: '',
    nationality: 'Indian',
    
    // Address Details
    houseNo: '',
    area: '',
    city: '',
    state: '',
    pinCode: '',
    currentAddress: '',
    isCurrentSameAsPermanent: true,
    
    // Parent / Guardian
    father: '',
    fatherMob: '',
    fatherOccupation: '',
    motherName: '',
    motherMobile: '',
    guardianName: '',
    guardianMobile: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyMobile: '',
    
    // Education Details
    collegeName: '',
    courseName: '',
    semesterYear: '',
    collegeId: '',
    collegeAddress: '',
    
    // Hostel Allocation
    floor: 'Ground',
    room: '',
    bedNumber: '',
    sharing: 'Double' as RoomSharing,
    acType: 'Non AC' as 'AC' | 'Non AC',
    washroomType: 'Common',
    
    // Stay Details
    agreementStartDate: '',
    agreementEndDate: '',
    noticePeriod: '30 Days',
    lockInPeriod: 'None',
    
    // Fee Selection
    feePlan: '1 Month',
    fee: defaultDoubleRent, // starting monthly rent
    yearlyTotalFee: defaultDoubleRent * 12,
    monthsCount: 1,
    discount: 0,
    totalRent: defaultDoubleRent,
    securityDeposit: 2000, // Standard safety deposit
    electricityCharges: 0,
    otherCharges: 0,
    finalPayableAmount: 9500, // Total Rent + Security
    
    // Payment Mode
    paymentMode: 'UPI' as any,
    transactionId: '',
    installmentType: 'One Time',
    
    // Legacy mapping
    status: 'Active' as StudentStatus,
    joinDate: '',
    address: '', // compiled address
    profilePic: '',

    // Physical Documents
    policeVerification: 'Pending',
    hostelForm: 'Pending',
    agreementDoc: 'Pending',
    studentAadhaarDoc: 'Pending',
    fatherAadhaarDoc: 'Pending',

    // Admission Amenities Items Handover Checklist
    itemThali: false,
    itemNasteKiPalet: false,
    itemChayeKaGilas: false,
    itemBdaGilas: false,
    itemChamch: false,
    itemBedsheet: false,

    // Initial electricity charges
    elecLastReading: 0,
    elecLastReadingDate: '',
    elecRatePerUnit: 10,
    elecHistoryJson: '[]',

    // Student Portal fields
    portalPassword: '',
    portalBlocked: false,
    blockPasswordChange: false
  });

  // Pre-load student details when editing
  useEffect(() => {
    if (studentToEdit) {
      setForm((prev: any) => ({
        ...prev,
        ...studentToEdit,
        id: studentToEdit.id,
        joinDate: studentToEdit.joinDate || new Date().toLocaleDateString('en-IN')
      }));
    } else {
      setForm((prev: any) => ({
        ...prev,
        joinDate: new Date().toLocaleDateString('en-IN')
      }));
    }
  }, [studentToEdit]);

  // Automatically recalculate fees when contract fee, discount, deposits change
  useEffect(() => {
    const yearly = form.yearlyTotalFee || 0;
    const discount = form.discount || 0;
    const security = form.securityDeposit || 0;
    const electricity = form.electricityCharges || 0;
    const other = form.otherCharges || 0;
    const finalAmount = yearly - discount + security + electricity + other;

    const currentDivider = 
      form.installmentType === 'Monthly' ? 12 :
      form.installmentType === '2 Installments' ? 2 :
      form.installmentType === '3 Installments' ? 3 :
      form.installmentType === '4 Installments' ? 4 :
      form.installmentType === '6 Installments' ? 6 : 12;
    const calculatedFee = Math.round(yearly / currentDivider);

    // Compile pretty address to legacy address block for backward compatibility
    let compiledAddress = '';
    if (form.isCurrentSameAsPermanent) {
      compiledAddress = `Permanent: ${form.houseNo ? form.houseNo + ', ' : ''}${form.area ? form.area + ', ' : ''}${form.city ? form.city + ', ' : ''}${form.state ? form.state + ', ' : ''}${form.pinCode || ''}`;
    } else {
      compiledAddress = `Permanent: ${form.houseNo ? form.houseNo + ', ' : ''}${form.area ? form.area + ', ' : ''}${form.city ? form.city + ', ' : ''}${form.state ? form.state + ', ' : ''}${form.pinCode || ''}\nCurrent: ${form.currentAddress}`;
    }

    setForm(prev => {
      // Protect against infinite loop re-renders by only updating if values have actually changed
      if (
        prev.totalRent === yearly &&
        prev.fee === calculatedFee &&
        prev.finalPayableAmount === finalAmount &&
        prev.address === compiledAddress
      ) {
        return prev;
      }
      return {
        ...prev,
        totalRent: yearly,
        fee: calculatedFee,
        finalPayableAmount: finalAmount,
        address: compiledAddress
      };
    });
  }, [
    form.yearlyTotalFee,
    form.installmentType,
    form.discount,
    form.securityDeposit,
    form.electricityCharges,
    form.otherCharges,
    form.houseNo,
    form.area,
    form.city,
    form.state,
    form.pinCode,
    form.currentAddress,
    form.isCurrentSameAsPermanent
  ]);

  const handleSharingChange = (val: RoomSharing) => {
    let defaultFee = savedSettings.doubleRent || 6500;
    if (val === 'Single') {
      defaultFee = savedSettings.singleRent || 8500;
    } else if (val === 'Triple') {
      defaultFee = savedSettings.tripleRent || 5500;
    } else if (val === 'Double') {
      defaultFee = savedSettings.doubleRent || 6500;
    }
    
    setForm(prev => ({
      ...prev,
      sharing: val,
      fee: defaultFee,
      yearlyTotalFee: defaultFee * 12
    }));
  };

  const handlePlanChange = (plan: string) => {
    let months = 1;
    if (plan === '1 Month') months = 1;
    else if (plan === '2 Month') months = 2;
    else if (plan === '3 Month') months = 3;
    else if (plan === '4 Month') months = 4;
    else if (plan === '5 Month') months = 5;
    else if (plan === '6 Month') months = 6;
    else if (plan === '12 Month') months = 12;

    setForm(prev => ({
      ...prev,
      feePlan: plan,
      monthsCount: months
    }));
  };

  const nextStep = () => {
    setErrorMsg(null);
    // Basic step validation
    if (step === 1) {
      if (!form.name || !form.name.trim()) {
        const msg = 'Please fill in Student Name! ⚠️';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg, true);
        return;
      }
      if (!form.mobile || !form.mobile.trim()) {
        const msg = 'Please fill in Student Primary Contact number! ⚠️';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg, true);
        return;
      }
    }
    if (step === 2) {
      if (!form.father || !form.father.trim()) {
        const msg = "Please enter Father Name! ⚠️";
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg, true);
        return;
      }
      if (!form.fatherMob || !form.fatherMob.trim()) {
        const msg = "Please enter Father Mobile Number! ⚠️";
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg, true);
        return;
      }
    }
    if (step === 3) {
      if (!form.room || !form.room.trim() || form.room === 'UNASSIGNED') {
        const msg = 'Please assign a valid Room Number before proceeding! ⚠️';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg, true);
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setErrorMsg(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Dynamic checks on submit to prevent silent validation blocks and direct the user to the correct step
    if (!form.name || !form.name.trim()) {
      const msg = 'Please enter the Student Full Name! (Step 1) ⚠️';
      setErrorMsg(msg);
      setStep(1);
      if (onShowToast) onShowToast(msg, true);
      return;
    }
    if (!form.mobile || !form.mobile.trim()) {
      const msg = 'Please enter the Student Mobile Number! (Step 1) ⚠️';
      setErrorMsg(msg);
      setStep(1);
      if (onShowToast) onShowToast(msg, true);
      return;
    }

    if (!form.father || !form.father.trim()) {
      const msg = "Please enter Father Name! (Step 2) ⚠️";
      setErrorMsg(msg);
      setStep(2);
      if (onShowToast) onShowToast(msg, true);
      return;
    }
    if (!form.fatherMob || !form.fatherMob.trim()) {
      const msg = "Please enter Father Mobile Number! (Step 2) ⚠️";
      setErrorMsg(msg);
      setStep(2);
      if (onShowToast) onShowToast(msg, true);
      return;
    }

    if (!form.room || !form.room.trim() || form.room === 'UNASSIGNED') {
      const msg = 'Please assign a valid Room Number! (Step 3) ⚠️';
      setErrorMsg(msg);
      setStep(3);
      if (onShowToast) onShowToast(msg, true);
      return;
    }

    if (form.yearlyTotalFee === undefined || form.yearlyTotalFee === null || form.yearlyTotalFee === '') {
      const msg = 'Please enter the Total Stay / Yearly Contract Fee! (Step 5) ⚠️';
      setErrorMsg(msg);
      setStep(5);
      if (onShowToast) onShowToast(msg, true);
      return;
    }

    onSubmit(form);
  };

  return (
    <div id="admission-form-wrapper" className="font-sans text-xs sm:text-sm text-gray-800">
      {/* Inline Warning banner */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 text-xs mb-4 animate-fade-in">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
      {/* Subtitle / Stepper Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
        <h4 className="text-[#1A1A2E] font-extrabold text-sm sm:text-base flex items-center gap-2">
          <span>{form.id ? 'UNITY BOYS HOSTEL – EDIT PROFILE' : 'UNITY BOYS HOSTEL – NEW ADMISSION'}</span>
        </h4>
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 font-mono text-[9px] sm:text-[10px] md:text-xs">
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition-all ${step === 1 ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>1. Basic</span>
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition-all ${step === 2 ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>2. Family</span>
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition-all ${step === 3 ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>3. Hostel</span>
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition-all ${step === 4 ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>4. Stay</span>
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition-all ${step === 5 ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>5. Rent & Docs</span>
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition-all ${step === 6 ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-400'}`}>6. Review</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {/* ==================== STEP 1: STUDENT BASIC DETAILS & ADDRESS ==================== */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <User className="w-4 h-4" /> 1. Student Basic Details
            </h5>

            {/* Profile Picture Upload & Camera Capture Section */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                {form.profilePic ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#FF6B35] shadow-md bg-white relative">
                     <img src={form.profilePic} alt="Student Profile Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     <button
                       type="button"
                       onClick={removePhoto}
                       className="absolute top-1 right-1 p-1 bg-red-650 hover:bg-red-750 text-white rounded-lg shadow transition duration-155"
                       title="Remove Photo"
                     >
                       <X className="w-3.5 h-3.5" />
                     </button>
                   </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <User className="w-8 h-8 text-gray-300" />
                    <span className="text-[9px] font-bold mt-1 uppercase text-gray-400">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center md:text-left">
                <h6 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">Student Profile Picture *</h6>
                <p className="text-[10px] text-gray-505 leading-relaxed font-semibold text-gray-500">
                  Provide a clear close-up face portrait-size photo. You can select an image file from your device, or directly capture one using your camera.
                </p>
                
                {/* Hidden input for local upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white hover:bg-gray-100 text-[#FF6B35] border border-[#FF6B35]/20 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 text-xs font-bold"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo 📁
                  </button>

                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-2 bg-[#FF6B35] hover:bg-[#e55a24] text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 text-xs font-bold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Selfie Photo 🤳
                    </button>
                  ) : (
                    <span className="inline-block text-[10px] bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-bold animate-pulse">
                      Camera Web-Stream Active...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Web Camera View Area */}
            {isCameraActive && (
              <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-800 gap-3 animate-slideDown shadow-xl max-w-sm mx-auto">
                <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 w-full aspect-square">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer text-xs font-bold"
                  >
                    <Check className="w-4 h-4" /> Capture Snippet Shot
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition active:scale-95 cursor-pointer text-xs font-bold"
                    title="Close webcam"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Student Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-[#FF6B35] mb-1">Date of Admission (प्रवेश तिथि) *</label>
                <input
                  type="date"
                  value={convertDDMMYYYYToYYYYMMDD(form.joinDate)}
                  onChange={e => setForm({ ...form, joinDate: convertYYYYMMDDToDDMMYYYY(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-[#FF6B35] rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Blood Group</label>
                <input
                  type="text"
                  placeholder="e.g. O+, A+"
                  maxLength={5}
                  value={form.bloodGroup}
                  onChange={e => setForm({ ...form, bloodGroup: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="12 digit number"
                  maxLength={12}
                  value={form.aadhaar}
                  onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10 digit contact"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="WhatsApp contact"
                  value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Email ID</label>
                <input
                  type="email"
                  placeholder="e.g. student@gmail.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Nationality</label>
              <input
                type="text"
                placeholder="Indian"
                value={form.nationality}
                onChange={e => setForm({ ...form, nationality: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
              />
            </div>

            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pt-2 pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <MapPin className="w-4 h-4" /> 2. Address Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">House No / Street</label>
                <input
                  type="text"
                  placeholder="House No, Street, building detailed"
                  value={form.houseNo}
                  onChange={e => setForm({ ...form, houseNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Area / Locality</label>
                <input
                  type="text"
                  placeholder="Area / landmark details"
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  placeholder="City Name"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">State</label>
                <input
                  type="text"
                  placeholder="State Name"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">PIN Code</label>
                <input
                  type="text"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  value={form.pinCode}
                  onChange={e => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer py-1.5 select-none font-semibold text-gray-650">
                <input
                  type="checkbox"
                  checked={form.isCurrentSameAsPermanent}
                  onChange={e => setForm({ ...form, isCurrentSameAsPermanent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]/30 cursor-pointer"
                />
                <span>Current Address is same as Permanent Address</span>
              </label>

              {!form.isCurrentSameAsPermanent && (
                <div className="animate-slideDown">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Current Address (if different)</label>
                  <textarea
                    rows={2}
                    placeholder="Enter current address if residing elsewhere..."
                    value={form.currentAddress}
                    onChange={e => setForm({ ...form, currentAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white resize-none"
                  ></textarea>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== STEP 2: PARENT / GUARDIAN & EMERGENCY CONTACT ==================== */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <ShieldAlert className="w-4 h-4" /> 3. Parent / Guardian Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Father Name *</label>
                <input
                  type="text"
                  placeholder="Father full name"
                  value={form.father}
                  onChange={e => setForm({ ...form, father: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Father Mobile *</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Father contact"
                  value={form.fatherMob}
                  onChange={e => setForm({ ...form, fatherMob: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Father Occupation</label>
                <input
                  type="text"
                  placeholder="Father occupation"
                  value={form.fatherOccupation}
                  onChange={e => setForm({ ...form, fatherOccupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Mother Name</label>
                <input
                  type="text"
                  placeholder="Mother full name"
                  value={form.motherName}
                  onChange={e => setForm({ ...form, motherName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Mother Mobile</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Mother contact"
                  value={form.motherMobile}
                  onChange={e => setForm({ ...form, motherMobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-gray-100">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Local Guardian Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Guardian full name"
                  value={form.guardianName}
                  onChange={e => setForm({ ...form, guardianName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Guardian Mobile (Optional)</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Guardian contact"
                  value={form.guardianMobile}
                  onChange={e => setForm({ ...form, guardianMobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <h5 className="font-black text-[#FF6B35] uppercase tracking-wider text-[11px] pt-1 pb-1 flex items-center gap-2">
              ⚠️ Emergency Contact Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Emergency contact Name</label>
                <input
                  type="text"
                  placeholder="Emergency contact full name"
                  value={form.emergencyName}
                  onChange={e => setForm({ ...form, emergencyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Uncle, Brother"
                  value={form.emergencyRelation}
                  onChange={e => setForm({ ...form, emergencyRelation: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Emergency Mobile</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Emergency contact mobile"
                  value={form.emergencyMobile}
                  onChange={e => setForm({ ...form, emergencyMobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: EDUCATION & HOSTEL ALLOCATION ==================== */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <GraduationCap className="w-4 h-4" /> 4. Education Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">College Name</label>
                <input
                  type="text"
                  placeholder="College / Institute Name"
                  value={form.collegeName}
                  onChange={e => setForm({ ...form, collegeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE, BCA"
                  value={form.courseName}
                  onChange={e => setForm({ ...form, courseName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Semester / Year</label>
                <input
                  type="text"
                  placeholder="e.g. 3rd Semester / 2nd Year"
                  value={form.semesterYear}
                  onChange={e => setForm({ ...form, semesterYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">College ID Number</label>
                <input
                  type="text"
                  placeholder="Roll No or registration number"
                  value={form.collegeId}
                  onChange={e => setForm({ ...form, collegeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">College Address</label>
              <input
                type="text"
                placeholder="College campus physical address"
                value={form.collegeAddress}
                onChange={e => setForm({ ...form, collegeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
              />
            </div>

            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pt-2 pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <Landmark className="w-4 h-4" /> 5. Hostel Room Allocation
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Floor Level</label>
                <select
                  value={form.floor}
                  onChange={e => setForm({ ...form, floor: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer"
                >
                  <option value="Ground">Ground Floor</option>
                  <option value="First">First Floor</option>
                  <option value="Second">Second Floor</option>
                  <option value="Third">Third Floor</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Room Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 104, 201"
                  value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Bed Number</label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={form.bedNumber}
                  onChange={e => setForm({ ...form, bedNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Sharing Type</label>
                <select
                  value={form.sharing}
                  onChange={e => handleSharingChange(e.target.value as RoomSharing)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer font-semibold text-gray-800"
                >
                  <option value="Single">Single Sharing</option>
                  <option value="Double">Double Sharing</option>
                  <option value="Triple">Triple Sharing</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">AC / Non AC</label>
                <select
                  value={form.acType}
                  onChange={e => setForm({ ...form, acType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer"
                >
                  <option value="Non AC">Non-AC Room</option>
                  <option value="AC">Air Conditioned (AC)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Washroom Type</label>
                <select
                  value={form.washroomType}
                  onChange={e => setForm({ ...form, washroomType: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer"
                >
                  <option value="Common">Common Shared</option>
                  <option value="Attached">Private Attached</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 4: STAY DETAILS & FINANCIAL BREAKDOWN ==================== */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <Calendar className="w-4 h-4" /> 6. Stay Details & Fee Plan Selection
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Agreement Start Date</label>
                <input
                  type="date"
                  value={form.agreementStartDate}
                  onChange={e => setForm({ ...form, agreementStartDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Agreement End Date</label>
                <input
                  type="date"
                  value={form.agreementEndDate}
                  onChange={e => setForm({ ...form, agreementEndDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notice Period Required</label>
                <input
                  type="text"
                  placeholder="30 Days"
                  value={form.noticePeriod}
                  onChange={e => setForm({ ...form, noticePeriod: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Lock-In Period</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Months, None"
                  value={form.lockInPeriod}
                  onChange={e => setForm({ ...form, lockInPeriod: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Registration Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as StudentStatus })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer font-bold text-gray-700"
                >
                  <option value="Active">Active Student</option>
                  <option value="Notice">Notice Serving</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">₹ Fee Structure & Stay Charges</span>
                <span className="text-[10px] bg-[#FF6B35]/10 text-[#FF6B35] px-2.5 py-0.5 rounded-full font-extrabold">{form.sharing} Sharing Basis</span>
              </div>

              {/* Combined Stay Contract & Preferred Installment Period */}
              <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/15 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#1A1A2E] uppercase tracking-wide mb-1">
                    Total Stay / Yearly Contract Fee (कुल वार्षिक शुल्क) *
                  </label>
                  <input
                    type="number"
                    value={form.yearlyTotalFee || 0}
                    onChange={e => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setForm({ ...form, yearlyTotalFee: val });
                    }}
                    className="w-full px-3 py-2 border border-orange-200 focus:border-[#FF6B35] rounded-xl outline-none font-extrabold text-[#1A1A2E] bg-white text-xs sm:text-sm"
                    placeholder="e.g. 90000"
                  />
                  <span className="text-[9px] text-[#FF6B35] font-bold leading-none block mt-1">Total contract fee expected from student</span>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-[#1A1A2E] uppercase tracking-wide mb-1">
                    Preferred Installment Period (भुगतान की अवधि)
                  </label>
                  <select
                    value={form.installmentType || 'Monthly'}
                    onChange={e => {
                      setForm({ ...form, installmentType: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-orange-200 focus:border-[#FF6B35] rounded-xl outline-none bg-white cursor-pointer font-bold text-gray-700 text-xs sm:text-sm"
                  >
                    <option value="Monthly">Monthly Plan (मासिक किस्त - 12)</option>
                    <option value="2 Installments">2 Installments Plan (Every 6 months)</option>
                    <option value="3 Installments">3 Installments Plan (Every 4 months)</option>
                    <option value="4 Installments">4 Installments Plan (Every 3 months)</option>
                    <option value="6 Installments">6 Installments Plan (Every 2 months)</option>
                  </select>
                  <span className="text-[9px] text-gray-500 font-medium leading-none block mt-1">
                    Interval categories for rent transactions
                  </span>
                </div>
              </div>

              {/* Dynamic summary card for selected installment type */}
              <div className="bg-white border border-gray-150 p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Installment Mode</span>
                  <span className="font-extrabold text-gray-800 text-xs sm:text-sm mt-0.5 block">{form.installmentType} Mode</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Calculated Per-installment Fee</span>
                  <span className="font-black text-[#FF6B35] text-sm sm:text-base mt-0.5 block">
                    ₹{form.fee.toLocaleString('en-IN')} x {
                      form.installmentType === 'Monthly' ? '12' :
                      form.installmentType === '2 Installments' ? '2' :
                      form.installmentType === '3 Installments' ? '3' :
                      form.installmentType === '4 Installments' ? '4' : '6'
                    } Installments
                  </span>
                </div>
              </div>

              {/* Allied Stay Charges Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Special Discount (₹)</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={e => setForm({ ...form, discount: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-bold text-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Security Deposit (Refundable) (₹)</label>
                  <input
                    type="number"
                    value={form.securityDeposit}
                    onChange={e => setForm({ ...form, securityDeposit: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-bold text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Electricity Charges / Advance (₹)</label>
                  <input
                    type="number"
                    value={form.electricityCharges}
                    onChange={e => setForm({ ...form, electricityCharges: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-bold text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Other Allied Services Charges (₹)</label>
                  <input
                    type="number"
                    value={form.otherCharges}
                    onChange={e => setForm({ ...form, otherCharges: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-bold text-gray-800 bg-white"
                  />
                </div>
              </div>

              {/* Total final payable */}
              <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                <span className="text-gray-500 font-bold text-xs sm:text-sm">Final Payable Admission Amount</span>
                <span className="font-extrabold text-[#FF6B35] text-base sm:text-lg font-mono">
                  ₹{form.finalPayableAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 5: ADMISSION PAYMENT & DOCUMENT VERIFICATION ==================== */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Payment Details */}
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <CreditCard className="w-4 h-4" /> 7. Admission Payment details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment Mode</label>
                <select
                  value={form.paymentMode}
                  onChange={e => setForm({ ...form, paymentMode: e.target.value as any })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer font-bold text-gray-700 text-xs sm:text-sm"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank Transfer">Direct Bank IMPS / NEFT</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Transaction ID / Reference Note</label>
                <input
                  type="text"
                  placeholder="e.g. TXN98327429"
                  value={form.transactionId}
                  onChange={e => setForm({ ...form, transactionId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Physical Documents Collection verification */}
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pt-2 pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <FileSpreadsheet className="w-4 h-4 ml-0.5" /> 8. Physical Documents Collection Checklist (भौतिक दस्तावेज संग्रह)
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Doc 1: Police Verification */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-gray-800 block text-[11px]">1. Police Verification</span>
                    <span className="text-[10px] text-gray-400">पुलिस सत्यापन पत्र</span>
                  </div>
                  <div>
                    <select
                      value={form.policeVerification && form.policeVerification.startsWith('data:') ? 'Received (Digital)' : (form.policeVerification || 'Pending')}
                      onChange={e => setForm({ ...form, policeVerification: e.target.value })}
                      className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white border border-gray-250 cursor-pointer text-[#1A1A2E]"
                    >
                      <option value="Pending">❌ Pending</option>
                      <option value="Received Handover">✅ Received</option>
                    </select>
                  </div>
                </div>
                {form.policeVerification && form.policeVerification.startsWith('data:') ? (
                  <div className="flex gap-2 items-center bg-white p-1 px-2 rounded-xl border border-emerald-100">
                    <img src={form.policeVerification} className="w-6 h-6 object-cover rounded border" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-mono text-emerald-700 font-bold flex-1 truncate">Uploaded Status</span>
                    <button type="button" onClick={() => removeDoc('policeVerification')} className="text-red-500 font-bold hover:underline cursor-pointer">Reset</button>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleDocUpload('policeVerification', e.target.files?.[0] || null)}
                      className="text-[9px] text-[#FF6B35] file:text-[9px] file:bg-orange-50 file:border-0 file:px-2 file:py-0.5 file:rounded cursor-pointer" 
                    />
                  </div>
                )}
              </div>

              {/* Doc 2: Hostel Form */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-gray-800 block text-[11px]">2. Hostel Admission Form</span>
                    <span className="text-[10px] text-gray-400">हॉस्टल प्रवेश फॉर्म</span>
                  </div>
                  <div>
                    <select
                      value={form.hostelForm && form.hostelForm.startsWith('data:') ? 'Received (Digital)' : (form.hostelForm || 'Pending')}
                      onChange={e => setForm({ ...form, hostelForm: e.target.value })}
                      className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white border border-gray-250 cursor-pointer text-[#1A1A2E]"
                    >
                      <option value="Pending">❌ Pending</option>
                      <option value="Received Handover">✅ Received</option>
                    </select>
                  </div>
                </div>
                {form.hostelForm && form.hostelForm.startsWith('data:') ? (
                  <div className="flex gap-2 items-center bg-white p-1 px-2 rounded-xl border border-emerald-100">
                    <img src={form.hostelForm} className="w-6 h-6 object-cover rounded border" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-mono text-emerald-700 font-bold flex-1 truncate">Uploaded Status</span>
                    <button type="button" onClick={() => removeDoc('hostelForm')} className="text-red-500 font-bold hover:underline cursor-pointer">Reset</button>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleDocUpload('hostelForm', e.target.files?.[0] || null)}
                      className="text-[9px] text-[#FF6B35] file:text-[9px] file:bg-orange-50 file:border-0 file:px-2 file:py-0.5 file:rounded cursor-pointer" 
                    />
                  </div>
                )}
              </div>

              {/* Doc 3: Agreement Stay Deed */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-gray-800 block text-[11px]">3. Lease Stay Agreement</span>
                    <span className="text-[10px] text-gray-400">एग्रीमेंट पत्र / डीड</span>
                  </div>
                  <div>
                    <select
                      value={form.agreementDoc && form.agreementDoc.startsWith('data:') ? 'Received (Digital)' : (form.agreementDoc || 'Pending')}
                      onChange={e => setForm({ ...form, agreementDoc: e.target.value })}
                      className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white border border-gray-250 cursor-pointer text-[#1A1A2E]"
                    >
                      <option value="Pending">❌ Pending</option>
                      <option value="Received Handover">✅ Received</option>
                    </select>
                  </div>
                </div>
                {form.agreementDoc && form.agreementDoc.startsWith('data:') ? (
                  <div className="flex gap-2 items-center bg-white p-1 px-2 rounded-xl border border-emerald-100">
                    <img src={form.agreementDoc} className="w-6 h-6 object-cover rounded border" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-mono text-emerald-700 font-bold flex-1 truncate">Uploaded Status</span>
                    <button type="button" onClick={() => removeDoc('agreementDoc')} className="text-red-500 font-bold hover:underline cursor-pointer">Reset</button>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleDocUpload('agreementDoc', e.target.files?.[0] || null)}
                      className="text-[9px] text-[#FF6B35] file:text-[9px] file:bg-orange-50 file:border-0 file:px-2 file:py-0.5 file:rounded cursor-pointer" 
                    />
                  </div>
                )}
              </div>

              {/* Doc 4: Student Aadhaar Card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-gray-800 block text-[11px]">4. Student Aadhaar Card</span>
                    <span className="text-[10px] text-gray-400">स्वयं का आधार कार्ड</span>
                  </div>
                  <div>
                    <select
                      value={form.studentAadhaarDoc && form.studentAadhaarDoc.startsWith('data:') ? 'Received (Digital)' : (form.studentAadhaarDoc || 'Pending')}
                      onChange={e => setForm({ ...form, studentAadhaarDoc: e.target.value })}
                      className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white border border-gray-250 cursor-pointer text-[#1A1A2E]"
                    >
                      <option value="Pending">❌ Pending</option>
                      <option value="Received Handover">✅ Received</option>
                    </select>
                  </div>
                </div>
                {form.studentAadhaarDoc && form.studentAadhaarDoc.startsWith('data:') ? (
                  <div className="flex gap-2 items-center bg-white p-1 px-2 rounded-xl border border-emerald-100">
                    <img src={form.studentAadhaarDoc} className="w-6 h-6 object-cover rounded border" referrerPolicy="no-referrer text-xs" />
                    <span className="text-[10px] font-mono text-emerald-700 font-bold flex-1 truncate">Uploaded Status</span>
                    <button type="button" onClick={() => removeDoc('studentAadhaarDoc')} className="text-red-500 font-bold hover:underline cursor-pointer">Reset</button>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleDocUpload('studentAadhaarDoc', e.target.files?.[0] || null)}
                      className="text-[9px] text-[#FF6B35] file:text-[9px] file:bg-orange-50 file:border-0 file:px-2 file:py-0.5 file:rounded cursor-pointer" 
                    />
                  </div>
                )}
              </div>

              {/* Doc 5: Father Aadhaar Card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-gray-800 block text-[11px]">5. Father's Aadhaar Card</span>
                    <span className="text-[10px] text-gray-400">पिता का आधार कार्ड</span>
                  </div>
                  <div>
                    <select
                      value={form.fatherAadhaarDoc && form.fatherAadhaarDoc.startsWith('data:') ? 'Received (Digital)' : (form.fatherAadhaarDoc || 'Pending')}
                      onChange={e => setForm({ ...form, fatherAadhaarDoc: e.target.value })}
                      className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white border border-gray-250 cursor-pointer text-[#1A1A2E]"
                    >
                      <option value="Pending">❌ Pending</option>
                      <option value="Received Handover">✅ Received</option>
                    </select>
                  </div>
                </div>
                {form.fatherAadhaarDoc && form.fatherAadhaarDoc.startsWith('data:') ? (
                  <div className="flex gap-2 items-center bg-white p-1 px-2 rounded-xl border border-emerald-100">
                    <img src={form.fatherAadhaarDoc} className="w-6 h-6 object-cover rounded border" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-mono text-emerald-700 font-bold flex-1 truncate">Uploaded Status</span>
                    <button type="button" onClick={() => removeDoc('fatherAadhaarDoc')} className="text-red-500 font-bold hover:underline cursor-pointer">Reset</button>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleDocUpload('fatherAadhaarDoc', e.target.files?.[0] || null)}
                      className="text-[9px] text-[#FF6B35] file:text-[9px] file:bg-orange-50 file:border-0 file:px-2 file:py-0.5 file:rounded cursor-pointer" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Admission Amenities Handover checklist (सामान वितरण रिकॉर्ड) */}
            <h5 className="font-black text-gray-750 uppercase tracking-wider text-[11px] pt-3 pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <FileText className="w-4 h-4 ml-0.5" /> 9. Admission Items/Amenities Handover Checklist (सामान वितरण रिकॉर्ड)
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              {/* Thali */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start gap-2 ${
                form.itemThali ? 'bg-emerald-50/75 border-emerald-500/30 text-emerald-850' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Steel Plate</span>
                  <input
                    type="checkbox"
                    checked={form.itemThali || false}
                    onChange={e => setForm({ ...form, itemThali: e.target.checked })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer w-4 h-4"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">एक थाली</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{form.itemThali ? '✓ Issued' : '✗ Pending'}</span>
                </div>
              </label>

              {/* Breakfast Plate */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start gap-2 ${
                form.itemNasteKiPalet ? 'bg-emerald-50/75 border-emerald-500/30 text-emerald-850' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Snack Plate</span>
                  <input
                    type="checkbox"
                    checked={form.itemNasteKiPalet || false}
                    onChange={e => setForm({ ...form, itemNasteKiPalet: e.target.checked })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer w-4 h-4"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">नाश्ते की प्लेट</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{form.itemNasteKiPalet ? '✓ Issued' : '✗ Pending'}</span>
                </div>
              </label>

              {/* Tea Glass */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start gap-2 ${
                form.itemChayeKaGilas ? 'bg-emerald-50/75 border-emerald-500/30 text-emerald-850' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Tea Glass</span>
                  <input
                    type="checkbox"
                    checked={form.itemChayeKaGilas || false}
                    onChange={e => setForm({ ...form, itemChayeKaGilas: e.target.checked })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer w-4 h-4"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">चाय का गिलास</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{form.itemChayeKaGilas ? '✓ Issued' : '✗ Pending'}</span>
                </div>
              </label>

              {/* Big Glass */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start gap-2 ${
                form.itemBdaGilas ? 'bg-emerald-50/75 border-emerald-500/30 text-emerald-850' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Big Glass</span>
                  <input
                    type="checkbox"
                    checked={form.itemBdaGilas || false}
                    onChange={e => setForm({ ...form, itemBdaGilas: e.target.checked })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer w-4 h-4"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">एक बड़ा गिलास</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{form.itemBdaGilas ? '✓ Issued' : '✗ Pending'}</span>
                </div>
              </label>

              {/* Spoon */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start gap-2 ${
                form.itemChamch ? 'bg-emerald-50/75 border-emerald-500/30 text-emerald-850' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Spoon</span>
                  <input
                    type="checkbox"
                    checked={form.itemChamch || false}
                    onChange={e => setForm({ ...form, itemChamch: e.target.checked })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer w-4 h-4"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">चम्मच</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{form.itemChamch ? '✓ Issued' : '✗ Pending'}</span>
                </div>
              </label>

              {/* Bedsheet */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start gap-2 ${
                form.itemBedsheet ? 'bg-emerald-50/75 border-emerald-500/30 text-emerald-850' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Bedsheet</span>
                  <input
                    type="checkbox"
                    checked={form.itemBedsheet || false}
                    onChange={e => setForm({ ...form, itemBedsheet: e.target.checked })}
                    className="rounded text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer w-4 h-4"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">बेडशीट (debsheet)</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{form.itemBedsheet ? '✓ Issued' : '✗ Pending'}</span>
                </div>
              </label>
            </div>

            {/* Student Portal Authorization Controls */}
            <h5 className="font-black text-gray-750 uppercase tracking-wider text-[11px] pt-4 pb-1 border-b border-gray-100 flex items-center gap-2 text-indigo-650 text-indigo-500">
              🔒 10. Student Portal Authorization Control (स्टूडेंट पोर्टल लॉगिन और पासवर्ड सेटअप)
            </h5>

            <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 space-y-4">
              <p className="text-[10px] sm:text-xs text-indigo-800/80 font-medium">
                Manage portal access permission, block logins, or set an optional login password/PIN specifically for this student.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Set Custom Portal Password / PIN */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Custom Password / PIN (वैकल्पिक पासवर्ड या पिन कोड)
                  </label>
                  <input
                    type="text"
                    value={form.portalPassword || ''}
                    onChange={e => setForm({ ...form, portalPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                    placeholder="e.g. 123456 or Student@123"
                  />
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    If set, the student can log in to the portal using this custom Password/PIN. If blank, standard login is used.
                  </span>
                </div>

                {/* Status/Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Toggle A: Block Student Portal Login */}
                  <label className={`p-3 rounded-xl border flex gap-2.5 items-start cursor-pointer transition ${
                    form.portalBlocked ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!form.portalBlocked}
                      onChange={e => setForm({ ...form, portalBlocked: e.target.checked })}
                      className="mt-0.5 accent-rose-600 h-3.5 w-3.5 cursor-pointer rounded"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[10px] sm:text-xs font-bold block">
                        Block Login 🚪
                      </span>
                      <span className="text-[9px] text-gray-400 block leading-tight">
                        मनाही (Block this student from accessing portal completely)
                      </span>
                    </div>
                  </label>

                  {/* Toggle B: Block Password Change */}
                  <label className={`p-3 rounded-xl border flex gap-2.5 items-start cursor-pointer transition ${
                    form.blockPasswordChange ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!form.blockPasswordChange}
                      onChange={e => setForm({ ...form, blockPasswordChange: e.target.checked })}
                      className="mt-0.5 accent-amber-600 h-3.5 w-3.5 cursor-pointer rounded"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[10px] sm:text-xs font-bold block">
                        Lock Password Change 🔒
                      </span>
                      <span className="text-[9px] text-gray-400 block leading-tight">
                        पासवर्ड लॉक (Block this student from updating password)
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 6: VERIFICATION & FORM SUBMISSION ==================== */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <h5 className="font-black text-gray-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center gap-2 text-[#FF6B35]">
              <Check className="w-4 h-4" /> 9. Admission Verification & Submission Review (सत्यापन और जमा करना)
            </h5>

            {/* Mini Review Card with photo */}
            <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50 text-xs flex flex-col md:flex-row gap-4 items-start">
              {form.profilePic ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-sm bg-white shrink-0 self-center md:self-start">
                  <img src={form.profilePic} alt="Admitted Student Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 shrink-0 self-center md:self-start">
                  <User className="w-6 h-6 text-gray-300" />
                  <span className="text-[8px] font-bold mt-1 uppercase text-gray-400">No Photo</span>
                </div>
              )}
              <div className="w-full space-y-1.5 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Student Name:</span>
                    <span className="font-black text-gray-800">{form.name || 'Not Filled'}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Academic / College:</span>
                    <span className="font-black text-gray-800">{form.collegeName || 'Not Filled'}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Emergency Phone:</span>
                    <span className="font-black text-gray-800 font-mono">{form.emergencyMobile || 'Not Filled'}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Father's Name:</span>
                    <span className="font-black text-gray-800">{form.father || 'Not Filled'}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Room & Bed choice:</span>
                    <span className="font-black text-[#FF6B35]">Room {form.room || 'Pending'} ({form.sharing} Sharing)</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-450">Notice Interval:</span>
                    <span className="font-black text-gray-600 font-mono">{form.noticePeriod || '30 Days'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1.5">
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Annual Hostel Fee:</span>
                    <span className="font-extrabold text-[#1A1A2E]">₹{(form.yearlyTotalFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-gray-100">
                    <span className="font-bold text-gray-500">Calculated Per Installment:</span>
                    <span className="font-black text-emerald-600 font-mono">₹{(form.fee || 0).toLocaleString('en-IN')} x {
                      form.installmentType === 'Monthly' ? '12' :
                      form.installmentType === '2 Installments' ? '2' :
                      form.installmentType === '3 Installments' ? '3' :
                      form.installmentType === '4 Installments' ? '4' : '6'
                    }</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex gap-2.5 text-xs text-amber-900 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Warden Check & Approve Confirmation:</strong> By saving this admission profile, a live registration record will be created. Hostel ledger cards, recurring UPI/cash outstanding invoices, and Parent WhatsApp reminder dockets will instantly setup.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-5 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
          <div>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 rounded-xl cursor-pointer transition select-none flex items-center gap-1.5"
            >
              Cancel
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 rounded-xl cursor-pointer transition select-none flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1A1A2E] to-[#24243e] text-white rounded-xl shadow-md cursor-pointer transition hover:shadow-lg flex items-center gap-1.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl shadow-md cursor-pointer transition hover:shadow-lg hover:shadow-[#FF6B35]/25 flex items-center gap-1.5"
              >
                Confirm Admission Check-In
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
