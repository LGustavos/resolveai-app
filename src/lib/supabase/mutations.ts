import { SupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "@/types/database";

// ============================================
// AUTH MUTATIONS
// ============================================

export async function signUpWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string,
  fullName: string,
  role: UserRole
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });
  return { data, error };
}

export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });
  return { data, error };
}

export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ============================================
// USER MUTATIONS
// ============================================

export async function updateUser(
  supabase: SupabaseClient,
  userId: string,
  data: { full_name?: string; avatar_url?: string | null; role?: UserRole }
) {
  const { error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { error };
}

// ============================================
// PROVIDER MUTATIONS
// ============================================

export async function updateProviderProfile(
  supabase: SupabaseClient,
  profileId: string,
  data: {
    description?: string;
    neighborhood?: string;
    whatsapp?: string;
    is_active?: boolean;
  }
) {
  const { error } = await supabase
    .from("provider_profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  return { error };
}

export async function setProviderCategories(
  supabase: SupabaseClient,
  providerId: string,
  categoryIds: string[]
) {
  // Delete existing
  await supabase
    .from("provider_categories")
    .delete()
    .eq("provider_id", providerId);

  // Insert new
  if (categoryIds.length > 0) {
    const { error } = await supabase.from("provider_categories").insert(
      categoryIds.map((categoryId) => ({
        provider_id: providerId,
        category_id: categoryId,
      }))
    );
    return { error };
  }

  return { error: null };
}

// ============================================
// PORTFOLIO MUTATIONS
// ============================================

const MAX_PORTFOLIO_IMAGES = 10;

export async function uploadPortfolioImage(
  supabase: SupabaseClient,
  providerId: string,
  userId: string,
  file: File
) {
  // Check limit
  const { count } = await supabase
    .from("portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId);

  if ((count ?? 0) >= MAX_PORTFOLIO_IMAGES) {
    return { error: { message: `Limite de ${MAX_PORTFOLIO_IMAGES} imagens atingido.` } };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("portfolio")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from("portfolio").getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("portfolio_images").insert({
    provider_id: providerId,
    image_url: publicUrl,
  });

  return { error: dbError };
}

export async function deletePortfolioImage(
  supabase: SupabaseClient,
  imageId: string,
  imageUrl: string
) {
  // Extract path from URL
  const urlParts = imageUrl.split("/portfolio/");
  const filePath = urlParts[urlParts.length - 1];

  if (filePath) {
    await supabase.storage.from("portfolio").remove([filePath]);
  }

  const { error } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", imageId);

  return { error };
}

// ============================================
// FAVORITE MUTATIONS
// ============================================

export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  providerId: string
) {
  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    return { isFavorited: false, error };
  } else {
    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      provider_id: providerId,
    });
    return { isFavorited: true, error };
  }
}

// ============================================
// REVIEW MUTATIONS
// ============================================

export async function createReview(
  supabase: SupabaseClient,
  providerId: string,
  clientId: string,
  rating: number,
  comment: string | null
) {
  const { error } = await supabase.from("reviews").insert({
    provider_id: providerId,
    client_id: clientId,
    rating,
    comment,
  });
  return { error };
}
