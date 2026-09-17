export interface Votacao {
  id: string;
  titulo: string;
  status: 'ABERTA' | 'ENCERRADA';
  created_at: string;
}

export interface Foto {
  id: string;
  votacao_id: string;
  titulo?: string | null;
  imagem_url: string;
  local?: string | null;
  data?: string | null;
  profissional_responsavel?: string | null;
  created_at: string;
}

export interface Voto {
  id: string;
  votacao_id: string;
  foto_id: string;
  usuario_id: string;
  created_at: string;
}

export interface FotoComVotos extends Foto {
  total_votos: number;
  posicao: number;
}
