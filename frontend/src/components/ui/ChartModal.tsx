"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Maximize2 } from "lucide-react";

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ChartModal({ isOpen, onClose, title, subtitle, children }: ChartModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />
      
      <div 
        className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-olympic-blue to-blue-600 flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors group"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-auto min-h-0">
          <div className="w-full h-full min-h-[500px]">
            {children}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-xs text-slate-400 text-center">
            Pressione <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono text-[10px]">ESC</kbd> ou clique fora para fechar
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface MaximizeButtonProps {
  onClick: () => void;
  label?: string;
}

export function MaximizeButton({ onClick, label }: MaximizeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-slate-100 transition-all group flex items-center gap-1.5"
      title={label || "Expandir gráfico"}
    >
      <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
      <span className="text-xs text-slate-400 group-hover:text-slate-600 hidden sm:inline">
        {label || "Expandir"}
      </span>
    </button>
  );
}
