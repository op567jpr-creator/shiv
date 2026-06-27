import React from 'react';
import { LogIn, UserX, UserPlus, Inbox, Calendar, Clock } from 'lucide-react';
import { Visitor } from '../types';

interface VisitorManagementProps {
  visitors: Visitor[];
  onOpenAddVisitor: () => void;
}

export default function VisitorManagement({
  visitors,
  onOpenAddVisitor
}: VisitorManagementProps) {

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Header configurations */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <LogIn className="w-4.5 h-4.5 text-[#FF6B35]" />
          Warden Guest & Visitor Logs
        </h4>
        <button
          onClick={onOpenAddVisitor}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Log visitor entry
        </button>
      </div>

      {/* Visitor register */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-4.5 px-5">Visitor Name</th>
              <th className="py-4.5 px-5">Hostel Lodger</th>
              <th className="py-4.5 px-5">Relationship</th>
              <th className="py-4.5 px-5">Purpose of Visit</th>
              <th className="py-4.5 px-5">Contact Mobile</th>
              <th className="py-4.5 px-5">Log Date</th>
              <th className="py-4.5 px-5">Log Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-550 bg-white">
            {visitors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No guest or visitation entries logged in warden registers today.
                </td>
              </tr>
            ) : (
              visitors.slice().reverse().map((v, i) => (
                <tr key={v.id} className="hover:bg-[#FF6B35]/3 transition-colors">
                  {/* Visitor Name & Details */}
                  <td className="py-4 px-5">
                    <strong className="text-gray-800">{v.name}</strong>
                  </td>

                  {/* Lodger */}
                  <td className="py-4 px-5">
                    <div>
                      <h5 className="font-bold text-gray-700 leading-tight">{v.studentName}</h5>
                      <span className="text-[10px] text-gray-400 font-medium">Room {v.room}</span>
                    </div>
                  </td>

                  {/* Relation */}
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-600 font-bold text-[10px] uppercase">
                      {v.relation || 'Visitor'}
                    </span>
                  </td>

                  {/* Purpose */}
                  <td className="py-4 px-5 text-gray-600 font-medium">{v.purpose}</td>

                  {/* Mobile */}
                  <td className="py-4 px-5 text-gray-550 font-mono text-xs">{v.contact}</td>

                  {/* Date */}
                  <td className="py-4 px-5 text-gray-500 font-semibold text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {v.date}
                    </span>
                  </td>

                  {/* Time info */}
                  <td className="py-4 px-5 text-gray-500 font-semibold text-xs text-[#FF6B35]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {v.time}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
