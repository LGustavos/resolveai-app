import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProviderById,
  getProviderReviews,
  getCurrentUser,
  hasUserReviewedProvider,
} from "@/lib/supabase/queries";
import { ProviderDetail } from "@/components/providers/provider-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const provider = await getProviderById(supabase, id);

  if (!provider) {
    return { title: "Prestador não encontrado - ResolveAí" };
  }

  const name = provider.user.full_name;
  const category = provider.categories[0]?.name ?? "Serviços";
  const rating = provider.average_rating
    ? ` | ${provider.average_rating} estrelas`
    : "";

  return {
    title: `${name} - ${category} | ResolveAí`,
    description: provider.description
      ? provider.description.slice(0, 160)
      : `${name} - ${category} em ${provider.neighborhood || "sua cidade"}. Veja avaliações e entre em contato pelo ResolveAí.`,
    openGraph: {
      title: `${name} - ${category}${rating}`,
      description: provider.description
        ? provider.description.slice(0, 160)
        : `Prestador de serviços no ResolveAí.`,
      type: "profile",
    },
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [provider, reviews, currentUser] = await Promise.all([
    getProviderById(supabase, id),
    getProviderReviews(supabase, id),
    getCurrentUser(supabase),
  ]);

  if (!provider) {
    notFound();
  }

  const alreadyReviewed = currentUser
    ? await hasUserReviewedProvider(supabase, id, currentUser.id)
    : true;

  return (
    <ProviderDetail
      provider={provider}
      reviews={reviews}
      currentUser={currentUser}
      alreadyReviewed={alreadyReviewed}
    />
  );
}
