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
      className={`group cursor-pointer rounded-xl border-2 border-dashed transition-all ${
        isDragging
          ? "border-[#0B3D91] bg-blue-50"
          : fileName
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      } px-6 py-10 text-center`}
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
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <p className="text-sm font-medium text-gray-900">{fileName}</p>
          <p className="mt-1 text-xs text-gray-400">Click or drag to replace</p>
        </>
      ) : (
        <>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-xs text-gray-400">Drag & drop or click to browse</p>
        </>
      )}
    </div>
  );
}
