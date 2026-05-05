"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { subscribeForegroundMessages } from "@/lib/firebase/messaging";

export function PushForegroundListener() {
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    subscribeForegroundMessages((payload) => {
      const title =
        payload.notification?.title ?? payload.data?.title ?? "Nova notificação";
      const body = payload.notification?.body ?? payload.data?.body ?? "";

      toast(title, {
        description: body || undefined,
      });
    })
      .then((listenerUnsubscribe) => {
        if (!mounted) {
          listenerUnsubscribe?.();
          return;
        }

        unsubscribe = listenerUnsubscribe;
      })
      .catch((error) => {
        console.error("[FCM] erro ao escutar mensagens em foreground", error);
      });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return null;
}
