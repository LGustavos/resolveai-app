import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/queries";
import { isAdmin } from "@/lib/admin";
import { AdminVerificationList } from "@/components/admin/verification-list";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || !isAdmin(user.email)) {
    redirect("/");
  }

  // Use admin client to bypass RLS
  const adminClient = createAdminClient();

  // Fetch all verification requests with provider info
  const { data: verifications } = await adminClient
    .from("verification_documents")
    .select(`
      id,
      provider_id,
      document_type,
      document_url,
      status,
      created_at,
      provider:provider_profiles!verification_documents_provider_id_fkey(
        id,
        verification_status,
        user:users!provider_profiles_user_id_fkey(full_name, email, avatar_url)
      )
    `)
    .order("created_at", { ascending: false });

  // Generate signed URLs for each document (admin client bypasses storage policies too)
  const verificationsWithUrls = await Promise.all(
    (verifications ?? []).map(async (doc) => {
      const isPath = !doc.document_url.startsWith("http");
      let signedUrl = doc.document_url;

      if (isPath) {
        const { data } = await adminClient.storage
          .from("verifications")
          .createSignedUrl(doc.document_url, 3600);
        signedUrl = data?.signedUrl ?? doc.document_url;
      }

      return {
        ...doc,
        signed_url: signedUrl,
        provider: doc.provider as unknown as {
          id: string;
          verification_status: string;
          user: { full_name: string; email: string; avatar_url: string | null };
        },
      };
    })
  );

  // Group by provider
  const providerMap = new Map<
    string,
    {
      providerId: string;
      providerName: string;
      providerEmail: string;
      providerAvatar: string | null;
      verificationStatus: string;
      documents: {
        id: string;
        documentType: string;
        signedUrl: string;
        status: string;
        createdAt: string;
      }[];
    }
  >();

  for (const v of verificationsWithUrls) {
    if (!v.provider) continue;
    const key = v.provider_id;

    if (!providerMap.has(key)) {
      providerMap.set(key, {
        providerId: v.provider.id,
        providerName: v.provider.user.full_name,
        providerEmail: v.provider.user.email,
        providerAvatar: v.provider.user.avatar_url,
        verificationStatus: v.provider.verification_status,
        documents: [],
      });
    }

    providerMap.get(key)!.documents.push({
      id: v.id,
      documentType: v.document_type,
      signedUrl: v.signed_url,
      status: v.status,
      createdAt: v.created_at,
    });
  }

  const providers = Array.from(providerMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verificações de Prestadores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {providers.filter((p) => p.verificationStatus === "pending").length} pendente(s)
        </p>
      </div>
      <AdminVerificationList providers={providers} />
    </div>
  );
}
