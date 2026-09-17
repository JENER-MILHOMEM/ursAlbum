import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import VotacaoCard from '@/components/VotacaoCard';
import type { Votacao } from '@/lib/types';

export const metadata = {
  title: 'Votações — UrsAlbum',
  description: 'Visualize e participe das votações de imagens disponíveis.',
};

export default async function VotacoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Buscar todas as votações (abertas primeiro, depois encerradas)
  const { data: votacoes, error } = await supabase
    .from('votacoes')
    .select('*')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  // Buscar votações em que o usuário já votou
  let votacoesVotadas: string[] = [];
  if (user) {
    const { data: votos } = await supabase
      .from('votos')
      .select('votacao_id')
      .eq('usuario_id', user.id);

    if (votos) {
      votacoesVotadas = votos.map((v) => v.votacao_id);
    }
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card-static p-8 text-center max-w-md">
            <p className="text-[var(--error)]">
              Erro ao carregar votações. Tente novamente mais tarde.
            </p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Votações
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm sm:text-base">
            Selecione uma votação para participar ou visualizar o ranking.
          </p>
        </div>

        {/* Grid de votações */}
        {votacoes && votacoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(votacoes as Votacao[]).map((votacao, index) => (
              <VotacaoCard
                key={votacao.id}
                votacao={votacao}
                jaVotou={votacoesVotadas.includes(votacao.id)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)] text-center">
              Nenhuma votação disponível no momento.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
