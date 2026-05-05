import { createClient } from "@/lib/supabase/client"
import type { FcmToken } from "@/types/database"

export type FCMTokenPlatform = "web" | "mobile" | "ios" | "android"

export async function saveFcmToken(
	token: string,
	platform: FCMTokenPlatform = "web"
): Promise<{ ok: true; data: FcmToken } | { ok: false; error: string }> {
	try {
		const supabase = createClient()

		// Get current user
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return {
				ok: false,
				error: "Usuário não autenticado. Faça login para ativar notificações."
			}
		}

		// Upsert the FCM token (update if exists, insert if not)
		const { data, error } = await supabase
			.from("fcm_tokens")
			.upsert(
				{
					user_id: user.id,
					token,
					platform,
					updated_at: new Date().toISOString()
				},
				{
					onConflict: "token" // If token already exists, update it
				}
			)
			.select()
			.single()

		if (error) {
			console.error("[saveFcmToken] Supabase error:", error)
			// Provide more helpful error messages
			if (error.code === "PGRST116") {
				return {
					ok: false,
					error:
						"Tabela fcm_tokens não existe. Execute a migration no Supabase: supabase/SETUP-FCM-TOKENS.sql"
				}
			}
			if (error.message?.includes("permission denied")) {
				return {
					ok: false,
					error: "Permissão negada. Verifique as RLS policies na tabela fcm_tokens."
				}
			}
			return {
				ok: false,
				error:
					"Erro ao salvar token de notificação: " +
					(error.message || error.code || "Erro desconhecido")
			}
		}

		if (!data) {
			return {
				ok: false,
				error: "Erro ao salvar token de notificação."
			}
		}

		console.log("[saveFcmToken] Token saved successfully", {
			userId: user.id,
			platform,
			tokenPreview: String(data.token).substring(0, 20) + "..."
		})

		return { ok: true, data: data as FcmToken }
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error("[saveFcmToken] Unexpected error:", message)
		return {
			ok: false,
			error: "Erro inesperado ao salvar token: " + message
		}
	}
}

export async function deleteFcmToken(
	token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	try {
		const supabase = createClient()

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return {
				ok: false,
				error: "Usuário não autenticado."
			}
		}

		const { error } = await supabase
			.from("fcm_tokens")
			.delete()
			.eq("token", token)
			.eq("user_id", user.id)

		if (error) {
			return {
				ok: false,
				error: "Erro ao deletar token: " + error.message
			}
		}

		console.log("[deleteFcmToken] Token deleted successfully")
		return { ok: true }
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error("[deleteFcmToken] Unexpected error:", message)
		return {
			ok: false,
			error: "Erro ao deletar token: " + message
		}
	}
}

export async function getUserFcmTokens(): Promise<
	{ ok: true; data: FcmToken[] } | { ok: false; error: string }
> {
	try {
		const supabase = createClient()

		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return {
				ok: false,
				error: "Usuário não autenticado."
			}
		}

		const { data, error } = await supabase
			.from("fcm_tokens")
			.select()
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })

		if (error) {
			return {
				ok: false,
				error: "Erro ao buscar tokens: " + error.message
			}
		}

		return { ok: true, data: (data || []) as FcmToken[] }
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error("[getUserFcmTokens] Unexpected error:", message)
		return {
			ok: false,
			error: "Erro ao buscar tokens: " + message
		}
	}
}
