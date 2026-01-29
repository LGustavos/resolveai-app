export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <span className="text-xl font-bold text-foreground">ResolveAí</span>
        </div>
        {children}
      </div>
    </div>
  );
}
