import Link from "next/link";
import { SignupForm } from "@/components/features/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-[8px] border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text">SlotDock</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Erstellen Sie Ihr Konto
          </p>
        </div>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-text-secondary">
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
