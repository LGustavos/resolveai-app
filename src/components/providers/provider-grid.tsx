import { type ReactNode } from "react";

export function ProviderGrid({ children }: { children: ReactNode[] | ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
