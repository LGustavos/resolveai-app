"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  MessageCircle,
  ArrowLeft,
  ImageIcon,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/review-card";
import { getWhatsAppUrl } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProviderDetailProps {
  provider: {
    id: string;
    description: string;
    neighborhood: string;
    whatsapp: string;
    user: { full_name: string; avatar_url: string | null };
    categories: { id: string; name: string; slug: string }[];
    portfolio: { id: string; image_url: string; created_at: string }[];
    average_rating: number | null;
    review_count: number;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    client: { full_name: string; avatar_url: string | null };
  }[];
  currentUser: { id: string; role: string } | null;
  alreadyReviewed: boolean;
}

export function ProviderDetail({
  provider,
  reviews,
  currentUser,
  alreadyReviewed,
}: ProviderDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"portfolio" | "reviews">(
    "portfolio"
  );

  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const canReview =
    currentUser && currentUser.role === "CLIENT" && !alreadyReviewed;

  return (
    <div className="pb-24">
      {/* Blue gradient banner */}
      <div className="relative -mx-4 -mt-6">
        <div className="h-36 w-full bg-linear-to-br from-primary via-primary/90 to-sky-400 rounded-b-3xl">
          {/* Back button on banner */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>

        {/* Avatar overlapping the banner */}
        <div className="px-4 -mt-12">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={provider.user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-3 space-y-2">
        <h1 className="text-xl font-bold">{provider.user.full_name}</h1>

        {provider.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {provider.categories.map((cat) => (
              <Badge
                key={cat.id}
                className="rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium border-0 hover:bg-emerald-100"
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        {provider.average_rating !== null && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(provider.average_rating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">
              {provider.average_rating}
            </span>
            <span className="text-sm text-muted-foreground">
              ({provider.review_count} avaliações)
            </span>
          </div>
        )}

        {provider.neighborhood && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {provider.neighborhood}
          </div>
        )}
      </div>

      {/* Description */}
      {provider.description && (
        <div className="mt-5 rounded-xl border border-border bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold">Sobre</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {provider.description}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors",
              activeTab === "portfolio"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ImageIcon className="h-4 w-4" />
            Portfólio
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors",
              activeTab === "reviews"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Avaliações
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "portfolio" ? (
            provider.portfolio.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto no portfólio ainda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {provider.portfolio.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-lg"
                  >
                    <Image
                      src={img.image_url}
                      alt="Trabalho do portfólio"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {/* Rating summary header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold">
                    {provider.average_rating ?? "0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({provider.review_count})
                  </span>
                </div>
                {canReview && (
                  <Link href={`/provider/${provider.id}/review`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-primary/30 text-primary font-medium"
                    >
                      Avaliar
                    </Button>
                  </Link>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma avaliação ainda. Seja o primeiro!
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed WhatsApp button */}
      {provider.whatsapp && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:bottom-6">
          <div className="mx-auto max-w-5xl">
            <a
              href={getWhatsAppUrl(provider.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full h-12 rounded-xl gap-2.5 bg-emerald-500 text-white font-semibold text-base shadow-lg hover:bg-emerald-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
                Chamar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
