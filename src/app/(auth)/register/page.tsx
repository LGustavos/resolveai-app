"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signUpWithEmail, signInWithGoogle } from "@/lib/supabase/mutations";
import { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search as SearchIcon, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 3) {
      toast.error("Informe seu nome completo (mínimo 3 caracteres).");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Informe um email válido.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await signUpWithEmail(
      supabase,
      email.trim(),
      password,
      fullName.trim(),
      role
    );

    if (error) {
      toast.error(error.message || "Erro ao criar conta.");
      setLoading(false);
      return;
    }

    toast.success("Conta criada! Verifique seu email para confirmar.");
    router.push("/login");
  }

  async function handleGoogleSignUp() {
    const { error } = await signInWithGoogle(supabase);
    if (error) {
      toast.error("Erro ao entrar com Google.");
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha como deseja usar o ResolveAí
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Eu quero...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                  role === "CLIENT"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border"
                )}
              >
                <SearchIcon
                  className={cn(
                    "h-6 w-6",
                    role === "CLIENT"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      role === "CLIENT" ? "text-primary" : "text-foreground"
                    )}
                  >
                    Quero contratar
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Busco serviços
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("PROVIDER")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                  role === "PROVIDER"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border"
                )}
              >
                <Wrench
                  className={cn(
                    "h-6 w-6",
                    role === "PROVIDER"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      role === "PROVIDER" ? "text-primary" : "text-foreground"
                    )}
                  >
                    Quero oferecer
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ofereço serviços
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Nome completo
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-lg border-border"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border-border"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-border"
              minLength={6}
              required
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Ao criar uma conta, você concorda com os{" "}
            <Link href="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>

          <Button
            type="submit"
            className="w-full h-11 rounded-lg font-semibold gradient-bg"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-muted-foreground">
              ou continue com
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-11 rounded-lg gap-3 border-border"
          onClick={handleGoogleSignUp}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar com Google
        </Button>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
