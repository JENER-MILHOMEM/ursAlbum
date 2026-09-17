import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import RankingTable from '@/components/RankingTable';
import type { Votacao, Foto, FotoComVotos } from '@/lib/types';

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/Imagens';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: votacao } = await supabase
    .from('votacoes')
    .select('titulo')
    .eq('id', id)
    .single();

  return {
    title: votacao
      ? `Ranking — ${votacao.titulo} — UrsAlbum`
      : 'Ranking — UrsAlbum',
    description: 'Resultado da votação com ranking das imagens mais votadas.',
  };
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: votacaoId } = await params;
  const supabase = await createClient();

  // Buscar votação
  const { data: votacao, error: votacaoError } = await supabase
    .from('votacoes')
    .select('*')
    .eq('id', votacaoId)
    .single();

  if (votacaoError || !votacao) {
    notFound();
  }

  const typedVotacao = votacao as Votacao;

  // Buscar fotos
  const { data: fotos } = await supabase
    .from('fotos')
    .select('*')
    .eq('votacao_id', votacaoId)
    .order('created_at', { ascending: true });

  if (!fotos || fotos.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card-static p-8 text-center max-w-md animate-fade-in">
            <p className="text-[var(--text-secondary)]">
              Nenhuma imagem encontrada para esta votação.
            </p>
            <Link href="/votacoes" className="btn-secondary mt-4 inline-block">
              Voltar às votações
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Buscar contagem de votos para cada foto
  const { data: votos } = await supabase
    .from('votos')
    .select('foto_id')
    .eq('votacao_id', votacaoId);

  // Contabilizar votos por foto
  const votosPorFoto: Record<string, number> = {};
  if (votos) {
    for (const voto of votos) {
      votosPorFoto[voto.foto_id] = (votosPorFoto[voto.foto_id] || 0) + 1;
    }
  }

  // Montar ranking
  const fotosComVotos: FotoComVotos[] = (fotos as Foto[])
    .map((foto) => ({
      ...foto,
      total_votos: votosPorFoto[foto.id] || 0,
      posicao: 0,
    }))
    .sort((a, b) => b.total_votos - a.total_votos)
    .map((foto, index) => ({
      ...foto,
      posicao: index + 1,
    }));

  const totalVotos = fotosComVotos.reduce((sum, f) => sum + f.total_votos, 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/votacoes"
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar às votações
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Ranking
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 text-sm">
                {typedVotacao.titulo}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`badge ${
                  typedVotacao.status === 'ABERTA' ? 'badge-open' : 'badge-closed'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    typedVotacao.status === 'ABERTA'
                      ? 'bg-[var(--success)]'
                      : 'bg-[var(--error)]'
                  }`}
                />
                {typedVotacao.status === 'ABERTA' ? 'Aberta' : 'Encerrada'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="glass-card-static p-4 text-center">
              <p className="text-2xl font-bold text-[var(--accent-primary-hover)]">
                {totalVotos}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {totalVotos === 1 ? 'voto total' : 'votos totais'}
              </p>
            </div>
            <div className="glass-card-static p-4 text-center">
              <p className="text-2xl font-bold text-[var(--accent-primary-hover)]">
                {fotosComVotos.length}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {fotosComVotos.length === 1 ? 'imagem' : 'imagens'}
              </p>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <RankingTable fotos={fotosComVotos} storageBaseUrl={STORAGE_BASE_URL!} />
      </main>
    </>
  );
}
