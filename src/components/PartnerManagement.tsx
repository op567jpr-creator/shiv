import React, { useState } from 'react';
import { 
  Users, TrendingDown, DollarSign, PlusCircle, Trash2, 
  Search, Filter, Calendar, FileText, CheckCircle, ArrowRightLeft, Sparkles, AlertCircle,
  Edit, History, Building, Flame, ShieldAlert, ShoppingBag, PieChart, Coins
} from 'lucide-react';
import { PartnerWithdrawal, Payment, HostelExpense, ExpenseCategory } from '../types';

interface PartnerManagementProps {
  partnerWithdrawals: PartnerWithdrawal[];
  payments: Payment[];
  onAddWithdrawal: (partner: 'Shiv' | 'Sunny', amount: number, date: string, purpose: string) => void;
  onDeleteWithdrawal: (id: number) => void;
  onEditWithdrawal: (id: number, fields: { partner: 'Shiv' | 'Sunny'; amount: number; date: string; purpose: string }) => void;
  expenses: HostelExpense[];
  onAddExpense: (category: ExpenseCategory, amount: number, date: string, purpose: string) => void;
  onDeleteExpense: (id: number) => void;
  onEditExpense: (id: number, fields: { category: ExpenseCategory; amount: number; date: string; purpose: string }) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function PartnerManagement({
  partnerWithdrawals,
  payments,
  onAddWithdrawal,
  onDeleteWithdrawal,
  onEditWithdrawal,
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  onEditExpense,
  onShowToast
}: PartnerManagementProps) {
  // Navigation tabs inside Partner screen
  const [activeSubTab, setActiveSubTab] = useState<'withdrawals' | 'expenses'>('expenses');

  // Withdrawal form state
  const [partner, setPartner] = useState<'Shiv' | 'Sunny'>('Shiv');
  const [wAmount, setWAmount] = useState<string>('');
  const [wDate, setWDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [wPurpose, setWPurpose] = useState<string>('');
  const [editingWItem, setEditingWItem] = useState<PartnerWithdrawal | null>(null);

  // Expense form state
  const [category, setCategory] = useState<ExpenseCategory>('Rent');
  const [eAmount, setEAmount] = useState<string>('');
  const [eDate, setEDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ePurpose, setEPurpose] = useState<string>('');
  const [editingEItem, setEditingEItem] = useState<HostelExpense | null>(null);

  // Search & Filter state
  const [withdrawalSearch, setWithdrawalSearch] = useState<string>('');
  const [partnerFilter, setPartnerFilter] = useState<'All' | 'Shiv' | 'Sunny'>('All');

  const [expenseSearch, setExpenseSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ExpenseCategory>('All');

  // Calculations
  const totalHostelCollections = payments.reduce((sum, p) => sum + p.amount, 0);
  
  const shivWithdrawals = partnerWithdrawals
    .filter(w => w.partner === 'Shiv')
    .reduce((sum, w) => sum + w.amount, 0);

  const sunnyWithdrawals = partnerWithdrawals
    .filter(w => w.partner === 'Sunny')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalWithdrawals = shivWithdrawals + sunnyWithdrawals;

  // Expenses categories calculations
  const rentExpenses = expenses.filter(e => e.category === 'Rent').reduce((sum, e) => sum + e.amount, 0);
  const electricityExpenses = expenses.filter(e => e.category === 'Electricity').reduce((sum, e) => sum + e.amount, 0);
  const salaryExpenses = expenses.filter(e => e.category === 'Salary').reduce((sum, e) => sum + e.amount, 0);
  const kiranaExpenses = expenses.filter(e => e.category === 'Kirana').reduce((sum, e) => sum + e.amount, 0);
  const otherExpenses = expenses.filter(e => e.category === 'Other').reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Cash left calculation
  const remainingHostelBalance = totalHostelCollections - totalWithdrawals - totalExpenses;

  // Comparative percentages
  const shivPercentage = totalWithdrawals > 0 ? (shivWithdrawals / totalWithdrawals) * 100 : 50;
  const sunnyPercentage = totalWithdrawals > 0 ? (sunnyWithdrawals / totalWithdrawals) * 100 : 50;

  // Handlers for Partner Withdrawals
  const handleStartWEdit = (item: PartnerWithdrawal) => {
    setEditingWItem(item);
    setPartner(item.partner);
    setWAmount(item.amount.toString());
    setWDate(item.date);
    setWPurpose(item.purpose);
    onShowToast(`Editing ₹${item.amount.toLocaleString('en-IN')} withdrawal for ${item.partner} ✏️`);
  };

  const handleCancelWEdit = () => {
    setEditingWItem(null);
    setPartner('Shiv');
    setWAmount('');
    setWDate(new Date().toISOString().split('T')[0]);
    setWPurpose('');
  };

  const handleWSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(wAmount);
    if (!wAmount || isNaN(numAmount) || numAmount <= 0) {
      onShowToast('कृपया वैध राशि दर्ज करें! ⚠️', true);
      return;
    }
    if (!wPurpose.trim()) {
      onShowToast('कृपया आहरण का कारण दर्ज करें! ⚠️', true);
      return;
    }

    if (editingWItem) {
      onEditWithdrawal(editingWItem.id, {
        partner,
        amount: numAmount,
        date: wDate,
        purpose: wPurpose.trim()
      });
      setEditingWItem(null);
      onShowToast(`₹${numAmount.toLocaleString('en-IN')} की आहरण प्रविष्टि सफलतापूर्वक संशोधित की गई! ✏️`);
    } else {
      onAddWithdrawal(partner, numAmount, wDate, wPurpose.trim());
      onShowToast(`₹${numAmount.toLocaleString('en-IN')} का हिसाब ${partner} के नाम सफलतापूर्वक दर्ज किया गया! ✅`);
    }
    setWAmount('');
    setWPurpose('');
    setWDate(new Date().toISOString().split('T')[0]);
  };

  // Handlers for Hostel Expenses
  const handleStartEEdit = (item: HostelExpense) => {
    setEditingEItem(item);
    setCategory(item.category);
    setEAmount(item.amount.toString());
    setEDate(item.date);
    setEPurpose(item.purpose);
    onShowToast(`Editing ₹${item.amount.toLocaleString('en-IN')} ${item.category} expense entry ✏️`);
  };

  const handleCancelEEdit = () => {
    setEditingEItem(null);
    setCategory('Rent');
    setEAmount('');
    setEDate(new Date().toISOString().split('T')[0]);
    setEPurpose('');
  };

  const handleESubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(eAmount);
    if (!eAmount || isNaN(numAmount) || numAmount <= 0) {
      onShowToast('कृपया खर्च की सही राशि दर्ज करें! ⚠️', true);
      return;
    }
    if (!ePurpose.trim()) {
      onShowToast('कृपया खर्च का विवरण या कारण दर्ज करें! ⚠️', true);
      return;
    }

    if (editingEItem) {
      onEditExpense(editingEItem.id, {
        category,
        amount: numAmount,
        date: eDate,
        purpose: ePurpose.trim()
      });
      setEditingEItem(null);
      onShowToast(`खर्च प्रविष्टि ₹${numAmount.toLocaleString('en-IN')} सफलतापूर्वक अपडेट की गई! ✏️`);
    } else {
      onAddExpense(category, numAmount, eDate, ePurpose.trim());
      onShowToast(`नया हॉस्टल खर्च ₹${numAmount.toLocaleString('en-IN')} (${category}) सफलतापूर्वक दर्ज किया गया! ✅`);
    }
    setEAmount('');
    setEPurpose('');
    setEDate(new Date().toISOString().split('T')[0]);
  };

  // Filtered withdrawals list
  const filteredWithdrawals = partnerWithdrawals.filter(w => {
    const matchesSearch = w.purpose.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                          w.amount.toString().includes(withdrawalSearch) ||
                          w.date.includes(withdrawalSearch);
    const matchesPartner = partnerFilter === 'All' || w.partner === partnerFilter;
    return matchesSearch && matchesPartner;
  }).reverse();

  // Filtered expenses list
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.purpose.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          e.amount.toString().includes(expenseSearch) ||
                          e.date.includes(expenseSearch);
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).reverse();

