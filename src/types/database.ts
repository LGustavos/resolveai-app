export type UserRole = "CLIENT" | "PROVIDER";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  description: string;
  neighborhood: string;
  whatsapp: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProviderCategory {
  id: string;
  provider_id: string;
  category_id: string;
}

export interface PortfolioImage {
  id: string;
  provider_id: string;
  image_url: string;
  created_at: string;
}

export interface Review {
  id: string;
  provider_id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
}

// Joined / computed types

export interface ProviderWithDetails extends ProviderProfile {
  user: Pick<User, "full_name" | "avatar_url">;
  categories: Category[];
  average_rating: number | null;
  review_count: number;
}

export interface ReviewWithClient extends Review {
  client: Pick<User, "full_name" | "avatar_url">;
}
