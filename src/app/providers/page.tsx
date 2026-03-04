import { redirect } from "next/navigation";
import { ProviderLandingPage } from "@/components/landing/provider-landing-page";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export default async function ProvidersLandingPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (user?.role === "PROVIDER") {
    redirect("/provider/edit");
  }

  if (user?.role === "CLIENT") {
    redirect("/become-provider");
  }

  return <ProviderLandingPage />;
}