  // Get localized Category label
  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Rent': return '🏠 Kiraya / किराया';
      case 'Electricity': return '⚡ Bijli Bill / बिजली बिल';
      case 'Salary': return '💼 Salary / स्टाफ वेतन';
      case 'Kirana': return '🛒 Kirana / किराना सामान';
      case 'Other': return '📦 Other / अन्य खर्चे';
    }
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Rent': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Electricity': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Salary': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Kirana': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Other': return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 📊 High-fidelity Business Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        
        {/* Total Collections Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block mb-1">
            Total Fees Collected (कुल फीस संग्रह)
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ₹{totalHostelCollections.toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Sum of all student fee receipts
          </p>
        </div>

        {/* Total Monthly Expenses Card */}
        <div className="bg-rose-950 text-white rounded-3xl p-5 border border-rose-900/40 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 block mb-1">
            Total Hostel Expenses (कुल खर्चे)
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-rose-200 mt-2 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            Rent, Bill, Salary, Kirana, Other
          </p>
        </div>

        {/* Total Withdrawals Card */}
        <div className="bg-amber-950 text-white rounded-3xl p-5 border border-amber-900/30 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block mb-1">
            Partner Payouts (कुल आहरण)
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ₹{totalWithdrawals.toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-amber-200 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Shiv (₹{shivWithdrawals.toLocaleString('en-IN')}) + Sunny (₹{sunnyWithdrawals.toLocaleString('en-IN')})
          </p>
        </div>

        {/* Net Remaining Cash Card */}
        <div className={`rounded-3xl p-5 border relative overflow-hidden shadow-lg ${
          remainingHostelBalance >= 0 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-100'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block mb-1">
            Net Cash Left (नेट बचा हुआ कैश)
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            ₹{remainingHostelBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] mt-2 flex items-center gap-1 font-bold">
            {remainingHostelBalance >= 0 ? '🟢 Safe Surplus cash counter' : '🔴 Balance is currently negative'}
          </p>
        </div>

      </div>

      {/* 🔄 Sub Tabs Selector */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 rounded-2xl gap-2 max-w-md">
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'expenses'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          हॉस्टल मासिक खर्चे (Expenses)
        </button>
        <button
          onClick={() => setActiveSubTab('withdrawals')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'withdrawals'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          पार्टनर आहरण (Withdrawals)
        </button>
      </div>

      {/* Visual Breakdowns Section */}
      {activeSubTab === 'expenses' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-rose-500" /> Expense Allocation Breakdown (खर्चों का वर्गीकरण)
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">Allocated across 5 master categories</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {/* Rent Block */}
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-[9px] uppercase font-black text-purple-600 block">🏠 Rent (किराया)</span>
              <h5 className="text-sm font-black text-slate-800 font-mono mt-1">₹{rentExpenses.toLocaleString('en-IN')}</h5>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${totalExpenses > 0 ? (rentExpenses / totalExpenses) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Electricity Block */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[9px] uppercase font-black text-amber-600 block">⚡ Electricity (बिजली)</span>
              <h5 className="text-sm font-black text-slate-800 font-mono mt-1">₹{electricityExpenses.toLocaleString('en-IN')}</h5>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalExpenses > 0 ? (electricityExpenses / totalExpenses) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Salary Block */}
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[9px] uppercase font-black text-blue-600 block">💼 Salary (वेतन)</span>
              <h5 className="text-sm font-black text-slate-800 font-mono mt-1">₹{salaryExpenses.toLocaleString('en-IN')}</h5>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${totalExpenses > 0 ? (salaryExpenses / totalExpenses) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Kirana Block */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[9px] uppercase font-black text-emerald-600 block">🛒 Kirana (किराना)</span>
              <h5 className="text-sm font-black text-slate-800 font-mono mt-1">₹{kiranaExpenses.toLocaleString('en-IN')}</h5>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${totalExpenses > 0 ? (kiranaExpenses / totalExpenses) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Other Block */}
            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-rose-50 border border-rose-100">
              <span className="text-[9px] uppercase font-black text-rose-600 block">📦 Other (अन्य खर्चे)</span>
              <h5 className="text-sm font-black text-slate-800 font-mono mt-1">₹{otherExpenses.toLocaleString('en-IN')}</h5>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-rose-600" style={{ width: `${totalExpenses > 0 ? (otherExpenses / totalExpenses) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Partnership Account Share Ratio (आहरण शेयर अनुपात)
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">Comparative ratio of taken money</span>
          </div>
          
          <div className="relative w-full h-8 bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner border border-slate-200">
            {totalWithdrawals === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                No withdrawals logged yet. Ratio is balanced 50/50.
              </div>
            ) : (
              <>
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 flex items-center pl-4 font-black text-[11px] text-white"
                  style={{ width: `${shivPercentage}%` }}
                >
                  {shivPercentage >= 15 && `Shiv: ${shivPercentage.toFixed(0)}%`}
                </div>
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300 flex items-center justify-end pr-4 font-black text-[11px] text-white"
                  style={{ width: `${sunnyPercentage}%` }}
                >
                  {sunnyPercentage >= 15 && `Sunny: ${sunnyPercentage.toFixed(0)}%`}
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-between mt-2.5 text-[10px] font-black uppercase text-slate-500 px-1">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Shiv (₹{shivWithdrawals.toLocaleString('en-IN')})</span>
            <span className="flex items-center gap-1">Sunny (₹{sunnyWithdrawals.toLocaleString('en-IN')}) <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span></span>
          </div>
        </div>
      )}

      {/* Tab Contents Panels */}
      {activeSubTab === 'expenses' ? (
        /* --- EXPENSES TAB INTERFACE --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* New / Edit Expense Form */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                {editingEItem ? <Edit className="w-4 h-4 text-blue-500 animate-pulse" /> : <PlusCircle className="w-4 h-4 text-rose-600" />}
                {editingEItem ? 'Edit Expense (खर्च संशोधित करें)' : 'Log Hostel Expense (खर्च दर्ज करें)'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Log monthly rent, staff salary, groceries bills, power bills or minor hostel items.
              </p>
            </div>

            <form onSubmit={handleESubmit} className="space-y-4 font-sans">
              
              {/* Category selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Expense Category (खर्च का प्रकार)
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-rose-500 rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                >
                  <option value="Rent">🏠 Monthly Rent (किराया)</option>
                  <option value="Electricity">⚡ Electricity Bill (बिजली बिल)</option>
                  <option value="Salary">💼 Staff Salary (कर्मचारी वेतन)</option>
                  <option value="Kirana">🛒 Grocery / Kirana (किराना सामान)</option>
                  <option value="Other">📦 Other Miscellaneous (अन्य खर्च)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Expense Amount (खर्च की राशि - ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={eAmount}
                    onChange={e => setEAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2 border border-slate-200 focus:border-rose-500 rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Date of Expense (दिनांक)
                </label>
                <input
                  type="date"
                  value={eDate}
                  onChange={e => setEDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 focus:border-rose-500 rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                />
              </div>

              {/* Purpose */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Expense Details / Description (विवरण)
                </label>
                <textarea
                  value={ePurpose}
                  onChange={e => setEPurpose(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 focus:border-rose-500 rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                  placeholder="e.g. Paid June Rent to building owner, grocery bill invoice, warden salary, etc."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {editingEItem && (
                  <button
                    type="button"
                    onClick={handleCancelEEdit}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer text-center font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`py-3 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    editingEItem 
                      ? 'flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:shadow-indigo-500/20' 
                      : 'w-full bg-gradient-to-r from-rose-600 to-orange-500 hover:shadow-rose-500/20'
                  }`}
                >
                  {editingEItem ? <Edit className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {editingEItem ? 'Update Expense' : 'Save Expense Entry'}
                </button>
              </div>

            </form>
          </div>

          {/* Expenses Table list */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  📜 Hostel Expenses Ledger (खर्च बहीखाता)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  View and manage all hostel operating expenses. Filter by category.
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {/* Category select filter */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-extrabold text-slate-600 bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Rent">🏠 Rent only</option>
                  <option value="Electricity">⚡ Electricity only</option>
                  <option value="Salary">💼 Salary only</option>
                  <option value="Kirana">🛒 Kirana only</option>
                  <option value="Other">📦 Other only</option>
                </select>

                {/* Search query */}
                <div className="relative flex-1 sm:w-40">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search details..."
                    value={expenseSearch}
                    onChange={e => setExpenseSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 focus:border-rose-500 rounded-xl text-[11px] font-semibold bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* List */}
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                <p className="text-xs font-black uppercase tracking-wider">No Expenses Recorded</p>
                <p className="text-[10px] text-gray-400">Please record an expense using the form to populate the ledger book.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-widest font-black text-[9px]">
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description / Details</th>
                      <th className="py-3 px-4">Logged By</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {filteredExpenses.map(item => {
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                              {getCategoryLabel(item.category).split('/')[0]}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {item.date.split('-').reverse().join('/')}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-sans max-w-[220px]" title={item.purpose}>
                            <div className="font-semibold text-slate-800">{item.purpose}</div>
                            {item.isEdited && item.history && item.history.length > 0 && (
                              <div className="mt-1.5 space-y-1 bg-amber-50 border border-amber-100 rounded-xl p-2 text-[9px] text-amber-800 font-medium leading-normal shadow-sm">
                                <span className="font-black uppercase tracking-wider block text-[8px] text-amber-700 flex items-center gap-1">
                                  <History className="w-2.5 h-2.5 text-amber-600" /> Correction History (इतिहास):
                                </span>
                                {item.history.map((hist, hIdx) => (
                                  <div key={hIdx} className="border-t border-amber-100/40 pt-1 mt-1">
                                    ₹{hist.amount.toLocaleString('en-IN')} on {hist.date.split('-').reverse().join('/')} ({hist.purpose})
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[10px]">
                            {item.recordedBy}
                          </td>
                          <td className="py-3 px-4 text-center flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit expense entry"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this expense of ₹${item.amount.toLocaleString('en-IN')}?`)) {
                                  onDeleteExpense(item.id);
                                  onShowToast(`Deleted ${item.category} expense record! 🗑️`);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cash book guide */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-2 text-rose-800">
              <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 flex-shrink-0" />
              <div className="text-[10px] leading-relaxed">
                <span className="font-extrabold block">💡 Monthly Expenses Audit (मासिक खर्च नियंत्रण):</span>
                Recording monthly rent, electricity billing meter charges, staff support payroll, grocery kirana, and general expenses directly calculates and updates the <strong>Net Remaining Cash</strong> in real-time. This helps Shiv and Sunny always inspect how much real cash is remaining in the drawer.
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* --- WITHDRAWALS TAB INTERFACE --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form to Log/Edit Withdrawal */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                {editingWItem ? <Edit className="w-4 h-4 text-blue-500 animate-pulse" /> : <PlusCircle className="w-4 h-4 text-amber-600" />}
                {editingWItem ? 'Edit Payout Entry (विवरण बदलें)' : 'Log Payout Entry (नया आहरण दर्ज करें)'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {editingWItem ? 'Modify the selected payout entry.' : 'Add how much money Shiv or Sunny took from the cash counter.'}
              </p>
            </div>

            <form onSubmit={handleWSubmit} className="space-y-4 font-sans">
              {/* Select Partner */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Select Partner (पार्टनर का नाम चुनें)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPartner('Shiv')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition ${
                      partner === 'Shiv' 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    👤 SHIV
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartner('Sunny')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition ${
                      partner === 'Sunny' 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    👤 SUNNY
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Amount Taken (निकाली गई राशि - ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={wAmount}
                    onChange={e => setWAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2 border border-slate-200 focus:border-[#FF6B35] rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Date (दिनांक)
                </label>
                <input
                  type="date"
                  value={wDate}
                  onChange={e => setWDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 focus:border-[#FF6B35] rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                />
              </div>

              {/* Purpose / Remark */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Purpose / Remark (कारण / विवरण)
                </label>
                <textarea
                  value={wPurpose}
                  onChange={e => setWPurpose(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 focus:border-[#FF6B35] rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                  placeholder="e.g. Personal withdraw or minor helper advance"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex gap-2">
                {editingWItem && (
                  <button
                    type="button"
                    onClick={handleCancelWEdit}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer text-center font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`py-3 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    editingWItem 
                      ? 'flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:shadow-indigo-500/20' 
                      : 'w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-teal-500/20'
                  }`}
                >
                  {editingWItem ? <Edit className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {editingWItem ? 'Update Entry' : 'Save Ledger Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* Ledger Transactions Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  📜 Payouts Ledger Book (आहरण बहीखाता)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Browse through registered withdrawals. Filters operate in real-time.
                </p>
              </div>
              
              {/* Real-time search & filters */}
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Partner Select Filter */}
                <select
                  value={partnerFilter}
                  onChange={e => setPartnerFilter(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-extrabold text-slate-600 bg-white cursor-pointer"
                >
                  <option value="All">All Partners</option>
                  <option value="Shiv">Shiv only</option>
                  <option value="Sunny">Sunny only</option>
                </select>

                {/* Search input */}
                <div className="relative flex-1 sm:w-44">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reason..."
                    value={withdrawalSearch}
                    onChange={e => setWithdrawalSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 focus:border-[#FF6B35] rounded-xl text-[11px] font-semibold bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Table list */}
            {filteredWithdrawals.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-black uppercase tracking-wider">No Transactions Found</p>
                <p className="text-[10px] text-gray-400">Try modifying your filter options or add a new entry.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-widest font-black text-[9px]">
                      <th className="py-3 px-4">Partner</th>
                      <th className="py-3 px-4">Amount Taken</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Reason / Purpose</th>
                      <th className="py-3 px-4">Logged By</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {filteredWithdrawals.map(item => {
                      const isShiv = item.partner === 'Shiv';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                              isShiv 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              👤 {item.partner}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-extrabold text-slate-800">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {item.date.split('-').reverse().join('/')}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-sans max-w-[200px]" title={item.purpose}>
                            <div className="font-semibold">{item.purpose}</div>
                            {item.isEdited && item.history && item.history.length > 0 && (
                              <div className="mt-1.5 space-y-1 bg-amber-50 border border-amber-100 rounded-xl p-2 text-[9px] text-amber-800 font-medium leading-normal shadow-sm">
                                <span className="font-black uppercase tracking-wider block text-[8px] text-amber-700 flex items-center gap-1">
                                  <History className="w-2.5 h-2.5 text-amber-600" /> Old Record / History (इतिहास):
                                </span>
                                {item.history.map((hist, hIdx) => (
                                  <div key={hIdx} className="border-t border-amber-100/40 pt-1 mt-1">
                                    ₹{hist.amount.toLocaleString('en-IN')} on {hist.date.split('-').reverse().join('/')} ({hist.purpose})
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[10px]">
                            {item.recordedBy}
                          </td>
                          <td className="py-3 px-4 text-center flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartWEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit withdrawal entry"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this withdrawal of ₹${item.amount.toLocaleString('en-IN')}?`)) {
                                  onDeleteWithdrawal(item.id);
                                  onShowToast(`Deleted ${item.partner} withdrawal record! 🗑️`);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete withdrawal record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Safety notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 flex items-start gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
              <div className="text-[10px] leading-relaxed">
                <span className="font-extrabold block">💡 Safety Rule (सुरक्षा नियम):</span>
                This ledger is intended for internal auditing between Shiv and Sunny. Only Master Administrators hold rights to log or discard withdrawals. Please ensure clear bills are maintained.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
