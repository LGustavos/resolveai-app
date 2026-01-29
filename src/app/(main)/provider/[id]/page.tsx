import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProviderById,
  getProviderReviews,
  getCurrentUser,
  hasUserReviewedProvider,
} from "@/lib/supabase/queries";
import { ProviderDetail } from "@/components/providers/provider-detail";

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
