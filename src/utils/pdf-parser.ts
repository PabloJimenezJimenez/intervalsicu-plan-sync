// PDF file handling utilities

import type { PDFFile, PDFMetadata } from '../types/api';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPE = 'application/pdf';

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (file.type !== ACCEPTED_FILE_TYPE) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF file.',
    };
  }

  // Check file size
  if (file.size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_PDF_SIZE / 1024 / 1024}MB limit.`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }

  return { valid: true };
}

/**
 * Convert PDF File to base64 string
 */
export function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extract metadata from PDF file
 */
export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  return {
    filename: file.name,
    sizeBytes: file.size,
    // Page count would require a PDF parsing library
    // For simplicity, we'll omit it in this client-only implementation
  };
}

/**
 * Process PDF file for upload
 */
export async function processPDFFile(file: File): Promise<PDFFile> {
  const validation = validatePDFFile(file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64 = await pdfToBase64(file);

  return {
    file,
    filename: file.name,
    size: file.size,
    base64,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
