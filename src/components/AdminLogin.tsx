import React, { useState } from 'react';
import { Crown, User, Lock, LogIn, ArrowLeft, Shield, Sparkles, KeySquare, HelpCircle, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface AdminLoginProps {
  onClose: () => void;
  onLoginSuccess: (session: { role: 'master' | 'staff'; name: string; user: string }) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function AdminLogin({ onClose, onLoginSuccess, onShowToast }: AdminLoginProps) {
  const [role, setRole] = useState<'master' | 'staff'>('master');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password flow states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotRole, setForgotRole] = useState<'master' | 'staff'>('master');
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter username, 2 = enter OTP, 3 = choose password
  const [otpSent, setOtpSent] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [generatedOtpHint, setGeneratedOtpHint] = useState<string | null>(null);

  const getStoredCreds = () => {
    const masterU = localStorage.getItem('ubh_creds_master_u') || 'admin';
    const masterP = localStorage.getItem('ubh_creds_master_p') || 'admin123';
    const staffU = localStorage.getItem('ubh_creds_staff_u') || 'staff';
    const staffP = localStorage.getItem('ubh_creds_staff_p') || 'staff123';
    
    return {
      master: { u: masterU, p: masterP, name: 'Master Admin (Full Control)' },
      staff: { u: staffU, p: staffP, name: 'Warden' }
    };
  };

  const handleRoleSelect = (selectedRole: 'master' | 'staff') => {
    setRole(selectedRole);
  };

  const handlePrefill = (user: string, pass: string, targetRole: 'master' | 'staff') => {
    setRole(targetRole);
    setUsername(user);
    setPassword(pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = getStoredCreds();
    const targetCreds = creds[role];
    
    if (username === targetCreds.u && password === targetCreds.p) {
      onShowToast(`Login successful! Welcome to ${targetCreds.name} dashboard 👋`);
      onLoginSuccess({
        role: role,
        name: targetCreds.name,
        user: username
      });
    } else {
      onShowToast('Invalid username or password! Please check credentials. ❌', true);
    }
  };

  // OTP send handler
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = getStoredCreds();
    const targetCreds = creds[forgotRole];

    if (forgotUsername.trim() !== targetCreds.u) {
      onShowToast(`No active account found with username: "${forgotUsername}" for this role! ⚠️`, true);
      return;
    }

    const code = localStorage.getItem('ubh_creds_recovery_key') || 'A040619932024Z';
    setOtpSent(code);
    setGeneratedOtpHint(code);
    setForgotStep(2);
    onShowToast(`Please enter the master verification key to reset password! 🚀`);
  };

  // OTP verify handler
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const masterCode = localStorage.getItem('ubh_creds_recovery_key') || 'A040619932024Z';
    if (otpInput === masterCode) {
      setForgotStep(3);
      onShowToast('Verification successful! Set your new panel password now. 🔑');
    } else {
      onShowToast('Invalid verification key! Please check key or retry. ❌', true);
    }
  };

  // Password reset submit handler
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 5) {
      onShowToast('Password must contain at least 5 character symbols! ⚠️', true);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      onShowToast('Passwords do not match! Please verify match. ⚠️', true);
      return;
    }

    // Save to localStorage
    const passKey = forgotRole === 'master' ? 'ubh_creds_master_p' : 'ubh_creds_staff_p';
    localStorage.setItem(passKey, newPassword);

    onShowToast('Password updated successfully! Welcome to login with new secret! 🌟');
    
    // Reset forgot state & back to login
    setIsForgotMode(false);
    setForgotStep(1);
    setForgotUsername('');
    setOtpInput('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setGeneratedOtpHint(null);
    setUsername(targetCredsForRoleUser(forgotRole));
    setPassword(newPassword);
  };

  const targetCredsForRoleUser = (r: 'master' | 'staff') => {
    const creds = getStoredCreds();
    return creds[r].u;
  };

  // Get currently saved credentials for display in demographic tags
  const currentCreds = getStoredCreds();

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A2E] lg:bg-gray-100 flex items-center justify-center font-sans">
      {/* Back to website button */}
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 px-4 py-2 text-xs sm:text-sm font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/20 flex items-center gap-2 cursor-pointer transition"
      >
        <ArrowLeft className="w-4 h-4 text-[#FF6B35]" />
        Back to Website
      </button>

      <div className="w-full h-full lg:h-auto lg:max-w-5xl lg:rounded-3xl lg:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white">
        
        {/* Left Hand: Hero Pitch (Dark Theme Info Column) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#1A1A2E] to-[#0F3460] p-12 flex-col justify-between text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-4 relative">
            <span className="px-3 py-1 bg-[#FF6B35]/20 border border-[#FF6B35]/30 rounded-full text-xs font-bold text-[#FF6B35] tracking-wider uppercase inline-block">
              Staff Portal
            </span>
            <h3 className="text-2xl font-black leading-tight tracking-tight">Unity Boys Hostel Sanganer</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Secure authentication gateway to view financial ledger lists, lodger directories, electric sub-meters, and repair logs safely.
            </p>
          </div>

          <div className="space-y-3 pt-8 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
              <span className="text-gray-300">Centralized storage database</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
              <span className="text-gray-300">Printable payment voucher slips</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
              <span className="text-gray-300">Staff and Master dual authentication</span>
            </div>
          </div>
        </div>

        {/* Right Hand: Interactive Login Panel */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            
            {/* Form Title banner */}
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#FF6B35]" />
                {isForgotMode ? "Reset Login Credentials" : "Administrative Gateway"}
              </h4>
              <p className="text-xs text-gray-400 mt-1 font-semibold">
                {isForgotMode 
                  ? "Follow safety guidelines to reset lost panel credentials." 
                  : "Pick your privilege role tier to enter hostel registers."}
              </p>
            </div>

            {/* IF FORGOT PASSWORD MODE SCREEN */}
            {isForgotMode ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Flow steps indicator */}
                <div className="grid grid-cols-3 gap-2 pb-2">
                  <div className={`h-1.5 rounded-full ${forgotStep >= 1 ? 'bg-orange-500' : 'bg-gray-150'}`}></div>
                  <div className={`h-1.5 rounded-full ${forgotStep >= 2 ? 'bg-orange-500' : 'bg-gray-150'}`}></div>
                  <div className={`h-1.5 rounded-full ${forgotStep >= 3 ? 'bg-orange-500' : 'bg-gray-150'}`}></div>
                </div>

                {/* STEP 1: SELECT ROLE AND ENTER USERNAME */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setForgotRole('master')}
                        className={`py-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          forgotRole === 'master'
                            ? 'bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-900 bg-transparent'
                        }`}
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        Master Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setForgotRole('staff')}
                        className={`py-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          forgotRole === 'staff'
                            ? 'bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-900 bg-transparent'
                        }`}
                      >
                        <User className="w-4 h-4 text-orange-500" />
                        Staff
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Registered Account Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                          type="text"
                          value={forgotUsername}
                          onChange={e => setForgotUsername(e.target.value)}
                          placeholder="e.g. admin or staff"
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition bg-white"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#f45417] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition"
                    >
                      <span>Proceed to Key Verification (मास्टर कीय सत्यापित करें)</span>
                    </button>
                  </form>
                )}

                {/* STEP 2: VERIFY CODE RECEIVED */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-xs space-y-1">
                      <span className="font-extrabold text-orange-850 flex items-center gap-1.5">
                        <KeySquare className="w-4 h-4 text-[#FF6B35]" />
                        Master Reset Verification (मास्टर रीसेट सत्यापित करें)
                      </span>
                      <p className="text-orange-700 leading-relaxed mt-1">
                        कृपया पासवर्ड रीसेट करने के लिए अपनी सीक्रेट <b>Recovery Verification Key / OTP Reset Code</b> दर्ज करें।
                      </p>
                      <p className="text-[10px] text-orange-800/85 bg-white/70 p-2.5 border border-orange-150 rounded-lg leading-relaxed">
                        ℹ️ सुरक्षा कारणों से, आपकी रिकवरी कीय अब स्क्रीन पर प्रदर्शित नहीं होगी। यह वही कीय है जो आपने सेटिंग्स पैनल में कॉन्फ़िगर की थी।
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Master Reset Key / OTP Code</label>
                      <input
                        type="password"
                        maxLength={50}
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value)}
                        placeholder="••••••••••••••"
                        className="w-full text-center tracking-widest font-mono font-bold text-sm px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#FF6B35] outline-none transition uppercase bg-white text-gray-950"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#f45417] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                    >
                      <span>Verify Code & Continue</span>
                    </button>
                  </form>
                )}

                {/* STEP 3: SET NEW PASSWORD */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800">
                      <p className="font-extrabold flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Identity verification approved.</p>
                      <span className="block text-[10px] text-gray-400 mt-1">Please enter a new dashboard password below. Make it secure.</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase font-semibold">New panel Password</label>
                      <input
                        type="password"
                        placeholder="At least 5 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#FF6B35] outline-none text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase font-semibold">Verify new Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={newPasswordConfirm}
                        onChange={e => setNewPasswordConfirm(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#FF6B35] outline-none text-xs font-semibold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg transition"
                    >
                      <Key className="w-4 h-4" />
                      <span>Confirm New Password & Exit</span>
                    </button>
                  </form>
                )}

                {/* Back to standard login trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setForgotStep(1);
                    setGeneratedOtpHint(null);
                  }}
                  className="w-full text-center text-xs font-black text-gray-400 hover:text-[#FF6B35] border border-gray-100 py-2 rounded-xl transition cursor-pointer"
                >
                  ← Back to standard credential login
                </button>
              </div>
            ) : (
              /* STANDARD LOGIN MODE SCREEN */
              <div className="space-y-5">
                {/* Privilege Role selectors */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('master')}
                    className={`py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      role === 'master'
                        ? 'bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 bg-transparent'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-500" />
                    Master Admin Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('staff')}
                    className={`py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      role === 'staff'
                        ? 'bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 bg-transparent'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#FF6B35]" />
                    Staff Login (स्टाफ लॉगिन)
                  </button>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition bg-white"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition bg-white"
                      required
                    />
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setForgotStep(1);
                        setForgotRole(role);
                        setForgotUsername(username || targetCredsForRoleUser(role));
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-[#FF6B35] hover:underline cursor-pointer transition"
                    >
                      Forgot Password? Reset via OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4.5 h-4.5" />
                    Authorize Panel
                  </button>
                </form>

                {/* Credentials reminder removed for security on hosted build */}
                <div className="mt-8 pt-6 border-t border-dashed border-gray-200 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">
                    🔒 Secure Session. Unauthorized access attempts are monitored and recorded.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
