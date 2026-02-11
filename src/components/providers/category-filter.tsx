"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { CATEGORY_GROUPS } from "@/lib/constants";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeSlug?: string;
  limit?: number;
}

export function CategoryFilter({ categories, activeSlug, limit }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(() => {
    if (!activeSlug) return null;
    const group = CATEGORY_GROUPS.find((g) =>
      (g.subcategories as readonly string[]).includes(activeSlug)
    );
    return group?.slug ?? null;
  });

  const displayedGroups = limit ? CATEGORY_GROUPS.slice(0, limit) : CATEGORY_GROUPS;
  const hasMore = limit ? CATEGORY_GROUPS.length > limit : false;

  function handleGroupClick(groupSlug: string) {
    if (expandedGroup === groupSlug) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupSlug);
    }
  }

  function handleSubcategoryClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === activeSlug) {
      params.delete("categoria");
    } else {
      params.set("categoria", slug);
    }
    router.push(`?${params.toString()}`);
  }

  // Check if active slug belongs to a group
  function isGroupActive(groupSlug: string) {
    const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);
    if (!group || !activeSlug) return false;
    return (group.subcategories as readonly string[]).includes(activeSlug);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>
        {hasMore && (
          <Link
            href="/categorias"
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {displayedGroups.map((group) => {
          const isActive = isGroupActive(group.slug);
          const isExpanded = expandedGroup === group.slug;
          const Icon = getCategoryIcon(group.slug);
          const groupCategories = categories.filter((c) =>
            (group.subcategories as readonly string[]).includes(c.slug)
          );

          return (
            <div key={group.slug}>
              <button
                onClick={() => handleGroupClick(group.slug)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 transition-all",
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-white text-foreground hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isActive ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex-1 text-left text-sm font-medium">
                  {group.name}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {isExpanded && groupCategories.length > 0 && (
                <div className="mt-1 ml-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {groupCategories.map((cat) => {
                    const isSubActive = cat.slug === activeSlug;
                    const SubIcon = getCategoryIcon(cat.slug);

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSubcategoryClick(cat.slug)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                          isSubActive
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                      >
                        <SubIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
