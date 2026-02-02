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

// All service categories available in the platform
// These must match the categories seeded in the database
export const SERVICE_CATEGORIES = [
  // Construção e Reformas
  { name: "Pedreiro", slug: "pedreiro" },
  { name: "Pintor", slug: "pintor" },
  { name: "Gesseiro", slug: "gesseiro" },
  { name: "Azulejista", slug: "azulejista" },
  { name: "Vidraceiro", slug: "vidraceiro" },
  { name: "Serralheiro", slug: "serralheiro" },
  { name: "Marceneiro", slug: "marceneiro" },
  { name: "Carpinteiro", slug: "carpinteiro" },
  { name: "Impermeabilizador", slug: "impermeabilizador" },
  { name: "Mestre de Obras", slug: "mestre-de-obras" },

  // Instalações
  { name: "Eletricista", slug: "eletricista" },
  { name: "Encanador", slug: "encanador" },
  { name: "Instalador de Ar-Condicionado", slug: "instalador-ar-condicionado" },
  { name: "Instalador de TV e Antenas", slug: "instalador-tv-antenas" },
  { name: "Instalador de Câmeras", slug: "instalador-cameras" },
  { name: "Instalador de Redes e Internet", slug: "instalador-redes" },

  // Limpeza e Organização
  { name: "Diarista", slug: "diarista" },
  { name: "Faxineira", slug: "faxineira" },
  { name: "Lavador de Estofados", slug: "lavador-estofados" },
  { name: "Dedetizador", slug: "dedetizador" },
  { name: "Jardineiro", slug: "jardineiro" },
  { name: "Piscineiro", slug: "piscineiro" },

  // Manutenção e Reparos
  { name: "Chaveiro", slug: "chaveiro" },
  { name: "Montador de Móveis", slug: "montador-moveis" },
  { name: "Técnico em Eletrodomésticos", slug: "tecnico-eletrodomesticos" },
  { name: "Técnico em Celular", slug: "tecnico-celular" },
  { name: "Técnico em Informática", slug: "tecnico-informatica" },
  { name: "Mecânico", slug: "mecanico" },
  { name: "Eletricista Automotivo", slug: "eletricista-automotivo" },
  { name: "Borracheiro", slug: "borracheiro" },

  // Beleza e Estética
  { name: "Cabeleireira", slug: "cabeleireira" },
  { name: "Manicure", slug: "manicure" },
  { name: "Maquiadora", slug: "maquiadora" },
  { name: "Barbeiro", slug: "barbeiro" },
  { name: "Designer de Sobrancelhas", slug: "designer-sobrancelhas" },
  { name: "Esteticista", slug: "esteticista" },
  { name: "Massagista", slug: "massagista" },

  // Saúde e Bem-Estar
  { name: "Personal Trainer", slug: "personal-trainer" },
  { name: "Fisioterapeuta", slug: "fisioterapeuta" },
  { name: "Nutricionista", slug: "nutricionista" },
  { name: "Cuidador de Idosos", slug: "cuidador-idosos" },
  { name: "Enfermeiro(a)", slug: "enfermeiro" },

  // Educação e Aulas
  { name: "Professor Particular", slug: "professor-particular" },
  { name: "Professor de Música", slug: "professor-musica" },
  { name: "Professor de Idiomas", slug: "professor-idiomas" },
  { name: "Instrutor de Autoescola", slug: "instrutor-autoescola" },

  // Eventos e Gastronomia
  { name: "Cozinheira", slug: "cozinheira" },
  { name: "Confeiteira", slug: "confeiteira" },
  { name: "Buffet", slug: "buffet" },
  { name: "Bartender", slug: "bartender" },
  { name: "DJ", slug: "dj" },
  { name: "Fotógrafo", slug: "fotografo" },
  { name: "Decorador de Festas", slug: "decorador-festas" },

  // Transporte e Mudanças
  { name: "Motorista Particular", slug: "motorista-particular" },
  { name: "Freteiro", slug: "freteiro" },
  { name: "Mudanças", slug: "mudancas" },
  { name: "Motoboy", slug: "motoboy" },

  // Serviços Profissionais
  { name: "Contador", slug: "contador" },
  { name: "Advogado", slug: "advogado" },
  { name: "Despachante", slug: "despachante" },
  { name: "Designer Gráfico", slug: "designer-grafico" },
  { name: "Desenvolvedor de Sites", slug: "desenvolvedor-sites" },
  { name: "Social Media", slug: "social-media" },

  // Pets
  { name: "Pet Sitter", slug: "pet-sitter" },
  { name: "Dog Walker", slug: "dog-walker" },
  { name: "Banho e Tosa", slug: "banho-tosa" },
  { name: "Veterinário", slug: "veterinario" },

  // Outros
  { name: "Costureira", slug: "costureira" },
  { name: "Sapateiro", slug: "sapateiro" },
  { name: "Lavanderia", slug: "lavanderia" },
  { name: "Soldador", slug: "soldador" },
  { name: "Outros", slug: "outros" },
] as const;
