"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  uploadPortfolioImage,
  deletePortfolioImage,
} from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/constants";

interface PortfolioManagerProps {
  providerId: string;
  userId: string;
  images: { id: string; image_url: string; created_at: string }[];
}

export function PortfolioManager({
  providerId,
  userId,
  images: initialImages,
}: PortfolioManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { error } = await uploadPortfolioImage(
      supabase,
      providerId,
      userId,
      file
    );

    if (error) {
      toast.error(
        "message" in error ? error.message : "Erro ao enviar imagem."
      );
    } else {
      toast.success("Imagem adicionada!");
      router.refresh();
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(imageId: string, imageUrl: string) {
    const { error } = await deletePortfolioImage(supabase, imageId, imageUrl);

    if (error) {
      toast.error("Erro ao remover imagem.");
    } else {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Imagem removida!");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-5">
      {/* Header with counter and upload */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {images.length} de {MAX_PORTFOLIO_IMAGES} fotos
          </p>
          <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-bg transition-all"
              style={{
                width: `${(images.length / MAX_PORTFOLIO_IMAGES) * 100}%`,
              }}
            />
          </div>
        </div>
        {images.length < MAX_PORTFOLIO_IMAGES && (
          <label className="cursor-pointer">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2 border-primary/30 text-primary"
              asChild
              disabled={uploading}
            >
              <span>
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Enviando..." : "Adicionar"}
              </span>
            </Button>
          </label>
        )}
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <ImagePlus className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhuma imagem ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione fotos dos seus trabalhos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={img.image_url}
                alt="Portfólio"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              <button
                onClick={() => handleDelete(img.id, img.image_url)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
