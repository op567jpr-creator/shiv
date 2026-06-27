import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, UserPlus, Receipt, AlertTriangle, 
  LogIn, Hammer, Eye, FileSpreadsheet, Settings, LogOut, 
  Building2, ChevronRight, Menu, Bell, Globe, Sparkles, Zap, Utensils
} from 'lucide-react';
import { Student, Payment, Complaint, Visitor, HostelSettings, UserSession } from '../types';

const logoImg = "/src/assets/images/unity_hostel_logo_1781847359405.jpg";

interface DashboardLayoutProps {
  session: UserSession;
  students: Student[];
  payments: Payment[];
  complaints: Complaint[];
  visitors: Visitor[];
  settings: HostelSettings;
  onLogout: () => void;
  onGoToWebsite: () => void;
  onOpenQuickModal: (modalName: 'student' | 'payment' | 'complaint' | 'visitor') => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  session,
  students,
  payments,
  complaints,
  visitors,
  settings,
  onLogout,
  onGoToWebsite,
  onOpenQuickModal,
  currentTab,
  onChangeTab,
  children
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  // Compile active system notifications dynamically based on active state arrays
  const systemAlerts: Array<{ id: string; type: 'warning' | 'info' | 'error' | 'success'; title: string; text: string; actionTab?: string }> = [];

  const dueStudents = students.filter(s => s.due > 0);
  dueStudents.slice(0, 3).forEach(s => {
    systemAlerts.push({
      id: `due-${s.id}`,
      type: 'warning',
      title: 'Outstanding Fee Alert (बकाया फीस चेतावनी)',
      text: `${s.name} (Room ${s.room || '--'}) owes ${s.due.toLocaleString('en-IN')} INR in monthly accommodation rent.`,
      actionTab: 'due'
    });
  });

  const pendingComplaints = complaints.filter(c => c.status === 'Pending');
  pendingComplaints.slice(0, 3).forEach(c => {
    systemAlerts.push({
      id: `complaint-${c.id}`,
      type: 'error',
      title: 'Pending Maintenance Log (शिकायत दर्ज)',
      text: `Room ${c.room} has an open ${c.type} issue: "${c.description}" awaiting Warden action.`,
      actionTab: 'complaints'
    });
  });

  // Recent Visitors logs list
  const recentVisitors = [...visitors].reverse().slice(0, 2);
  recentVisitors.forEach(v => {
    systemAlerts.push({
      id: `visitor-${v.id}`,
      type: 'info',
      title: 'Guest Logged (दर्ज विजिटर)',
      text: `Guest ${v.name} (Relation: ${v.relation}) checked-in for Room ${v.room} on ${v.date} at ${v.time}.`,
      actionTab: 'visitors'
    });
  });

  if (systemAlerts.length === 0) {
    systemAlerts.push({
      id: 'all-clear',
      type: 'success',
      title: 'System Registry Secure (सभी रिकॉर्ड पूर्ण)',
      text: 'All lodgers, inventories, and fee logs are clean. No unresolved alerts required.'
    });
  }

