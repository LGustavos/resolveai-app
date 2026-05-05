import { createAdminClient } from "@/lib/supabase/admin"
import type { FcmToken } from "@/types/database"

/**
 * Get all FCM tokens for a specific user
 */
export async function getUserTokensAdmin(
	userId: string
): Promise<FcmToken[] | null> {
	try {
		const supabase = createAdminClient()

		const { data, error } = await supabase
			.from("fcm_tokens")
			.select()
			.eq("user_id", userId)

		if (error) {
			console.error("[getUserTokensAdmin] Error:", error.message)
			return null
		}

		return (data || []) as FcmToken[]
	} catch (error) {
		console.error("[getUserTokensAdmin] Unexpected error:", error)
		return null
	}
}

/**
 * Get all FCM tokens for multiple users
 */
export async function getUsersTokensAdmin(
	userIds: string[]
): Promise<Record<string, FcmToken[]>> {
	try {
		const supabase = createAdminClient()

		const { data, error } = await supabase
			.from("fcm_tokens")
			.select()
			.in("user_id", userIds)

		if (error) {
			console.error("[getUsersTokensAdmin] Error:", error.message)
			return {}
		}

		// Group tokens by user_id
		const grouped: Record<string, FcmToken[]> = {}
		userIds.forEach((id) => {
			grouped[id] = []
		})
		;(data || []).forEach((token) => {
			if (grouped[token.user_id]) {
				grouped[token.user_id].push(token as FcmToken)
			}
		})

		return grouped
	} catch (error) {
		console.error("[getUsersTokensAdmin] Unexpected error:", error)
		return {}
	}
}

/**
 * Get all active FCM tokens (e.g., for broadcast notifications)
 */
export async function getAllActiveTokensAdmin(): Promise<FcmToken[] | null> {
	try {
		const supabase = createAdminClient()

		const { data, error } = await supabase
			.from("fcm_tokens")
			.select()
			.order("created_at", { ascending: false })

		if (error) {
			console.error("[getAllActiveTokensAdmin] Error:", error.message)
			return null
		}

		return (data || []) as FcmToken[]
	} catch (error) {
		console.error("[getAllActiveTokensAdmin] Unexpected error:", error)
		return null
	}
}

/**
 * Delete an FCM token (called when token is invalid/expired)
 */
export async function deleteTokenAdmin(tokenId: string): Promise<boolean> {
	try {
		const supabase = createAdminClient()

		const { error } = await supabase.from("fcm_tokens").delete().eq("id", tokenId)

		if (error) {
			console.error("[deleteTokenAdmin] Error:", error.message)
			return false
		}

		return true
	} catch (error) {
		console.error("[deleteTokenAdmin] Unexpected error:", error)
		return false
	}
}

/**
 * Delete tokens by token string
 */
export async function deleteTokenByStringAdmin(
	token: string
): Promise<boolean> {
	try {
		const supabase = createAdminClient()

		const { error } = await supabase
			.from("fcm_tokens")
			.delete()
			.eq("token", token)

		if (error) {
			console.error("[deleteTokenByStringAdmin] Error:", error.message)
			return false
		}

		return true
	} catch (error) {
		console.error("[deleteTokenByStringAdmin] Unexpected error:", error)
		return false
	}
}

/**
 * Update last_used_at timestamp for a token
 */
export async function updateTokenLastUsedAdmin(
	tokenId: string
): Promise<boolean> {
	try {
		const supabase = createAdminClient()

		const { error } = await supabase
			.from("fcm_tokens")
			.update({
				last_used_at: new Date().toISOString()
			})
			.eq("id", tokenId)

		if (error) {
			console.error("[updateTokenLastUsedAdmin] Error:", error.message)
			return false
		}

		return true
	} catch (error) {
		console.error("[updateTokenLastUsedAdmin] Unexpected error:", error)
		return false
	}
}
