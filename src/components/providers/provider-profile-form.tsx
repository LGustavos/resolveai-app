"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  updateProviderProfile,
  setProviderCategories,
} from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, Check } from "lucide-react";

interface ProviderProfileFormProps {
  profile: {
    id: string;
    description: string;
    neighborhood: string;
    whatsapp: string;
    is_active: boolean;
    categories: { id: string; name: string; slug: string }[];
  };
  categories: { id: string; name: string; slug: string }[];
  userId: string;
}

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function unformatWhatsApp(value: string): string {
  return value.replace(/\D/g, "");
}

export function ProviderProfileForm({
  profile,
  categories,
}: ProviderProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [description, setDescription] = useState(profile.description);
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
  const [whatsapp, setWhatsapp] = useState(formatWhatsApp(profile.whatsapp));
  const [isActive, setIsActive] = useState(profile.is_active);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    profile.categories.map((c) => c.id)
  );
  const [loading, setLoading] = useState(false);

  function toggleCategory(categoryId: string) {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  function handleWhatsAppChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setWhatsapp(formatWhatsApp(digits));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const rawWhatsapp = unformatWhatsApp(whatsapp);

    if (rawWhatsapp && (rawWhatsapp.length < 10 || rawWhatsapp.length > 11)) {
      toast.error("WhatsApp inválido. Informe DDD + número (10 ou 11 dígitos).");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Selecione pelo menos uma categoria de serviço.");
      return;
    }

    setLoading(true);

    const { error: profileError } = await updateProviderProfile(
      supabase,
      profile.id,
      {
        description,
        neighborhood,
        whatsapp: rawWhatsapp,
        is_active: isActive,
      }
    );

    const { error: catError } = await setProviderCategories(
      supabase,
      profile.id,
      selectedCategories
    );

    if (profileError || catError) {
      toast.error("Erro ao salvar perfil.");
    } else {
      toast.success("Perfil atualizado!");
      router.push("/profile");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Descrição do serviço
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva seus serviços, experiência e especialidades..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-lg border-border resize-none"
          />
        </div>

        {/* Neighborhood */}
        <div className="space-y-1.5">
          <Label htmlFor="neighborhood" className="text-sm font-medium">
            Bairro de atuação
          </Label>
          <Input
            id="neighborhood"
            placeholder="Ex: Centro, Jardins..."
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="h-11 rounded-lg border-border"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="text-sm font-medium">
            WhatsApp (DDD + número)
          </Label>
          <Input
            id="whatsapp"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            className="h-11 rounded-lg border-border"
            inputMode="tel"
          />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Categorias de serviço
          </Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active toggle */}
        <div className="rounded-lg border border-border p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium">Perfil ativo</p>
              <p className="text-xs text-muted-foreground">
                Visível para clientes na busca
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                isActive ? "bg-primary" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  isActive && "translate-x-5"
                )}
              />
            </button>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 rounded-lg font-semibold gap-2 gradient-bg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-lg gap-2 border-border"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </form>
    </div>
  );
}
