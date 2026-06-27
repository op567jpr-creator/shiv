import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  CheckCircle, 
  Search, 
  TrendingUp, 
  Smartphone, 
  Coins, 
  Calendar, 
  Info,
  Users
} from 'lucide-react';
import { Student, Payment, Complaint, Visitor } from '../types';

interface ReportsPanelProps {
  students: Student[];
  payments: Payment[];
  complaints: Complaint[];
  visitors: Visitor[];
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function ReportsPanel({
  students,
  payments,
  complaints,
  visitors,
  onShowToast
}: ReportsPanelProps) {
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Helper to compile overall stats
  let overallCashTotal = 0;
  let overallOnlineTotal = 0;
  let overallPaymentsSum = 0;
  let cashTxCount = 0;
  let onlineTxCount = 0;

  payments.forEach(p => {
    const isCash = p.mode === 'Cash';
    const amt = p.amount || 0;
    
    if (isCash) {
      overallCashTotal += amt;
      cashTxCount++;
    } else {
      overallOnlineTotal += amt;
      onlineTxCount++;
    }
    overallPaymentsSum += amt;
  });

  // Compile Month-Wise Collection distribution
  const monthlyLogs: { [month: string]: { cash: number; online: number; total: number; count: number } } = {};
  
  payments.forEach(p => {
    const m = p.month || 'Unspecified Month';
    const amt = p.amount || 0;
    const isCash = p.mode === 'Cash';

    if (!monthlyLogs[m]) {
      monthlyLogs[m] = { cash: 0, online: 0, total: 0, count: 0 };
    }

    if (isCash) {
      monthlyLogs[m].cash += amt;
    } else {
      monthlyLogs[m].online += amt;
    }
    monthlyLogs[m].total += amt;
    monthlyLogs[m].count += 1;
  });

  const monthsList = Object.keys(monthlyLogs).sort();

  // Helper trigger for downloading CSVs
  const triggerCSVDownload = (filename: string, headers: string[], rows: any[][]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(val => {
          const cleanVal = typeof val === 'string' ? val.replace(/"/g, '""') : val === undefined || val === null ? '' : String(val);
          return `"${cleanVal}"`;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast(`Report downloaded successfully: ${filename} 📊`);
    } catch (e) {
      onShowToast('Failed to export report CSV! ❌', true);
    }
  };

  // EXPORT 1: Combined Collections & Mode Audit Report
  const handleExportCombinedAudit = () => {
    if (monthsList.length === 0) {
      onShowToast('No transactions mapped to generate combined audit! ⚠️', true);
      return;
    }
    const headers = ['Month / Category / Mode', 'Cash Collection (₹)', 'Online Collection (₹)', 'Combined Total (₹)', 'Tx Count / Details'];
    
    // Monthly collections list rows
    const rowsMonth = monthsList.map(m => [
      `Billing Month: ${m}`, 
      monthlyLogs[m].cash, 
      monthlyLogs[m].online, 
      monthlyLogs[m].total, 
      `${monthlyLogs[m].count} Payments`
    ]);

    // Combined summary rows
    const rowsDivider1 = ['', '', '', '', ''];
    const rowsDivider2 = ['--- OVERALL SYSTEM MODE AUDIT SUMMARY ---', '', '', '', ''];
    const rowsMode = [
      ['Cash Mode Collections Audit', overallCashTotal, '', overallCashTotal, `${cashTxCount} collections`],
      ['Online Digital Collections Audit', '', overallOnlineTotal, overallOnlineTotal, `${onlineTxCount} collections`],
      ['Total Hostel Unified Collections Sum', overallCashTotal, overallOnlineTotal, overallPaymentsSum, `${payments.length} total payments`]
    ];

    const combinedRows = [
      ...rowsMonth,
      rowsDivider1,
      rowsDivider2,
      ...rowsMode
    ];

    triggerCSVDownload(`combined-collections-audit-${Date.now()}.csv`, headers, combinedRows);
  };

  // EXPORT 2: Custom All Student Ledger with comprehensive details
  const handleExportAllStudentData = () => {
    if (students.length === 0) {
      onShowToast('No student files registered! ⚠️', true);
      return;
    }
    const headers = [
      'Student Name (विद्यार्थी का नाम)',
      'Room Number (कमरा नंबर)',
      'Sharing Type (कमरा शेयरिंग)',
      'Student Mobile (विद्यार्थी मोबाइल)',
      'Student Status (स्थिति)',
      'Date of Joining (प्रवेश तिथि)',
      'Father Name (पिता का नाम)',
      'Father Mobile (पिता का मोबाइल)',
      'Monthly Rent/Fee (मासिक किराया)',
      'Security Deposit (सुरक्षा राशि ₹)',
      'Total Paid till date (कुल भुगतान)',
      'Current Due Amount (शेष देय राशि)',
      'Last Electricity Reading (आखिरी मीटर रीडिंग)',
      'Total Payments History Logs (भुगतान इतिहास विवरण)',
      'Hostel Name (हॉस्टल)'
    ];

    const rows = students.map(s => {
      // Find all payments of this student
      const studentPayments = payments.filter(p => p.studentId === s.id);
      const totalPaidSum = studentPayments.reduce((sum, curr) => sum + (curr.amount || 0), 0);
      
      const paymentDetailsString = studentPayments.map(p => 
        `₹${p.amount} (${p.mode} - ${p.date || '-'} [Recpt: ${p.receipt}])`
      ).join('; ') || 'No payments registered';

      const compiledHistory = `Total Paid: ₹${totalPaidSum} | Logged: ${paymentDetailsString}`;

      return [
        s.name,
        s.room,
        s.sharing || 'N/A',
        s.mobile,
        s.status || 'Active',
        s.joinDate || 'N/A',
        s.father || 'N/A',
        s.fatherMob || 'N/A',
        s.fee || 0,
        s.securityDeposit || 0,
        totalPaidSum,
        s.due || 0,
        s.elecLastReading || 0,
        compiledHistory,
        'Unity Boys Hostel'
      ];
    });

    triggerCSVDownload(`ubh-all-student-directory-${Date.now()}.csv`, headers, rows);
  };

  // EXPORT 3: Electricity Billing Report Export
  const handleExportElectricityReport = () => {
    const headers = [
      'Lodger Name (नाम)',
      'Room Number (रूम नं.)',
      'Previous Reading (पिछली मीटर रीडिंग)',
      'Current Reading (वर्तमान मीटर रीडिंग)',
      'Consumed Units (कुल बिजली खपत यूनिट)',
      'Tariff Rate (दर ₹/यू.)',
      'Total Bill Due (कुल बिल राशि ₹)',
      'Logged Month (रीडिंग महीना)',
      'Dues Status (बिल स्थिति)'
    ];

    const rows: any[][] = [];

    students.forEach(s => {
      let history: any[] = [];
      try {
        if (s.elecHistoryJson) {
          history = JSON.parse(s.elecHistoryJson);
        }
      } catch (e) {
        console.error("Error reading JSON history", e);
      }

      if (Array.isArray(history) && history.length > 0) {
        history.forEach((h: any) => {
          rows.push([
            s.name,
            s.room,
         h.prevReading || 0,
            h.currentReading || 0,
            h.consumedUnits || 0,
            h.rate || 10,
            h.amount || 0,
            h.date || s.joinDate || '-',
            h.isPaid ? 'Settle Paid' : 'Added to Monthly Rent Dues'
          ]);
        });
      } else {
        // Default record mapping for active residents
        rows.push([
          s.name,
          s.room,
          0,
          s.elecLastReading || 0,
          s.elecLastReading || 0,
          10,
          (s.elecLastReading || 0) * 10,
          'Base Readings (First Time)',
          'Not Billed'
        ]);
      }
    });

    triggerCSVDownload(`ubh-electricity-billing-ledger-${Date.now()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* 3 METRIC SUMMARY CARDS: Combined sum, cash report and online report */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Metric Card A: Overall Collections */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-150 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">Overall Combined Collections (कुल संकलन)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-teal-950 font-mono">
              ₹{overallPaymentsSum.toLocaleString('en-IN')}
            </h3>
            <span className="text-[9px] text-teal-600 font-extrabold block mt-1 uppercase">
              Total logs: {payments.length} collections
            </span>
          </div>
        </div>

        {/* Metric Card B: Cash Report */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-100 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Overall Cash Report (नकद संकलन)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
              ₹{overallCashTotal.toLocaleString('en-IN')}
            </h3>
            <span className="text-[9px] text-amber-600 font-extrabold block mt-1 uppercase">
              Total cash transactions: {cashTxCount}
            </span>
          </div>
        </div>

        {/* Metric Card C: Online UPI/Bank Report */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-150 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Online Report (डिजिटल यूपीआई/बैंक)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">
              ₹{overallOnlineTotal.toLocaleString('en-IN')}
            </h3>
            <span className="text-[9px] text-indigo-600 font-extrabold block mt-1 uppercase">
              Total digital transactions: {onlineTxCount}
            </span>
          </div>
        </div>

      </div>

      {/* MONTH-WISE CASH AND ONLINE LEDGER SHEET */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF6B35]" />
              Month-wise Collections & Mode Summary
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Summary sheet dividing Cash collections and Online collections month-by-month</p>
          </div>
          <button
            onClick={handleExportCombinedAudit}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 duration-150 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Combined Audit Export
          </button>
        </div>

        {monthsList.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 font-bold bg-gray-50/50 rounded-2xl">
            No monthly collections recorded in files yet. Recording a payment will automatically catalog month summaries!
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-semibold border-b border-gray-150">
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4 text-right">Cash Received (₹)</th>
                  <th className="py-3 px-4 text-right">Online Received (UPI/Bank) (₹)</th>
                  <th className="py-3 px-4 text-right font-black">Combined Month Total (₹)</th>
                  <th className="py-3 px-4 text-center">Tx Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white font-medium">
                {monthsList.slice().reverse().map(m => {
                  const data = monthlyLogs[m];
                  return (
                    <tr key={m} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-extrabold text-[#1A1A2E] font-mono">{m}</td>
                      <td className="py-3.5 px-4 text-right text-amber-700 font-mono">₹{data.cash.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right text-indigo-700 font-mono">₹{data.online.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 font-mono">₹{data.total.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{data.count} Payments</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED CSV EXPORT MANAGEMENT PANEL */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        <h4 className="text-xs font-black text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-[#FF6B35]" />
          Warden Unified Reports & CSV Export Center
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Export Student List Detail Button with requested fields */}
          <button
            onClick={handleExportAllStudentData}
            className="p-4 border border-dashed border-gray-200 hover:border-[#FF6B35] bg-gray-50/50 hover:bg-orange-50/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2.5">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h5 className="font-extrabold text-gray-800 text-xs sm:text-sm">All Student Ledger File</h5>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              Downloads Name, Room, Mobile, Father Name/Mobile, Rent, Security Deposit, Total Paid, Dues & Pay History
            </p>
          </button>

          {/* Combined Audit Button */}
          <button
            onClick={handleExportCombinedAudit}
            className="p-4 border border-dashed border-gray-200 hover:border-[#FF6B35] bg-gray-50/50 hover:bg-orange-50/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <h5 className="font-extrabold text-gray-800 text-xs sm:text-sm">Combined Monthly & Cash/Online Audit</h5>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              Combines monthly collections list with total Cash & Digital mode summaries
            </p>
          </button>

          {/* Export Electricity Report Button */}
          <button
            onClick={handleExportElectricityReport}
            className="p-4 border border-dashed border-gray-200 hover:border-[#FF6B35] bg-gray-50/50 hover:bg-orange-50/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <h5 className="font-extrabold text-gray-800 text-xs sm:text-sm">Electricity Bill Report</h5>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              Exports sub-meter readings, consumed units, tariff rates and outstanding bills
            </p>
          </button>

        </div>
      </div>

      {/* Info note regarding exported columns */}
      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3 text-xs leading-relaxed text-amber-900">
        <Info className="w-4.5 h-4.5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
        <p>
          <strong>Report System Tip:</strong> All generated reports comply with standard Microsoft Excel, Google Sheets, and Tally accounting layouts. You can directly import the downloadable files into your ledger book for smooth auditing and tax checks.
        </p>
      </div>

    </div>
  );
}
