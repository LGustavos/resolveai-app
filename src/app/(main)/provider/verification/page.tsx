import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProviderByUserId } from "@/lib/supabase/queries";
import { VerificationRequest } from "@/components/providers/verification-request";
import { BackButton } from "@/components/ui/back-button";

export default async function VerificationPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || user.role !== "PROVIDER") {
    redirect("/profile");
  }

  const providerProfile = await getProviderByUserId(supabase, user.id);

  if (!providerProfile) {
    redirect("/profile");
  }

  // Fetch existing verification documents
  const { data: documents } = await supabase
    .from("verification_documents")
    .select("id, document_type, document_url, status")
    .eq("provider_id", providerProfile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-2xl font-bold">Verificação de perfil</h1>
      </div>
      <VerificationRequest
        providerId={providerProfile.id}
        userId={user.id}
        verificationStatus={providerProfile.verification_status ?? "none"}
        existingDocuments={(documents ?? []) as {
          id: string;
          document_type: "identity" | "selfie";
          document_url: string;
          status: "pending" | "approved" | "rejected";
        }[]}
      />
    </div>
  );
}
