'use client';

import { useState } from 'react';
import styles from './CardGenerator.module.css';

interface CardGeneratorProps {
  canGenerate: boolean;
  onGenerate: () => Promise<string | null>;
}

export default function CardGenerator({ canGenerate, onGenerate }: CardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const imageUrl = await onGenerate();
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      }
    } catch (err) {
      setError('Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `christmas-card-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(generatedImage, '_blank');
    }
  };

  if (isGenerating) {
    return (
      <div className={styles.container}>
        <div className={styles.generating}>
          <div className={styles.progressBar}>
            <div className={styles.progress} />
          </div>
          <p className={styles.generatingText}>Creating your Christmas card...</p>
          <p className={styles.hint}>This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (generatedImage) {
    return (
      <div className={styles.container}>
        <div className={styles.result}>
          <div className={styles.imageWrapper}>
            <img 
              src={generatedImage} 
              alt="Generated Christmas Card" 
              className={styles.image}
            />
          </div>
          <div className={styles.actions}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              ↓ Download Card
            </button>
            <button className={styles.newBtn} onClick={handleGenerate}>
              Generate New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      
      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={!canGenerate}
      >
        <span className={styles.btnIcon}>✨</span>
        Generate Christmas Card
      </button>
      
      {!canGenerate && (
        <p className={styles.hint}>
          Upload images above to generate your card
        </p>
      )}
    </div>
  );
}

