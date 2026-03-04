import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingIcons } from "@/components/layout/floating-icons";
import { TermsAcceptanceModal } from "@/components/auth/terms-acceptance-modal";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingIcons />
      <Header isAuthenticated={!!user} />
      {user && !user.accepted_terms_at && (
        <TermsAcceptanceModal userId={user.id} />
      )}
      <main className="relative mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-10">
        {children}
      </main>
      <BottomNav isAuthenticated={!!user} />
    </div>
  );
}
