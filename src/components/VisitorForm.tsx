import React, { useState } from 'react';
import { Student } from '../types';

interface VisitorFormProps {
  students: Student[];
  onSubmit: (data: { name: string; contact: string; studentId: number; purpose: string; relation: string }) => void;
  onCancel: () => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
}

export default function VisitorForm({ students, onSubmit, onCancel, onShowToast }: VisitorFormProps) {
  const [name, setName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [studentId, setStudentId] = useState<number>(0);
  const [purpose, setPurpose] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || studentId === 0 || !purpose) {
      const msg = 'Please fill out Name, Contact, Hosting Student, and Purpose fields! ⚠️';
      setErrorMsg(msg);
      if (onShowToast) onShowToast(msg, true);
      return;
    }
    onSubmit({ name, contact, studentId, purpose, relation });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2 text-xs">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Visitor Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Suresh Verma"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact Mobile *</label>
          <input
            type="tel"
            required
            maxLength={10}
            placeholder="e.g. 10 digit number"
            value={contact}
            onChange={e => setContact(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hosting Student *</label>
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
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Relation with Student</label>
          <input
            type="text"
            placeholder="e.g. Father, Uncle, Friend"
            value={relation}
            onChange={e => setRelation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Purpose of Visit *</label>
        <textarea
          rows={2}
          required
          placeholder="Mention brief purpose (e.g. Paying fee, delivering clothes...)"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none transition bg-white resize-none"
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
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl shadow-md cursor-pointer hover:shadow-emerald-600/25 hover:shadow-lg"
        >
          Log Entry
        </button>
      </div>
    </form>
  );
}
