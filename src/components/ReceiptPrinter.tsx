import React, { useRef, useState } from 'react';
import { Download, Printer, CheckCircle, Smartphone, MapPin, Milestone, Receipt, Copy } from 'lucide-react';
import { Payment, HostelSettings } from '../types';

interface ReceiptPrinterProps {
  payment: Payment | null;
  settings: HostelSettings;
  onClose: () => void;
}

export default function ReceiptPrinter({ payment, settings, onClose }: ReceiptPrinterProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!payment) return null;

  const paymentTypeLabel = payment.paymentType === 'Installment' ? 'Installment (किस्त)' : 'Monthly Rent (मासिक किराया)';

  const handleCopyText = () => {
    const periodOrInstallment = payment.paymentType === 'Installment' 
      ? `Installment No:    ${payment.installmentNo || 'N/A'}` 
      : `Billing Period:    ${payment.month || 'Current Cycle'}`;

    const txt = `===========================================
      OFFICIAL FEE PAYMENT RECEIPT
      ${settings.name.toUpperCase()}
===========================================
Receipt voucher:   #${payment.receipt}
Recorded Date:     ${payment.date}
Hostel Lodger:     ${payment.studentName}
Father's Name:     ${payment.fatherName ? 'S/O ' + payment.fatherName : 'N/A'}
Warden Room:       Room ${payment.room}
Payment Scheme:    ${payment.paymentType || 'Monthly'}
${periodOrInstallment}
Method of Pay:     ${payment.mode}
-------------------------------------------
TOTAL COLLECTED:   ₹${payment.amount.toLocaleString('en-IN')}
-------------------------------------------
Status:            ✓ PAID & SECURED IN LEDGER
Official Stamp:    UNITY BOYS HOSTEL - OFFICIAL PAID
Authorized Signature: Warden Office, ${settings.name}
Thank you for staying with us!
===========================================`;

    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const printContent = printableRef.current?.innerHTML;
    if (!printContent) return;

    const w = window.open('', '', 'width=650,height=800');
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Receipt - #${payment.receipt}</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              padding: 30px;
              color: #1e293b;
              background-color: #fff;
              max-width: 600px;
              margin: auto;
              border: 3px double #334155;
              border-radius: 12px;
              box-sizing: border-box;
            }
            .header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #cbd5e1;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .header-left h1 {
              color: #0f172a;
              margin: 0;
              font-size: 22px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-left p {
              margin: 4px 0 0;
              font-size: 11px;
              color: #475569;
              font-weight: 600;
              line-height: 1.4;
            }
            .header-right {
              text-align: right;
            }
            .doc-title {
              font-size: 14px;
              font-weight: 900;
              color: #e25822; /* Premium Brick Orange */
              letter-spacing: 1px;
              text-transform: uppercase;
              margin: 0 0 5px 0;
              background: #fff3e0;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
            }
            .doc-meta {
              font-size: 11px;
              color: #475569;
              margin: 2px 0;
              font-weight: 700;
              font-family: monospace;
            }
            /* Info Box Grid */
            .grid-panels {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 16px;
              margin-bottom: 20px;
            }
            .panel {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 14px;
            }
            .panel-title {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 3px;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .info-line {
              display: flex;
              justify-content: space-between;
              font-size: 11.5px;
              margin-bottom: 5px;
              line-height: 1.3;
            }
            .info-lbl {
              font-weight: 600;
              color: #64748b;
            }
            .info-val {
              font-weight: 700;
              color: #0f172a;
              text-align: right;
            }
            /* Invoice itemized table */
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            .invoice-table th {
              background: #0f172a;
              color: #ffffff;
              text-align: left;
              padding: 10px 12px;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .invoice-table td {
              padding: 12px;
              border-bottom: 2px solid #f1f5f9;
              color: #334155;
            }
            .invoice-table tr:last-child td {
              border-bottom: 2px solid #cbd5e1;
            }
            /* Net Summary banner */
            .amount-banner {
              background: #f0fdf4; /* Light green professional tint */
              border: 1.5px solid #22c55e;
              border-radius: 10px;
              padding: 12px;
              text-align: center;
              margin: 20px 0;
            }
            .amount-banner .lbl {
              margin: 0;
              font-size: 10px;
              color: #166534;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              font-weight: 800;
            }
            .amount-banner .sum {
              font-size: 28px;
              font-weight: 900;
              color: #15803d;
              margin-top: 3px;
              letter-spacing: 0.5px;
            }
            /* Rubber Stamp and Signature */
            .stamp-area {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 10px;
            }
            .stamp-hostel {
              position: relative;
              display: inline-block;
              vertical-align: middle;
            }
            .sign-box {
              text-align: center;
              font-size: 11px;
              color: #475569;
              font-weight: 700;
              width: 150px;
            }
            .signature-line {
              border-top: 1px solid #94a3b8;
              margin-top: 25px;
              padding-top: 5px;
            }
            .watermark {
              text-align: center;
              color: #94a3b8;
              font-size: 9px;
              margin-top: 35px;
              border-top: 1px solid #f1f5f9;
              padding-top: 12px;
              font-weight: 500;
              letter-spacing: 0.3px;
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="header-left">
              <h1>🏠 ${settings.name}</h1>
              <p>${settings.address}</p>
              <p>Phone: ${settings.phone} | Email: ${settings.email}</p>
            </div>
            <div class="header-right">
              <div class="doc-title">OFFICIAL RECEIPT</div>
              <div class="doc-meta">Receipt: #${payment.receipt}</div>
              <div class="doc-meta">Date: ${payment.date}</div>
            </div>
          </div>

          <div class="grid-panels">
            <div class="panel">
              <div class="panel-title">LODGER DETAILS (छात्र विवरण)</div>
              <div class="info-line">
                <span class="info-lbl">Lodger Name:</span>
                <span class="info-val">${payment.studentName}</span>
              </div>
              <div class="info-line">
                <span class="info-lbl">Father's Name:</span>
                <span class="info-val">${payment.fatherName ? 'S/O ' + payment.fatherName : 'N/A'}</span>
              </div>
              <div class="info-line">
                <span class="info-lbl">Room Allocated:</span>
                <span class="info-val">Room ${payment.room}</span>
              </div>
            </div>

            <div class="panel">
              <div class="panel-title">PAYMENT VOUCHER (भुगतान विवरण)</div>
              <div class="info-line">
                <span class="info-lbl">Voucher Status:</span>
                <span class="info-val" style="color: #16a34a;">★ SUCCESS ★</span>
              </div>
              <div class="info-line">
                <span class="info-lbl">Payment Scheme:</span>
                <span class="info-val">${payment.paymentType === 'Installment' ? 'Installment (' + (payment.installmentNo || 'N/A') + ')' : 'Monthly Rent'}</span>
              </div>
              <div class="info-line">
                <span class="info-lbl">Method of Pay:</span>
                <span class="info-val">${payment.mode}</span>
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th style="width: 10%">Sr.</th>
                <th style="width: 50%">Item / Particular Details</th>
                <th style="width: 20%">Reference</th>
                <th style="text-align: right; width: 20%">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 700;">01.</td>
                <td>
                  <strong style="color: #0f172a; display: block; font-size: 12px;">
                    ${payment.paymentType === 'Installment' ? 'Hostel Fee Installment Payment' : 'Hostel Monthly Rent Charge'}
                  </strong>
                  <span style="font-size: 10px; color: #64748b; margin-top: 2px; display: block;">
                    Category: ${payment.paymentType === 'Installment' ? 'Installment (किस्त)' : 'Monthly Cycle (मासिक किराया)'}
                  </span>
                </td>
                <td style="font-weight: 700; color: #1e293b;">
                  ${payment.paymentType === 'Installment' ? (payment.installmentNo || 'N/A') : (payment.month || 'Current Cycle')}
                </td>
                <td style="text-align: right; font-weight: 800; font-family: monospace; font-size: 13px; color: #0f172a;">
                  ₹${payment.amount.toLocaleString('en-IN')}.00
                </td>
              </tr>
              ${payment.note ? `
              <tr>
                <td></td>
                <td colspan="3" style="font-size: 11px; background: #fafafa; padding: 8px 12px; color: #475569; border-radius: 6px;">
                  <strong>Note/Remarks:</strong> ${payment.note}
                </td>
              </tr>` : ''}
            </tbody>
          </table>

          <div class="amount-banner">
            <div class="lbl">TOTAL RECEIVED & SECURED IN LEDGER</div>
            <div class="sum">₹${payment.amount.toLocaleString('en-IN')}/-</div>
          </div>

          <div class="stamp-area">
            <div class="stamp-hostel">
              <svg width="110" height="110" viewBox="0 0 120 120" style="transform: rotate(-8deg); filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.05)); overflow: visible; display: inline-block; opacity: 0.9;">
                <filter id="distressed-ink-print">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <g filter="url(#distressed-ink-print)">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#0d47a1" stroke-width="2.5" />
                  <circle cx="60" cy="60" r="49" fill="none" stroke="#0d47a1" stroke-width="1" stroke-dasharray="2,2" />
                  <circle cx="60" cy="60" r="35" fill="none" stroke="#0d47a1" stroke-width="1.5" />

                  <defs>
                    <path id="top-arc-print" d="M 16,60 A 44,44 0 0,1 104,60" fill="none" />
                    <path id="bottom-arc-print" d="M 104,60 A 44,44 0 0,1 16,60" fill="none" />
                  </defs>

                  <text fill="#0d47a1" font-size="7.5" font-family="'Trebuchet MS', Arial, sans-serif" font-weight="900" letter-spacing="0.5">
                    <textPath href="#top-arc-print" startOffset="50%" text-anchor="middle">
                      ${settings.name.toUpperCase()}
                    </textPath>
                  </text>

                  <text fill="#0d47a1" font-size="5" font-family="'Trebuchet MS', Arial, sans-serif" font-weight="900" letter-spacing="0.3">
                    <textPath href="#bottom-arc-print" startOffset="50%" text-anchor="middle">
                      SITAPURA • SANGANER • JAIPUR • RAJASTHAN
                    </textPath>
                  </text>

                  <rect x="22" y="47" width="76" height="26" rx="3" fill="#ffffff" stroke="#c62828" stroke-width="2" transform="rotate(-3 60 60)" />
                  <text x="60" y="65" fill="#c62828" font-size="13" font-family="'Impact', 'Arial Black', sans-serif" font-weight="950" letter-spacing="1" text-anchor="middle" transform="rotate(-3 60 60)">
                    PAID
                  </text>

                  <circle cx="21" cy="60" r="1.5" fill="#0d47a1" />
                  <circle cx="99" cy="60" r="1.5" fill="#0d47a1" />
                </g>
              </svg>
            </div>
            <div class="sign-box">
              <div class="signature-line">Authorized Signatory</div>
              <div style="font-size: 8px; color: #94a3b8; font-weight: bold; margin-top: 3px;">SYSTEM GENERATED & VALID</div>
            </div>
          </div>

          <div class="watermark">
            Thank you for choosing ${settings.name}! • Generated on ${new Date().toLocaleDateString('en-IN')} via Smart Warden Portal.
          </div>
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => {
      w.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col overflow-hidden max-h-[92vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-155">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1A1A2E] text-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">Print Preview</span>
          <h4 className="text-sm font-black uppercase tracking-tight">Receipt #{payment.receipt}</h4>
        </div>

        {/* Inner receipt copy wrapper */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div ref={printableRef} className="border-[3px] border-double border-slate-700 rounded-2xl p-6 bg-white space-y-4 font-sans text-xs sm:text-sm shadow-xs">
            
            {/* Header section styled elegantly */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-2">
              <div>
                <h5 className="text-base font-black text-slate-900 tracking-tight leading-none">🏠 {settings.name}</h5>
                <p className="text-[10px] text-slate-500 mt-2 font-semibold line-clamp-2 max-w-[200px]">{settings.address}</p>
                <p className="text-[10px] text-[#FF6B35] font-bold mt-1">Phone: {settings.phone}</p>
              </div>
              <div className="text-right">
                <span className="inline-block text-[9px] font-extrabold text-[#FF6B35] bg-orange-50 border border-orange-100 px-2 py-1 rounded uppercase tracking-wider">OFFICIAL RECEIPT</span>
                <p className="font-mono text-[11px] font-bold text-slate-700 mt-2">No: #{payment.receipt}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{payment.date}</p>
              </div>
            </div>

            {/* Split Info Panels */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 text-[11px]">
                <span className="block text-[9px] font-extrabold text-slate-400 tracking-wider uppercase border-b border-dashed border-slate-200 pb-1">LODGER DETAILS (विवरण)</span>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Lodger:</span>
                  <span className="font-extrabold text-indigo-700">{payment.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Father:</span>
                  <span className="font-bold text-slate-700">{payment.fatherName ? `S/O ${payment.fatherName}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium font-sans">Assigned:</span>
                  <span className="font-extrabold text-[#FF6B35]">Room {payment.room}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 text-[11px]">
                <span className="block text-[9px] font-extrabold text-slate-400 tracking-wider uppercase border-b border-dashed border-slate-200 pb-1">VOUCHER (भुगतान)</span>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="font-extrabold text-emerald-600">★ SUCCESS ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-bold text-slate-800">{payment.paymentType === 'Installment' ? 'Installment' : 'Monthly Rent'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Mode:</span>
                  <span className="font-extrabold text-slate-755">{payment.mode}</span>
                </div>
              </div>
            </div>

            {/* Itemized Particulars table style representation */}
            <div className="border border-slate-150 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider font-extrabold">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Ref Detail</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-3 px-3">
                      <strong className="block text-slate-800 text-[11px] font-bold">
                        {payment.paymentType === 'Installment' ? 'Hostel Fee Installment Payment' : 'Hostel Monthly Rent Charge'}
                      </strong>
                      <span className="text-[9px] text-slate-400">Category: {payment.paymentType === 'Installment' ? 'Installment (किस्त)' : 'Monthly Rent (मासिक किराया)'}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-slate-600 text-[11px]">
                      {payment.paymentType === 'Installment' ? (payment.installmentNo || 'N/A') : (payment.month || 'Current Cycle')}
                    </td>
                    <td className="py-3 px-3 text-right font-black font-mono text-slate-900 text-[11px]">
                      ₹{payment.amount.toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                  {payment.note && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={3} className="py-2.5 px-3 text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700">Remarks (टिप्पणी):</span> {payment.note}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Premium received banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block">TOTAL RECEIVED & SECURED IN LEDGER</span>
              <span className="text-2xl font-black text-emerald-800 block mt-0.5">₹{payment.amount.toLocaleString('en-IN')}/-</span>
            </div>

            {/* Official Warden & Stamp Representation */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
              {/* Authentic Circular Rubber Stamp (गोल मोहर) */}
              <div className="relative flex items-center justify-center select-none" style={{ width: '110px', height: '110px' }}>
                <svg width="110" height="110" viewBox="0 0 120 120" className="overflow-visible" style={{ transform: 'rotate(-8deg)', opacity: 0.9 }}>
                  <filter id="distressed-ink-jsx">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <g filter="url(#distressed-ink-jsx)">
                    {/* Outer double borders */}
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#0d47a1" strokeWidth="2.5" />
                    <circle cx="60" cy="60" r="49" fill="none" stroke="#0d47a1" strokeWidth="1" strokeDasharray="2,2" />
                    <circle cx="60" cy="60" r="35" fill="none" stroke="#0d47a1" strokeWidth="1.5" />

                    <defs>
                      <path id="top-arc-jsx" d="M 16,60 A 44,44 0 0,1 104,60" fill="none" />
                      <path id="bottom-arc-jsx" d="M 104,60 A 44,44 0 0,1 16,60" fill="none" />
                    </defs>

                    {/* Top curved hostel name */}
                    <text fill="#0d47a1" fontSize="7.5" fontFamily="'Trebuchet MS', Arial, sans-serif" fontWeight="900" letterSpacing="0.5">
                      <textPath href="#top-arc-jsx" startOffset="50%" textAnchor="middle">
                        {settings.name.toUpperCase()}
                      </textPath>
                    </text>

                    {/* Bottom curved official seal text */}
                    <text fill="#0d47a1" fontSize="5" fontFamily="'Trebuchet MS', Arial, sans-serif" fontWeight="900" letterSpacing="0.3">
                      <textPath href="#bottom-arc-jsx" startOffset="50%" textAnchor="middle">
                        SITAPURA • SANGANER • JAIPUR • RAJASTHAN
                      </textPath>
                    </text>

                    {/* Center Paid Banner */}
                    <rect x="22" y="47" width="76" height="26" rx="3" fill="#ffffff" stroke="#c62828" strokeWidth="2" transform="rotate(-3 60 60)" />
                    <text x="60" y="65" fill="#c62828" fontSize="13" fontFamily="'Impact', 'Arial Black', sans-serif" fontWeight="950" letterSpacing="1" textAnchor="middle" transform="rotate(-3 60 60)">
                      PAID
                    </text>

                    <circle cx="21" cy="60" r="1.5" fill="#0d47a1" />
                    <circle cx="99" cy="60" r="1.5" fill="#0d47a1" />
                  </g>
                </svg>
              </div>

              <div className="text-right">
                <div className="inline-block border-t border-slate-300 w-32 pt-1.5 text-center font-sans">
                  <span className="text-[10px] text-slate-600 font-bold block leading-none">Authorized Signatory</span>
                  <span className="text-[8px] text-[#FF6B35] font-black block mt-0.5">STAMP & REVENUE APPROVED</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Actions panel */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold rounded-xl text-xs cursor-pointer transition active:scale-95"
          >
            Close preview
          </button>
          <button
            onClick={handleCopyText}
            className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border transition active:scale-95 shadow-xs ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-white hover:bg-gray-100 border-gray-200 text-slate-700'
            }`}
            title="Copy formatted receipt text representation so you can easily paste and edit it in Notepad"
          >
            <Copy className={`w-3.5 h-3.5 ${copied ? 'text-emerald-500' : 'text-slate-500'}`} />
            {copied ? 'Copied to clipboard! 📝' : 'Copy for Notepad 📁'}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Launch system printer
          </button>
        </div>

      </div>
    </div>
  );
}
