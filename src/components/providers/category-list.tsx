"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

interface CategoryListProps {
  categories: { id: string; name: string; slug: string }[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} categoria{filtered.length !== 1 ? "s" : ""}{" "}
        {search
          ? `encontrada${filtered.length !== 1 ? "s" : ""}`
          : `disponíve${filtered.length !== 1 ? "is" : "l"}`}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">
            Nenhuma categoria encontrada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente buscar com outro termo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {filtered.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/search?categoria=${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
