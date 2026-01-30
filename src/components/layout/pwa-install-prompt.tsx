"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed
    if (localStorage.getItem("pwa-install-dismissed")) {
      setDismissed(true);
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem("pwa-install-dismissed", "1");
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:w-80">
      <div className="rounded-xl border border-border bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-bg">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">
              Instalar ResolveAí
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Acesse mais rápido direto da tela inicial
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="h-8 rounded-lg gradient-bg text-xs font-semibold"
                onClick={handleInstall}
              >
                Instalar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs text-muted-foreground"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
