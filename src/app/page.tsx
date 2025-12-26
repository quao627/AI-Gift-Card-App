'use client';

import { useState, useCallback } from 'react';
import styles from './page.module.css';
import ImageUploader from '@/components/ImageUploader';
import CardGenerator from '@/components/CardGenerator';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  const handleGenerateCard = useCallback(async (): Promise<string | null> => {
    if (images.length === 0) return null;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: images.slice(0, 15),
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }, [images]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Christmas Card Creator</h1>
        <p className={styles.subtitle}>
          Upload your reference images, let AI create the perfect card
        </p>
      </header>

      <div className={styles.steps}>
        {/* Step 1: Upload Images */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <span className={`${styles.stepNumber} ${images.length > 0 ? styles.completed : styles.active}`}>
              {images.length > 0 ? '✓' : '1'}
            </span>
            <h2 className={styles.stepTitle}>Upload Reference Images</h2>
          </div>
          <div className={styles.stepContent}>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={15}
            />
          </div>
        </section>

        {/* Step 2: Generate Card */}
        <section className={`${styles.step} ${images.length === 0 ? styles.disabled : ''}`}>
          <div className={styles.stepHeader}>
            <span className={`${styles.stepNumber} ${images.length > 0 ? styles.active : ''}`}>
              2
            </span>
            <h2 className={styles.stepTitle}>Generate Your Card</h2>
          </div>
          <div className={styles.stepContent}>
            <CardGenerator
              canGenerate={images.length > 0}
              onGenerate={handleGenerateCard}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

