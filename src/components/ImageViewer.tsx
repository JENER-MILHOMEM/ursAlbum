'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import type { Foto } from '@/lib/types';
import { resolveImageUrl, formatDate } from '@/lib/utils';

interface ImageViewerProps {
  fotos: Foto[];
  onVote: (fotoId: string) => Promise<void>;
  onFinish: () => void;
  storageBaseUrl: string;
}

export default function ImageViewer({
  fotos,
  onVote,
  onFinish,
  storageBaseUrl,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [voted, setVoted] = useState(false);
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [imageError, setImageError] = useState(false);

  const currentFoto = fotos[currentIndex];
  const isLast = currentIndex === fotos.length - 1;
  const progress = fotos.length > 0 ? ((currentIndex + 1) / fotos.length) * 100 : 0;

  if (!fotos || fotos.length === 0) {
    return (
      <div className="glass-card-static p-8 text-center text-[var(--text-muted)]">
        Nenhuma imagem encontrada nesta votação.
      </div>
    );
  }

  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (isAnimating) return;

    if (isLast) {
      onFinish();
      return;
    }

    setDirection('out');
    setIsAnimating(true);
    setVoted(false);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection('in');
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 350);
  }, [isAnimating, isLast, onFinish]);

  const handleVote = async () => {
    if (voted || isAnimating) return;
    setVoted(true);
    await onVote(currentFoto.id);

    // Auto-avança após votar
    setTimeout(() => {
      goNext();
    }, 800);
  };

  const imageUrl = resolveImageUrl(currentFoto?.imagem_url, storageBaseUrl);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">
            Imagem {currentIndex + 1} de {fotos.length}
          </span>
          <span className="text-sm font-medium text-[var(--accent-primary-hover)]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Image container */}
      <div
        className={`glass-card-static overflow-hidden w-full ${
          direction === 'out'
            ? 'animate-slide-out-left'
            : 'animate-slide-in-right'
        }`}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-[var(--bg-secondary)] flex items-center justify-center">
          {imageError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mb-3 text-[var(--text-muted)] opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Não foi possível carregar a imagem
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md truncate">
                {imageUrl}
              </p>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={currentFoto.titulo || `Fotografia #${currentIndex + 1}`}
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Informações da foto */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              {currentFoto.titulo?.trim() || `Fotografia #${currentIndex + 1}`}
            </h2>
          </div>


          {(currentFoto.local || currentFoto.data || currentFoto.profissional_responsavel) && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)]">
              {currentFoto.local && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <svg className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{currentFoto.local}</span>
                </div>
              )}

              {currentFoto.data && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <svg className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDate(currentFoto.data)}</span>
                </div>
              )}

              {currentFoto.profissional_responsavel && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <svg className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{currentFoto.profissional_responsavel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 mt-8 w-full max-w-sm">
        <button
          onClick={goNext}
          disabled={isAnimating || voted}
          className="btn-secondary flex-1 text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLast ? 'Finalizar' : 'Próxima'}
        </button>

        <button
          onClick={handleVote}
          disabled={voted || isAnimating}
          className={`btn-vote flex-1 text-center disabled:cursor-not-allowed transition-all ${
            voted
              ? 'bg-gradient-to-r from-[var(--success)] to-emerald-600 opacity-80'
              : ''
          }`}
        >
          {voted ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Votado!
            </span>
          ) : (
            'VOTAR'
          )}
        </button>
      </div>
    </div>
  );
}
