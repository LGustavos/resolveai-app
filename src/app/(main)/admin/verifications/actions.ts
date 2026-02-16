"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/queries";
import { isAdmin } from "@/lib/admin";

export async function reviewVerification(
  providerId: string,
  documentIds: string[],
  action: "approve" | "reject"
) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || !isAdmin(user.email)) {
    return { error: "Não autorizado." };
  }

  const adminClient = createAdminClient();
  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update all documents
  const { error: docError } = await adminClient
    .from("verification_documents")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .in("id", documentIds);

  if (docError) {
    console.error("reviewVerification docError:", docError);
    return { error: `Erro ao atualizar documentos: ${docError.message}` };
  }

  // Update provider profile
  const { error: providerError } = await adminClient
    .from("provider_profiles")
    .update({
      verification_status: newStatus,
      is_verified: action === "approve",
      verified_at: action === "approve" ? new Date().toISOString() : null,
    })
    .eq("id", providerId);

  if (providerError) {
    console.error("reviewVerification providerError:", providerError);
    return { error: `Erro ao atualizar perfil: ${providerError.message}` };
  }

  return { success: true };
}
