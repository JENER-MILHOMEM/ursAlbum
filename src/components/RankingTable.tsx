import Image from 'next/image';
import type { FotoComVotos } from '@/lib/types';
import { resolveImageUrl, formatDate } from '@/lib/utils';

interface RankingTableProps {
  fotos: FotoComVotos[];
  storageBaseUrl: string;
}

function getMedalColor(posicao: number): string | null {
  switch (posicao) {
    case 1:
      return 'var(--gold)';
    case 2:
      return 'var(--silver)';
    case 3:
      return 'var(--bronze)';
    default:
      return null;
  }
}

function getMedalEmoji(posicao: number): string {
  switch (posicao) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

export default function RankingTable({ fotos, storageBaseUrl }: RankingTableProps) {
  const maxVotos = Math.max(...fotos.map((f) => f.total_votos), 1);

  return (
    <div className="space-y-3 w-full">
      {fotos.map((foto, index) => {
        const medalColor = getMedalColor(foto.posicao);
        const medalEmoji = getMedalEmoji(foto.posicao);
        const barWidth = (foto.total_votos / maxVotos) * 100;
        const imageUrl = resolveImageUrl(foto.imagem_url, storageBaseUrl);
        const displayTitle = foto.titulo?.trim() || `Fotografia #${foto.posicao}`;

        return (
          <div
            key={foto.id}
            className="glass-card-static overflow-hidden opacity-0 animate-slide-up"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'forwards',
              borderColor: medalColor
                ? `${medalColor}33`
                : 'var(--border-subtle)',
            }}
          >
            <div className="flex items-start sm:items-center gap-4 p-4">
              {/* Posição */}
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mt-0.5 sm:mt-0"
                style={{
                  background: medalColor
                    ? `${medalColor}18`
                    : 'var(--bg-secondary)',
                  color: medalColor || 'var(--text-muted)',
                  border: `1px solid ${
                    medalColor ? `${medalColor}33` : 'var(--border-subtle)'
                  }`,
                }}
              >
                {medalEmoji || `${foto.posicao}º`}
              </div>

              {/* Thumbnail */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-secondary)] flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={displayTitle}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base">
                    {displayTitle}
                  </h3>
                </div>

                {/* Badges de metadados da foto */}
                {(foto.local || foto.data || foto.profissional_responsavel) && (
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                    {foto.local && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {foto.local}
                      </span>
                    )}
                    {foto.data && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                        </svg>
                        {formatDate(foto.data)}
                      </span>
                    )}
                    {foto.profissional_responsavel && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {foto.profissional_responsavel}
                      </span>
                    )}
                  </div>
                )}

                {/* Barra de progresso */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${barWidth}%`,
                        background: medalColor
                          ? `linear-gradient(90deg, ${medalColor}, ${medalColor}aa)`
                          : undefined,
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold shrink-0 tabular-nums"
                    style={{ color: medalColor || 'var(--text-secondary)' }}
                  >
                    {foto.total_votos}
                    <span className="text-[var(--text-muted)] font-normal ml-1 text-xs">
                      {foto.total_votos === 1 ? 'voto' : 'votos'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
