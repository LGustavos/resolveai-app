"use client";

import { useState, useRef } from "react";
import { ShieldCheck, Upload, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface VerificationRequestProps {
  providerId: string;
  userId: string;
  verificationStatus: "none" | "pending" | "approved" | "rejected";
  existingDocuments: {
    id: string;
    document_type: "identity" | "selfie";
    document_url: string;
    status: "pending" | "approved" | "rejected";
  }[];
}

const STATUS_CONFIG = {
  none: {
    icon: ShieldCheck,
    title: "Verificar seu perfil",
    description: "Envie um documento de identidade e uma selfie para receber o selo de verificação.",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  pending: {
    icon: Clock,
    title: "Verificação em análise",
    description: "Seus documentos estão sendo analisados. Você receberá uma resposta em breve.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  approved: {
    icon: CheckCircle,
    title: "Perfil verificado",
    description: "Seu perfil foi verificado com sucesso! O selo de verificação está ativo.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  rejected: {
    icon: XCircle,
    title: "Verificação recusada",
    description: "Seus documentos foram recusados. Você pode enviar novos documentos para tentar novamente.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

export function VerificationRequest({
  providerId,
  userId,
  verificationStatus,
  existingDocuments,
}: VerificationRequestProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [identityPreview, setIdentityPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const identityInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const config = STATUS_CONFIG[verificationStatus];
  const StatusIcon = config.icon;

  const canSubmit = verificationStatus === "none" || verificationStatus === "rejected";
  const hasIdentityDoc = existingDocuments.some(
    (d) => d.document_type === "identity" && d.status === "pending"
  );
  const hasSelfieDoc = existingDocuments.some(
    (d) => d.document_type === "selfie" && d.status === "pending"
  );

  function handleFileSelect(
    file: File | undefined,
    type: "identity" | "selfie"
  ) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas arquivos de imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 5MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === "identity") {
      setIdentityFile(file);
      setIdentityPreview(preview);
    } else {
      setSelfieFile(file);
      setSelfiePreview(preview);
    }
  }

  async function handleSubmit() {
    if (!identityFile || !selfieFile) {
      toast.error("Envie ambos os documentos: identidade e selfie.");
      return;
    }

    setLoading(true);

    try {
      // Upload identity document
      const identityExt = identityFile.name.split(".").pop();
      const identityPath = `${userId}/${providerId}/identity-${Date.now()}.${identityExt}`;
      const { error: identityUploadError } = await supabase.storage
        .from("verifications")
        .upload(identityPath, identityFile);

      if (identityUploadError) throw identityUploadError;

      const { data: identityUrlData } = supabase.storage
        .from("verifications")
        .getPublicUrl(identityPath);

      // Upload selfie
      const selfieExt = selfieFile.name.split(".").pop();
      const selfiePath = `${userId}/${providerId}/selfie-${Date.now()}.${selfieExt}`;
      const { error: selfieUploadError } = await supabase.storage
        .from("verifications")
        .upload(selfiePath, selfieFile);

      if (selfieUploadError) throw selfieUploadError;

      const { data: selfieUrlData } = supabase.storage
        .from("verifications")
        .getPublicUrl(selfiePath);

      // Insert verification documents
      const { error: insertError } = await supabase
        .from("verification_documents")
        .insert([
          {
            provider_id: providerId,
            document_type: "identity",
            document_url: identityUrlData.publicUrl,
            status: "pending",
          },
          {
            provider_id: providerId,
            document_type: "selfie",
            document_url: selfieUrlData.publicUrl,
            status: "pending",
          },
        ]);

      if (insertError) throw insertError;

      // Update provider verification status to pending
      await supabase
        .from("provider_profiles")
        .update({ verification_status: "pending" })
        .eq("id", providerId);

      toast.success("Documentos enviados! Aguarde a análise.");
      window.location.reload();
    } catch {
      toast.error("Erro ao enviar documentos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* Status header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bg)}>
          <StatusIcon className={cn("h-5 w-5", config.color)} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{config.title}</h2>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Upload form (only for none/rejected) */}
      {canSubmit && !hasIdentityDoc && !hasSelfieDoc && (
        <div className="space-y-4">
          {/* Identity upload */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Documento de identidade (RG ou CNH)
            </label>
            <input
              ref={identityInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0], "identity")}
            />
            {identityPreview ? (
              <button
                type="button"
                onClick={() => identityInputRef.current?.click()}
                className="relative h-32 w-full overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={identityPreview}
                  alt="Documento de identidade"
                  fill
                  className="object-cover"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => identityInputRef.current?.click()}
                className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                Selecionar documento
              </button>
            )}
          </div>

          {/* Selfie upload */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Selfie segurando o documento
            </label>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0], "selfie")}
            />
            {selfiePreview ? (
              <button
                type="button"
                onClick={() => selfieInputRef.current?.click()}
                className="relative h-32 w-full overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={selfiePreview}
                  alt="Selfie com documento"
                  fill
                  className="object-cover"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => selfieInputRef.current?.click()}
                className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                Selecionar selfie
              </button>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !identityFile || !selfieFile}
            className="w-full h-11 rounded-lg font-semibold gap-2 gradient-bg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Enviar para verificação
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
