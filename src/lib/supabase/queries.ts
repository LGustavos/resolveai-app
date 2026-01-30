import { SupabaseClient } from "@supabase/supabase-js";

// ============================================
// USER QUERIES
// ============================================

export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  return data;
}

// ============================================
// CATEGORY QUERIES
// ============================================

export async function getCategories(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return data ?? [];
}

// ============================================
// PROVIDER QUERIES
// ============================================

export async function getActiveProviders(
  supabase: SupabaseClient,
  filters?: {
    search?: string;
    categorySlug?: string;
    neighborhood?: string;
    orderBy?: "rating" | "recent";
    page?: number;
    pageSize?: number;
  }
) {
  let query = supabase
    .from("provider_profiles")
    .select(
      `
      *,
      user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
      categories:provider_categories(
        category:categories(*)
      ),
      ratings:provider_ratings(average_rating, review_count)
    `
    )
    .eq("is_active", true);

  if (filters?.neighborhood) {
    query = query.ilike("neighborhood", `%${filters.neighborhood}%`);
  }

  const { data } = await query;

  let providers = (data ?? [])
    .filter((p) => p.user !== null)
    .map((p) => ({
      ...p,
      user: p.user as { full_name: string; avatar_url: string | null },
      categories: (
        p.categories as { category: { id: string; name: string; slug: string } }[]
      ).map((pc) => pc.category),
      average_rating: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.average_rating ?? null,
      review_count: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.review_count ?? 0,
    }));

  // Filter by category
  if (filters?.categorySlug) {
    providers = providers.filter((p) =>
      p.categories.some((c: { slug: string }) => c.slug === filters.categorySlug)
    );
  }

  // Filter by text search (name or description)
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    providers = providers.filter(
      (p) =>
        p.user.full_name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.categories.some((c: { name: string }) =>
          c.name.toLowerCase().includes(term)
        )
    );
  }

  // Sort
  if (filters?.orderBy === "rating") {
    providers.sort(
      (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
    );
  } else {
    providers.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Pagination
  const total = providers.length;
  if (filters?.page && filters?.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    providers = providers.slice(start, start + filters.pageSize);
  }

  return { providers, total };
}

export async function getProviderById(
  supabase: SupabaseClient,
  providerId: string
) {
  const { data } = await supabase
    .from("provider_profiles")
    .select(
      `
      *,
      user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
      categories:provider_categories(
        category:categories(*)
      ),
      portfolio:portfolio_images(*),
      ratings:provider_ratings(average_rating, review_count)
    `
    )
    .eq("id", providerId)
    .single();

  if (!data) return null;

  return {
    ...data,
    user: data.user as { full_name: string; avatar_url: string | null },
    categories: (
      data.categories as {
        category: { id: string; name: string; slug: string };
      }[]
    ).map((pc) => pc.category),
    portfolio: data.portfolio as {
      id: string;
      image_url: string;
      created_at: string;
    }[],
    average_rating: (data.ratings as { average_rating: number; review_count: number }[])?.[0]
      ?.average_rating ?? null,
    review_count: (data.ratings as { average_rating: number; review_count: number }[])?.[0]
      ?.review_count ?? 0,
  };
}

export async function getProviderByUserId(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("provider_profiles")
    .select(
      `
      *,
      categories:provider_categories(
        category:categories(*)
      ),
      portfolio:portfolio_images(*)
    `
    )
    .eq("user_id", userId)
    .single();

  if (!data) return null;

  return {
    ...data,
    categories: (
      data.categories as {
        category: { id: string; name: string; slug: string };
      }[]
    ).map((pc) => pc.category),
    portfolio: data.portfolio as {
      id: string;
      image_url: string;
      created_at: string;
    }[],
  };
}

// ============================================
// REVIEW QUERIES
// ============================================

export async function getProviderReviews(
  supabase: SupabaseClient,
  providerId: string
) {
  const { data } = await supabase
    .from("reviews")
    .select(
      `
      *,
      client:users!reviews_client_id_fkey(full_name, avatar_url)
    `
    )
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    ...r,
    client: r.client as { full_name: string; avatar_url: string | null },
  }));
}

export async function hasUserReviewedProvider(
  supabase: SupabaseClient,
  providerId: string,
  clientId: string
) {
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("client_id", clientId);

  return (count ?? 0) > 0;
}

// ============================================
// FAVORITE QUERIES
// ============================================

export async function getUserFavorites(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("favorites")
    .select("provider_id")
    .eq("user_id", userId);

  return (data ?? []).map((f) => f.provider_id);
}

export async function getUserFavoriteProviders(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("favorites")
    .select(
      `
      provider:provider_profiles!favorites_provider_id_fkey(
        *,
        user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
        categories:provider_categories(
          category:categories(*)
        ),
        ratings:provider_ratings(average_rating, review_count)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? [])
    .map((f) => f.provider as unknown as Record<string, unknown>)
    .filter((p) => p !== null && p.user !== null)
    .map((p) => ({
      id: p.id as string,
      neighborhood: p.neighborhood as string,
      description: p.description as string,
      user: p.user as { full_name: string; avatar_url: string | null },
      categories: (
        p.categories as { category: { id: string; name: string; slug: string } }[]
      ).map((pc) => pc.category),
      average_rating: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.average_rating ?? null,
      review_count: (p.ratings as { average_rating: number; review_count: number }[])?.[0]
        ?.review_count ?? 0,
    }));
}

// ============================================
// NEIGHBORHOODS (distinct values from providers)
// ============================================

export async function getNeighborhoods(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("provider_profiles")
    .select("neighborhood")
    .eq("is_active", true)
    .neq("neighborhood", "");

  const unique = [...new Set((data ?? []).map((d) => d.neighborhood))].sort();
  return unique;
}
