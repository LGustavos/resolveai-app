"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  neighborhoods: string[];
  activeCategory?: string;
  activeNeighborhood?: string;
  activeOrder?: string;
  activeSearch?: string;
}

export function SearchFilters({
  categories,
  neighborhoods,
  activeCategory,
  activeNeighborhood,
  activeOrder,
  activeSearch,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(activeSearch ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/search?${params.toString()}`);
  }

  const hasActiveFilters = activeCategory || activeNeighborhood;

  return (
    <div className="space-y-3">
      {/* Search bar + filter button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar profissionais..."
            className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("q", searchTerm.trim() || "all");
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 shrink-0 rounded-lg border ${
            hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "border-border"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center justify-between">
        <Select
          value={activeOrder ?? "recentes"}
          onValueChange={(v) => updateParam("ordenar", v)}
        >
          <SelectTrigger className="h-8 w-auto gap-1.5 rounded-lg border-border bg-white px-3 text-xs font-medium">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="avaliacao">Melhor avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter bottom sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Categoria
                </label>
                <Select
                  value={activeCategory ?? "all"}
                  onValueChange={(v) => updateParam("categoria", v)}
                >
                  <SelectTrigger className="h-11 rounded-lg border-border">
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Bairro
                </label>
                <Select
                  value={activeNeighborhood ?? "all"}
                  onValueChange={(v) => updateParam("bairro", v)}
                >
                  <SelectTrigger className="h-11 rounded-lg border-border">
                    <SelectValue placeholder="Todos bairros" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">Todos bairros</SelectItem>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full h-11 rounded-lg gradient-bg font-semibold"
                onClick={() => setShowFilters(false)}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
