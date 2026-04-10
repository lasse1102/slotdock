import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text">SlotDock</h1>
        <p className="mt-3 text-lg text-text-secondary">
          Die Online-Rampenbuchung für Fulfillment-Unternehmen
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-[6px] bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-border px-6 text-sm font-medium text-secondary hover:bg-bg transition-colors"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
