"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white hover:bg-muted transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
