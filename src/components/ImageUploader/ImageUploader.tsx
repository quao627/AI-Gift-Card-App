'use client';

import { useRef, useState, useCallback } from 'react';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const remaining = maxImages - images.length;
    const filesToProcess = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remaining);

    if (filesToProcess.length === 0) return;

    // Read all files and collect results before updating state
    const readPromises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newImages => {
      onImagesChange([...images, ...newImages]);
    });
  }, [images, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeImage = useCallback((index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  const canAddMore = images.length < maxImages;

  return (
    <div className={styles.container}>
      {images.length > 0 && (
        <div className={styles.preview}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageWrapper}>
              <img src={img} alt={`Upload ${index + 1}`} className={styles.image} />
              <button 
                className={styles.removeBtn}
                onClick={() => removeImage(index)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className={styles.input}
          />
          <div className={styles.dropzoneContent}>
            <span className={styles.icon}>+</span>
            <p className={styles.text}>
              {images.length === 0 
                ? 'Drop images here or click to upload' 
                : `Add more (${images.length}/${maxImages})`}
            </p>
            <p className={styles.hint}>PNG, JPG up to 10MB each</p>
          </div>
        </div>
      )}
    </div>
  );
}