  const getPendingComplaintsCount = () => complaints.filter(c => c.status === 'Pending').length;
  const getDueCount = () => students.filter(s => s.due > 0).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" />, badge: students.length },
    { id: 'payments', label: 'Payments', icon: <Receipt className="w-4 h-4" /> },
    { id: 'due', label: 'Due Payments', icon: <AlertTriangle className="w-4 h-4" />, badge: getDueCount(), badgeVariant: 'danger' },
    { id: 'electricity', label: 'Electric Bill', icon: <Zap className="w-4 h-4" /> },
    { id: 'rooms', label: 'Rooms Map', icon: <Building2 className="w-4 h-4" /> },
    { id: 'complaints', label: 'Complaints', icon: <Hammer className="w-4 h-4" />, badge: getPendingComplaintsCount(), badgeVariant: 'warning' },
    { id: 'visitors', label: 'Visitors Log', icon: <LogIn className="w-4 h-4" /> },
    { id: 'mess', label: 'Mess Menu 🍽️', icon: <Utensils className="w-4 h-4" /> },
    { id: 'partners', label: 'Partner Accounts 👥', icon: <Users className="w-4 h-4 text-emerald-400" />, isMasterOnly: true },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, isMasterOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.isMasterOnly && session.role !== 'master') return false;
    return true;
  });

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': 
        return { 
          title: session.role === 'master' ? 'Master Admin Dashboard' : 'Staff Dashboard', 
          sub: session.role === 'master' ? 'Full administrative access & financial statistics overview' : 'Real-time hostel overview & statistics' 
        };
      case 'students': return { title: 'Students register', sub: 'Manage, search, & add student files' };
      case 'payments': return { title: 'Payment Collections', sub: 'Log payments & generate printable receipts' };
      case 'due': return { title: 'Due Balances', sub: 'Track outstanding balances & send WhatsApp reminders' };
      case 'electricity': return { title: 'Electricity Meter Readings', sub: 'Record sub-meter indexes, generate tariff statements, & track logs' };
      case 'rooms': return { title: 'Rooms Mapping Grid', sub: 'Floor layout, vacant/occupied room grid mapping' };
      case 'complaints': return { title: 'Repair & Complaints', sub: 'WiFi, plumbing, cleaning ticket solver' };
      case 'visitors': return { title: 'Gate Visitation Log', sub: 'Log daily checkout registers & family entry logs' };
      case 'mess': return { title: 'Mess Menu Management (मैस मेनू)', sub: 'Update weekly meals schedule, lunch/dinner timings & print physical menu cards' };
      case 'partners': return { title: 'Partner Accounts (शिव और सनी का हिसाब)', sub: 'Track withdrawals, personal advanced, & ledger payouts for Shiv & Sunny' };
      case 'reports': return { title: 'Reports & Exporting', sub: 'Export custom collection reports to CSV file' };
      case 'settings': return { title: 'System settings', sub: 'Warden, phone, address, UPI, resetting controls' };
      default: return { title: 'Admin panel', sub: 'Manage systems' };
    }
  };

  const currentInfo = getPageTitle();

  const getSidebarBgClass = () => {
    switch (settings.sidebarTheme) {
      case 'coal':
        return 'bg-[#0E0F10] border-r border-gray-800';
      case 'orange':
        return 'bg-[#2B140B] border-r border-[#FF6B35]/20';
      case 'indigo':
        return 'bg-[#0D0B1C] border-r border-indigo-550/20 border-indigo-500/20';
      case 'emerald':
        return 'bg-[#03140C] border-r border-emerald-550/20 border-emerald-500/20';
      case 'dark':
      default:
        return 'bg-[#1E2022] border-r border-[#D4AF37]/15';
    }
  };

  const getSidebarAccentClass = () => {
    switch (settings.sidebarTheme) {
      case 'coal':
        return 'text-gray-400';
      case 'orange':
        return 'text-orange-400';
      case 'indigo':
        return 'text-indigo-400';
      case 'emerald':
        return 'text-emerald-400';
      case 'dark':
      default:
        return 'text-[#D4AF37]';
    }
  };

  const getSidebarAvatarStyle = () => {
    switch (settings.sidebarTheme) {
      case 'coal':
        return 'from-gray-700 to-gray-800 text-white';
      case 'orange':
        return 'from-orange-500 to-[#FF6B35] text-white';
      case 'indigo':
        return 'from-indigo-600 to-violet-600 text-white';
      case 'emerald':
        return 'from-emerald-600 to-teal-600 text-white';
      case 'dark':
      default:
        return 'from-[#B89742] to-[#D4AF37] text-[#1E2022]';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 ${getSidebarBgClass()} text-white overflow-y-auto flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src={logoImg} 
                alt="Unity Hostel Logo" 
                className="w-10 h-10 rounded-full border border-current object-contain shadow bg-gray-900"
                style={{ color: settings.sidebarTheme === 'dark' ? '#D4AF37' : '#FF6B35' }}
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none text-white">{settings.name || "Unity Hostel"}</h3>
                <span className={`text-[10px] ${getSidebarAccentClass()} font-bold block mt-1 uppercase tracking-wider`}>
                  {session.role === 'master' ? 'Master Admin Panel' : 'Staff Panel'}
                </span>
              </div>
            </div>
          </div>

          {/* User badge */}
          <div className="m-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getSidebarAvatarStyle()} flex items-center justify-center font-black uppercase text-sm shadow-inner`}>
              {session.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight truncate max-w-[130px]">{session.name}</h4>
              <span className={`text-[9px] ${getSidebarAccentClass()} font-bold tracking-widest uppercase block mt-1`}>
                {session.role === 'master' ? 'Master Admin' : 'Staff Member'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {filteredMenuItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF6B35]/15 text-[#FF6B35] border-l-4 border-[#FF6B35]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-500/10 text-rose-500'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions inside Sidebar */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={onGoToWebsite}
            className="w-full py-2.5 px-4 text-left text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold flex items-center gap-3 transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#FF6B35]" />
            Go to public web
          </button>
          <button 
            onClick={() => {
              onLogout();
            }}
            className="w-full py-2.5 px-4 text-left text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold flex items-center gap-3 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout session
          </button>
        </div>
      </aside>

      {/* Main Panel Content container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Topbar navigation panel */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 sm:px-8 py-4 flex items-center justify-between shadow-xs">
          
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 bg-gray-50 border border-gray-100 transition mr-1 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-800 leading-tight tracking-tight flex items-center gap-2">
                {currentInfo.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium block mt-0.5">{currentInfo.sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Record CTA buttons */}
            <button
              onClick={() => onOpenQuickModal('payment')}
              className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 transition cursor-pointer hidden sm:flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Receive payment
            </button>
            <div className="relative">
              <button 
                onClick={() => setNotifyOpen(!notifyOpen)}
                className={`w-10 h-10 border text-gray-500 rounded-xl flex items-center justify-center transition relative cursor-pointer ${notifyOpen ? 'bg-orange-50 border-orange-200 text-[#FF6B35]' : 'bg-gray-55 hover:bg-gray-100 border-gray-100 bg-gray-50'}`}
                title="System Notifications (सिस्टम अधिसूचनाएं)"
                id="bell-notification-btn"
              >
                <Bell className="w-4.5 h-4.5" />
                {systemAlerts.length > 0 && systemAlerts[0].id !== 'all-clear' && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B35] rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Popper Dropdown inside Dashboard Layout Header */}
              {notifyOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setNotifyOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-72 sm:w-85 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-3 text-xs animate-fadeIn overflow-hidden">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-extrabold text-gray-800 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
                        <span className="bg-[#FF6B35]/10 text-[#FF6B35] w-2.5 h-2.5 bg-[#FF6B35] rounded-full inline-block animate-ping"></span>
                        Active Notifications ({systemAlerts[0].id === 'all-clear' ? 0 : systemAlerts.length})
                      </span>
                      <button 
                        onClick={() => setNotifyOpen(false)}
                        className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-650 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {systemAlerts.map(alert => {
                        let colorBorder = 'border-l-[4px] border-l-amber-500';
                        let tagBg = 'bg-amber-50 text-amber-805';
                        if (alert.type === 'error') {
                          colorBorder = 'border-l-[4px] border-l-rose-500';
                          tagBg = 'bg-rose-50 text-rose-800';
                        } else if (alert.type === 'info') {
                          colorBorder = 'border-l-[4px] border-l-sky-500';
                          tagBg = 'bg-sky-50 text-sky-800';
                        } else if (alert.type === 'success') {
                          colorBorder = 'border-l-[4px] border-l-emerald-500';
                          tagBg = 'bg-emerald-50 text-emerald-800';
                        }

                        return (
                          <div 
                            key={alert.id}
                            onClick={() => {
                              if (alert.actionTab) {
                                onChangeTab(alert.actionTab);
                              }
                              setNotifyOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 transition ${colorBorder} ${alert.actionTab ? 'cursor-pointer' : ''}`}
                          >
                            <span className="font-bold text-gray-800 block text-[11px] mb-0.5">{alert.title}</span>
                            <p className="text-gray-500 text-[10px] leading-relaxed font-medium">{alert.text}</p>
                            {alert.actionTab && (
                              <span className="text-[9px] font-bold text-[#FF6B35] block mt-1.5 hover:underline">
                                Action Needed: View and update records →
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Inner dynamic view pages */}
        <main className="p-6 sm:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
