"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/profile", label: "Perfil", icon: User },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <span className="text-sm font-bold text-white">R</span>
          </div>
          <span className="text-lg font-bold text-foreground">
            ResolveAí
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-lg px-3 text-sm",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
