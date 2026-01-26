// PDF Uploader component with drag-and-drop functionality

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { validatePDFFile, formatFileSize } from "../utils/pdf-parser";
import "../styles.css";
import "../animations.css";

interface PDFUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing?: boolean;
}

export function PDFUploader({
  onFileSelected,
  isProcessing = false,
}: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    const validation = validatePDFFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="pdf-uploader">
      {!selectedFile && !isProcessing && (
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""} ${error ? "error" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          <div className="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3>Upload Training Plan PDF</h3>
          <p>Drag and drop your PDF file here, or click to browse</p>
          <span className="file-requirements">PDF files only, max 10MB</span>
        </div>
      )}

      {selectedFile && !isProcessing && (
        <div className="file-selected animate-scale-in">
          <div className="file-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M10 13h4M10 17h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="file-info">
            <h4>{selectedFile.name}</h4>
            <p>{formatFileSize(selectedFile.size)}</p>
          </div>

          <button
            onClick={handleReset}
            className="btn-remove"
            aria-label="Remove file"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="upload-error animate-slide-in-up">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .pdf-uploader {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .drop-zone {
          border: 3px dashed var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-3xl);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-base);
          background: var(--color-bg-elevated);
        }

        .drop-zone:hover {
          border-color: var(--color-accent);
          background: var(--color-bg-surface);
        }

        .drop-zone.dragging {
          border-color: var(--color-accent);
          background: var(--color-bg-surface);
          transform: scale(1.02);
          box-shadow: var(--shadow-glow);
        }

        .drop-zone.error {
          border-color: var(--color-error);
        }

        .upload-icon {
          color: var(--color-accent);
          margin-bottom: var(--space-lg);
          animation: bounce 2s ease-in-out infinite;
        }

        .drop-zone h3 {
          margin-bottom: var(--space-sm);
          color: var(--color-text-primary);
        }

        .drop-zone p {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-md);
        }

        .file-requirements {
          display: inline-block;
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          background: var(--color-bg-surface);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-full);
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-lg);
          background: var(--color-bg-elevated);
          border: 2px solid var(--color-success);
          border-radius: var(--radius-lg);
        }

        .file-icon {
          color: var(--color-success);
          flex-shrink: 0;
        }

        .file-info {
          flex: 1;
          text-align: left;
        }

        .file-info h4 {
          font-size: var(--text-base);
          font-family: var(--font-body);
          font-weight: var(--weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-xs);
          text-transform: none;
        }

        .file-info p {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          font-family: var(--font-mono);
          margin: 0;
        }

        .btn-remove {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: var(--color-error-bg);
          color: var(--color-error);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }

        .btn-remove:hover {
          background: var(--color-error);
          color: white;
          transform: scale(1.1);
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-top: var(--space-md);
          padding: var(--space-md);
          background: var(--color-error-bg);
          border: 1px solid var(--color-error);
          border-radius: var(--radius-md);
          color: var(--color-error);
          font-size: var(--text-sm);
        }
      `}</style>
    </div>
  );
}
