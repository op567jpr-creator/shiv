import React, { useState } from 'react';
import { Layers, Hotel, HelpCircle, Check, Users, ShieldAlert, DoorOpen, X } from 'lucide-react';
import { Student } from '../types';

interface RoomManagementProps {
  students: Student[];
}

export default function RoomManagement({ students }: RoomManagementProps) {
  const [activeFloor, setActiveFloor] = useState<'all' | 'G' | '1' | '2'>('all');
  const [selectedRoom, setSelectedRoom] = useState<{ roomNum: string; curOccupancy: Student[]; capacity: number } | null>(null);

  const floors = [
    { name: 'Ground Floor Units (101-112)', prefix: '1', count: 12, start: 101, label: 'G' },
    { name: 'First Floor Units (201-213)', prefix: '2', count: 13, start: 201, label: '1' },
    { name: 'Second Floor Units (301-311)', prefix: '3', count: 11, start: 301, label: '2' }
  ];

  // Helper to determine capacity based on standard prefix structure
  const getRoomCapacity = (roomNum: string): number => {
    // Check if any student matches this room and get their sharing type to be robust
    const match = students.find(s => s.room === roomNum);
    if (match) {
      if (match.sharing === 'Single') return 1;
      if (match.sharing === 'Double') return 2;
      return 3;
    }
    // Default capacity based on room code
    const roomInt = parseInt(roomNum);
    if (!isNaN(roomInt)) {
      if (roomInt >= 101 && roomInt <= 112) return 3; // Ground rooms are mostly triples
      if (roomInt % 3 === 0) return 1; // Arbitrary rule to distribute varieties
      return 2;
    }
    return 2;
  };

  const handleRoomClick = (roomNum: string, curOccupancy: Student[], capacity: number) => {
    setSelectedRoom({ roomNum, curOccupancy, capacity });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Legend Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-[#FF6B35]" />
            Visual Campus Occupancy Map
          </h4>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-medium">Click on any room node block below to view assigned students and details.</p>
        </div>

        {/* Floor selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-150 rounded-xl self-start">
          {(['all', 'G', '1', '2'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                activeFloor === f 
                  ? 'bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
              }`}
            >
              {f === 'all' ? 'All Floors' : f === 'G' ? 'Ground' : `Floor ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Legend categories */}
      <div className="flex items-center gap-5 text-xs text-gray-500 p-3 bg-gray-50 rounded-2xl border border-gray-100">
        <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Map Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-500 text-emerald-600 block"></span>
          <span>Vacant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-500 text-amber-600 block"></span>
          <span>Half Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-500 text-rose-600 block"></span>
          <span>Fully Booked</span>
        </div>
      </div>

      {/* Floor Mapping grids */}
      <div className="space-y-8">
        {floors
          .filter(f => activeFloor === 'all' || activeFloor === f.label)
          .map((f, idx) => {
            return (
              <div key={idx} className="space-y-4">
                <h5 className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-2">
                  <Hotel className="w-4.5 h-4.5 text-[#FF6B35]" />
                  {f.name}
                </h5>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {Array.from({ length: f.count }).map((_, rIdx) => {
                    const roomNum = String(f.start + rIdx);

                    const curOccupancy = students.filter(s => s.room === roomNum);
                    const capacity = getRoomCapacity(roomNum);
                    
                    let bgStyle = 'bg-emerald-50/75 border-emerald-500/30 text-emerald-600';
                    let statusLabel = 'Vacant';
                    
                    if (curOccupancy.length >= capacity) {
                      bgStyle = 'bg-rose-50/75 border-rose-500/30 text-rose-600';
                      statusLabel = 'Full';
                    } else if (curOccupancy.length > 0) {
                      bgStyle = 'bg-amber-50/75 border-amber-500/30 text-amber-600';
                      statusLabel = `${curOccupancy.length}/${capacity}`;
                    }

                    return (
                      <button
                        key={roomNum}
                        onClick={() => handleRoomClick(roomNum, curOccupancy, capacity)}
                        className={`p-4 rounded-xl border text-center transition-all hover:scale-102 hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${bgStyle}`}
                      >
                        <h6 className="text-[#1A1A2E] text-sm font-black leading-none">{roomNum}</h6>
                        <span className="text-[10px] uppercase font-bold mt-2">{statusLabel}</span>
                        <div className="flex items-center justify-center gap-1 mt-1 text-gray-400">
                          {statusLabel === 'Vacant' ? (
                            <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                          ) : statusLabel === 'Full' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Modern Room Detail Overlay Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] p-5 text-white flex items-center justify-between">
              <div>
                <h5 className="font-extrabold text-sm sm:text-base leading-tight">Room {selectedRoom.roomNum} Details</h5>
                <span className="text-[10px] text-[#D4AF37] font-bold">Total Active Students: {selectedRoom.curOccupancy.filter(s => s.status === 'Active').length}</span>
              </div>
              <button 
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              {selectedRoom.curOccupancy.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-505 mx-auto">
                    <DoorOpen className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h6 className="font-bold text-gray-800">Unit is completely vacant!</h6>
                    <p className="text-gray-400 text-[11px] mt-1">Ready for check-in registrations or sharing swaps.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block">Currently Lodging ({selectedRoom.curOccupancy.length})</span>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {selectedRoom.curOccupancy.map((s, idx) => (
                      <div key={s.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-3 hover:bg-orange-50/20 hover:border-orange-200 transition">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#FF6B35]">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 block text-xs sm:text-sm">{s.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{s.mobile} • {s.sharing} sharing</span>
                          </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 font-black' : 'bg-rose-50 text-rose-600 font-black'}`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white rounded-xl text-xs font-bold shadow-md shadow-gray-200 cursor-pointer hover:shadow-lg active:scale-95 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
