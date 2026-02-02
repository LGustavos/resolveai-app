import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  // Handle OAuth errors from Supabase
  const error = searchParams.get("error");
  if (error) {
    const desc =
      searchParams.get("error_description") ?? "Erro na autenticação";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(desc)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
