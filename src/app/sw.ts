import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"
import { getApp, getApps, initializeApp } from "firebase/app"
import {
	getMessaging,
	isSupported as isMessagingSupportedInSw,
	onBackgroundMessage
} from "firebase/messaging/sw"
import type { FirebaseOptions } from "firebase/app"

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined
	}
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: defaultCache,
	fallbacks: {
		entries: [
			{
				url: "/offline",
				matcher({ request }) {
					return request.destination === "document"
				}
			}
		]
	}
})

serwist.addEventListeners()

void setupFirebaseMessagingInServiceWorker()

async function getFirebaseConfig(): Promise<FirebaseOptions | null> {
	try {
		const res = await fetch("/api/sw-config")
		if (!res.ok) return null

		const config: FirebaseOptions = await res.json()
		const isComplete = [
			config.apiKey,
			config.authDomain,
			config.projectId,
			config.storageBucket,
			config.messagingSenderId,
			config.appId
		].every(Boolean)

		return isComplete ? config : null
	} catch {
		return null
	}
}

async function setupFirebaseMessagingInServiceWorker() {
	try {
		const supported = await isMessagingSupportedInSw()
		if (!supported) return

		const config = await getFirebaseConfig()
		if (!config) {
			console.warn("[sw] Firebase config indisponível, FCM não inicializado")
			return
		}

		const firebaseApp = getApps().length ? getApp() : initializeApp(config)

		const messaging = getMessaging(firebaseApp)

		onBackgroundMessage(messaging, (payload) => {
			if (payload.notification?.title || payload.notification?.body) return

			const title = payload.data?.title ?? "Nova notificação"
			const body = payload.data?.body ?? ""
			const icon = payload.data?.icon ?? "/icons/icon-192.png"

			void self.registration.showNotification(title, { body, icon })
		})

		console.log("[sw] FCM inicializado com sucesso")
	} catch (error) {
		console.error("[sw] erro ao iniciar FCM", error)
	}
}
