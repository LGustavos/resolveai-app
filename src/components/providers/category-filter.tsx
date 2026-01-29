"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Paintbrush,
  Zap,
  Droplets,
  Sparkles,
  HardHat,
  LayoutGrid,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  pintor: Paintbrush,
  eletricista: Zap,
  encanador: Droplets,
  diarista: Sparkles,
  pedreiro: HardHat,
};

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeSlug?: string;
  providerCounts?: Record<string, number>;
}

export function CategoryFilter({ categories, activeSlug, providerCounts }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === activeSlug) {
      params.delete("categoria");
    } else {
      params.set("categoria", slug);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Categorias</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;
          const Icon = iconMap[cat.slug] || LayoutGrid;
          const count = providerCounts?.[cat.slug];

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isActive ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{cat.name}</p>
                {count !== undefined && (
                  <p className="text-[10px] text-muted-foreground">
                    {count} profissionais
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
