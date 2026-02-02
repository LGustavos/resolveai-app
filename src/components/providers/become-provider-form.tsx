"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  createProviderProfile,
  setProviderCategories,
} from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { toast } from "sonner";
import { Loader2, Wrench } from "lucide-react";

interface BecomeProviderFormProps {
  categories: { id: string; name: string; slug: string }[];
  userId: string;
}

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function BecomeProviderForm({
  categories,
  userId,
}: BecomeProviderFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleWhatsAppChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setWhatsapp(formatWhatsApp(digits));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const rawWhatsapp = whatsapp.replace(/\D/g, "");

    if (!city.trim()) {
      toast.error("Informe sua cidade.");
      return;
    }

    if (rawWhatsapp && (rawWhatsapp.length < 10 || rawWhatsapp.length > 11)) {
      toast.error(
        "WhatsApp inválido. Informe DDD + número (10 ou 11 dígitos)."
      );
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Selecione pelo menos uma categoria de serviço.");
      return;
    }

    setLoading(true);

    const { error: profileError, profileId } = await createProviderProfile(
      supabase,
      userId,
      {
        description,
        city: city.trim(),
        whatsapp: rawWhatsapp,
      }
    );

    if (profileError || !profileId) {
      toast.error("Erro ao criar perfil de prestador.");
      setLoading(false);
      return;
    }

    const { error: catError } = await setProviderCategories(
      supabase,
      profileId,
      selectedCategories
    );

    if (catError) {
      toast.error("Erro ao salvar categorias.");
      setLoading(false);
      return;
    }

    toast.success("Perfil de prestador criado com sucesso!");
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-5 flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Sua conta será convertida para prestador de serviços
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Você poderá receber avaliações e aparecer nas buscas
          </p>
        </div>
      </div>

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

        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-sm font-medium">
            Cidade *
          </Label>
          <Input
            id="city"
            placeholder="Ex: São Paulo, Campinas..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 rounded-lg border-border"
            required
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
            Categorias de serviço *
          </Label>
          <CategoryMultiSelect
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg font-semibold gap-2 gradient-bg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Criar perfil de prestador"
          )}
        </Button>
      </form>
    </div>
  );
}
