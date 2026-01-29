export const WHATSAPP_DEFAULT_MESSAGE =
  "Olá! Encontrei seu perfil no ResolveAí e gostaria de um orçamento.";

export function getWhatsAppUrl(phone: string, message?: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(
    message ?? WHATSAPP_DEFAULT_MESSAGE
  );
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
}

export const MAX_PORTFOLIO_IMAGES = 10;
