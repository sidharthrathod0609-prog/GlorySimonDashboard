import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-700 dark:text-gray-300 outline-none cursor-pointer flex items-center justify-between text-left focus:border-[#A8B89A] focus:ring-1 focus:ring-[#A8B89A]/25 transition-all text-xs"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-[#A8B89A]/10 text-[#8AA17A] dark:text-[#A8B89A] font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
