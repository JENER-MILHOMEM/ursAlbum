'use client';

import { useRouter } from 'next/navigation';
import type { Votacao } from '@/lib/types';

interface VotacaoCardProps {
  votacao: Votacao;
  jaVotou: boolean;
  index: number;
}

export default function VotacaoCard({ votacao, jaVotou, index }: VotacaoCardProps) {
  const router = useRouter();

  const formattedDate = votacao.created_at
    ? new Date(votacao.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleClick = () => {
    if (jaVotou) {
      router.push(`/votacoes/${votacao.id}/ranking`);
    } else if (votacao.status === 'ABERTA') {
      router.push(`/votacoes/${votacao.id}`);
    } else {
      router.push(`/votacoes/${votacao.id}/ranking`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="glass-card p-6 text-left w-full opacity-0 animate-fade-in group hover:border-[var(--accent-primary)] transition-all"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
          {votacao.titulo}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {jaVotou && (
            <span className="badge badge-voted">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Votado
            </span>
          )}
          <span
            className={`badge ${
              votacao.status === 'ABERTA' ? 'badge-open' : 'badge-closed'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                votacao.status === 'ABERTA' ? 'bg-[var(--success)]' : 'bg-[var(--error)]'
              }`}
            />
            {votacao.status === 'ABERTA' ? 'Aberta' : 'Encerrada'}
          </span>
        </div>
      </div>

      {formattedDate && (
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Criada em {formattedDate}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {jaVotou ? 'Clique para ver o ranking' : votacao.status === 'ABERTA' ? 'Clique para votar' : 'Clique para ver o ranking'}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:translate-x-1"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
}
