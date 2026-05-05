import admin from "firebase-admin"

/**
 * Initializes Firebase Admin SDK if not already initialized
 */
function initializeFirebaseAdmin() {
	if (admin.apps.length > 0) {
		return admin.apps[0]!
	}

	const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
	if (!serviceAccountKey) {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_KEY não configurada. Adicione a chave do Firebase Service Account nas variáveis de ambiente."
		)
	}

	let serviceAccount: object
	try {
		// Try to parse as JSON
		serviceAccount = JSON.parse(serviceAccountKey)
	} catch {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_KEY é inválida. Deve ser um JSON válido."
		)
	}

	return admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	})
}

export interface SendNotificationOptions {
	title: string
	body: string
	icon?: string
	badge?: string
	tag?: string
	data?: Record<string, string>
}

/**
 * Send a notification to a single device using FCM
 */
export async function sendNotificationToDevice(
	deviceToken: string,
	options: SendNotificationOptions
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
	try {
		initializeFirebaseAdmin()
		const messaging = admin.messaging()

		const message: admin.messaging.Message = {
			notification: {
				title: options.title,
				body: options.body,
				...(options.icon && { imageUrl: options.icon })
			},
			webpush: {
				notification: {
					title: options.title,
					body: options.body,
					icon: options.icon,
					badge: options.badge,
					tag: options.tag
				},
				...(options.data && { data: options.data })
			},
			android: {
				notification: {
					title: options.title,
					body: options.body,
					icon: options.icon,
					tag: options.tag
				},
				...(options.data && { data: options.data })
			},
			apns: {
				payload: {
					aps: {
						alert: {
							title: options.title,
							body: options.body
						},
						sound: "default",
						badge: 1
					}
				},
				...(options.data && { customData: options.data })
			},
			token: deviceToken
		}

		const messageId = await (messaging as any).send(message)

		console.log("[FCM] Notification sent successfully:", {
			messageId,
			deviceToken: deviceToken.substring(0, 20) + "..."
		})

		return { ok: true, messageId }
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error("[FCM] Error sending notification:", message)
		return {
			ok: false,
			error: message
		}
	}
}

/**
 * Send notifications to multiple devices
 */
export async function sendNotificationToDevices(
	deviceTokens: string[],
	options: SendNotificationOptions
): Promise<
	| {
			ok: true
			successCount: number
			failureCount: number
			failures: Array<{ token: string; error: string }>
	  }
	| {
			ok: false
			error: string
	  }
> {
	try {
		initializeFirebaseAdmin()
		const messaging = admin.messaging()

		const message: admin.messaging.MulticastMessage = {
			notification: {
				title: options.title,
				body: options.body,
				...(options.icon && { imageUrl: options.icon })
			},
			webpush: {
				notification: {
					title: options.title,
					body: options.body,
					icon: options.icon,
					badge: options.badge,
					tag: options.tag
				},
				...(options.data && { data: options.data })
			},
			android: {
				notification: {
					title: options.title,
					body: options.body,
					icon: options.icon,
					tag: options.tag
				},
				...(options.data && { data: options.data })
			},
			apns: {
				payload: {
					aps: {
						alert: {
							title: options.title,
							body: options.body
						},
						sound: "default",
						badge: 1
					}
				},
				...(options.data && { customData: options.data })
			},
			tokens: deviceTokens
		}

		// Send to multiple devices
		const results = await (messaging as any).sendMulticast(message)

		const failures = results.responses
			.map((response: any, index: number) => ({
				token: deviceTokens[index]!,
				response
			}))
			.filter(({ response }: any) => !response.success)
			.map(({ token, response }: any) => ({
				token,
				error: response.error?.message || "Unknown error"
			}))

		console.log("[FCM] Multicast send completed:", {
			successCount: results.successCount,
			failureCount: results.failureCount
		})

		return {
			ok: true,
			successCount: results.successCount,
			failureCount: results.failureCount,
			failures
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error("[FCM] Error sending multicast notification:", message)
		return {
			ok: false,
			error: message
		}
	}
}

/**
 * Send a notification to all users (broadcast)
 * ⚠️ WARNING: This sends to ALL registered devices
 */
export async function broadcastNotification(
	options: SendNotificationOptions,
	tokens: string[]
): Promise<
	| {
			ok: true
			successCount: number
			failureCount: number
			failures: Array<{ token: string; error: string }>
	  }
	| {
			ok: false
			error: string
	  }
> {
	if (tokens.length === 0) {
		return {
			ok: true,
			successCount: 0,
			failureCount: 0,
			failures: []
		}
	}

	return sendNotificationToDevices(tokens, options)
}
