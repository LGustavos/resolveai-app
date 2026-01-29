"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
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
    currentUser &&
    currentUser.role === "CLIENT" &&
    !alreadyReviewed;

  return (
    <div className="space-y-5 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Profile header */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={provider.user.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-xl font-bold">{provider.user.full_name}</h1>

        {provider.categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
            {provider.categories.map((cat) => (
              <Badge
                key={cat.id}
                variant="secondary"
                className="rounded-md bg-accent text-accent-foreground text-xs font-medium"
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-3 text-sm">
          {provider.average_rating !== null && (
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(provider.average_rating!)
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{provider.average_rating}</span>
              <span className="text-muted-foreground">
                ({provider.review_count})
              </span>
              {canReview && (
                <Link
                  href={`/provider/${provider.id}/review`}
                  className="ml-1 text-primary font-medium"
                >
                  Avaliar
                </Link>
              )}
            </div>
          )}
        </div>

        {provider.neighborhood && (
          <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {provider.neighborhood}
          </div>
        )}
      </div>

      {/* Description */}
      {provider.description && (
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold">Sobre</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {provider.description}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={cn(
              "flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === "portfolio"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            Portfólio
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            Avaliações ({provider.review_count})
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            )
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma avaliação ainda. Seja o primeiro!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
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
