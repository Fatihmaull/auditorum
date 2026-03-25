"use client";

import { useCallback, useState, DragEvent, useRef } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label?: string;
  accept?: string;
}

export function FileUpload({
  onFileSelect,
  label = "Upload a file",
  accept,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? "border-brand-500 bg-brand-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          : fileName
          ? "border-emerald-500/50 bg-emerald-500/5 shadow-inner"
          : "border-dark-700 bg-dark-800 hover:border-brand-500/50 hover:bg-dark-700/50"
      } px-6 py-12 text-center`}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={accept}
        className="hidden"
      />

      {fileName ? (
        <>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <p className="text-sm font-bold text-white tracking-wide">{fileName}</p>
          <p className="mt-1 text-xs text-gray-500 uppercase tracking-widest font-bold opacity-60">Ready for Protocol Anchoring</p>
        </>
      ) : (
        <>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dark-700 text-gray-500 transition-all group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{label}</p>
          <p className="mt-2 text-xs text-gray-500 uppercase tracking-widest font-bold opacity-40">Drag & Drop or Click Engine</p>
        </>
      )}
    </div>
  );
}
