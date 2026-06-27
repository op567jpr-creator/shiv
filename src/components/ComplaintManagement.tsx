import React, { useState } from 'react';
import { Hammer, CheckCircle, Clock, Plus, Inbox, AlertTriangle } from 'lucide-react';
import { Complaint } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface ComplaintManagementProps {
  complaints: Complaint[];
  onResolveComplaint: (id: number) => void;
  onOpenAddComplaint: () => void;
}

export default function ComplaintManagement({
  complaints,
  onResolveComplaint,
  onOpenAddComplaint
}: ComplaintManagementProps) {
  const [complaintToResolve, setComplaintToResolve] = useState<Complaint | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Header operations */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <Hammer className="w-4.5 h-4.5 text-[#FF6B35]" />
          Maintenance & Repair Logs
        </h4>
        <button
          onClick={onOpenAddComplaint}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          File complaint
        </button>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-4.5 px-5">Ticket #</th>
              <th className="py-4.5 px-5">Classification</th>
              <th className="py-4.5 px-5">Lodger / Room</th>
              <th className="py-4.5 px-5">Detailed Description</th>
              <th className="py-4.5 px-5">Priority</th>
              <th className="py-4.5 px-5">Filed Date</th>
              <th className="py-4.5 px-5 text-center">Ticket Status</th>
              <th className="py-4.5 px-5 text-center">Resolving commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-550 bg-white">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No student complaints registered in system sheets yet.
                </td>
              </tr>
            ) : (
              complaints.slice().reverse().map((c) => {
                const isPending = c.status === 'Pending';
                
                return (
                  <tr key={c.id} className="hover:bg-[#FF6B35]/3 transition-colors">
                    {/* Ticket Code */}
                    <td className="py-4 px-5 font-mono text-gray-700 font-extrabold text-xs">
                      {c.ticket}
                    </td>

                    {/* Type */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs capitalize">
                        {c.type}
                      </span>
                    </td>

                    {/* Lodger info */}
                    <td className="py-4 px-5">
                      <div>
                        <h5 className="font-extrabold text-gray-800 leading-tight">{c.studentName}</h5>
                        <span className="text-[10px] text-gray-400 font-medium">Room {c.room}</span>
                      </div>
                    </td>

                    {/* Description details */}
                    <td className="py-4 px-5 text-xs text-gray-600 max-w-xs truncate" title={c.description}>
                      {c.description}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wide ${
                        c.priority === 'High' 
                          ? 'bg-rose-50 text-rose-550' 
                          : c.priority === 'Medium'
                          ? 'bg-amber-50 text-[#e6a800]'
                          : 'bg-indigo-50 text-indigo-500'
                      }`}>
                        {c.priority}
                      </span>
                    </td>

                    {/* Log Date */}
                    <td className="py-4 px-5 text-gray-500 font-medium">{c.date}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPending 
                          ? 'bg-rose-50 text-rose-500 border border-rose-250/30' 
                          : 'bg-emerald-50 text-emerald-550 border border-emerald-250/30'
                      }`}>
                        {isPending ? <Clock className="w-3 h-3 text-rose-500 font-bold" /> : <CheckCircle className="w-3 h-3 text-emerald-500 font-bold" />}
                        {c.status}
                      </span>
                    </td>

                     {/* Resolver commands */}
                    <td className="py-4 px-5 text-center">
                      {isPending ? (
                        <button
                          onClick={() => setComplaintToResolve(c)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-xl cursor-pointer transition active:scale-95 text-xs font-bold"
                          title="Click to resolve and clear"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-gray-400 font-extrabold text-xs">✓ Cleared</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={complaintToResolve !== null}
        onClose={() => setComplaintToResolve(null)}
        onConfirm={() => {
          if (complaintToResolve) {
            onResolveComplaint(complaintToResolve.id);
          }
        }}
        title="Resolve Complaint"
        message={`Approve resolve status for ticket #${complaintToResolve?.ticket || ''}?`}
        confirmText="Yes, Resolve"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
