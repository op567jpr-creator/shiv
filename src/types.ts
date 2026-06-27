export type RoomSharing = 'Single' | 'Double' | 'Triple';
export type StudentStatus = 'Active' | 'Notice';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer';
export type ComplaintType = 'WiFi' | 'Electricity' | 'Plumbing' | 'Cleaning' | 'Other';
export type ComplaintPriority = 'Low' | 'Medium' | 'High';
export type ComplaintStatus = 'Pending' | 'Resolved';

export interface Student {
  id: number;
  name: string;
  mobile: string;
  father: string;
  fatherMob: string;
  room: string;
  sharing: RoomSharing;
  fee: number;
  status: StudentStatus;
  address: string;
  paid: number;
  due: number;
  joinDate: string;
  profilePic?: string; // Base64 or image URL
  
  // New Admission fields
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  aadhaar?: string;
  whatsapp?: string;
  email?: string;
  nationality?: string;
  
  // Address Detailed
  houseNo?: string;
  area?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  currentAddress?: string;
  
  // Parental details detailed
  fatherOccupation?: string;
  motherName?: string;
  motherMobile?: string;
  guardianName?: string;
  guardianMobile?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyMobile?: string;
  
  // Education details
  collegeName?: string;
  courseName?: string;
  semesterYear?: string;
  collegeId?: string;
  collegeAddress?: string;
  
  // Hostel location/STAY Details
  floor?: string;
  bedNumber?: string;
  acType?: 'AC' | 'Non AC';
  washroomType?: string;
  agreementStartDate?: string;
  agreementEndDate?: string;
  noticePeriod?: string;
  lockInPeriod?: string;
  
  // Billing Breakdown Details
  feePlan?: string;
  monthsCount?: number;
  discount?: number;
  totalRent?: number;
  securityDeposit?: number;
  electricityCharges?: number;
  otherCharges?: number;
  finalPayableAmount?: number;
  yearlyTotalFee?: number;
  
  // Payment Mode details
  paymentMode?: string;
  transactionId?: string;
  installmentType?: string;

  // Physical Documents (कागजी दस्तावेज संकलन)
  policeVerification?: string; // Base64 or 'Yes' / 'Pending'
  hostelForm?: string;
  agreementDoc?: string;
  studentAadhaarDoc?: string;
  fatherAadhaarDoc?: string;

  // Admission Amenities/Inventory check elements (सामान वितरण रिकॉर्ड)
  itemThali?: boolean;
  itemNasteKiPalet?: boolean;
  itemChayeKaGilas?: boolean;
  itemBdaGilas?: boolean;
  itemChamch?: boolean;
  itemBedsheet?: boolean;

  // Electricity meter reading management (बिजली बिल एवं मीटर रीडिंग संकलन)
  elecLastReading?: number;
  elecLastReadingDate?: string;
  elecRatePerUnit?: number;
  elecHistoryJson?: string; // JSON holding prior bill instances

  // Student Portal controls
  portalPassword?: string;
  portalBlocked?: boolean;
  blockPasswordChange?: boolean;
}

export interface Payment {
  id: number;
  receipt: string;
  studentId: number;
  studentName: string;
  room: string;
  amount: number;
  mode: PaymentMode;
  month: string; // e.g. "2026-06"
  date: string;  // e.g. "19/06/2026"
  note: string;
  paymentType?: 'Monthly' | 'Installment';
  installmentNo?: string;
  fatherName?: string;
}

export interface Complaint {
  id: number;
  ticket: string;
  studentId: number;
  studentName: string;
  room: string;
  type: ComplaintType;
  priority: ComplaintPriority;
  description: string;
  status: ComplaintStatus;
  date: string;
}

export interface Visitor {
  id: number;
  name: string;
  contact: string;
  studentId: number;
  studentName: string;
  room: string;
  purpose: string;
  relation: string;
  date: string;
  time: string;
}

export interface HostelSettings {
  name: string;
  phone: string;
  address: string;
  wa: string;
  email: string;
  upi: string;
  lateFee: number;
  totalBeds?: number;
  singleRent?: number;
  doubleRent?: number;
  tripleRent?: number;
  standardElecRate?: number;
  upiPayeeName?: string;
  upiQrUrl?: string;

  // Added Custom Settings parameters:
  doubleRoomsCount?: number;
  tripleRoomsCount?: number;
  totalRoomsCount?: number;
  sidebarTheme?: 'dark' | 'coal' | 'orange' | 'indigo' | 'emerald';
  registrationFormTemplate?: 'comprehensive' | 'simplified' | 'hindi';
  quickActionFeature?: 'inventory' | 'visitors' | 'complaints' | 'electricity';
  messMenu?: MessMenu;
  isStudentPortalLive?: boolean;
  blockStudentPasswordChange?: boolean;
  
  // Ad Banner / Photo option
  adBannerUrl?: string;
  adBannerUrls?: string[];
  adBannerPdfUrl?: string;
  adBannerPdfName?: string;
  adBannerText?: string;
  showAdBanner?: boolean;
}

export interface PartnerWithdrawal {
  id: number;
  partner: 'Shiv' | 'Sunny';
  amount: number;
  date: string; // e.g. "2026-06-24"
  purpose: string; // e.g. "Personal" or "Hostel Groceries"
  recordedBy: string; // e.g. "Master Admin" or "Staff"
  isEdited?: boolean;
  history?: {
    date: string;
    amount: number;
    purpose: string;
    editedAt: string;
  }[];
}

export type ExpenseCategory = 'Rent' | 'Electricity' | 'Salary' | 'Kirana' | 'Other';

export interface HostelExpense {
  id: number;
  category: ExpenseCategory;
  amount: number;
  date: string; // e.g. "2026-06-24"
  purpose: string;
  recordedBy: string;
  isEdited?: boolean;
  history?: {
    date: string;
    amount: number;
    purpose: string;
    editedAt: string;
  }[];
}

export interface MessMenuItem {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MessMenu {
  timings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  compulsory: {
    lunch: string;
    dinner: string;
  };
  days: {
    Monday: MessMenuItem;
    Tuesday: MessMenuItem;
    Wednesday: MessMenuItem;
    Thursday: MessMenuItem;
    Friday: MessMenuItem;
    Saturday: MessMenuItem;
    Sunday: MessMenuItem;
  };
  sundaySpecialNote: string;
}

export interface UserSession {
  role: 'master' | 'staff';
  name: string;
  user: string;
}
