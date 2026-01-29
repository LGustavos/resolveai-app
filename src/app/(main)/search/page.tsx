import { createClient } from "@/lib/supabase/server";
import {
  getActiveProviders,
  getCategories,
  getNeighborhoods,
} from "@/lib/supabase/queries";
import { ProviderCard } from "@/components/providers/provider-card";
import { SearchFilters } from "@/components/providers/search-filters";
import { ProviderGrid } from "@/components/providers/provider-grid";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    bairro?: string;
    ordenar?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [providers, categories, neighborhoods] = await Promise.all([
    getActiveProviders(supabase, {
      categorySlug: params.categoria,
      neighborhood: params.bairro,
      orderBy: params.ordenar === "avaliacao" ? "rating" : "recent",
    }),
    getCategories(supabase),
    getNeighborhoods(supabase),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Buscar</h1>

      <SearchFilters
        categories={categories}
        neighborhoods={neighborhoods}
        activeCategory={params.categoria}
        activeNeighborhood={params.bairro}
        activeOrder={params.ordenar}
      />

      <p className="text-sm text-muted-foreground">
        {providers.length} resultado{providers.length !== 1 ? "s" : ""}
      </p>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">
            Nenhum resultado encontrado
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Tente ajustar os filtros
          </p>
        </div>
      ) : (
        <ProviderGrid>
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </ProviderGrid>
      )}
    </div>
  );
}
