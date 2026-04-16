import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-[8px] border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text">SlotDock</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Melden Sie sich an
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Noch kein Konto?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
