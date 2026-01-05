"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const selected = options.find((opt) => opt.value === value);
    if (selected) {
    }
  }, [value, options]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="relative cursor-pointer group"
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            setSearch("");
          } else {
            setIsOpen(false);
          }
        }}
      >
        <div className={`w-full p-3 pl-10 pr-8 bg-white border rounded-lg text-sm font-medium flex items-center justify-between transition-all ${isOpen ? 'border-olympic-blue ring-2 ring-olympic-blue/20' : 'border-slate-200 group-hover:border-slate-300'}`}>
           <span className={`truncate ${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
             {selectedOption ? selectedOption.label : placeholder}
           </span>
           <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        <div className="absolute left-3 top-3.5 pointer-events-none text-slate-400">
          {icon}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                autoFocus
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-olympic-blue focus:ring-1 focus:ring-olympic-blue"
                placeholder="Digite para buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${
                    value === opt.value
                      ? "bg-olympic-blue/10 text-olympic-blue font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
