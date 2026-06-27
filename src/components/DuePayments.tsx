import React, { useState } from 'react';
import { MessageSquare, AlertOctagon, AlertCircle, Calendar, Users, Filter, Clock, CheckCircle2, ChevronRight, RefreshCw, PhoneCall, Copy, Download, FileSpreadsheet, Printer, Smartphone } from 'lucide-react';
import { Student } from '../types';

interface DuePaymentsProps {
  students: Student[];
}

export default function DuePayments({ students }: DuePaymentsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'outstanding' | 'upcoming'>('outstanding');
  const [upcomingSearch, setUpcomingSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [includePenalty, setIncludePenalty] = useState(true);

  const dueStudents = students.filter(s => s.due > 0);

  const showCopyToast = (msg: string) => {
    setCopyStatus(msg);
    setTimeout(() => {
      setCopyStatus(null);
    }, 2500);
  };

  const handleCopyText = (text: string, successMsg: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showCopyToast(successMsg);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Helper to trigger CSV file download which opens seamlessly in Microsoft Excel
  const downloadExcelDues = () => {
    try {
      let csv = "\uFEFF"; // UTF-8 BOM so Excel displays rupee symbols/accents correctly
      csv += "Student Name,Room Number,Monthly Rent (INR),Paid So Far (INR),Outstanding Balance (INR),Student Mobile,Father Name,Father Mobile,City\n";
      
      dueStudents.forEach(s => {
        const name = (s.name || '').replace(/"/g, '""');
        const room = (s.room || '').replace(/"/g, '""');
        const mobile = (s.mobile || '').replace(/"/g, '""');
        const fatherName = (s.father || '').replace(/"/g, '""');
        const fatherMobile = (s.fatherMob || '').replace(/"/g, '""');
        const city = (s.city || 'Jaipur').replace(/"/g, '""');
        csv += `"${name}","Room ${room}",${s.fee},${s.paid},${s.due},"${mobile}","${fatherName}","${fatherMobile}","${city}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unity_boys_hostel_outstanding_dues_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showCopyToast("Excel LEDGER Downloaded Successfully! 📊");
    } catch (err) {
      console.error("Excel generation error", err);
    }
  };

  const downloadPDFDues = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print PDF reports!");
      return;
    }

    const nowStr = new Date().toLocaleString('en-IN');
    
    let html = `
      <html>
      <head>
        <title>Outstanding Dues Report - Unity Boys Hostel</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            padding: 0;
            margin: 0;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .official-badge {
            background-color: #ff6b35;
            color: white;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 8px;
          }
          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            margin: 0 0 6px 0;
            color: #111;
            letter-spacing: -0.5px;
          }
          .header p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
            font-weight: 600;
          }
          .header-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 20px;
            font-size: 11px;
            color: #64748b;
          }
          .meta-box strong {
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #cbd5e1;
            padding: 10px 12px;
            text-align: left;
            font-size: 10px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            vertical-align: middle;
          }
          tr:nth-child(even) td {
            background-color: #fafafa;
          }
          .amount-due {
            color: #ef4444;
            font-weight: 700;
          }
          .total-row {
            font-weight: 800;
            background-color: #f1f5f9 !important;
            border-top: 2px solid #cbd5e1;
          }
          .total-row td {
            color: #0f172a;
            font-size: 11px;
            padding: 12px;
          }
          .no-print {
            text-align: right;
            padding: 12px 16px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 24px;
          }
          .print-btn {
            background-color: #ff6b35;
            color: white;
            border: none;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgb(255 107 53 / 0.1);
            transition: all 0.2s;
          }
          .print-btn:hover {
            background-color: #e55a24;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
          }
          .signature-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 50px;
            padding-right: 12px;
          }
          .signature-box {
            text-align: center;
            width: 160px;
            border-top: 1px solid #94a3b8;
            padding-top: 6px;
            font-size: 10px;
            color: #64748b;
            font-weight: 600;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Dues Report</button>
        </div>
        <div style="padding: 10px;">
          <div class="official-badge">OFFICIAL LEDGER RECORD</div>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1>Unity Boys Hostel</h1>
                <p>Outstanding Fee Dues Summary Sheet (A4 Compact)</p>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.4;">
                <strong>Jaipur Branch</strong><br/>
                Sector 5, Mansarovar<br/>
                Jaipur, Rajasthan
              </div>
            </div>
          </div>
          <div class="header-meta">
            <div>
              <strong>Report Generated:</strong> ${nowStr}
            </div>
            <div>
              <strong>Outstanding Accounts:</strong> ${dueStudents.length} Students Pending
            </div>
          </div>
          <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">Student Name</th>
              <th style="width: 15%;">Unit / Room</th>
              <th style="width: 12%;">Assigned Rent</th>
              <th style="width: 12%;">Paid So Far</th>
              <th style="width: 12%;">Amount Due</th>
              <th style="width: 19%;">Contacts Summary</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalRent = 0;
    let totalPaid = 0;
    let totalDue = 0;

    dueStudents.forEach((s, idx) => {
      totalRent += s.fee;
      totalPaid += s.paid;
      totalDue += s.due;
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.name}</strong></td>
          <td>Room ${s.room} (${s.sharing})</td>
          <td>₹${s.fee.toLocaleString('en-IN')}</td>
          <td>₹${s.paid.toLocaleString('en-IN')}</td>
          <td class="amount-due"><strong>₹${s.due.toLocaleString('en-IN')}</strong></td>
          <td style="font-size: 10px; line-height: 1.4;">
            Mobile: ${s.mobile}<br/>
            ${s.fatherMob ? `Father: ${s.fatherMob}<br/>` : ''}
            City: ${s.city || 'Jaipur'}
          </td>
        </tr>
      `;
    });

    html += `
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>GRAND TOTAL:</strong></td>
              <td><strong>₹${totalRent.toLocaleString('en-IN')}</strong></td>
              <td><strong>₹${totalPaid.toLocaleString('en-IN')}</strong></td>
              <td class="amount-due"><strong>₹${totalDue.toLocaleString('en-IN')}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            AUTHORIZED WARDEN<br/>
            (UNITY BOYS HOSTEL)
          </div>
        </div>

        <div class="footer">
          Unity Boys Hostel Management System • Generated Digitally • Jaipur, Rajasthan
        </div>
        </div>
      </body>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        }
      </script>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Helper to construct WhatsApp message body
  const getWhatsAppMsg = (s: Student, isFather: boolean = false) => {
    const name = isFather ? s.father : s.name;
    const penaltyText = includePenalty ? " समय पर जमा कराए अन्यथा पेनल्टी (penalty) लग जाएगी।" : "";
    return `Hello ${name || 'Parent'}, this is an outstanding fee reminder from Unity Boys Hostel, Jaipur regarding the outstanding hostel due balance of ₹${s.due}.${penaltyText} Please process the payment or UPI transfer. Thank you!\n- Warden Office.`;
  };

  const getWhatsAppLink = (s: Student, isFather: boolean = false) => {
    const phone = isFather ? s.fatherMob : s.mobile;
    const msg = getWhatsAppMsg(s, isFather);
    return `https://wa.me/91${phone ? phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(msg)}`;
  };

  const getSMSLink = (phone: string, msg: string) => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    return `sms:+91${cleanPhone}?body=${encodeURIComponent(msg)}`;
  };

  // Generate a formatted report of outstanding dues for Notepad
  const getOutstandingReportText = () => {
    let report = `============================================\n`;
    report += `   OUTSTANDING HOSTEL DUES LEDGER REPORT\n`;
    report += `   UNITY BOYS HOSTEL, JAIPUR\n`;
    report += `============================================\n`;
    report += `Date of Export : ${new Date().toLocaleString('en-IN')}\n`;
    report += `Total Pending  : ${dueStudents.length} Students\n`;
    report += `--------------------------------------------\n\n`;

    dueStudents.forEach((s, idx) => {
      report += `${idx + 1}. STUDENT NAME : ${s.name}\n`;
      report += `   Room Number  : Room ${s.room}\n`;
      report += `   Monthly Fee  : ₹${s.fee.toLocaleString('en-IN')}\n`;
      report += `   Amount Paid  : ₹${s.paid.toLocaleString('en-IN')}\n`;
      report += `   DUE BALANCE  : ₹${s.due.toLocaleString('en-IN')}\n`;
      report += `   Student Mob  : ${s.mobile || 'N/A'}\n`;
      report += `   Father Name  : ${s.father || 'N/A'}\n`;
      report += `   Father Mob   : ${s.fatherMob || 'N/A'}\n`;
      report += `--------------------------------------------\n`;
    });

    report += `\n* Created & formatted for easy Notepad editing & offline storage *`;
    return report;
  };

  // Helper to parse student's admission / join date (DD/MM/YYYY)
  const parseStudentJoinDate = (dateStr: string) => {
    if (!dateStr) return new Date(); // Fallback to current
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // Generate dynamic installments schedule based on student's actual admission date and selected frequency Plan (1, 2, 3, 4, 6, 12 months)
  const getInstallments = () => {
    const installmentsList: Array<{
      id: string;
      student: Student;
      installmentNum: number;
      dueDate: string;
      dueDateObj: Date;
      dueMonthLabel: string;
      amount: number;
      status: 'Paid' | 'Partial' | 'Upcoming';
      remainingAmount: number;
      isAlertActive: boolean;
    }> = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    students.forEach(s => {
      // Parse interval from feePlan (e.g. '3 Month' or default to 1)
      let interval = 1;
      if (s.feePlan) {
        const match = s.feePlan.match(/\d+/);
        if (match) {
          interval = parseInt(match[0]) || 1;
        }
      }

      const maxInstallments = Math.max(1, Math.floor(12 / interval));

      // Calculate installment amount
      // If student has a defined yearly total fee, divide it by total installments
      let installmentAmount = 0;
      if (s.yearlyTotalFee !== undefined && s.yearlyTotalFee > 0) {
        installmentAmount = Math.round(s.yearlyTotalFee / maxInstallments);
      } else {
        const monthlyFee = s.fee || 7500;
        installmentAmount = monthlyFee * interval;
      }
      
      // Parse individual student's admission date as start of installments
      const joinDateObj = parseStudentJoinDate(s.joinDate || s.agreementStartDate);

      let cumulativeRequired = 0;
      for (let i = 1; i <= maxInstallments; i++) {
        cumulativeRequired += installmentAmount;
        
        // Compute due dates starting from join date in increments of 'interval' months
        const d = new Date(joinDateObj);
        d.setMonth(joinDateObj.getMonth() + (i - 1) * interval);
        
        const dueDateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const dueMonthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        let status: 'Paid' | 'Partial' | 'Upcoming' = 'Upcoming';
        let remainingAmount = installmentAmount;
        const paidSoFar = s.paid || 0;
        const prevRequired = cumulativeRequired - installmentAmount;

        if (paidSoFar >= cumulativeRequired) {
          status = 'Paid';
          remainingAmount = 0;
        } else if (paidSoFar > prevRequired) {
          status = 'Partial';
          remainingAmount = cumulativeRequired - paidSoFar;
        } else {
          status = 'Upcoming';
          remainingAmount = installmentAmount;
        }

        // Alert activates if we've reached or passed the start of the installment due month
        const dueYear = d.getFullYear();
        const dueMonth = d.getMonth();
        const isAlertActive = (currentYear > dueYear) || (currentYear === dueYear && currentMonth >= dueMonth);

        installmentsList.push({
          id: `${s.id}-inst-${i}`,
          student: s,
          installmentNum: i,
          dueDate: dueDateStr,
          dueDateObj: d,
          dueMonthLabel,
          amount: installmentAmount,
          status,
          remainingAmount,
          isAlertActive: isAlertActive && remainingAmount > 0
        });
      }
    });

    // Sort by Due Date
    return installmentsList.sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
  };

  const installments = getInstallments();

  // Get unique months labels for filter dropdown
  const uniqueMonths = ['All Months', ...Array.from(new Set(installments.map(inst => inst.dueMonthLabel)))];

  // Filter installments
  const filteredInstallments = installments.filter(inst => {
    const matchesSearch = inst.student.name.toLowerCase().includes(upcomingSearch.toLowerCase()) || 
                          inst.student.room.toLowerCase().includes(upcomingSearch.toLowerCase());
    const matchesMonth = monthFilter === 'All Months' || inst.dueMonthLabel === monthFilter;
    return matchesSearch && matchesMonth;
  });

  const getUpcomingWhatsAppMsg = (inst: typeof installments[0], isFather: boolean = false) => {
    const name = isFather ? inst.student.father : inst.student.name;
    const penaltyText = includePenalty ? " समय पर जमा कराए अन्यथा पेनल्टी (penalty) लग जाएगी।" : "";
    return `Hello ${name || 'Parent'}, an upcoming/pending payment reminder from Unity Boys Hostel, Jaipur.\n\nInstallment #${inst.installmentNum} of ₹${inst.remainingAmount} falls on ${inst.dueDate} according to the ${inst.student.feePlan || '1 Month'} installment schedule.${penaltyText}\n\nPlease clear the dues. Thank you!\n- Warden Office.`;
  };

  const getUpcomingWhatsAppLink = (inst: typeof installments[0], isFather: boolean = false) => {
    const phone = isFather ? inst.student.fatherMob : inst.student.mobile;
    const msg = getUpcomingWhatsAppMsg(inst, isFather);
    return `https://wa.me/91${phone ? phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(msg)}`;
  };

  const getUpcomingReportText = () => {
    let report = `============================================\n`;
    report += `   UPCOMING FUTURE INSTALLMENTS REPORT\n`;
    report += `   UNITY BOYS HOSTEL, JAIPUR\n`;
    report += `============================================\n`;
    report += `Date of Export : ${new Date().toLocaleString('en-IN')}\n`;
    report += `Filter Month   : ${monthFilter}\n`;
    report += `Total Scheduled: ${filteredInstallments.length} Records\n`;
    report += `--------------------------------------------\n\n`;

    filteredInstallments.forEach((inst, idx) => {
      report += `${idx + 1}. STUDENT NAME : ${inst.student.name}\n`;
      report += `   Room Number  : Room ${inst.student.room}\n`;
      report += `   Installment  : #${inst.installmentNum} of standard ${inst.student.feePlan || '1 Month'} cycle\n`;
      report += `   Due Date     : ${inst.dueDate} (${inst.dueMonthLabel})\n`;
      report += `   Gross Amount : ₹${inst.amount.toLocaleString('en-IN')}\n`;
      report += `   Remaining    : ₹${inst.remainingAmount.toLocaleString('en-IN')}\n`;
      report += `   Status       : ${inst.status.toUpperCase()}${inst.isAlertActive ? ' (🚨 MONTH STARTED - REQ COLLECTION)' : ''}\n`;
      report += `   Student Mob  : ${inst.student.mobile || 'N/A'}\n`;
      report += `   Father Mob   : ${inst.student.fatherMob || 'N/A'}\n`;
      report += `--------------------------------------------\n`;
    });

    report += `\n* Created & formatted for easy Notepad editing & offline storage *`;
    return report;
  };

  const downloadExcelInstallments = () => {
    try {
      let csv = "\uFEFF"; // UTF-8 BOM so Excel displays rupee symbols/accents correctly
      csv += "Student Name,Room Number,Installment Plan,Installment Number,Scheduled Due Date,Month,Gross Amount (INR),Expected Remaining (INR),Status,Student Mobile,Father Mobile\n";
      
      filteredInstallments.forEach(inst => {
        const name = (inst.student.name || '').replace(/"/g, '""');
        const room = (inst.student.room || '').replace(/"/g, '""');
        const plan = (inst.student.feePlan || '1 Month').replace(/"/g, '""');
        const mobile = (inst.student.mobile || '').replace(/"/g, '""');
        const fatherMobile = (inst.student.fatherMob || '').replace(/"/g, '""');
        csv += `"${name}","Room ${room}","${plan}",${inst.installmentNum},"${inst.dueDate}","${inst.dueMonthLabel}",${inst.amount},${inst.remainingAmount},"${inst.status}","${mobile}","${fatherMobile}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unity_boys_hostel_upcoming_installments_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showCopyToast("Excel PLANNER Downloaded Successfully! 📊");
    } catch (err) {
      console.error("Excel generation error", err);
    }
  };

  const downloadPDFInstallments = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print PDF reports!");
      return;
    }

    const nowStr = new Date().toLocaleString('en-IN');
    
    let html = `
      <html>
      <head>
        <title>Upcoming Installments Planner - Unity Boys Hostel</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1a202c;
            padding: 40px;
            margin: 0;
            background-color: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 850;
            text-transform: uppercase;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
            color: #111;
          }
          .header p {
            font-size: 13px;
            color: #4a5568;
            margin: 0;
            font-weight: 700;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #4a5568;
            margin-bottom: 20px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 30px;
          }
          th {
            background-color: #1e2022;
            color: #ffffff;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #2d3748;
            padding: 12px 10px;
            text-align: left;
          }
          td {
            padding: 12px 10px;
            border-bottom: 1px solid #edf2f7;
            color: #2d3748;
          }
          tr:nth-child(even) td {
            background-color: #f7fafc;
          }
          .badge {
            display: inline-block;
            background-color: #feebcb;
            color: #c05621;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .badge-unpaid {
            background-color: #fff5f5;
            color: #c53030;
          }
          .badge-paid {
            background-color: #c6f6d5;
            color: #22543d;
          }
          .total-row {
            font-weight: 800;
            background-color: #e2e8f0 !important;
            border-top: 2px solid #cbd5e0;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #718096;
            border-top: 1px solid #edf2f7;
            padding-top: 15px;
          }
          .print-btn {
            background-color: #e53e3e;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right;">
          <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Report</button>
        </div>
        <div class="header">
          <h1>Unity Boys Hostel, Jaipur</h1>
          <p>Upcoming Installments billing Planner</p>
        </div>
        <div class="meta-info">
          <div>DATE OF REPORT: ${nowStr}</div>
          <div>FILTERED PLANNER SCHEDULES: ${filteredInstallments.length} Records</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">Student Name</th>
              <th style="width: 10%;">Room</th>
              <th style="width: 15%;">Installment Detail</th>
              <th style="width: 15%;">Scheduled Date</th>
              <th style="width: 15%;">Remaining Due</th>
              <th style="width: 15%;">Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalDueAmt = 0;

    filteredInstallments.forEach((inst, idx) => {
      totalDueAmt += inst.remainingAmount;
      const statusClass = inst.status.toLowerCase() === 'unpaid' ? 'badge-unpaid' : 'badge-paid';
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${inst.student.name}</strong><br/><small style="color:#718096">Mob: ${inst.student.mobile}</small></td>
          <td>Room ${inst.student.room}</td>
          <td>Installment #${inst.installmentNum} (${inst.student.feePlan || '1 Month'})</td>
          <td><strong>${inst.dueDate}</strong><br/><small style="color:#718096">${inst.dueMonthLabel}</small></td>
          <td><strong>₹${inst.remainingAmount.toLocaleString('en-IN')}</strong></td>
          <td><span class="badge ${statusClass}">${inst.status.toUpperCase()}</span></td>
        </tr>
      `;
    });

    html += `
            <tr class="total-row">
              <td colspan="5" style="text-align: right;">TOTAL PENDING:</td>
              <td><strong>₹${totalDueAmt.toLocaleString('en-IN')}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          Unity Boys Hostel Management System • Generated Digitally • Jaipur, Rajasthan
        </div>
      </body>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        }
      </script>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Sub Tabs Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-2">
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('outstanding')}
            className={`pb-3.5 px-6 font-bold text-xs sm:text-sm transition relative cursor-pointer ${
              activeSubTab === 'outstanding' 
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Overdue Balances ({dueStudents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('upcoming')}
            className={`pb-3.5 px-6 font-bold text-xs sm:text-sm transition relative cursor-pointer ${
              activeSubTab === 'upcoming' 
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Upcoming Installments Finder (Aug 1st Session)
          </button>
        </div>

        {/* Penalty Toggle */}
        <div className="pb-2 sm:pb-0">
          <label className="flex items-center gap-2 cursor-pointer bg-amber-50 hover:bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-black text-amber-800 select-none transition">
            <input 
              type="checkbox" 
              checked={includePenalty} 
              onChange={(e) => setIncludePenalty(e.target.checked)} 
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-amber-350 accent-amber-600"
            />
            ⚠️ Add Penalty Warning (पेनल्टी चेतावनी)
          </label>
        </div>
      </div>

      {activeSubTab === 'outstanding' ? (
        <>
          {/* Header section with Bulk Copy for Notepad */}
          <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <AlertOctagon className="w-6 h-6 text-rose-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-rose-950">Outstanding Due Ledger Sheet ({dueStudents.length} Students Pending)</h4>
                <p className="text-[10px] sm:text-xs text-rose-700 font-medium max-w-2xl">
                  List of student directories with outstanding fee balances. Tap 'WA' to open WhatsApp templates, or 'Call' to initiate cellular calls.
                </p>
              </div>
            </div>
            {dueStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 shrink-0 self-start md:self-auto">
                <button
                  onClick={downloadExcelDues}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-sm border border-emerald-600/10"
                  title="Download all outstanding student dues data directly in Excel/CSV format"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white/95" />
                  Download Excel Sheet 📊
                </button>
                <button
                  onClick={downloadPDFDues}
                  className="px-4 py-2.5 bg-[#e53e3e] hover:bg-[#c53030] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-sm border border-red-600/10"
                  title="Download / Print outstanding dues as a high-quality PDF document"
                >
                  <Printer className="w-4 h-4 text-white/95" />
                  Print PDF Report 📄
                </button>
              </div>
            )}
          </div>

          {/* Table register */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#1E2022] to-[#2E3135] text-white text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-4.5 px-5">Student / Name</th>
                  <th className="py-4.5 px-5">Room Assigned</th>
                  <th className="py-4.5 px-5">Total Monthly Rent</th>
                  <th className="py-4.5 px-5">Paid so far</th>
                  <th className="py-4.5 px-5 text-right">Outstanding Balance</th>
                  <th className="py-4.5 px-5 text-center">Alert Warden commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {dueStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#D4AF37]">
                      <AlertCircle className="w-8 h-8 text-[#D4AF37]/45 mx-auto mb-2 animate-bounce" />
                      <span className="font-extrabold block text-sm mb-1">🎉 Absolute Perfect Balance!</span>
                      <span className="text-gray-400 text-xs">All active student ledgers have been completely synchronized and paid.</span>
                    </td>
                  </tr>
                ) : (
                  dueStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-rose-50/20 transition-all">
                      
                      {/* Name block */}
                      <td className="py-4 px-5">
                        <div>
                          <h5 className="font-extrabold text-gray-800 leading-tight">{s.name}</h5>
                          <div className="text-[10px] text-gray-400 font-medium space-y-0.5 mt-0.5">
                            <span className="block">Student Mob: {s.mobile}</span>
                            <span className="block text-slate-600 font-bold">Papa Mob: {s.fatherMob} ({s.father})</span>
                          </div>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-[#D4AF37] rounded-lg">
                          Room {s.room}
                        </span>
                      </td>

                      {/* Rent */}
                      <td className="py-4 px-5 font-semibold text-gray-650">
                        ₹{s.fee.toLocaleString('en-IN')}
                      </td>

                      {/* Paid */}
                      <td className="py-4 px-5 font-semibold text-emerald-600">
                        ₹{s.paid.toLocaleString('en-IN')}
                      </td>

                      {/* due balance */}
                      <td className="py-4 px-5 text-right font-black text-rose-600">
                        ₹{s.due.toLocaleString('en-IN')}
                      </td>

                      {/* reminder action button */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-2 min-w-[260px] max-w-[310px] mx-auto text-left">
                          {/* Student Dues Options */}
                          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-150 last:border-0 last:pb-0">
                            <span className="font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px]">
                              Student
                            </span>
                            <div className="flex items-center gap-1">
                              <a
                                href={getWhatsAppLink(s, false)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                                title="WhatsApp Student"
                              >
                                <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                                WA
                              </a>
                              {s.mobile && (
                                <a
                                  href={getSMSLink(s.mobile, getWhatsAppMsg(s, false))}
                                  className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                  title="Send SMS text reminder to Student"
                                >
                                  <Smartphone className="w-3 h-3 text-violet-500" />
                                  SMS
                                </a>
                              )}
                              {s.mobile && (
                                <a
                                  href={`tel:${s.mobile}`}
                                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-blue-200 transition active:scale-95"
                                  title="Call Student"
                                >
                                  <PhoneCall className="w-3 h-3 text-blue-500" />
                                  Call
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Father Dues Options */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px] truncate max-w-[100px]" title={s.father || 'Parent'}>
                              Papa: {s.father || 'Parent'}
                            </span>
                            <div className="flex items-center gap-1">
                              <a
                                href={getWhatsAppLink(s, true)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                                title="WhatsApp Father"
                              >
                                <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                                WA
                              </a>
                              {s.fatherMob && (
                                <a
                                  href={getSMSLink(s.fatherMob, getWhatsAppMsg(s, true))}
                                  className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                  title="Send SMS text reminder to Father"
                                >
                                  <Smartphone className="w-3 h-3 text-violet-500" />
                                  SMS
                                </a>
                              )}
                              {s.fatherMob && (
                                <a
                                  href={`tel:${s.fatherMob}`}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-amber-200 transition active:scale-95"
                                  title="Call Father"
                                >
                                  <PhoneCall className="w-3 h-3 text-amber-500" />
                                  Call
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Upcoming Installments Finder Section with Bulk exporting */}
          <div className="p-4 bg-amber-50/40 border border-amber-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Clock className="w-6 h-6 text-[#D4AF37] flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">Dynamic Rent Installments Planner (Individual Admission dates)</h4>
                <p className="text-[10px] sm:text-xs text-amber-800 font-medium max-w-2xl">
                  Tracks future dues according to student payment profiles (1, 2, 3, 4, 6, 12 month intervals) calculated from each student's personal Admission Date. A collection alert triggers at the beginning of respective months.
                </p>
              </div>
            </div>
            {filteredInstallments.length > 0 && (
              <div className="flex flex-wrap gap-2 shrink-0 self-start md:self-auto">
                <button
                  onClick={downloadExcelInstallments}
                  className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#bfa032] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-sm"
                  title="Download all filtered upcoming installments directly in Excel/CSV format"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  Download Excel Planner 📊
                </button>
                <button
                  onClick={downloadPDFInstallments}
                  className="px-4 py-2.5 bg-[#e53e3e] hover:bg-[#c53030] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-sm border border-red-650/15"
                  title="Download / Print filtered upcoming installments as a high-quality PDF document"
                >
                  <Printer className="w-4 h-4 text-white" />
                  Print PDF Planner 📄
                </button>
              </div>
            )}
          </div>

          {/* Filters & Control bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by student name or room..."
                value={upcomingSearch}
                onChange={e => setUpcomingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] bg-white font-medium"
              />
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] bg-white text-gray-700 font-bold cursor-pointer"
              >
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Installments List Grid */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#1E2022] to-[#2E3135] text-white text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Student</th>
                  <th className="py-4 px-5">Room</th>
                  <th className="py-4 px-5">Installment Interval</th>
                  <th className="py-4 px-5">Scheduled Due Date</th>
                  <th className="py-4 px-5">Gross Amount</th>
                  <th className="py-4 px-5">Expected Remaining</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {filteredInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <span className="font-extrabold block text-sm mb-1">No installment matches found</span>
                      <span className="text-gray-400 text-xs text-center">Try adjusting your filters or search terms.</span>
                    </td>
                  </tr>
                ) : (
                  filteredInstallments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-all">
                      {/* Student */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-gray-800 leading-tight">{inst.student.name}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold block">Student: {inst.student.mobile}</span>
                          <span className="text-[10px] text-slate-500 font-bold block">Papa: {inst.student.fatherMob} ({inst.student.father})</span>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-5 font-extrabold text-[#D4AF37]">
                        Room {inst.student.room}
                      </td>

                      {/* Installment count */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-xs">Plan: {inst.student.feePlan || '1 Month'}</span>
                          <span className="text-[10px] text-gray-400 font-medium">Installment #{inst.installmentNum}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-5 font-mono text-xs font-extrabold text-blue-900">
                        {inst.dueDate}
                        <span className="block text-[9px] text-gray-400 font-sans mt-0.5">{inst.dueMonthLabel}</span>
                      </td>

                      {/* Amount total */}
                      <td className="py-3.5 px-5 font-semibold text-gray-700">
                        ₹{inst.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Remaining to pay */}
                      <td className="py-3.5 px-5 font-black text-rose-600">
                        ₹{inst.remainingAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        {inst.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            RECEIVED
                          </span>
                        ) : inst.isAlertActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-rose-50 text-rose-600 rounded-full border border-rose-200 animate-pulse" title="This installment's scheduled month has started! Needs immediate collection.">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            🚨 DUE: MONTH STARTED
                          </span>
                        ) : inst.status === 'Partial' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                            PARTIAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-slate-50 text-slate-500 rounded-full border border-slate-200">
                            UPCOMING
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5">
                        {inst.status !== 'Paid' ? (
                          <div className="flex flex-col gap-2 min-w-[260px] max-w-[310px] mx-auto text-left">
                            {/* Student Dues Options */}
                            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-150 last:border-0 last:pb-0">
                              <span className="font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px]">
                                Student
                              </span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={getUpcomingWhatsAppLink(inst, false)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                                  title="WhatsApp Student"
                                >
                                  <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                                  WA
                                </a>
                                {inst.student.mobile && (
                                  <a
                                    href={getSMSLink(inst.student.mobile, getUpcomingWhatsAppMsg(inst, false))}
                                    className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                    title="Send SMS text reminder to Student"
                                  >
                                    <Smartphone className="w-3 h-3 text-violet-500" />
                                    SMS
                                  </a>
                                )}
                                {inst.student.mobile && (
                                  <a
                                    href={`tel:${inst.student.mobile}`}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-blue-200 transition active:scale-95"
                                    title="Call Student"
                                  >
                                    <PhoneCall className="w-3 h-3 text-blue-500" />
                                    Call
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Father Dues Options */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px] truncate max-w-[100px]" title={inst.student.father || 'Parent'}>
                                Papa: {inst.student.father || 'Parent'}
                              </span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={getUpcomingWhatsAppLink(inst, true)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                                  title="WhatsApp Father"
                                >
                                  <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                                  WA
                                </a>
                                {inst.student.fatherMob && (
                                  <a
                                    href={getSMSLink(inst.student.fatherMob, getUpcomingWhatsAppMsg(inst, true))}
                                    className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                    title="Send SMS text reminder to Father"
                                  >
                                    <Smartphone className="w-3 h-3 text-violet-500" />
                                    SMS
                                  </a>
                                )}
                                {inst.student.fatherMob && (
                                  <a
                                    href={`tel:${inst.student.fatherMob}`}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-amber-200 transition active:scale-95"
                                    title="Call Father"
                                  >
                                    <PhoneCall className="w-3 h-3 text-amber-500" />
                                    Call
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-extrabold justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Clear
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modern Floating Toast Notification */}
      {copyStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A2E] text-white border border-[#FF6B35]/30 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
          <span className="text-xs font-black tracking-wide uppercase text-slate-100">{copyStatus}</span>
        </div>
      )}

    </div>
  );
}
