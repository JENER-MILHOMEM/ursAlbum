'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import ImageViewer from '@/components/ImageViewer';
import type { Foto, Votacao } from '@/lib/types';

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/Imagens';

export default function VotacaoPage() {
  const router = useRouter();
  const params = useParams();
  const votacaoId = params.id as string;
  const supabase = createClient();

  const [votacao, setVotacao] = useState<Votacao | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Verificar se o usuário já votou nesta votação
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data: votoExistente } = await supabase
          .from('votos')
          .select('id')
          .eq('votacao_id', votacaoId)
          .eq('usuario_id', user.id)
          .maybeSingle();

        if (votoExistente) {
          router.replace(`/votacoes/${votacaoId}/ranking`);
          return;
        }

        // Carregar votação
        const { data: votacaoData, error: votacaoError } = await supabase
          .from('votacoes')
          .select('*')
          .eq('id', votacaoId)
          .single();

        if (votacaoError || !votacaoData) {
          setError('Votação não encontrada.');
          setLoading(false);
          return;
        }

        // Se votação encerrada, ir pro ranking
        if (votacaoData.status === 'ENCERRADA') {
          router.replace(`/votacoes/${votacaoId}/ranking`);
          return;
        }

        setVotacao(votacaoData as Votacao);

        // Carregar fotos
        const { data: fotosData, error: fotosError } = await supabase
          .from('fotos')
          .select('*')
          .eq('votacao_id', votacaoId)
          .order('created_at', { ascending: true });

        if (fotosError) {
          setError('Erro ao carregar imagens.');
          setLoading(false);
          return;
        }

        if (!fotosData || fotosData.length === 0) {
          setError('Nenhuma imagem encontrada para esta votação.');
          setLoading(false);
          return;
        }

        setFotos(fotosData as Foto[]);
        setLoading(false);
      } catch {
        setError('Erro inesperado. Tente novamente.');
        setLoading(false);
      }
    }

    loadData();
  }, [votacaoId, router, supabase]);

  const handleVote = useCallback(
    async (fotoId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase.from('votos').insert({
        votacao_id: votacaoId,
        foto_id: fotoId,
        usuario_id: user.id,
      });
    },
    [supabase, votacaoId]
  );

  const handleFinish = useCallback(() => {
    router.push(`/votacoes/${votacaoId}/ranking`);
  }, [router, votacaoId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
            <p className="text-[var(--text-secondary)] text-sm">
              Carregando votação...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card-static p-8 text-center max-w-md animate-fade-in">
            <p className="text-[var(--error)] mb-4">{error}</p>
            <button
              onClick={() => router.push('/votacoes')}
              className="btn-secondary"
            >
              Voltar às votações
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => router.push('/votacoes')}
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
            Voltar
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {votacao?.titulo}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Escolha uma imagem para votar ou avance para a próxima.
          </p>
        </div>

        {/* Image Viewer */}
        <ImageViewer
          fotos={fotos}
          onVote={handleVote}
          onFinish={handleFinish}
          storageBaseUrl={STORAGE_BASE_URL}
        />
      </main>
    </>
  );
}
