import React, { useState } from 'react';
import { Search, UserPlus, Eye, Trash2, Filter, AlertCircle, PhoneCall, Info, Link, PenSquare } from 'lucide-react';
import { Student, RoomSharing, StudentStatus } from '../types';
import { getLiveAppUrl } from '../utils/url';
import ConfirmationModal from './ConfirmationModal';

interface StudentManagementProps {
  students: Student[];
  onDeleteStudent: (id: number) => void;
  onOpenAddStudent: () => void;
  onViewDetails: (student: Student) => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
  onEditStudent?: (student: Student) => void;
}

export default function StudentManagement({
  students,
  onDeleteStudent,
  onOpenAddStudent,
  onViewDetails,
  onShowToast,
  onEditStudent
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sharingFilter, setSharingFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.mobile.includes(searchTerm);
    
    const matchesSharing = sharingFilter === 'All' || s.sharing === sharingFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesSharing && matchesStatus;
  });

  const avatarColors = [
    'bg-[#FF6B35] text-white',
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-pink-600 text-white',
    'bg-blue-600 text-white'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search Input bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by student name, room or mobile..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition"
          />
        </div>

        {/* Filters and trigger Add CTA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sharing selector */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1.5 rounded-xl text-xs">
            <span className="text-gray-400 px-1 font-semibold">Sharing:</span>
            <select
              value={sharingFilter}
              onChange={e => setSharingFilter(e.target.value)}
              className="bg-transparent border-0 outline-none font-bold text-gray-700 cursor-pointer"
            >
              <option value="All">All types</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1.5 rounded-xl text-xs">
            <span className="text-gray-400 px-1 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 outline-none font-bold text-gray-700 cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Notice">Notice</option>
            </select>
          </div>

          <button
            onClick={() => {
              const link = getLiveAppUrl() + '?mode=student-form';
              navigator.clipboard.writeText(link);
              if (onShowToast) onShowToast('Admission Form Link copied! Send this to students to fill. 📋');
            }}
            className="px-4 py-2.5 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Link className="w-4 h-4" />
            Share Form
          </button>

          <button
            onClick={onOpenAddStudent}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add Register
          </button>
        </div>

      </div>

      {/* Structured Table of Data results */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-4.5 px-5">Student Details</th>
              <th className="py-4.5 px-5">Warden Room</th>
              <th className="py-4.5 px-5">Beds sharing</th>
              <th className="py-4.5 px-5">Contact & City</th>
              <th className="py-4.5 px-5 text-right">Fee due</th>
              <th className="py-4.5 px-5 text-center">Register Status</th>
              <th className="py-4.5 px-5 text-center">Action commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-550 bg-white">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No students in directory match filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, idx) => {
                const colorHex = avatarColors[idx % avatarColors.length];
                return (
                  <tr key={s.id} className="hover:bg-[#FF6B35]/3 transition-colors duration-150">
                    {/* Name block */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-150 shadow-sm relative">
                          {s.profilePic ? (
                            <img src={s.profilePic} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center font-bold text-sm tracking-tight ${colorHex}`}>
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-gray-800 leading-tight">{s.name}</h5>
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Joined: {s.joinDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* Room block */}
                    <td className="py-4 px-5 font-bold">
                      <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-100 text-[#FF6B35]">
                        Room {s.room}
                      </span>
                    </td>

                    {/* Bed style */}
                    <td className="py-4 px-5 font-medium text-gray-600">{s.sharing}</td>

                    {/* Primary Contacts & City */}
                    <td className="py-4 px-5">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <span className="bg-blue-50 text-blue-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded">Student</span>
                          <a href={`tel:${s.mobile}`} className="hover:underline">{s.mobile}</a>
                        </div>
                        {s.fatherMob && (
                          <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
                            <span className="bg-amber-50 text-amber-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded">Papa</span>
                            <a href={`tel:${s.fatherMob}`} className="hover:underline">{s.fatherMob}</a>
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <span className="text-gray-400">📍 City:</span>
                          <span className="text-gray-650 uppercase tracking-wide font-extrabold">{s.city || "Jaipur"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Out due fee */}
                    <td className="py-4 px-5 text-right font-black">
                      <span className={s.due > 0 ? "text-rose-600 bg-rose-50 px-2 py-1 rounded-md" : "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"}>
                        ₹{s.due.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        s.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-550 border border-emerald-250/30'
                          : 'bg-amber-50 text-amber-550 border border-amber-250/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onEditStudent && (
                          <button
                            onClick={() => onEditStudent(s)}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl cursor-pointer transition border border-amber-100"
                            title="Edit Student Profile Details"
                          >
                            <PenSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetails(s)}
                          className="p-2 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl cursor-pointer transition border border-sky-100"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(s)}
                          className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl cursor-pointer transition border border-rose-100"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
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
        isOpen={studentToDelete !== null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
          }
        }}
        title="Delete Student Record"
        message={`Remove records for student "${studentToDelete?.name || ''}"? This operation cannot be undone. All room and details history will be deleted.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
