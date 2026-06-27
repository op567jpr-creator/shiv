import React, { useState } from 'react';
import { Landmark, Printer, Sparkles, Inbox, IndianRupee, CreditCard, Receipt, Search, Filter, Pencil, Trash2 } from 'lucide-react';
import { Payment, Student } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface PaymentManagementProps {
  payments: Payment[];
  students: Student[];
  onOpenReceivePayment: () => void;
  onPrintReceipt: (payment: Payment) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: number) => void;
}

export default function PaymentManagement({
  payments,
  students,
  onOpenReceivePayment,
  onPrintReceipt,
  onEditPayment,
  onDeletePayment
}: PaymentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [installmentFilter, setInstallmentFilter] = useState('All');
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Helper to map student installment type
  const getStudentInstallmentType = (studentId: number): string => {
    const student = students.find(s => s.id === studentId);
    return student?.installmentType || 'Monthly'; // Defaults to Monthly for legacy
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Cash':
        return <IndianRupee className="w-3.5 h-3.5 text-amber-600" />;
      case 'UPI':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receipt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.room.toLowerCase().includes(searchQuery.toLowerCase());

    const planMode = getStudentInstallmentType(p.studentId);
    const matchesInstallment = installmentFilter === 'All' || planMode === installmentFilter;

    return matchesSearch && matchesInstallment;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Receipt className="w-4.5 h-4.5 text-[#FF6B35]" />
            Fee Payment Ledger history
          </h4>
          <p className="text-[11px] text-gray-400 mt-1">Manage, search, and verify student ledger collection books</p>
        </div>
        <button
          onClick={onOpenReceivePayment}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Receive payment
        </button>
      </div>

      {/* SEARCH AND SEARCH-BY-CATEGORY CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150">
        <div className="relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wide">
            Search Lodger / Receipt
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Rahul Kumar, #RCPT-920, Room 102..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-[#FF6B35] rounded-xl outline-none font-medium text-xs sm:text-sm bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wide">
            Filter by Fee/Installment category (किस्त श्रेणी)
          </label>
          <div className="relative">
            <select
              value={installmentFilter}
              onChange={(e) => setInstallmentFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2 border border-gray-200 focus:border-[#FF6B35] rounded-xl outline-none bg-white cursor-pointer font-bold text-xs sm:text-sm text-gray-700 appearance-none"
            >
              <option value="All">All Installment Structures (सभी किश्त योजनाएं)</option>
              <option value="Monthly">Monthly Plan (12 Installments)</option>
              <option value="2 Installments">2 Installments Plan</option>
              <option value="3 Installments">3 Installments Plan</option>
              <option value="4 Installments">4 Installments Plan</option>
              <option value="6 Installments">6 Installments Plan</option>
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <div className="absolute right-3.5 top-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-4.5 px-5">Receipt Code</th>
              <th className="py-4.5 px-5">Student / Contact details</th>
              <th className="py-4.5 px-5">Installment Plan</th>
              <th className="py-4.5 px-5">Amount Collected</th>
              <th className="py-4.5 px-5">Payment Mode</th>
              <th className="py-4.5 px-5">Fee Period</th>
              <th className="py-4.5 px-5">Logged Date</th>
              <th className="py-4.5 px-5 text-center">Actions & Correction (संशोधन)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 bg-white">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No payments matched your search query & installment filters.
                </td>
              </tr>
            ) : (
              filteredPayments.slice().reverse().map((p) => {
                const planType = getStudentInstallmentType(p.studentId);
                return (
                  <tr key={p.id} className="hover:bg-[#FF6B35]/3 transition-all">
                    {/* Code */}
                    <td className="py-4 px-5 font-mono text-gray-700 font-extrabold text-xs">
                      #{p.receipt}
                    </td>
                    
                    {/* Name info */}
                    <td className="py-4 px-5">
                      <div>
                        <h5 className="font-extrabold text-gray-800 leading-tight">{p.studentName}</h5>
                        <span className="text-[10px] text-gray-400 font-medium tracking-wide">assigned room: {p.room}</span>
                      </div>
                    </td>

                    {/* Installment Plan Badge */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 text-[10px] font-black rounded-full bg-orange-50 text-[#FF6B35] border border-orange-100 uppercase tracking-widest">
                        {planType}
                      </span>
                    </td>

                    {/* amount accumulated */}
                    <td className="py-4 px-5">
                      <span className="text-xs sm:text-sm font-black text-emerald-600">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* mode */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gray-50 border border-gray-100 rounded-lg text-gray-700">
                        {getModeIcon(p.mode)}
                        {p.mode}
                      </span>
                    </td>

                    {/* period */}
                    <td className="py-4 px-5 font-bold text-gray-700">
                      {p.month ? (
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-[#FF6B35] font-mono text-xs">
                          {p.month}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 text-gray-500 font-medium">
                      {p.date}
                    </td>

                    {/* Actions and Corrections */}
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintReceipt(p)}
                          title="Print Receipt Copy"
                          className="px-2 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-1 text-xs font-bold font-sans"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        
                        <button
                          onClick={() => onEditPayment(p)}
                          title="Correct Receipt Details (रसीद संशोधन)"
                          className="px-2 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-1 text-xs font-bold font-sans"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </button>

                        <button
                          onClick={() => setPaymentToDelete(p)}
                          title="Void / Delete Receipt Log"
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-150 border border-rose-100 rounded-lg cursor-pointer transition active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={paymentToDelete !== null}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={() => {
          if (paymentToDelete) {
            onDeletePayment(paymentToDelete.id);
          }
        }}
        title="Void / Delete Receipt Log"
        message={`⚠️ WARNING: Are you sure you want to VOID/DELETE receipt #${paymentToDelete?.receipt || ''}? This will deduct ₹${paymentToDelete?.amount || 0} from student '${paymentToDelete?.studentName || ''}' paid fee record and add it back to their dues!`}
        confirmText="Yes, Void / Delete Receipt"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
