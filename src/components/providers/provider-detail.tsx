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
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
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
    city: string;
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const canReview =
    currentUser && currentUser.role === "CLIENT" && !alreadyReviewed;

  async function handleShare() {
    const url = `${window.location.origin}/provider/${provider.id}`;
    const shareData = {
      title: `${provider.user.full_name} - ResolveAí`,
      text: `Confira o perfil de ${provider.user.full_name} no ResolveAí`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }

  return (
    <div className="pb-24">
      {/* Blue gradient banner */}
      <div className="relative -mx-4 -mt-6">
        <div className="h-40 w-full bg-linear-to-br from-primary via-primary/90 to-sky-400 rounded-b-3xl">
          {/* Back button on banner */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {/* Share button on banner */}
          <button
            onClick={handleShare}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar overlapping the banner */}
        <div className="px-4 -mt-14">
          <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
            <AvatarImage src={provider.user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-3 space-y-2.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {provider.user.full_name}
          </h1>
          {provider.city && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {provider.city}
            </div>
          )}
        </div>

        {provider.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {provider.categories.map((cat) => (
              <Badge
                key={cat.id}
                className="rounded-full bg-primary/10 text-primary text-xs font-medium border-0 hover:bg-primary/10 px-3"
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stats card */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold">
              {provider.average_rating ?? "-"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Nota</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <span className="text-lg font-bold">{provider.review_count}</span>
          <p className="text-xs text-muted-foreground mt-0.5">Avaliações</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <span className="text-lg font-bold">
            {provider.portfolio.length}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">Fotos</p>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <div className="mt-4 rounded-xl border border-border bg-white p-4">
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
            Portfólio ({provider.portfolio.length})
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
            Avaliações ({provider.review_count})
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "portfolio" ? (
            provider.portfolio.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                  <ImageIcon className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">
                  Nenhuma foto no portfólio
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Este prestador ainda não adicionou fotos
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {provider.portfolio.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative aspect-square overflow-hidden rounded-xl"
                  >
                    <Image
                      src={img.image_url}
                      alt="Trabalho do portfólio"
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 640px) 33vw, 33vw"
                    />
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {/* Rating summary header */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold">
                      {provider.average_rating ?? "0"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {provider.review_count} avaliações
                    </p>
                  </div>
                </div>
                {canReview && (
                  <Link href={`/provider/${provider.id}/review`}>
                    <Button
                      size="sm"
                      className="rounded-lg font-medium gradient-bg"
                    >
                      Avaliar
                    </Button>
                  </Link>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <MessageSquare className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">
                    Nenhuma avaliação ainda
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Seja o primeiro a avaliar!
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-5 w-5" />
          </button>

          {provider.portfolio.length > 1 && (
            <>
              <button
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + provider.portfolio.length) %
                      provider.portfolio.length
                  );
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex + 1) % provider.portfolio.length
                  );
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-[90vw] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={provider.portfolio[lightboxIndex].image_url}
              alt="Portfólio"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <div className="absolute bottom-4 text-sm text-white/60">
            {lightboxIndex + 1} / {provider.portfolio.length}
          </div>
        </div>
      )}

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
