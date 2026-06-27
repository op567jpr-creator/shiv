import React, { useState } from 'react';
import { 
  Zap, Calendar, Users, Search, Calculator, FileText, CheckCircle2, 
  TrendingUp, PlusCircle, History, Info, AlertCircle, Copy, Check
} from 'lucide-react';
import { Student } from '../types';

interface ElectricityManagementProps {
  students: Student[];
  onUpdateStudentElectricity: (
    studentId: number, 
    newReading: number, 
    readingDate: string, 
    billAmount: number, 
    addToDues: boolean,
    historyJsonStr: string
  ) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function ElectricityManagement({ 
  students, 
  onUpdateStudentElectricity,
  onShowToast 
}: ElectricityManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Modal Fields
  const [currentReadingInput, setCurrentReadingInput] = useState('');
  const [rateInput, setRateInput] = useState('10');
  const [readingDateInput, setReadingDateInput] = useState(new Date().toLocaleDateString('en-IN'));
  const [shouldAddToDues, setShouldAddToDues] = useState(true);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<Student | null>(null);

  // Filter out active students
  const activeStudents = students.filter(s => s.status === 'Active');

  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.room && s.room.toString().includes(searchTerm))
  );

  const handleOpenReadingModal = (student: Student) => {
    setSelectedStudent(student);
    setCurrentReadingInput('');
    setRateInput(student.elecRatePerUnit?.toString() || '10');
    setReadingDateInput(new Date().toLocaleDateString('en-IN'));
    setShouldAddToDues(true);
    setIsReadingModalOpen(true);
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const prevReading = selectedStudent.elecLastReading || 0;
    const currentReading = parseFloat(currentReadingInput);
    const rate = parseFloat(rateInput);

    if (isNaN(currentReading) || currentReading < prevReading) {
      onShowToast(`New reading must be greater than or equal to previous reading (${prevReading} units)! ⚠️`, true);
      return;
    }

    if (isNaN(rate) || rate <= 0) {
      onShowToast('Please enter a valid rate per unit! ⚠️', true);
      return;
    }

    const consumedUnits = currentReading - prevReading;
    const billAmount = Math.round(consumedUnits * rate);

    // Save history
    let existingHistory: any[] = [];
    try {
      if (selectedStudent.elecHistoryJson) {
        existingHistory = JSON.parse(selectedStudent.elecHistoryJson);
      }
    } catch (e) {
      console.error(e);
    }

    const newHistoryRecord = {
      date: readingDateInput,
      prevReading,
      currentReading,
      consumedUnits,
      rate,
      amount: billAmount,
      addedToDues: shouldAddToDues,
      recordedAt: new Date().toISOString()
    };

    const newHistory = [newHistoryRecord, ...existingHistory];
    const newHistoryStr = JSON.stringify(newHistory);

    onUpdateStudentElectricity(
      selectedStudent.id,
      currentReading,
      readingDateInput,
      billAmount,
      shouldAddToDues,
      newHistoryStr
    );

    setIsReadingModalOpen(false);
    setSelectedStudent(null);
  };

  const parseHistory = (jsonStr?: string): any[] => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Upper overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] p-5 rounded-2xl text-white border border-[#FF6B35]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-gray-300">Meter Management</span>
            <Zap className="w-5 h-5 text-[#FF6B35] animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black">{activeStudents.length} Active Rooms</h3>
          <p className="text-[10px] text-gray-400 mt-1">Every lodging unit is mapped to a dedicated digital sub-meter.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Average Billing Rate</span>
            <Calculator className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-800">₹10 / Unit</h3>
          <p className="text-[10px] text-gray-400 mt-1">Warden configuration standard tariff rates for Sanganer Campus.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Recent Bills Generated</span>
            <TrendingUp className="w-5 h-5 text-emerald-505 text-emerald-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-800">
            {students.filter(s => (parseHistory(s.elecHistoryJson).length > 0)).length} Students Logged
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">Meter readings are usually collected at 2 to 3 month intervals.</p>
        </div>
      </div>

      {/* Directory & Actions Layout */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
          <div>
            <h4 className="text-base font-black text-gray-800 tracking-tight">Student Electric Sub-Meters (बिजली बिल रिकॉर्डर)</h4>
            <p className="text-xs text-gray-400">Record last and current readings to generate bills. Bill is added directly to dues.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, room number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm transition placeholder-gray-400"
            />
          </div>
        </div>

        {/* Meter reading table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Student & Room</th>
                <th className="py-3 px-4">Last Meter Reading</th>
                <th className="py-3 px-4">Last Reading Date</th>
                <th className="py-3 px-4">Standard Rate</th>
                <th className="py-3 px-4">Billing History</th>
                <th className="py-3 px-4 text-right">Quick Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-405 font-medium">
                    No active students found matching search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const history = parseHistory(student.elecHistoryJson);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7.5 h-7.5 rounded-lg bg-orange-50 text-[#FF6B35] font-black flex items-center justify-center text-[10px]">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-800 block text-xs sm:text-sm leading-tight">{student.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Room {student.room} • {student.sharing} sharing</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {student.elecLastReading || 0} Units
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium font-sans">
                        {student.elecLastReadingDate || 'First Entry'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600 font-semibold">
                        ₹{student.elecRatePerUnit || 10} / unit
                      </td>
                      <td className="py-3.5 px-4">
                        {history.length > 0 ? (
                          <button
                            onClick={() => setSelectedHistoryStudent(student)}
                            className="text-[10px] text-[#FF6B35] font-bold hover:underline flex items-center gap-1 bg-orange-50/50 border border-orange-100/50 px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                          >
                            <History className="w-3 h-3" />
                            <span>View {history.length} Bills</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400">No logs yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenReadingModal(student)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-[#FF6B35] to-[#f45417] text-white font-extrabold rounded-lg text-[11px] cursor-pointer shadow-xs active:scale-95 transition flex items-center gap-1.5 ml-auto text-center"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Record Meter</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record reading modal */}
      {isReadingModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4 bg-orange-50/30 p-2.5 rounded-xl border border-orange-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center"><Zap className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-black text-gray-800">New Meter Reading Entry</h4>
                  <p className="text-[10px] text-gray-400">Student: {selectedStudent.name} (Room {selectedStudent.room})</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsReadingModalOpen(false);
                  setSelectedStudent(null);
                }} 
                className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReading} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <span className="text-[10px] text-gray-400 block font-semibold mb-0.5">Last Record Reading</span>
                  <span className="font-mono font-bold text-gray-800 text-sm sm:text-base block">{selectedStudent.elecLastReading || 0} Units</span>
                  <span className="text-[9px] text-gray-400 mt-1 block">Date: {selectedStudent.elecLastReadingDate || 'First'}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Reading Date</label>
                  <input
                    type="text"
                    value={readingDateInput}
                    onChange={e => setReadingDateInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs font-semibold"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">New/Current Meter Reading Reading (वर्तमान मीटर रीडिंग) *</label>
                <input
                  type="number"
                  step="any"
                  value={currentReadingInput}
                  onChange={e => setCurrentReadingInput(e.target.value)}
                  required
                  placeholder={`Must be >= ${selectedStudent.elecLastReading || 0}`}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Tariff Rate Per Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rateInput}
                    onChange={e => setRateInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:border-[#FF6B35] outline-none text-xs sm:text-sm font-bold font-mono"
                  />
                </div>

                <div className="bg-orange-50/70 p-3 rounded-xl border border-[#FF6B35]/15 text-xs">
                  <span className="text-[10px] text-orange-600 block font-bold mb-0.5 uppercase tracking-wide">Calculated Charges</span>
                  <span className="font-extrabold text-orange-950 text-sm sm:text-base block">
                    {(() => {
                      const prev = selectedStudent.elecLastReading || 0;
                      const curr = parseFloat(currentReadingInput) || 0;
                      const r = parseFloat(rateInput) || 0;
                      const cons = Math.max(0, curr - prev);
                      return `₹${Math.round(cons * r).toLocaleString('en-IN')}`;
                    })()}
                  </span>
                  <span className="text-[9px] text-orange-500 font-medium block mt-0.5">
                    {(() => {
                      const prev = selectedStudent.elecLastReading || 0;
                      const curr = parseFloat(currentReadingInput) || 0;
                      const cons = Math.max(0, curr - prev);
                      return `${Math.round(cons)} Units used`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Add to dues ledger tick checkbox */}
              <label className="p-3 bg-emerald-50/40 border border-emerald-500/15 rounded-xl cursor-pointer flex items-center justify-between transition hover:bg-emerald-50/80">
                <div className="flex-1 pr-2">
                  <span className="text-xs font-black block text-emerald-800">Add directly to student dues account list</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">This adds calculated charges directly to outstanding student due balance.</span>
                </div>
                <input
                  type="checkbox"
                  checked={shouldAddToDues}
                  onChange={e => setShouldAddToDues(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsReadingModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-gray-55 hover:bg-gray-100 rounded-lg font-bold border cursor-pointer text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#FF6B35] to-[#f45417] text-white font-bold rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition active:scale-95"
                >
                  Submit Read & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History view modal */}
      {selectedHistoryStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 bg-gray-50 p-2 rounded-xl">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#FF6B35]" />
                <div>
                  <h4 className="text-sm font-black text-gray-800 leading-tight">Complete Electricity Billing History</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Student Room: {selectedHistoryStudent.room}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedHistoryStudent(null)} 
                className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 font-bold cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {parseHistory(selectedHistoryStudent.elecHistoryJson).map((record, index) => (
                <div key={index} className="p-3 bg-gray-50 hover:bg-orange-50/10 border border-gray-200 rounded-xl text-xs space-y-1.5 transition">
                  <div className="flex justify-between items-center bg-white p-1 pb-1.5 px-2 rounded-lg border border-gray-100">
                    <span className="font-extrabold text-[#FF6B35]">Date Recorded: {record.date}</span>
                    <span className="text-[10px] font-black font-mono text-orange-950">
                      ₹{record.amount?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-gray-500 font-semibold font-mono">
                    <div>
                      <span className="text-gray-400 block leading-tight">Prev Meter:</span>
                      <span className="text-gray-850 font-bold block mt-0.5">{record.prevReading} Units</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block leading-tight">Curr Meter:</span>
                      <span className="text-gray-850 font-bold block mt-0.5">{record.currentReading} Units</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block leading-tight">Consumption:</span>
                      <span className="text-emerald-600 font-bold block mt-0.5">+{record.consumedUnits} Units</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block leading-tight">LEDGER STATUS:</span>
                      <span className={`font-bold block mt-0.5 uppercase tracking-wide text-[9px] ${record.addedToDues ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {record.addedToDues ? 'Added to Dues' : 'Settle Handover'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedHistoryStudent(null)}
                className="px-5 py-2 bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition active:scale-95"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
