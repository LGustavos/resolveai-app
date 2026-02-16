"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reviewVerification } from "@/app/(main)/admin/verifications/actions";
import { toast } from "sonner";

interface Document {
  id: string;
  documentType: string;
  signedUrl: string;
  status: string;
  createdAt: string;
}

interface ProviderVerification {
  providerId: string;
  providerName: string;
  providerEmail: string;
  providerAvatar: string | null;
  verificationStatus: string;
  documents: Document[];
}

interface AdminVerificationListProps {
  providers: ProviderVerification[];
}

const STATUS_BADGE = {
  pending: { label: "Pendente", color: "bg-amber-50 text-amber-600", icon: Clock },
  approved: { label: "Aprovado", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Recusado", color: "bg-red-50 text-red-600", icon: XCircle },
} as const;

export function AdminVerificationList({ providers }: AdminVerificationListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const filtered = filter === "all"
    ? providers
    : providers.filter((p) => p.verificationStatus === filter);

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovados" : "Recusados"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <ShieldCheck className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium">Nenhuma verificação {filter === "pending" ? "pendente" : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((provider) => (
            <ProviderVerificationCard
              key={provider.providerId}
              provider={provider}
              onImageClick={setLightboxUrl}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[85vh] w-[90vw] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt="Documento de verificação"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderVerificationCard({
  provider,
  onImageClick,
}: {
  provider: ProviderVerification;
  onImageClick: (url: string) => void;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [currentStatus, setCurrentStatus] = useState(provider.verificationStatus);
  const [docStatuses, setDocStatuses] = useState<Record<string, string>>(
    Object.fromEntries(provider.documents.map((d) => [d.id, d.status]))
  );

  const initials = provider.providerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const badge = STATUS_BADGE[currentStatus as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.pending;
  const BadgeIcon = badge.icon;

  const isPending = currentStatus === "pending";

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    const newStatus = action === "approve" ? "approved" : "rejected";
    const docIds = provider.documents.map((d) => d.id);

    try {
      const result = await reviewVerification(provider.providerId, docIds, action);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setCurrentStatus(newStatus);
      setDocStatuses(Object.fromEntries(docIds.map((id) => [id, newStatus])));
      toast.success(
        action === "approve"
          ? `${provider.providerName} verificado com sucesso!`
          : `Verificação de ${provider.providerName} recusada.`
      );
    } catch {
      toast.error("Erro ao processar verificação.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      {/* Provider header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={provider.providerAvatar ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{provider.providerName}</p>
          <p className="text-xs text-muted-foreground truncate">{provider.providerEmail}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", badge.color)}>
          <BadgeIcon className="h-3 w-3" />
          {badge.label}
        </span>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {provider.documents.map((doc) => {
          const docBadge = STATUS_BADGE[docStatuses[doc.id] as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.pending;
          return (
            <div key={doc.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {doc.documentType === "identity" ? "Documento" : "Selfie"}
                </span>
                <span className={cn("text-[10px] font-medium rounded-full px-1.5 py-0.5", docBadge.color)}>
                  {docBadge.label}
                </span>
              </div>
              <button
                onClick={() => onImageClick(doc.signedUrl)}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Image
                  src={doc.signedUrl}
                  alt={doc.documentType === "identity" ? "Documento de identidade" : "Selfie"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 300px"
                />
              </button>
              <p className="text-[10px] text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action buttons (only for pending) */}
      {isPending && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="flex-1 h-10 rounded-lg font-semibold gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Aprovar
              </>
            )}
          </Button>
          <Button
            onClick={() => handleAction("reject")}
            disabled={loading !== null}
            variant="outline"
            className="flex-1 h-10 rounded-lg font-semibold gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            {loading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Recusar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
