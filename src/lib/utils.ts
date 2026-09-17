/**
 * Resolve e normaliza URLs de imagens do Supabase Storage.
 * Suporta tanto caminhos relativos quanto URLs absolutas completas,
 * e limpa possíveis duplicações de prefixo de storage.
 */
export function resolveImageUrl(
  imagemUrl: string,
  storageBaseUrl?: string
): string {
  if (!imagemUrl) return '';

  let cleaned = imagemUrl.trim();

  // Se por acaso a URL tiver duplicação (ex: https://.../Imagens/https://...)
  const lastHttpIndex = cleaned.lastIndexOf('http://');
  const lastHttpsIndex = cleaned.lastIndexOf('https://');
  const lastProtocolIndex = Math.max(lastHttpIndex, lastHttpsIndex);

  if (lastProtocolIndex > 0) {
    cleaned = cleaned.substring(lastProtocolIndex);
  }

  // Se já for uma URL completa HTTP(S)
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      return encodeURI(decodeURI(cleaned));
    } catch {
      return cleaned;
    }
  }

  // Caminho relativo: combina com o storageBaseUrl
  const base = (
    storageBaseUrl ||
    `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/Imagens`
  ).replace(/\/+$/, '');

  const path = cleaned.replace(/^\/+/, '');
  const fullUrl = `${base}/${path}`;

  try {
    return encodeURI(decodeURI(fullUrl));
  } catch {
    return fullUrl;
  }
}

/**
 * Formata datas ISO ou strings de data para formato legível em pt-BR.
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

