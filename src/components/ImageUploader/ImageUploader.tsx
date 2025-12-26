'use client';

import { useRef, useState, useCallback } from 'react';
import styles from './ImageUploader.module.css';

const MAX_FILE_SIZE_KB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

/**
 * Resizes an image to be under the target size in bytes.
 * Uses iterative quality reduction and dimension scaling.
 */
async function resizeImageToTargetSize(
  file: File,
  targetSizeBytes: number = MAX_FILE_SIZE_BYTES
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      let width = img.width;
      let height = img.height;
      let quality = 0.9;
      const minQuality = 0.1;
      const qualityStep = 0.1;
      const scaleStep = 0.8;
      
      const attemptCompress = (): string => {
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for better compression (unless it's a PNG with transparency)
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        return canvas.toDataURL(mimeType, quality);
      };
      
      const getDataUrlSize = (dataUrl: string): number => {
        // Base64 encoding increases size by ~33%, so calculate actual bytes
        const base64 = dataUrl.split(',')[1];
        return base64 ? Math.ceil((base64.length * 3) / 4) : 0;
      };
      
      let result = attemptCompress();
      let currentSize = getDataUrlSize(result);
      
      // If already under target, return immediately
      if (currentSize <= targetSizeBytes) {
        resolve(result);
        return;
      }
      
      // First, try reducing quality
      while (currentSize > targetSizeBytes && quality > minQuality) {
        quality -= qualityStep;
        result = attemptCompress();
        currentSize = getDataUrlSize(result);
      }
      
      // If still too large, reduce dimensions iteratively
      while (currentSize > targetSizeBytes && width > 100 && height > 100) {
        width = Math.floor(width * scaleStep);
        height = Math.floor(height * scaleStep);
        quality = 0.8; // Reset quality for new dimensions
        
        result = attemptCompress();
        currentSize = getDataUrlSize(result);
        
        // Try reducing quality again at new dimensions
        while (currentSize > targetSizeBytes && quality > minQuality) {
          quality -= qualityStep;
          result = attemptCompress();
          currentSize = getDataUrlSize(result);
        }
      }
      
      console.log(`Image resized: ${file.name} - Original: ${(file.size / 1024).toFixed(1)}KB, Final: ${(currentSize / 1024).toFixed(1)}KB, Dimensions: ${width}x${height}`);
      resolve(result);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

export default function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const remaining = maxImages - images.length;
    const filesToProcess = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remaining);

    if (filesToProcess.length === 0) return;

    setIsProcessing(true);

    try {
      // Process all files with resizing
      const resizePromises = filesToProcess.map(file => resizeImageToTargetSize(file));
      const newImages = await Promise.all(resizePromises);
      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
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
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${isProcessing ? styles.processing : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className={styles.input}
            disabled={isProcessing}
          />
          <div className={styles.dropzoneContent}>
            {isProcessing ? (
              <>
                <span className={styles.spinner}></span>
                <p className={styles.text}>Optimizing images...</p>
              </>
            ) : (
              <>
                <span className={styles.icon}>+</span>
                <p className={styles.text}>
                  {images.length === 0 
                    ? 'Drop images here or click to upload' 
                    : `Add more (${images.length}/${maxImages})`}
                </p>
                <p className={styles.hint}>PNG, JPG — auto-optimized for best quality</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

