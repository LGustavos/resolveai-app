"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateUser } from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

interface UserProfileFormProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(user.full_name);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setLoading(true);

    const { error } = await updateUser(supabase, user.id, {
      full_name: fullName.trim(),
    });

    if (error) {
      toast.error("Erro ao salvar dados.");
    } else {
      toast.success("Dados atualizados!");
      router.push("/profile");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nome completo
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-lg border-border"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email</Label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="h-11 rounded-lg border-border bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            O email não pode ser alterado.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 rounded-lg font-semibold gap-2 gradient-bg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-lg gap-2 border-border"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </form>
    </div>
  );
}
