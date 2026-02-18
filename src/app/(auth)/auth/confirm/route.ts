import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Redirect based on type or custom next parameter
      if (next) {
        redirectTo.pathname = next;
      } else if (type === "recovery") {
        redirectTo.pathname = "/reset-password";
      } else {
        redirectTo.pathname = "/home";
      }
      return NextResponse.redirect(redirectTo);
    }
  }

  // On error, redirect to login with error message
  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("error", "Link inválido ou expirado. Tente novamente.");
  return NextResponse.redirect(redirectTo);
}
