// JSON Uploader component with drag-and-drop functionality

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { validateJSONFile, formatFileSize } from "../utils/json-parser";
import "../styles.css";
import "../animations.css";

interface JSONUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing?: boolean;
}

export function JSONUploader({
  onFileSelected,
  isProcessing = false,
}: JSONUploaderProps) {
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

    const validation = validateJSONFile(file);
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
    <div className="json-uploader">
      {!selectedFile && !isProcessing && (
        <div
          className={`drop-zone json-drop-zone ${isDragging ? "dragging" : ""} ${error ? "error" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          <div className="upload-icon json-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 15c0 1 .5 2 2 2s2-1 2-2-.5-1-2-1-2 0-2 1z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>

          <h3>Upload Training Plan JSON</h3>
          <p>Drag and drop your JSON file here, or click to browse</p>
          <span className="file-requirements">JSON files only, max 5MB</span>
        </div>
      )}

      {selectedFile && !isProcessing && (
        <div className="file-selected animate-scale-in">
          <div className="file-icon json-file-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6"
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
        .json-uploader {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .json-drop-zone {
          border: 3px dashed var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-3xl);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-base);
          background: var(--color-bg-elevated);
        }

        .json-drop-zone:hover {
          border-color: var(--color-success);
          background: var(--color-bg-surface);
        }

        .json-drop-zone.dragging {
          border-color: var(--color-success);
          background: var(--color-bg-surface);
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }

        .json-drop-zone.error {
          border-color: var(--color-error);
        }

        .json-icon {
          color: var(--color-success);
          margin-bottom: var(--space-lg);
          animation: bounce 2s ease-in-out infinite;
        }

        .json-drop-zone h3 {
          margin-bottom: var(--space-sm);
          color: var(--color-text-primary);
        }

        .json-drop-zone p {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-md);
        }

        .json-file-icon {
          color: var(--color-success);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
