-- ============================================
-- Seed: Parent Categories for Subcategory Grouping
-- Run this AFTER migration-v3.sql (which adds parent_id and display_order)
-- ============================================

-- Insert parent categories
INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
  ('Construção e Reformas', 'construcao-reformas', NULL, 1),
  ('Instalações', 'instalacoes', NULL, 2),
  ('Limpeza e Organização', 'limpeza-organizacao', NULL, 3),
  ('Manutenção e Reparos', 'manutencao-reparos', NULL, 4),
  ('Beleza e Estética', 'beleza-estetica', NULL, 5),
  ('Saúde e Bem-Estar', 'saude-bem-estar', NULL, 6),
  ('Educação e Aulas', 'educacao-aulas', NULL, 7),
  ('Eventos e Gastronomia', 'eventos-gastronomia', NULL, 8),
  ('Transporte e Mudanças', 'transporte-mudancas', NULL, 9),
  ('Serviços Profissionais', 'servicos-profissionais', NULL, 10),
  ('Pets', 'pets', NULL, 11)
ON CONFLICT (slug) DO NOTHING;

-- Assign parent_id to existing subcategories

-- Construção e Reformas
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'construcao-reformas')
WHERE slug IN ('pedreiro', 'pintor', 'gesseiro', 'azulejista', 'vidraceiro', 'serralheiro', 'marceneiro', 'carpinteiro', 'impermeabilizador', 'mestre-de-obras');

-- Instalações
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'instalacoes')
WHERE slug IN ('eletricista', 'encanador', 'instalador-ar-condicionado', 'instalador-tv-antenas', 'instalador-cameras', 'instalador-redes');

-- Limpeza e Organização
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'limpeza-organizacao')
WHERE slug IN ('diarista', 'faxineira', 'lavador-estofados', 'dedetizador', 'jardineiro', 'piscineiro');

-- Manutenção e Reparos
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'manutencao-reparos')
WHERE slug IN ('chaveiro', 'montador-moveis', 'tecnico-eletrodomesticos', 'tecnico-celular', 'tecnico-informatica', 'mecanico', 'eletricista-automotivo', 'borracheiro');

-- Beleza e Estética
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'beleza-estetica')
WHERE slug IN ('cabeleireira', 'manicure', 'maquiadora', 'barbeiro', 'designer-sobrancelhas', 'esteticista', 'massagista');

-- Saúde e Bem-Estar
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'saude-bem-estar')
WHERE slug IN ('personal-trainer', 'fisioterapeuta', 'nutricionista', 'cuidador-idosos', 'enfermeiro');

-- Educação e Aulas
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'educacao-aulas')
WHERE slug IN ('professor-particular', 'professor-musica', 'professor-idiomas', 'instrutor-autoescola');

-- Eventos e Gastronomia
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'eventos-gastronomia')
WHERE slug IN ('cozinheira', 'confeiteira', 'buffet', 'bartender', 'dj', 'fotografo', 'decorador-festas');

-- Transporte e Mudanças
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'transporte-mudancas')
WHERE slug IN ('motorista-particular', 'freteiro', 'mudancas', 'motoboy');

-- Serviços Profissionais
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'servicos-profissionais')
WHERE slug IN ('contador', 'advogado', 'despachante', 'designer-grafico', 'desenvolvedor-sites', 'social-media');

-- Pets
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'pets')
WHERE slug IN ('pet-sitter', 'dog-walker', 'banho-tosa', 'veterinario');
