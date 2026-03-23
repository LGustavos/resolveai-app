-- ============================================
-- Migration v14: Fix provider signup after CPF/CNPJ became required
-- ============================================

-- Backfill provider_type for existing providers based on stored document
update public.provider_profiles
  set provider_type = 'company'
  where provider_type = 'individual'
    and cpf not ilike 'PENDING%'
    and length(regexp_replace(cpf, '\D', '', 'g')) = 14;

-- Normalize legacy pending placeholder (from older attempts)
update public.provider_profiles
  set cpf = 'PENDING-' || id::text
  where cpf = 'PENDING';

-- Ensure role-change trigger can still create a minimal provider profile
create or replace function public.handle_provider_role()
returns trigger as $$
begin
  if new.role = 'PROVIDER' and old.role = 'CLIENT' then
    insert into public.provider_profiles (user_id, is_active, cpf, provider_type)
    values (new.id, true, 'PENDING-' || new.id::text, 'individual')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Update signup trigger to include cpf/provider_type from auth metadata
create or replace function public.handle_new_provider()
returns trigger as $$
declare
  provider_data jsonb;
  pp_id uuid;
  cat_id text;
  raw_document text;
  resolved_document text;
  resolved_provider_type text;
begin
  if new.role = 'PROVIDER' then
    -- Read provider_data from auth.users metadata (set during email signup wizard)
    select raw_user_meta_data->'provider_data' into provider_data
    from auth.users where id = new.id;

    raw_document := regexp_replace(coalesce(provider_data->>'cpf', ''), '\D', '', 'g');

    resolved_provider_type := case
      when provider_data->>'provider_type' in ('individual', 'company') then provider_data->>'provider_type'
      when length(raw_document) = 14 then 'company'
      else 'individual'
    end;

    resolved_document := case
      when length(raw_document) in (11, 14) then raw_document
      else 'PENDING-' || new.id::text
    end;

    if provider_data is not null
       and (provider_data->>'whatsapp') is not null
       and (provider_data->>'whatsapp') != '' then
      -- Provider registered via email wizard with full data
      insert into public.provider_profiles (
        user_id, description, city, neighborhood, cep, state,
        latitude, longitude, whatsapp, cpf, provider_type, is_active
      )
      values (
        new.id,
        coalesce(provider_data->>'description', ''),
        coalesce(provider_data->>'city', ''),
        coalesce(provider_data->>'neighborhood', ''),
        nullif(provider_data->>'cep', ''),
        nullif(provider_data->>'state', ''),
        (provider_data->>'latitude')::double precision,
        (provider_data->>'longitude')::double precision,
        provider_data->>'whatsapp',
        resolved_document,
        resolved_provider_type,
        true
      )
      on conflict (user_id) do update set
        description = excluded.description,
        city = excluded.city,
        neighborhood = excluded.neighborhood,
        cep = excluded.cep,
        state = excluded.state,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        whatsapp = excluded.whatsapp,
        cpf = case
          when public.provider_profiles.cpf ilike 'PENDING%' then excluded.cpf
          else public.provider_profiles.cpf
        end,
        provider_type = case
          when public.provider_profiles.provider_type = 'individual' and excluded.provider_type = 'company' then 'company'
          else public.provider_profiles.provider_type
        end,
        is_active = true
      returning id into pp_id;

      -- Insert provider categories from metadata
      if pp_id is not null and provider_data->'categoryIds' is not null then
        for cat_id in select jsonb_array_elements_text(provider_data->'categoryIds')
        loop
          insert into public.provider_categories (provider_id, category_id)
          values (pp_id, cat_id::uuid)
          on conflict (provider_id, category_id) do nothing;
        end loop;
      end if;

      -- Create default business hours (Mon-Fri 08:00-18:00, Sat-Sun closed)
      if pp_id is not null then
        insert into public.business_hours (provider_id, day_of_week, open_time, close_time, is_closed)
        values
          (pp_id, 0, null, null, true),
          (pp_id, 1, '08:00', '18:00', false),
          (pp_id, 2, '08:00', '18:00', false),
          (pp_id, 3, '08:00', '18:00', false),
          (pp_id, 4, '08:00', '18:00', false),
          (pp_id, 5, '08:00', '18:00', false),
          (pp_id, 6, null, null, true)
        on conflict (provider_id, day_of_week) do nothing;
      end if;

    else
      -- Provider without data (Google OAuth or incomplete signup) - create empty profile
      insert into public.provider_profiles (user_id, is_active, cpf, provider_type)
      values (new.id, true, 'PENDING-' || new.id::text, 'individual')
      on conflict (user_id) do nothing;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;
