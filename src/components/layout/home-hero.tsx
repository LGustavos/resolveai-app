"use client";

import { Search } from "lucide-react";
import Link from "next/link";

export function HomeHero() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá! O que você
          <br />
          precisa resolver?
        </h1>
      </div>

      <Link href="/search" className="block">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-muted-foreground shadow-sm transition-shadow hover:shadow-md">
          <Search className="h-5 w-5" />
          <span className="text-sm">Buscar profissionais...</span>
        </div>
      </Link>
    </div>
  );
}
