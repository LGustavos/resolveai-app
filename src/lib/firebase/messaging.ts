import {
	getMessaging,
	getToken,
	isSupported,
	onMessage,
	type MessagePayload,
	type Unsubscribe
} from "firebase/messaging"
import { getFirebaseClientApp } from "@/lib/firebase/app"
import {
	firebaseVapidKey,
	hasFirebaseClientConfig
} from "@/lib/firebase/config"
import { saveFcmToken } from "@/lib/supabase/fcm"

const FCM_TOKEN_STORAGE_KEY = "eufaco:fcm-token"

export type EnablePushNotificationsResult =
	| { ok: true; token: string }
	| {
			ok: false
			reason:
				| "unsupported"
				| "missing-config"
				| "missing-vapid-key"
				| "permission-denied"
				| "service-worker-unavailable"
				| "token-unavailable"
				| "unexpected-error"
			message: string
	  }

export function isPushNotificationsSupportedInBrowser(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof Notification !== "undefined" &&
		"serviceWorker" in navigator &&
		"PushManager" in window
	)
}

export function getStoredFcmToken(): string | null {
	if (typeof window === "undefined") {
		return null
	}

	return localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
}

export function clearStoredFcmToken() {
	if (typeof window === "undefined") {
		return
	}

	const token = localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
	localStorage.removeItem(FCM_TOKEN_STORAGE_KEY)

	// Delete from Supabase if token exists (fire and forget)
	if (token) {
		import("@/lib/supabase/fcm").then(({ deleteFcmToken }) => {
			deleteFcmToken(token)
				.then((result) => {
					if (result.ok) {
						console.log("[FCM] Token deletado do Supabase com sucesso")
					} else {
						console.warn("[FCM] Erro ao deletar token do Supabase:", result.error)
					}
				})
				.catch((error) => {
					console.error("[FCM] Erro inesperado ao deletar token do Supabase:", error)
				})
		})
	}
}

export async function enablePushNotifications(): Promise<EnablePushNotificationsResult> {
	if (!isPushNotificationsSupportedInBrowser()) {
		return {
			ok: false,
			reason: "unsupported",
			message: "Este navegador não suporta notificações push."
		}
	}

	console.log("[FCM] hasFirebaseClientConfig:", hasFirebaseClientConfig)
	console.log("[FCM] firebaseVapidKey presente:", !!firebaseVapidKey)

	if (!hasFirebaseClientConfig) {
		console.error("[FCM] Configuração Firebase incompleta")
		return {
			ok: false,
			reason: "missing-config",
			message:
				"Configuração Firebase incompleta. Verifique as variáveis NEXT_PUBLIC_FIREBASE_*."
		}
	}

	if (!firebaseVapidKey) {
		console.error("[FCM] VAPID key faltando")
		return {
			ok: false,
			reason: "missing-vapid-key",
			message:
				"Falta NEXT_PUBLIC_FIREBASE_VAPID_KEY. Gere a chave Web Push no Firebase Console."
		}
	}

	if (Notification.permission === "denied") {
		return {
			ok: false,
			reason: "permission-denied",
			message:
				"Permissão de notificação bloqueada no navegador. Libere nas configurações do site."
		}
	}

	const permission =
		Notification.permission === "granted"
			? "granted"
			: await Notification.requestPermission()

	if (permission !== "granted") {
		return {
			ok: false,
			reason: "permission-denied",
			message: "Permissão de notificação não foi concedida."
		}
	}

	try {
		const messagingSupported = await isSupported()

		if (!messagingSupported) {
			return {
				ok: false,
				reason: "unsupported",
				message: "FCM não é suportado neste navegador."
			}
		}

		const serviceWorkerRegistration = await getOrRegisterServiceWorker()

		if (!serviceWorkerRegistration) {
			return {
				ok: false,
				reason: "service-worker-unavailable",
				message:
					"Service Worker indisponível. Push funciona apenas em HTTPS/produção."
			}
		}

		const firebaseApp = getFirebaseClientApp()
		if (!firebaseApp) {
			return {
				ok: false,
				reason: "missing-config",
				message: "Não foi possível inicializar o app Firebase."
			}
		}

		const messaging = getMessaging(firebaseApp)
		const token = await getToken(messaging, {
			vapidKey: firebaseVapidKey,
			serviceWorkerRegistration
		})

		if (!token) {
			return {
				ok: false,
				reason: "token-unavailable",
				message: "Não foi possível gerar token FCM para este dispositivo."
			}
		}

		// Store locally
		localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token)

		// Save to Supabase (fire and forget - don't block on errors)
		saveFcmToken(token, "web")
			.then((result) => {
				if (result.ok) {
					console.log("[FCM] Token salvo no Supabase com sucesso")
				} else {
					console.warn("[FCM] Erro ao salvar token no Supabase:", result.error)
				}
			})
			.catch((error) => {
				console.error("[FCM] Erro inesperado ao salvar token no Supabase:", error)
			})

		return { ok: true, token }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error("[FCM] erro ao ativar notificações", error)

		// Check for specific error patterns
		if (errorMessage.includes("PGRST116") || errorMessage.includes("not found")) {
			return {
				ok: false,
				reason: "unexpected-error",
				message: "Erro: Tabela de tokens não existe. Contate o administrador."
			}
		}

		if (errorMessage.includes("permission")) {
			return {
				ok: false,
				reason: "unexpected-error",
				message: "Erro de permissão ao salvar token. Verifique suas permissões."
			}
		}

		return {
			ok: false,
			reason: "unexpected-error",
			message: "Falha ao ativar notificações push: " + errorMessage
		}
	}
}

export async function subscribeForegroundMessages(
	callback: (payload: MessagePayload) => void
): Promise<Unsubscribe | null> {
	if (!isPushNotificationsSupportedInBrowser() || !hasFirebaseClientConfig) {
		return null
	}

	const messagingSupported = await isSupported()
	if (!messagingSupported) {
		return null
	}

	const firebaseApp = getFirebaseClientApp()
	if (!firebaseApp) {
		return null
	}

	const messaging = getMessaging(firebaseApp)
	return onMessage(messaging, callback)
}

async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!("serviceWorker" in navigator)) return null

	try {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/"
		})

		// Já está ativo, retorna imediatamente
		if (registration.active) return registration

		// Espera qualquer SW (installing ou waiting) ativar
		return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error("SW timeout")), 15_000)

			// Tenta pegar o SW que está em progresso
			const sw =
				registration.installing ?? registration.waiting ?? registration.active

			if (!sw) {
				clearTimeout(timeout)
				reject(new Error("Nenhum SW encontrado"))
				return
			}

			if (sw.state === "activated") {
				clearTimeout(timeout)
				resolve(registration)
				return
			}

			sw.addEventListener("statechange", () => {
				if (sw.state === "activated") {
					clearTimeout(timeout)
					resolve(registration)
				} else if (sw.state === "redundant") {
					clearTimeout(timeout)
					reject(new Error("SW redundant"))
				}
			})
		})
	} catch (error) {
		console.error("[FCM] Erro ao registrar Service Worker:", error)
		return null
	}
}
