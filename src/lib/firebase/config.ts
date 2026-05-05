import type { FirebaseOptions } from "firebase/app"

const rawFirebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "",
	messagingSenderId:
		process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() ?? ""
}

if (typeof window !== "undefined") {
	console.log("[Firebase Config Loaded]", {
		apiKey: rawFirebaseConfig.apiKey ? "✓" : "✗",
		authDomain: rawFirebaseConfig.authDomain ? "✓" : "✗",
		projectId: rawFirebaseConfig.projectId ? "✓" : "✗",
		storageBucket: rawFirebaseConfig.storageBucket ? "✓" : "✗",
		messagingSenderId: rawFirebaseConfig.messagingSenderId ? "✓" : "✗",
		appId: rawFirebaseConfig.appId ? "✓" : "✗",
		vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? "✓" : "✗"
	})
}

export const hasFirebaseClientConfig = [
	rawFirebaseConfig.apiKey,
	rawFirebaseConfig.authDomain,
	rawFirebaseConfig.projectId,
	rawFirebaseConfig.storageBucket,
	rawFirebaseConfig.messagingSenderId,
	rawFirebaseConfig.appId
].every(Boolean)

export const firebaseClientConfig: FirebaseOptions | null =
	hasFirebaseClientConfig
		? {
				apiKey: rawFirebaseConfig.apiKey,
				authDomain: rawFirebaseConfig.authDomain,
				projectId: rawFirebaseConfig.projectId,
				storageBucket: rawFirebaseConfig.storageBucket,
				messagingSenderId: rawFirebaseConfig.messagingSenderId,
				appId: rawFirebaseConfig.appId,
				...(rawFirebaseConfig.measurementId
					? { measurementId: rawFirebaseConfig.measurementId }
					: {})
			}
		: null

export const firebaseVapidKey =
	process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? ""
