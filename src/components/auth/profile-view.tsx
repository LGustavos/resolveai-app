"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/mutations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  Pencil,
  Images,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

interface ProfileViewProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
  providerProfile: {
    id: string;
    description: string;
    neighborhood: string;
    whatsapp: string;
    is_active: boolean;
    categories: { id: string; name: string; slug: string }[];
  } | null;
}

export function ProfileView({ user, providerProfile }: ProfileViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut(supabase);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* User info card */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge
              variant="secondary"
              className="mt-1 rounded-md bg-accent text-accent-foreground text-xs font-medium"
            >
              {user.role === "PROVIDER" ? "Prestador" : "Cliente"}
            </Badge>
          </div>
        </div>

        {user.role === "PROVIDER" && providerProfile && (
          <Link href={`/provider/${providerProfile.id}`} className="block mt-4">
            <Button
              variant="outline"
              className="w-full h-10 rounded-lg gap-2 border-primary/30 text-primary font-medium"
            >
              <User className="h-4 w-4" />
              Ver perfil
            </Button>
          </Link>
        )}
      </div>

      {/* Menu items */}
      <div className="rounded-xl border border-border bg-white divide-y divide-border">
        {user.role === "PROVIDER" && providerProfile && (
          <>
            <Link
              href="/profile/edit"
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">
                  Editar perfil de prestador
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/provider/portfolio"
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Images className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Portfólio</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </>
        )}

        <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Ajuda e suporte</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full h-11 rounded-lg gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </Button>
    </div>
  );
}
