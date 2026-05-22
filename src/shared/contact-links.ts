/**
 * Helpers puros (client-safe) para normalizar contactos del host/hotel
 * a URLs accionables.
 *
 * - Teléfono → WhatsApp (`https://wa.me/<solo dígitos>`). Si el número
 *   queda muy corto se cae a `tel:` plano. El admin no tiene que pensar
 *   si es WhatsApp o no: si cargó teléfono, el botón abre WhatsApp.
 * - Instagram → acepta `@user`, `user`, `instagram.com/user`,
 *   `https://instagram.com/user` y devuelve siempre la URL canónica.
 */

export function toWhatsAppHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D+/g, "");
  if (digits.length < 7) {
    // Demasiado corto para que sea WhatsApp confiable — usamos tel:
    return `tel:${phone}`;
  }
  return `https://wa.me/${digits}`;
}

export function toInstagramHref(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Quita @ inicial, dominios sueltos, slashes.
  const clean = trimmed
    .replace(/^@/, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/^\//, "")
    .replace(/\/+$/, "");
  if (!clean) return null;
  return `https://instagram.com/${clean}`;
}

/** Para mostrar como label visible: "@user". */
export function instagramHandle(
  raw: string | null | undefined
): string | null {
  const url = toInstagramHref(raw);
  if (!url) return null;
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match ? `@${match[1]}` : null;
}
