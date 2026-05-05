"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  enablePushNotifications,
  getStoredFcmToken,
  isPushNotificationsSupportedInBrowser,
} from "@/lib/firebase/messaging";

type PushStatus = "loading" | "ready" | "enabled" | "blocked" | "unsupported";

export function PushNotificationsCard() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [feedback, setFeedback] = useState<string>("");
  const [tokenPreview, setTokenPreview] = useState<string>("");

  useEffect(() => {
    if (!isPushNotificationsSupportedInBrowser()) {
      setStatus("unsupported");
      setFeedback("Seu navegador atual não suporta notificações push.");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("blocked");
      setFeedback(
        "Notificações bloqueadas. Libere nas configurações do navegador para receber avisos.",
      );
      return;
    }

    const storedToken = getStoredFcmToken();
    if (storedToken) {
      setStatus("enabled");
      setFeedback("Notificações push já estão ativas neste dispositivo.");
      setTokenPreview(maskToken(storedToken));
      return;
    }

    setStatus("ready");
    setFeedback("Ative para receber alertas de novas oportunidades e mensagens.");
  }, []);

  const ctaLabel = useMemo(() => {
    if (status === "loading") return "Verificando...";
    if (status === "enabled") return "Ativado";
    if (status === "blocked") return "Bloqueado";
    if (status === "unsupported") return "Indisponível";
    return "Ativar notificações";
  }, [status]);

  async function handleEnable() {
    setStatus("loading");
    setFeedback("Solicitando permissão...");

    const result = await enablePushNotifications();

    if (result.ok) {
      setStatus("enabled");
      setFeedback("Notificações push ativadas com sucesso.");
      setTokenPreview(maskToken(result.token));
      return;
    }

    if (result.reason === "permission-denied") {
      setStatus("blocked");
    } else if (result.reason === "unsupported") {
      setStatus("unsupported");
    } else {
      setStatus("ready");
    }

    setFeedback(result.message);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {status === "enabled" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : status === "blocked" || status === "unsupported" ? (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Notificações do app
          </p>
          <p className="text-xs text-muted-foreground">{feedback}</p>

          {tokenPreview && (
            <p className="text-[11px] text-muted-foreground">
              Token: {tokenPreview}
            </p>
          )}

          <Button
            type="button"
            size="sm"
            className="mt-1"
            onClick={handleEnable}
            disabled={
              status === "loading" || status === "enabled" || status === "unsupported"
            }
          >
            {status === "loading" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function maskToken(token: string): string {
  if (token.length <= 18) {
    return token;
  }

  return `${token.slice(0, 9)}...${token.slice(-9)}`;
}
