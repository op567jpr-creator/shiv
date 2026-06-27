import React, { useState } from 'react';
import { ComplaintType, ComplaintPriority, Student } from '../types';

interface ComplaintFormProps {
  students: Student[];
  onSubmit: (data: { studentId: number; type: ComplaintType; priority: ComplaintPriority; description: string }) => void;
  onCancel: () => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
}

export default function ComplaintForm({ students, onSubmit, onCancel, onShowToast }: ComplaintFormProps) {
  const [studentId, setStudentId] = useState<number>(0);
  const [type, setType] = useState<ComplaintType>('WiFi');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [description, setDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId === 0 || !description) {
      const msg = 'Please select a student and provide a ticket description! ⚠️';
      setErrorMsg(msg);
      if (onShowToast) onShowToast(msg, true);
      return;
    }
    onSubmit({ studentId, type, priority, description });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 text-xs animate-fade-in">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Filer Lodger Name *</label>
        <select
          value={studentId}
          required
          onChange={e => setStudentId(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] bg-white cursor-pointer outline-none font-bold text-gray-800"
        >
          <option value="">Select Student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} (Room {s.room})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Issue Classification *</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as ComplaintType)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer"
          >
            <option value="WiFi">WiFi / Internet issue</option>
            <option value="Electricity">Electricity power / switches / fans</option>
            <option value="Plumbing">Water / plumbing leakage / taps</option>
            <option value="Cleaning">Housekeeping / sweep hygiene request</option>
            <option value="Other">Other general issues</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Warden Ticket Priority *</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as ComplaintPriority)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none bg-white cursor-pointer font-bold"
          >
            <option value="Low">Low - Schedule regular checks</option>
            <option value="Medium">Medium - Clear within 24 hours</option>
            <option value="High">High - Instant emergency fix</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Detailed description of complaint *</label>
        <textarea
          rows={3}
          required
          placeholder="Mention exact issue details (e.g. Wash basin faucet broken, Water smells rusty...)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white resize-none text-xs sm:text-sm"
        ></textarea>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-650 rounded-xl cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-amber-550 to-amber-600 text-white rounded-xl shadow-md cursor-pointer hover:shadow-amber-500/25 hover:shadow-lg"
        >
          Register Ticket
        </button>
      </div>
    </form>
  );
}
