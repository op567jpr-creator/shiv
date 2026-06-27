import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'danger'
}: ConfirmationModalProps) {
  const colorMap = {
    danger: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      iconBg: 'bg-rose-100 text-rose-600',
      btn: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white shadow-rose-200'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      iconBg: 'bg-amber-100 text-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white shadow-amber-200'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      iconBg: 'bg-blue-100 text-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-blue-200'
    }
  };

  const style = colorMap[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-slate-100 p-6 flex flex-col gap-4"
          >
            {/* Header / Icon */}
            <div className="flex gap-4 items-start">
              <div className={`p-3 rounded-2xl ${style.iconBg} flex-shrink-0`}>
                {type === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                  {title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {message}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition cursor-pointer shadow-md ${style.btn}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
