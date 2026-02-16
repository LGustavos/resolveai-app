-- ============================================
-- ResolveAi - Migration V4
-- Features: CEP-based geolocation, proximity search
-- Idempotent: safe to run multiple times
-- ============================================

-- ============================================
-- 1. New columns on provider_profiles
-- ============================================

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS cep text DEFAULT NULL;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS state text DEFAULT NULL;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS latitude double precision DEFAULT NULL;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS longitude double precision DEFAULT NULL;

-- ============================================
-- 2. Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_provider_profiles_lat_lng
  ON public.provider_profiles(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_cep
  ON public.provider_profiles(cep);

-- ============================================
-- 3. Enable earthdistance extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================
-- 4. RPC function for nearby providers
-- ============================================

CREATE OR REPLACE FUNCTION get_nearby_providers(
  lat double precision,
  lng double precision,
  radius_km double precision DEFAULT 50
)
RETURNS TABLE(provider_id uuid, distance_km double precision) AS $$
  SELECT
    id AS provider_id,
    (earth_distance(
      ll_to_earth(lat, lng),
      ll_to_earth(latitude, longitude)
    ) / 1000.0) AS distance_km
  FROM public.provider_profiles
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND is_active = true
    AND earth_distance(
      ll_to_earth(lat, lng),
      ll_to_earth(latitude, longitude)
    ) / 1000.0 <= radius_km
  ORDER BY distance_km ASC;
$$ LANGUAGE sql STABLE;
