-- ============================================
-- Migration v11: Restrict ratings view to authenticated users
-- Ratings and reviews are now only visible to logged-in users
-- ============================================

create or replace view public.provider_ratings
  with (security_invoker = true)
as
select
  provider_id,
  round(avg(rating)::numeric, 1) as average_rating,
  count(*) as review_count
from public.reviews
group by provider_id;
