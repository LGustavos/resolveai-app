"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/providers/favorite-button";

interface ProviderCardProps {
  provider: {
    id: string;
    user: { full_name: string; avatar_url: string | null };
    categories: { id: string; name: string; slug: string }[];
    city: string;
    average_rating: number | null;
    review_count: number;
  };
  featured?: boolean;
  userId?: string | null;
  isFavorited?: boolean;
}

export function ProviderCard({ provider, featured, userId, isFavorited }: ProviderCardProps) {
  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/provider/${provider.id}`} className="block">
      <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
        {userId !== undefined && (
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton
              providerId={provider.id}
              userId={userId}
              isFavorited={isFavorited ?? false}
            />
          </div>
        )}
        <div className="flex gap-3 p-3">
          {/* Square avatar */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Avatar className="h-full w-full rounded-lg">
              <AvatarImage
                src={provider.user.avatar_url ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            {featured && (
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 px-1.5 py-0.5 text-center">
                <span className="text-[10px] font-semibold text-white">
                  Destaque
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <h3 className="font-semibold text-foreground leading-tight truncate">
              {provider.user.full_name}
            </h3>

            {provider.categories.length > 0 && (
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className="rounded-md bg-accent text-accent-foreground text-[11px] font-medium px-2 py-0"
                >
                  {provider.categories[0].name}
                </Badge>
              </div>
            )}

            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              {provider.average_rating !== null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">
                    {provider.average_rating}
                  </span>
                  <span>({provider.review_count})</span>
                </span>
              )}
              {provider.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {provider.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
