import { useState, useCallback, useRef } from 'react';

export interface UseFileDropOptions {
  onFileSelect: (file: File) => void | Promise<void>;
  multiple?: boolean;
  onFilesSelect?: (files: File[]) => void | Promise<void>;
}

export function useFileDrop({ onFileSelect, multiple = false, onFilesSelect }: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      if (multiple && onFilesSelect) {
        onFilesSelect(files);
      } else if (files[0]) {
        onFileSelect(files[0]);
      }
    },
    [multiple, onFileSelect, onFilesSelect]
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length === 0) return;
      if (multiple && onFilesSelect) {
        onFilesSelect(files);
      } else if (files[0]) {
        onFileSelect(files[0]);
      }
      e.target.value = '';
    },
    [multiple, onFileSelect, onFilesSelect]
  );

  return {
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFilePicker,
    handleFileInputChange,
  };
}
