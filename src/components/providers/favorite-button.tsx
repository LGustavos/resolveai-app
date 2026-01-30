"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/supabase/mutations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  providerId: string;
  userId: string | null;
  isFavorited: boolean;
  className?: string;
}

export function FavoriteButton({
  providerId,
  userId,
  isFavorited: initialFavorited,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Faça login para salvar favoritos.");
      return;
    }

    setLoading(true);
    setIsFavorited(!isFavorited);

    const { isFavorited: newState, error } = await toggleFavorite(
      supabase,
      userId,
      providerId
    );

    if (error) {
      setIsFavorited(isFavorited);
      toast.error("Erro ao atualizar favorito.");
    } else {
      setIsFavorited(newState);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        isFavorited
          ? "bg-red-50 text-red-500"
          : "bg-muted/80 text-muted-foreground hover:text-red-500",
        className
      )}
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={cn("h-4.5 w-4.5", isFavorited && "fill-current")}
        strokeWidth={isFavorited ? 0 : 2}
      />
    </button>
  );
}
