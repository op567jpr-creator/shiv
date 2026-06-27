import React, { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, ShieldAlert, GraduationCap, 
  CheckCircle2, Copy, Send, ArrowLeft, Phone, Mail, FileText,
  Camera, Upload, X, Trash2, Check, RefreshCw, Printer, Download, Eye
} from 'lucide-react';
import { Student, RoomSharing, HostelSettings } from '../types';
import { downloadBase64File } from '../utils/download';

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

const logoImg = "/src/assets/images/unity_hostel_logo_1781847359405.jpg";

interface StudentSelfRegistrationProps {
  students: Student[];
  settings?: HostelSettings;
  onAddStudent: (student: Omit<Student, 'id' | 'paid' | 'due' | 'joinDate'> & { joinDate?: string }) => void;
  onGoBack: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function StudentSelfRegistration({
  students,
  settings,
  onAddStudent,
  onGoBack,
  onShowToast
}: StudentSelfRegistrationProps) {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState<{name: string, mobile: string, date: string, profilePic?: string, fullForm?: any} | null>(null);

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
      onShowToast("Camera access refused or unavailable! Please upload from files instead. ⚠️", true);
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
        onShowToast("Selfie captured successfully! 🤳📸");
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("Image size must be less than 2MB! ⚠️", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({ ...prev, profilePic: reader.result as string }));
        onShowToast("Profile photo uploaded successfully! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setForm((prev: any) => ({ ...prev, profilePic: '' }));
    onShowToast("Profile photo removed.");
  };

  const handleDocUpload = (fieldName: string, file: File | null) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("File size must be less than 2MB! ⚠️", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, [fieldName]: reader.result as string }));
        onShowToast("Document file loaded successfully! 📂✅");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDoc = (fieldName: string) => {
    setForm(prev => ({ ...prev, [fieldName]: '' }));
    onShowToast("Document file removed.");
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

  // Form Fields
  const [form, setForm] = useState({
    name: '',
    profilePic: '',
    dob: '',
    joinDate: new Date().toLocaleDateString('en-IN'),
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

    // Parent/Guardian
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

    // Education
    collegeName: '',
    courseName: '',
    semesterYear: '',
    collegeId: '',
    collegeAddress: '',

    // Hostel Choice
    sharing: 'Double' as RoomSharing,
    acType: 'Non AC' as 'AC' | 'Non AC',
    washroomType: 'Common',

    // New Fee structure & physical documents fields
    yearlyTotalFee: defaultDoubleRent * 12,
    installmentType: 'Monthly',
    fee: defaultDoubleRent,
    policeVerification: '', // Pending or Base64
    hostelForm: '', // Pending or Base64
    agreementDoc: '', // Pending or Base64
    studentAadhaarDoc: '', // Pending or Base64
    fatherAadhaarDoc: '', // Pending or Base64
  });

  // On mount, the registration form always opens fresh (as per request: "share form har bar fresh hi khule")
  useEffect(() => {
    // Fresh form by default on load. No automatic single-submission lock screen on mount.
  }, []);

  const handleSharingChange = (val: RoomSharing) => {
    let targetFee = savedSettings.doubleRent || 6500;
    if (val === 'Single') {
      targetFee = savedSettings.singleRent || 8500;
    } else if (val === 'Triple') {
      targetFee = savedSettings.tripleRent || 5500;
    } else if (val === 'Double') {
      targetFee = savedSettings.doubleRent || 6500;
    }
    setForm(prev => ({ 
      ...prev, 
      sharing: val,
      fee: targetFee,
      yearlyTotalFee: targetFee * 12
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.mobile) {
        onShowToast('Please enter your Full Name and Mobile Number! ⚠️', true);
        return;
      }
    }
    if (step === 2) {
      if (!form.houseNo || !form.city || !form.pinCode) {
        onShowToast('Please fill in permanent address details! 🏠', true);
        return;
      }
    }
    if (step === 3) {
      if (!form.father || !form.fatherMob || !form.emergencyMobile) {
        onShowToast('Please fill in Parental & Emergency mobile numbers! ⚠️', true);
        return;
      }
    }
    if (step === 4) {
      if (!form.collegeName || !form.courseName) {
        onShowToast('Please enter your College Name and registered Course! 🎓', true);
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compile formatted text for copy/whastapp direct text matching the exact requested format
  const getCompiledFormText = () => {
    const permAddr = `${form.houseNo}, ${form.area}, ${form.city}, ${form.state} - ${form.pinCode}`;
    const currAddr = form.isCurrentSameAsPermanent ? 'Same as Permanent Address' : form.currentAddress;

    return `===============================
UNITY BOYS HOSTEL – ADMISSION FORM
===============================

1. STUDENT BASIC DETAILS

Full Name: ${form.name}
Date of Birth: ${form.dob || 'Not Filled'}
Gender: ${form.gender}
Blood Group: ${form.bloodGroup || 'Not Filled'}
Aadhaar Number: ${form.aadhaar || 'Not Filled'}
Mobile Number: ${form.mobile}
WhatsApp Number: ${form.whatsapp || 'Not Filled'}
Email ID: ${form.email || 'Not Filled'}
Nationality: ${form.nationality}

---------------------------------

2. ADDRESS DETAILS

Permanent Address:
House No / Street: ${form.houseNo}
Area: ${form.area || 'Not Filled'}
City: ${form.city}
State: ${form.state || 'Rajasthan'}
PIN Code: ${form.pinCode}

Current Address: ${currAddr}

---------------------------------

3. PARENT / GUARDIAN DETAILS

Father Name: ${form.father}
Father Mobile: ${form.fatherMob}
Father Occupation: ${form.fatherOccupation || 'Not Filled'}

Mother Name: ${form.motherName || 'Not Filled'}
Mother Mobile: ${form.motherMobile || 'Not Filled'}

Local Guardian Name: ${form.guardianName || 'None'}
Guardian Mobile: ${form.guardianMobile || 'N/A'}

Emergency Contact Name: ${form.emergencyName || form.father}
Relation: ${form.emergencyRelation || 'Father'}
Emergency Mobile: ${form.emergencyMobile}

---------------------------------

4. EDUCATION DETAILS

College Name: ${form.collegeName}
Course Name: ${form.courseName}
Semester / Year: ${form.semesterYear || '1st Year'}
College ID Number: ${form.collegeId || 'Not Filled'}
College Address: ${form.collegeAddress || 'Not Filled'}

---------------------------------

5. HOSTEL ROOM ALLOCATION

Floor: Ground Floor (Subject to verification)
Room Number: Pending Assignment
Bed Number: Pending Assignment

Sharing Type: ${form.sharing} Sharing
AC / Non AC: ${form.acType}
Washroom Type: ${form.washroomType}

---------------------------------
Form Submitted Online via Self-Registration Portal.
Warden verification pending.
===============================`;
  };

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    onShowToast("Form Details Copied to Clipboard! 📋");
  };

  const handleSendToWhatsApp = (textToSend: string) => {
    const encodedText = encodeURIComponent(textToSend);
    // WhatsApp direct link to the warden primary number
    const waUrl = `https://wa.me/918209696820?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  const downloadFormAsHtml = (data: any) => {
    if (!data) return;
    try {
      const hostelName = savedSettings?.name || "Unity Boys Hostel";
      const hostelPhone = savedSettings?.phone || "+91 82096 96820, +91 95215 12224";

      // Build out embedded documents HTML
      let documentsHtml = '';
      const docList = [
        { label: 'Police Verification Receipt', key: 'policeVerification' },
        { label: 'Hostel Admission Printed Form', key: 'hostelForm' },
        { label: 'Agreement Contract Slip', key: 'agreementDoc' },
        { label: 'Student Aadhaar Card (Front/Back)', key: 'studentAadhaarDoc' },
        { label: 'Father / Guardian Aadhaar Card', key: 'fatherAadhaarDoc' }
      ];

      docList.forEach(doc => {
        const docSrc = data[doc.key];
        if (docSrc && docSrc !== 'Pending Submission' && docSrc.startsWith('data:')) {
          documentsHtml += `
            <div class="document-card page-break">
              <h3>📄 ${doc.label}</h3>
              <div class="document-img-container">
                <img src="${docSrc}" class="document-img" alt="${doc.label}" />
              </div>
            </div>
          `;
        }
      });

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hostel Admission Form - \${data.name || 'Student'}</title>
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 30px;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .no-print {
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      text-decoration: none;
    }
    .btn-primary {
      background: #ff6b35;
      color: white;
    }
    .btn-primary:hover {
      background: #e55a24;
      box-shadow: 0 10px 15px -3px rgba(255,107,53,0.25);
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 3px dashed #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-text h1 {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .header-text p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      font-weight: 600;
    }
    .badge {
      background: #ffefea;
      color: #ff6b35;
      font-weight: 800;
      font-size: 11px;
      padding: 8px 16px;
      border-radius: 9999px;
      text-transform: uppercase;
      border: 1px solid #ffe0d5;
      letter-spacing: 0.5px;
    }
    .profile-section {
      display: flex;
      gap: 30px;
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #f1f5f9;
      align-items: flex-start;
    }
    .profile-pic-container {
      width: 140px;
      height: 140px;
      border-radius: 16px;
      overflow: hidden;
      border: 3px solid #ffeedb;
      background: #f8fafc;
      flex-shrink: 0;
    }
    .profile-pic {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      width: 100%;
    }
    .full-width {
      grid-column: span 2;
    }
    .field {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 800;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .field-value {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
    }
    .section-title {
      font-size: 13px;
      color: #0f172a;
      font-weight: 800;
      border-left: 4px solid #ff6b35;
      padding-left: 10px;
      margin: 35px 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      padding: 24px;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .document-preview-section {
      margin-top: 40px;
    }
    .document-card {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 30px;
      text-align: center;
    }
    .document-card h3 {
      font-size: 14px;
      margin: 0 0 15px 0;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .document-img-container {
      width: 100%;
      max-height: 700px;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      box-sizing: border-box;
    }
    .document-img {
      max-width: 100%;
      max-height: 650px;
      object-fit: contain;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-primary" onclick="window.print()">
      <svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print Form (प्रिंट रसीद)
    </button>
  </div>

  <div class="container">
    <div class="header">
      <div class="header-text">
        <h1>${hostelName}</h1>
        <p>Provisional Digital Admission Receipt</p>
      </div>
      <div class="badge">Submitted Online</div>
    </div>

    <div class="profile-section">
      ${data.profilePic ? `
      <div class="profile-pic-container">
        <img class="profile-pic" src="${data.profilePic}" alt="Student Profile" />
      </div>
      ` : ''}
      <div class="grid">
        <div class="field">
          <span class="field-label">Student Name (छात्र का नाम)</span>
          <span class="field-value">${data.name || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Mobile Number (मोबाइल)</span>
          <span class="field-value">${data.mobile || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">WhatsApp Number</span>
          <span class="field-value">${data.whatsapp || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Aadhaar Card Number (आधार)</span>
          <span class="field-value">${data.aadhaar || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Date of Birth (DOB)</span>
          <span class="field-value">${data.dob || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Blood Group / Gender</span>
          <span class="field-value">${data.bloodGroup || 'Not declared'} / ${data.gender || 'Male'}</span>
        </div>
      </div>
    </div>

    <div class="section-title font-bold">Parents & emergency Contacts</div>
    <div class="card">
      <div class="card-grid">
        <div class="field">
          <span class="field-label">Father's Name (पिता का नाम)</span>
          <span class="field-value">${data.father || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Father's Mobile</span>
          <span class="field-value">${data.fatherMob || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label font-bold">Mother's Name (माता का नाम)</span>
          <span class="field-value">${data.motherName || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Mother's Mobile</span>
          <span class="field-value">${data.motherMobile || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Father's Occupation</span>
          <span class="field-value">${data.fatherOccupation || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Emergency SOS Number</span>
          <span class="field-value" style="color: #ff6b35;">${data.emergencyMobile || '--'} (${data.emergencyName || 'SOS'} - ${data.emergencyRelation || 'Contact'})</span>
        </div>
      </div>
    </div>

    <div class="section-title">🏠 Residency Address Details</div>
    <div class="card">
      <div class="card-grid">
        <div class="field full-width">
          <span class="field-label">Permanent Address (स्थायी पता)</span>
          <span class="field-value">${data.houseNo || ''} ${data.area || ''}, ${data.city || ''}, ${data.state || ''} - ${data.pinCode || ''}</span>
        </div>
        ${!data.isCurrentSameAsPermanent && data.currentAddress ? `
        <div class="field full-width" style="border-top: 1px dashed #e2e8f0; padding-top: 10px; margin-top: 5px;">
          <span class="field-label">Current / Mailing Address</span>
          <span class="field-value">${data.currentAddress}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <div class="section-title">🎓 College & course Admissions</div>
    <div class="card">
      <div class="card-grid">
        <div class="field">
          <span class="field-label">College / Institute Name</span>
          <span class="field-value">${data.collegeName || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">Course & Sem / Year</span>
          <span class="field-value">${data.courseName || '--'} (${data.semesterYear || '1st Year'})</span>
        </div>
        <div class="field">
          <span class="field-label">College Roll No / ID</span>
          <span class="field-value">${data.collegeId || '--'}</span>
        </div>
        <div class="field">
          <span class="field-label">College Address</span>
          <span class="field-value">${data.collegeAddress || '--'}</span>
        </div>
      </div>
    </div>

    <div class="section-title">🛏&zwj; Allocation Request & Rent cycle</div>
    <div class="card">
      <div class="card-grid">
        <div class="field">
          <span class="field-label">Room Sharing Plan</span>
          <span class="field-value">${data.sharing} Sharing Plan</span>
        </div>
        <div class="field">
          <span class="field-label">AC / Air Cooling Preference</span>
          <span class="field-value">${data.acType}</span>
        </div>
        <div class="field">
          <span class="field-label">Washroom Attachment</span>
          <span class="field-value">${data.washroomType || 'Common Bathroom'}</span>
        </div>
        <div class="field">
          <span class="field-label">Provisional Base Rent</span>
          <span class="field-value" style="color: #10b981;">₹${(data.fee || 6500).toLocaleString('en-IN')} per month (${data.installmentType || 'Monthly'})</span>
        </div>
      </div>
    </div>

    ${documentsHtml ? `
      <div class="document-preview-section">
        <div class="section-title">📂 Digital Verification Documents Attached</div>
        ${documentsHtml}
      </div>
    ` : ''}

    <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 20px; font-size: 11px; text-align: center; color: #94a3b8; font-weight: 500;">
      Admission recorded securely on ${data.joinDate || new Date().toLocaleDateString('en-IN')}. For support, contact Warden at ${hostelPhone}.
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `index.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onShowToast("Downloaded index.html admission receipt! 📂 Save this file.");
    } catch (e) {
      console.error(e);
      onShowToast("Could not export HTML file ⚠️", true);
    }
  };

  const handleFormSubmit = () => {
    // Calculated rent per installment based on selected plan or base rent
    const standardFee = form.fee || (form.sharing === 'Triple' ? (savedSettings.tripleRent || 5500) : form.sharing === 'Single' ? (savedSettings.singleRent || 8500) : (savedSettings.doubleRent || 6500));
    
    // Auto compile full address text block
    let fullAddr = `Permanent Address:\nHouse No: ${form.houseNo}, ${form.area ? form.area + ', ' : ''}${form.city}, ${form.state || 'Rajasthan'} - ${form.pinCode}`;
    if (!form.isCurrentSameAsPermanent) {
      fullAddr += `\n\nCurrent Address:\n${form.currentAddress}`;
    }

    // Call state registration back to App
    onAddStudent({
      name: form.name,
      profilePic: form.profilePic,
      mobile: form.mobile,
      father: form.father,
      fatherMob: form.fatherMob,
      room: "Unassigned", // Admin will assign later
      sharing: form.sharing,
      fee: standardFee,
      status: "Notice", // Sets temporary notice state for unapproved registry
      address: fullAddr,

      // Detailed metadata
      dob: form.dob,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      aadhaar: form.aadhaar,
      whatsapp: form.whatsapp || form.mobile,
      email: form.email,
      nationality: form.nationality,
      houseNo: form.houseNo,
      area: form.area,
      city: form.city,
      state: form.state || 'Rajasthan',
      pinCode: form.pinCode,
      currentAddress: form.isCurrentSameAsPermanent ? fullAddr : form.currentAddress,
      fatherOccupation: form.fatherOccupation,
      motherName: form.motherName,
      motherMobile: form.motherMobile,
      guardianName: form.guardianName,
      guardianMobile: form.guardianMobile,
      emergencyName: form.emergencyName || form.father,
      emergencyRelation: form.emergencyRelation || 'Father',
      emergencyMobile: form.emergencyMobile,
      collegeName: form.collegeName,
      courseName: form.courseName,
      semesterYear: form.semesterYear,
      collegeId: form.collegeId,
      collegeAddress: form.collegeAddress,

      acType: form.acType,
      washroomType: form.washroomType,
      floor: "Unassigned",
      bedNumber: "Pending",
      agreementStartDate: form.joinDate || new Date().toLocaleDateString('en-IN'),
      joinDate: form.joinDate || new Date().toLocaleDateString('en-IN'),
      feePlan: '1 Month',
      monthsCount: 1,
      discount: 0,
      totalRent: standardFee,
      securityDeposit: 2000,
      finalPayableAmount: standardFee + 2000,

      // New columns from user request
      yearlyTotalFee: form.yearlyTotalFee,
      installmentType: form.installmentType,
      policeVerification: form.policeVerification || 'Pending Submission',
      hostelForm: form.hostelForm || 'Pending Submission',
      agreementDoc: form.agreementDoc || 'Pending Submission',
      studentAadhaarDoc: form.studentAadhaarDoc || 'Pending Submission',
      fatherAadhaarDoc: form.fatherAadhaarDoc || 'Pending Submission'
    });

    // Save browser token lock ("one time only")
    const nowStr = form.joinDate || new Date().toLocaleDateString('en-IN');
    localStorage.setItem('ubh_student_submitted', 'true');
    localStorage.setItem('ubh_submitted_name', form.name);
    localStorage.setItem('ubh_submitted_mobile', form.mobile);
    localStorage.setItem('ubh_submitted_date', nowStr);
    localStorage.setItem('ubh_submitted_full_form', JSON.stringify(form));
    if (form.profilePic) {
      localStorage.setItem('ubh_submitted_pic', form.profilePic);
    }

    setSubmittedData({
      name: form.name,
      mobile: form.mobile,
      date: nowStr,
      profilePic: form.profilePic,
      fullForm: form
    });

    onShowToast("Admission form registered successfully! 🎉");
    setStep(6); // Show success screen
  };

  const renderFormFullPreview = (data: any) => {
    if (!data) return null;
    return (
      <div className="border border-slate-200 rounded-2xl bg-white p-5 sm:p-6 text-xs text-left space-y-5 shadow-sm transition duration-200 text-slate-800">
        <div className="border-b border-dashed border-slate-200 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <h4 className="font-extrabold text-[#1A1A2E] text-xs sm:text-sm uppercase tracking-wider">UNITY BOYS HOSTEL - PROVISIONAL ADMISSION FORM</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Registration Slip & Document Verbiage Proof</p>
          </div>
          <span className="bg-[#FF6B35]/10 text-[#FF6B35] font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
            REGISTRATION PREVIEW
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pb-4 border-b border-slate-100">
          {data.profilePic && (
            <div className="md:col-span-1 mx-auto md:mx-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-[#FF6B35]/30 shadow-md bg-white flex-shrink-0">
              <img src={data.profilePic} alt="Lodger Photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="md:col-span-3 grid grid-cols-2 gap-x-4 gap-y-2 mt-2 md:mt-0 font-medium">
            <div>
              <span className="text-gray-400 font-bold block text-[9px] uppercase">Lodger Full Name (नाम)</span>
              <span className="text-slate-800 font-extrabold text-sm">{data.name || '--'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[9px] uppercase">Mobile Number (मोबाइल)</span>
              <span className="text-slate-800 font-extrabold font-mono">{data.mobile || '--'}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-400 font-bold block text-[9px] uppercase">Aadhaar (आधार कार्ड नंबर)</span>
              <span className="text-slate-700 font-bold font-mono text-xs">{data.aadhaar ? data.aadhaar.match(/.{1,4}/g)?.join(' ') : '--'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[9px] uppercase">Date of Birth (DOB)</span>
              <span className="text-slate-700 font-bold">{data.dob || '--'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[9px] uppercase">Blood Group & Gender</span>
              <span className="text-slate-705 font-bold">{data.bloodGroup || 'Not set'} / {data.gender || 'Male'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[9px] uppercase">Proposed join Date (तिथि)</span>
              <span className="text-slate-705 font-bold font-mono">{data.joinDate || '--'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Family Block */}
          <div className="space-y-2.5 bg-gray-50/50 p-3.5 rounded-xl border border-gray-150">
            <h5 className="font-extrabold text-[#1A1A2E] text-[10px] uppercase tracking-wider pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              👨‍👩‍👦 Parents & SOS Guardians Details
            </h5>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-gray-400 text-[10px]">Father's Name:</span>
                <span className="text-gray-800 font-bold">{data.father || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-[10px]">Father's Phone:</span>
                <span className="text-gray-800 font-bold font-mono">{data.fatherMob || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-[10px]">Mother's Name:</span>
                <span className="text-gray-800 font-bold">{data.motherName || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-[10px]">Mother's Phone:</span>
                <span className="text-gray-800 font-bold font-mono">{data.motherMobile || '--'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-150 border-dashed text-[#FF6B35]">
                <span className="text-[10px]">Emergency SOS Contact:</span>
                <span className="font-extrabold font-mono">{data.emergencyMobile || '--'}</span>
              </div>
            </div>
          </div>

          {/* Location Block */}
          <div className="space-y-2.5 bg-gray-50/50 p-3.5 rounded-xl border border-gray-150">
            <h5 className="font-extrabold text-[#1A1A2E] text-[10px] uppercase tracking-wider pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              🏠 Permanent Address (स्थायी पता)
            </h5>
            <div className="space-y-1 text-slate-700 leading-relaxed font-semibold">
              <p className="text-slate-800 font-bold text-[11px]">{data.houseNo ? `${data.houseNo}, ${data.area || ''}` : '--'}</p>
              <p className="text-xs">{data.city || '--'}, {data.state || '--'} - <span className="font-mono">{data.pinCode || '--'}</span></p>
              <div className="pt-2 border-t border-slate-150 border-dashed mt-2.5">
                <span className="text-gray-400 text-[9px] uppercase font-bold block">College / Course</span>
                <p className="font-black text-slate-800 text-[11px] truncate">{data.collegeName || '--'}</p>
                <p className="text-[10px] text-gray-500 font-bold">Course: {data.courseName || '--'} | ID: {data.collegeId || '--'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-[#FF6B35]/5 rounded-xl border border-[#FF6B35]/15">
            <span className="text-gray-450 text-[9px] font-bold block uppercase mb-0.5">Sharing</span>
            <span className="font-black text-[#FF6B35] text-[10px] sm:text-xs leading-none">{data.sharing} sharing</span>
          </div>
          <div className="p-2.5 bg-[#FF6B35]/5 rounded-xl border border-[#FF6B35]/15">
            <span className="text-gray-450 text-[9px] font-bold block uppercase mb-0.5">AC status</span>
            <span className="font-black text-[#FF6B35] text-[10px] sm:text-xs leading-none">{data.acType} Room</span>
          </div>
          <div className="p-2.5 bg-[#FF6B35]/5 rounded-xl border border-[#FF6B35]/15">
            <span className="text-gray-450 text-[9px] font-bold block uppercase mb-0.5">Toilet</span>
            <span className="font-black text-[#FF6B35] text-[10px] sm:text-xs leading-none">{data.washroomType || 'Common Bathroom'}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-600 text-[9px] font-bold block uppercase mb-0.5">Base rent</span>
            <span className="font-black text-emerald-800 text-[10px] sm:text-xs leading-none">₹{(data.fee || 7500).toLocaleString('en-IN')}/mo</span>
          </div>
        </div>

        {/* Digital Document checklist */}
        <div className="space-y-1.5">
          <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wider">Verification documents uploaded profile status:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[10px] text-center font-bold">
            {[
              { label: 'Police Verification', key: 'policeVerification', file: 'police_verification' },
              { label: 'Hostel Form', key: 'hostelForm', file: 'hostel_form' },
              { label: 'Agreement Slip', key: 'agreementDoc', file: 'agreement_contract' },
              { label: 'Student Aadhaar', key: 'studentAadhaarDoc', file: 'student_aadhaar' },
              { label: 'Parent Aadhaar', key: 'fatherAadhaarDoc', file: 'father_aadhaar' }
            ].map(doc => {
              const rawDoc = (data as any)[doc.key];
              const hasDoc = rawDoc && rawDoc !== 'Pending Submission' && rawDoc.startsWith('data:');
              return (
                <div key={doc.key} className={`p-2 rounded-lg border flex flex-col justify-between min-h-[75px] ${hasDoc ? 'bg-emerald-50/60 border-emerald-250 text-emerald-800' : 'bg-gray-50 border-gray-150 text-gray-400'}`}>
                  <div>
                    <span className="truncate block">{doc.label}</span>
                    <span className="text-[9px] font-black uppercase mt-0.5 block">{hasDoc ? '✓ Uploaded' : '✗ Pending'}</span>
                  </div>
                  {hasDoc && (
                    <div className="flex justify-center gap-1 mt-1.5 pt-1 border-t border-emerald-100">
                      <button
                        type="button"
                        onClick={() => {
                          const win = window.open();
                          if (win) {
                            win.document.write(`<img src="${rawDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                          }
                        }}
                        className="px-1 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[8px] font-extrabold cursor-pointer"
                        title="View Document"
                      >
                        View
                      </button>
                      <button
                        type="button"
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
                        className="px-1 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[8px] font-extrabold cursor-pointer"
                        title="Print this document copy"
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const ext = rawDoc.split(';')[0].split('/')[1] || 'png';
                          const filename = `${(data.name || 'document').replace(/\s+/g, '_')}_${doc.file}.${ext}`;
                          downloadBase64File(rawDoc, filename);
                        }}
                        className="px-1 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-extrabold cursor-pointer flex items-center gap-0.5"
                        title="Download Document"
                      >
                        <Download className="w-2 h-2" /> DL
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERING 1: ALREADY SUBMITTED SHIELD SCREEN ---
  if (submittedData) {
    const formattedText = `===============================
UNITY BOYS HOSTEL Admission details
===============================
Lodger Name: ${submittedData.name}
Mobile Number: ${submittedData.mobile}
Submission Date: ${submittedData.date}
Verification Status: Pending review by Warden

We've recorded your entry. Your bed will be allocated upon arrival.
===============================`;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div>
            <h3 className="text-xl font-extrabold text-[#1A1A2E]">Form Already Submitted Successfully!</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              To maintain database security, students can only register on our admission portal **one time**. Your details have been transmitted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-start">
            <div className="md:col-span-1 bg-orange-50/50 rounded-2xl p-4 border border-orange-100 flex flex-col items-center text-center space-y-3">
              {submittedData.profilePic && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#FF6B35]/20 shadow-sm bg-white">
                  <img src={submittedData.profilePic} alt="Submitted Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="text-xs text-gray-700 space-y-1 font-semibold w-full">
                <span className="text-[10px] uppercase font-bold text-[#FF6B35] tracking-wider block mb-1">Receipt Token</span>
                <p className="truncate">👤 Lodger: <span className="font-extrabold">{submittedData.name}</span></p>
                <p className="font-mono">📞 Phone: <span>{submittedData.mobile}</span></p>
                <p className="font-mono">🗓️ Registered: <span>{submittedData.date}</span></p>
                <p className="pt-1.5">⚡ Status: <span className="text-emerald-700 bg-emerald-100 border border-emerald-250 px-2 py-0.5 rounded-full font-black text-[10px]">Warden Checking</span></p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              {submittedData.fullForm ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lodger Form Review Sheet:</span>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => downloadFormAsHtml(submittedData.fullForm)} 
                        className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg hover:bg-emerald-100 font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" /> Download index.html
                      </button>
                      <button 
                        onClick={() => window.print()} 
                        className="px-3 py-1 bg-slate-105 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Copy
                      </button>
                    </div>
                  </div>
                  {renderFormFullPreview(submittedData.fullForm)}
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl text-center text-gray-400 border border-gray-150">
                  Detailed form cache is not active in this browser index.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleCopyText(formattedText)}
              className="w-full py-3 bg-gray-100 font-bold text-xs sm:text-sm text-gray-800 rounded-xl hover:bg-gray-200 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Copy Admission Details
            </button>
            <button
              onClick={() => handleSendToWhatsApp(formattedText)}
              className="w-full py-3 bg-[#25D366] font-bold text-xs sm:text-sm text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send Details to Warden
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('ubh_student_submitted');
                localStorage.removeItem('ubh_submitted_name');
                localStorage.removeItem('ubh_submitted_mobile');
                localStorage.removeItem('ubh_submitted_date');
                localStorage.removeItem('ubh_submitted_pic');
                localStorage.removeItem('ubh_submitted_full_form');
                setSubmittedData(null);
                setForm({
                  name: '',
                  mobile: '',
                  whatsapp: '',
                  email: '',
                  joinDate: new Date().toISOString().split('T')[0],
                  dob: '',
                  gender: 'Male',
                  bloodGroup: 'B+',
                  aadhaar: '',
                  father: '',
                  fatherMob: '',
                  fatherOccupation: '',
                  motherName: '',
                  motherMobile: '',
                  emergencyName: '',
                  emergencyRelation: 'Father',
                  emergencyMobile: '',
                  houseNo: '',
                  area: '',
                  city: '',
                  state: 'Rajasthan',
                  pinCode: '',
                  address: '',
                  collegeName: '',
                  courseName: '',
                  semesterYear: '',
                  room: '',
                  sharing: 'Double',
                  fee: savedSettings.doubleRent || 6500,
                  securityDeposit: 0,
                  agreementStartDate: new Date().toISOString().split('T')[0],
                  agreementEndDate: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString().split('T')[0],
                  noticePeriod: '30 Days',
                  lockInPeriod: '6 Months',
                  profilePic: '',
                  policeVerification: '',
                  hostelForm: '',
                  agreementDoc: '',
                  studentAadhaarDoc: '',
                  fatherAadhaarDoc: '',
                });
                setStep(1);
                onShowToast('Ready to register another student! 📝');
              }}
              className="w-full py-3 bg-indigo-50 font-bold text-xs sm:text-sm text-indigo-700 rounded-xl hover:bg-indigo-100 transition duration-150 flex items-center justify-center gap-2 cursor-pointer border border-indigo-200"
            >
              📝 Register Another Student (नया फॉर्म भरें)
            </button>
            <button
               onClick={onGoBack}
               className="w-full py-3 text-xs text-gray-400 hover:text-[#1A1A2E] font-semibold transition animate-pulse"
             >
               Return to Website Landing
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING 2: MULTI-STEP PROGRESSBAR ADMISSION FORM ---
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-gray-150 shadow-2xl relative overflow-hidden">
        
        {/* Fancy Ribbon Header */}
        <div className="bg-gradient-to-r from-[#1E2022] to-[#2E3135] py-6 px-8 text-white relative border-b border-[#D4AF37]/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl"></div>
          <button 
            onClick={onGoBack}
            className="absolute top-6 right-8 text-white/50 hover:text-white flex items-center gap-1 text-xs cursor-pointer bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Portal
          </button>
          
          <div className="flex items-center gap-3">
            <img 
               src={logoImg} 
               alt="Unity Hostel Logo" 
               className="w-12 h-12 rounded-full border border-[#D4AF37] object-contain shadow-md bg-[#1E2022]"
               referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                {settings?.name || 'Unity Boys Hostel'}
              </h1>
              <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                Admission Form Self-Service Portal
              </p>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 mt-6">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <React.Fragment key={s}>
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    step >= s ? 'bg-[#D4AF37] text-[#1E2022] font-black shadow-md shadow-[#D4AF37]/30' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {s}
                </div>
                {s < 6 && <div className={`flex-1 h-0.5 max-w-[40px] ${step > s ? 'bg-[#D4AF37]' : 'bg-white/10'}`}></div>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] text-gray-300 italic mt-2">
            Step {step} of 6: {
              step === 1 ? 'Lodger Basic Information Details' :
              step === 2 ? 'Address Sheets Representation' :
              step === 3 ? 'Parent / Guardian sos registries' :
              step === 4 ? 'Academics & Educational criteria' :
              step === 5 ? 'Rent & Installment, Physical Documents upload' :
              'Self Admission review checklist & submission'
            }
          </p>
        </div>

        {/* Dynamic Forms */}
        <div className="p-8">
          
          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2">
                <User className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="font-extrabold text-[#1A1A2E] text-base leading-none">1. STUDENT BASIC DETAILS</h3>
              </div>

              {/* Profile Picture Upload & Camera Capture Section */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  {form.profilePic ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md bg-white relative">
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
                  <p className="text-[10px] leading-relaxed font-semibold text-gray-500">
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
                      className="px-3.5 py-2 bg-white hover:bg-gray-100 text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 font-bold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo 📁
                    </button>

                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#bfa032] text-[#1E2021] rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 font-bold"
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
                <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-800 gap-3 animate-slideDown shadow-xl max-w-sm mx-auto w-full">
                  <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 w-full aspect-square">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full font-sans">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer font-bold"
                    >
                      <Check className="w-4 h-4" /> Capture Snippet Shot
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-2.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition active:scale-95 cursor-pointer font-bold"
                      title="Close webcam"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                  <input 
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#FF6B35] mb-1.5 font-sans">Date of Admission (प्रवेश तिथि) *</label>
                  <input 
                    type="date"
                    value={convertDDMMYYYYToYYYYMMDD(form.joinDate)}
                    onChange={e => setForm({ ...form, joinDate: convertYYYYMMDDToDDMMYYYY(e.target.value) })}
                    className="w-full px-4 py-3 border border-[#FF6B35] rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-sans font-extrabold text-[#FF6B35]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date of Birth (DOB) *</label>
                  <input 
                    type="date"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
                  <select 
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white cursor-pointer"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Blood Group</label>
                  <input 
                    type="text"
                    value={form.bloodGroup}
                    onChange={e => setForm({ ...form, bloodGroup: e.target.value.toUpperCase() })}
                    placeholder="e.g. O+, B+"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Aadhaar National Card Number</label>
                  <input 
                    type="text"
                    maxLength={12}
                    value={form.aadhaar}
                    onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '') })}
                    placeholder="12-digit UID"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student Mobile Number *</label>
                  <input 
                    type="tel"
                    maxLength={10}
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="10 digit personal number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">WhatsApp Contact Address</label>
                  <input 
                    type="tel"
                    maxLength={10}
                    value={form.whatsapp}
                    onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                    placeholder="10 digit WhatsApp contact"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Personal Email ID Address</label>
                  <input 
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. resident@gmail.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nationality</label>
                  <input 
                    type="text"
                    value={form.nationality}
                    onChange={e => setForm({ ...form, nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS FILES */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2">
                <MapPin className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="font-extrabold text-[#1A1A2E] text-base leading-none">2. ADDRESS DETAILS</h3>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-1 block">A. Permanent Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">House No / Apartment / Block / Street *</label>
                    <input 
                      type="text"
                      value={form.houseNo}
                      onChange={e => setForm({ ...form, houseNo: e.target.value })}
                      placeholder="Flat, House no., Building name, Street"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Area / Colony / Landmarking Landmark</label>
                    <input 
                      type="text"
                      value={form.area}
                      onChange={e => setForm({ ...form, area: e.target.value })}
                      placeholder="Colony, Sector, Locality"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">City / Village *</label>
                    <input 
                      type="text"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">State Address State</label>
                    <input 
                      type="text"
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      placeholder="e.g. Rajasthan, Haryana"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">PIN Code ZIP Postal *</label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={form.pinCode}
                      onChange={e => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 digit PIN code"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <input 
                    type="checkbox"
                    id="isSame"
                    checked={form.isCurrentSameAsPermanent}
                    onChange={e => setForm({ ...form, isCurrentSameAsPermanent: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isSame" className="text-xs font-bold text-gray-600 block cursor-pointer">
                    Current Address is same as Permanent Address
                  </label>
                </div>

                {!form.isCurrentSameAsPermanent && (
                  <div className="pt-3 animate-fadeIn">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Current Address Sheets *</label>
                    <textarea 
                      rows={3}
                      value={form.currentAddress}
                      onChange={e => setForm({ ...form, currentAddress: e.target.value })}
                      placeholder="Enter details of current staying location..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white resize-none"
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: PARENTS / EMERGENCY RECORD */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2">
                <ShieldAlert className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="font-extrabold text-[#1A1A2E] text-base leading-none">3. PARENT / GUARDIAN DETAILS</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Father Full Name *</label>
                  <input 
                    type="text"
                    value={form.father}
                    onChange={e => setForm({ ...form, father: e.target.value })}
                    placeholder="Father Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Father Mobile Number *</label>
                  <input 
                    type="tel"
                    maxLength={10}
                    value={form.fatherMob}
                    onChange={e => setForm({ ...form, fatherMob: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Father Occupation</label>
                  <input 
                    type="text"
                    value={form.fatherOccupation}
                    onChange={e => setForm({ ...form, fatherOccupation: e.target.value })}
                    placeholder="Business, Service, etc."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mother Full Name</label>
                  <input 
                    type="text"
                    value={form.motherName}
                    onChange={e => setForm({ ...form, motherName: e.target.value })}
                    placeholder="Mother Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mother Mobile Number</label>
                  <input 
                    type="tel"
                    maxLength={10}
                    value={form.motherMobile}
                    onChange={e => setForm({ ...form, motherMobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="Mother contact"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-dashed border-gray-150">
                  <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-3">B. SOS / Emergency Primary Contact</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Emergency Contact Full Name</label>
                  <input 
                    type="text"
                    value={form.emergencyName}
                    onChange={e => setForm({ ...form, emergencyName: e.target.value })}
                    placeholder="Emergency Contact Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Relationship to Student</label>
                  <input 
                    type="text"
                    value={form.emergencyRelation}
                    onChange={e => setForm({ ...form, emergencyRelation: e.target.value })}
                    placeholder="e.g. Uncle, Brother, Father"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Emergency SOS Mobile Number *</label>
                  <input 
                    type="tel"
                    maxLength={10}
                    value={form.emergencyMobile}
                    onChange={e => setForm({ ...form, emergencyMobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit number for emergency alerts"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EDUCATION DETAILS & ALLOCATION DESIRE */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2">
                <GraduationCap className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="font-extrabold text-[#1A1A2E] text-base leading-none">4. EDUCATION DETAILS</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">College / Institution Name *</label>
                  <input 
                    type="text"
                    value={form.collegeName}
                    onChange={e => setForm({ ...form, collegeName: e.target.value })}
                    placeholder="Enter College or Coaching Institute"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Course Name *</label>
                  <input 
                    type="text"
                    value={form.courseName}
                    onChange={e => setForm({ ...form, courseName: e.target.value })}
                    placeholder="e.g. B.Tech CSE, NEET Aspirant"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Semester / Year</label>
                  <input 
                    type="text"
                    value={form.semesterYear}
                    onChange={e => setForm({ ...form, semesterYear: e.target.value })}
                    placeholder="e.g. 1st Year, Semester III"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">College ID Number</label>
                  <input 
                    type="text"
                    value={form.collegeId}
                    onChange={e => setForm({ ...form, collegeId: e.target.value })}
                    placeholder="College registration UID"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">College Address</label>
                  <input 
                    type="text"
                    value={form.collegeAddress}
                    onChange={e => setForm({ ...form, collegeAddress: e.target.value })}
                    placeholder="Location / area"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white"
                  />
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-dashed border-gray-150">
                  <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-3">B. Hostel Bed Booking Preferences</h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sharing Accommodation Type</label>
                  <select 
                    value={form.sharing}
                    onChange={e => handleSharingChange(e.target.value as RoomSharing)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white cursor-pointer font-semibold text-gray-800"
                  >
                    <option value="Single">Single Sharing</option>
                    <option value="Double">Double Sharing</option>
                    <option value="Triple">Triple Sharing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">AC / Non AC Cooling Preference</label>
                  <select 
                    value={form.acType}
                    onChange={e => setForm({ ...form, acType: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white cursor-pointer"
                  >
                    <option value="Non AC">Non-AC Air Cooler Ventilated</option>
                    <option value="AC">Premium Air Conditioned (AC)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Washroom Type</label>
                  <select 
                    value={form.washroomType}
                    onChange={e => setForm({ ...form, washroomType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm bg-white cursor-pointer"
                  >
                    <option>Common Washroom Complex</option>
                    <option>Attached Suite Washroom</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: RENT & DOCUMENTS UPLOAD */}
          {step === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-2">
                <FileText className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="font-extrabold text-[#1A1A2E] text-base leading-none">5. RENT AGREEMENTS & DOCUMENTS (किस्त और दस्तावेज)</h3>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-800 space-y-1 mb-4 sm:col-span-2">
                <p className="font-extrabold text-[#1A1A2E] text-[11px] uppercase tracking-wider">📋 Hostel Room & Rent Allotment Process</p>
                <p className="leading-relaxed">
                  Your final accommodation rent, room sharing bed count, standard security deposit, and payment installment schedule will be configured and formally finalized by the <strong>Hostel Warden</strong> at the time of your physical joining.
                </p>
                <p className="text-[10px] text-emerald-700 font-bold">Please proceed to upload verification document proofs below to submit your application checks.</p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-dashed border-gray-150">
                <h4 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-1">📑 Physical Documents upload (भौतिक दस्तावेज सत्यापन)</h4>
                <p className="text-[10px] text-gray-400">Upload scanned copies of standard documents. The Warden will verify these during check-in.</p>
              </div>

              {/* Documents upload section */}
              <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Document 1: Police Verification */}
                  <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-700 text-xs">1. Police Verification (पुलिस सत्यापन)</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${form.policeVerification ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                          {form.policeVerification ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">Submit character validation verified by local police station.</p>
                    </div>
                    {form.policeVerification ? (
                      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded overflow-hidden border cursor-pointer hover:opacity-85" onClick={() => {
                          const win = window.open();
                          if (win) win.document.write(`<img src="${form.policeVerification}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                        }}>
                          <img src={form.policeVerification} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 flex-1 truncate">police_verification_proof.jpg</span>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open();
                              if (win) win.document.write(`<img src="${form.policeVerification}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                            }}
                            className="text-[#FF6B35] hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ext = (form.policeVerification || '').split(';')[0].split('/')[1] || 'png';
                              const filename = `${(form.name || 'document').replace(/\s+/g, '_')}_police_verification.${ext}`;
                              downloadBase64File(form.policeVerification || '', filename);
                            }}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            DL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#fff;">
                                      <img src="${form.policeVerification}" style="max-width:100%; max-height:100%; object-fit:contain;" />
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
                            className="text-sky-600 hover:underline cursor-pointer"
                          >
                            Print
                          </button>
                          <button type="button" onClick={() => removeDoc('policeVerification')} className="text-red-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleDocUpload('policeVerification', e.target.files?.[0] || null)}
                        className="text-[10px] text-gray-500 file:border-0 file:bg-gray-200 file:px-2.5 file:py-1 file:rounded-lg file:text-xs file:font-semibold cursor-pointer" 
                      />
                    )}
                  </div>

                  {/* Document 2: Hostel Form */}
                  <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-700 text-xs">2. Hostel Admission Form (प्रवेश पत्र)</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${form.hostelForm ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                          {form.hostelForm ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">Scanned copy of filled offline Admission Application docket.</p>
                    </div>
                    {form.hostelForm ? (
                      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded overflow-hidden border cursor-pointer hover:opacity-85" onClick={() => {
                          const win = window.open();
                          if (win) win.document.write(`<img src="${form.hostelForm}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                        }}>
                          <img src={form.hostelForm} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 flex-1 truncate">hostel_admission_form.jpg</span>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open();
                              if (win) win.document.write(`<img src="${form.hostelForm}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                            }}
                            className="text-[#FF6B35] hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ext = (form.hostelForm || '').split(';')[0].split('/')[1] || 'png';
                              const filename = `${(form.name || 'document').replace(/\s+/g, '_')}_hostel_form.${ext}`;
                              downloadBase64File(form.hostelForm || '', filename);
                            }}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            DL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#fff;">
                                      <img src="${form.hostelForm}" style="max-width:100%; max-height:100%; object-fit:contain;" />
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
                            className="text-sky-600 hover:underline cursor-pointer"
                          >
                            Print
                          </button>
                          <button type="button" onClick={() => removeDoc('hostelForm')} className="text-red-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleDocUpload('hostelForm', e.target.files?.[0] || null)}
                        className="text-[10px] text-gray-500 file:border-0 file:bg-gray-200 file:px-2.5 file:py-1 file:rounded-lg file:text-xs file:font-semibold cursor-pointer" 
                      />
                    )}
                  </div>

                  {/* Document 3: Agreement Stay Deed */}
                  <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-700 text-xs">3. Stay Lease Agreement (एग्रीमेंट पत्र)</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${form.agreementDoc ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                          {form.agreementDoc ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">Signed terms deed of hostel living contract.</p>
                    </div>
                    {form.agreementDoc ? (
                      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded overflow-hidden border cursor-pointer hover:opacity-85" onClick={() => {
                          const win = window.open();
                          if (win) win.document.write(`<img src="${form.agreementDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                        }}>
                          <img src={form.agreementDoc} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 flex-1 truncate">hostel_lease_agreement.jpg</span>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open();
                              if (win) win.document.write(`<img src="${form.agreementDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                            }}
                            className="text-[#FF6B35] hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ext = (form.agreementDoc || '').split(';')[0].split('/')[1] || 'png';
                              const filename = `${(form.name || 'document').replace(/\s+/g, '_')}_lease_agreement.${ext}`;
                              downloadBase64File(form.agreementDoc || '', filename);
                            }}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            DL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#fff;">
                                      <img src="${form.agreementDoc}" style="max-width:100%; max-height:100%; object-fit:contain;" />
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
                            className="text-sky-600 hover:underline cursor-pointer"
                          >
                            Print
                          </button>
                          <button type="button" onClick={() => removeDoc('agreementDoc')} className="text-red-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleDocUpload('agreementDoc', e.target.files?.[0] || null)}
                        className="text-[10px] text-gray-500 file:border-0 file:bg-gray-200 file:px-2.5 file:py-1 file:rounded-lg file:text-xs file:font-semibold cursor-pointer" 
                      />
                    )}
                  </div>

                  {/* Document 4: Student Aadhaar Card */}
                  <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-700 text-xs">4. Student Aadhaar Card (स्वयं का आधार)</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${form.studentAadhaarDoc ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                          {form.studentAadhaarDoc ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">Mandatory Government identity photo verification.</p>
                    </div>
                    {form.studentAadhaarDoc ? (
                      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded overflow-hidden border cursor-pointer hover:opacity-85" onClick={() => {
                          const win = window.open();
                          if (win) win.document.write(`<img src="${form.studentAadhaarDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                        }}>
                          <img src={form.studentAadhaarDoc} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 flex-1 truncate">student_aadhaar_card.jpg</span>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open();
                              if (win) win.document.write(`<img src="${form.studentAadhaarDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                            }}
                            className="text-[#FF6B35] hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ext = (form.studentAadhaarDoc || '').split(';')[0].split('/')[1] || 'png';
                              const filename = `${(form.name || 'document').replace(/\s+/g, '_')}_student_aadhaar.${ext}`;
                              downloadBase64File(form.studentAadhaarDoc || '', filename);
                            }}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            DL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#fff;">
                                      <img src="${form.studentAadhaarDoc}" style="max-width:100%; max-height:100%; object-fit:contain;" />
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
                            className="text-sky-600 hover:underline cursor-pointer"
                          >
                            Print
                          </button>
                          <button type="button" onClick={() => removeDoc('studentAadhaarDoc')} className="text-red-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleDocUpload('studentAadhaarDoc', e.target.files?.[0] || null)}
                        className="text-[10px] text-gray-500 file:border-0 file:bg-gray-200 file:px-2.5 file:py-1 file:rounded-lg file:text-xs file:font-semibold cursor-pointer" 
                      />
                    )}
                  </div>

                  {/* Document 5: Father Aadhaar Card */}
                  <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between gap-3 text-xs md:col-span-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-700 text-xs">5. Father's Aadhaar Card (पिता का आधार कार्ड)</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${form.fatherAadhaarDoc ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                          {form.fatherAadhaarDoc ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">Emergency guardian identity validation document.</p>
                    </div>
                    {form.fatherAadhaarDoc ? (
                      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded overflow-hidden border cursor-pointer hover:opacity-85" onClick={() => {
                          const win = window.open();
                          if (win) win.document.write(`<img src="${form.fatherAadhaarDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                        }}>
                          <img src={form.fatherAadhaarDoc} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 flex-1 truncate">father_aadhaar_proof.jpg</span>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open();
                              if (win) win.document.write(`<img src="${form.fatherAadhaarDoc}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                            }}
                            className="text-[#FF6B35] hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const ext = (form.fatherAadhaarDoc || '').split(';')[0].split('/')[1] || 'png';
                              const filename = `${(form.name || 'document').replace(/\s+/g, '_')}_parent_aadhaar.${ext}`;
                              downloadBase64File(form.fatherAadhaarDoc || '', filename);
                            }}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            DL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#fff;">
                                      <img src="${form.fatherAadhaarDoc}" style="max-width:100%; max-height:100%; object-fit:contain;" />
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
                            className="text-sky-600 hover:underline cursor-pointer"
                          >
                            Print
                          </button>
                          <button type="button" onClick={() => removeDoc('fatherAadhaarDoc')} className="text-red-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleDocUpload('fatherAadhaarDoc', e.target.files?.[0] || null)}
                        className="text-[10px] text-gray-500 file:border-0 file:bg-gray-200 file:px-2.5 file:py-1 file:rounded-lg file:text-xs file:font-semibold cursor-pointer" 
                      />
                    )}
                  </div>

                </div>
              </div>
            )}

          {/* STEP 6: OVERVIEW CHECKLIST & SUBMIT */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <FileText className="w-12 h-12 text-[#FF6B35] mx-auto mb-2" />
                <h3 className="font-extrabold text-[#1A1A2E] text-base leading-none">6. REVIEW & SUBMIT APPLICATION</h3>
                <p className="text-[10px] text-gray-400 mt-1">Please double check your credentials. Submissions are restricted to one-entry per student.</p>
              </div>

              {/* Official Beautiful Form Full Preview Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Review Form Details:</span>
                  <button 
                    type="button"
                    onClick={() => downloadFormAsHtml(form)} 
                    className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg hover:bg-emerald-100 font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download index.html (Draft)
                  </button>
                </div>
                {renderFormFullPreview(form)}
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 text-xs leading-relaxed text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Notice of Single Submission:</strong> By submitting, you confirm all data is authentic. You will not be able to change or fill this application again from this browser device. Write down details or copy them post successfully submitting.
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Warden Admission Contacts</span>
                  <span className="text-xs text-gray-700 font-bold block mt-0.5">{savedSettings.phone || "+91 82096 96820, +91 95215 12224"}</span>
                </div>
                <div className="bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {savedSettings.name || "Unity Boys Hostel"}
                </div>
              </div>

              <button
                onClick={handleFormSubmit}
                className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-sm font-black shadow-lg shadow-[#FF6B35]/30 hover:shadow-[#FF6B35]/50 hover:-translate-y-0.5 active:scale-95 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete Self Registration Submit
              </button>
            </div>
          )}

          {/* Actions bars */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            {step > 1 && step <= 6 ? (
              <button
                onClick={prevStep}
                className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs sm:text-sm transition hover:bg-gray-50 cursor-pointer"
              >
                Previous Step
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 6 && (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-lg transition cursor-pointer"
              >
                Next Section
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
