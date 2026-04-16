"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

type SignupFormData = z.infer<typeof signupSchema>;

function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.name },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // If identities is empty, the email is already registered
      if (signUpData.user && signUpData.user.identities?.length === 0) {
        setError("Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.");
        return;
      }

      // Email confirmation required — show success message
      setConfirmed(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="rounded-[8px] border border-border bg-surface p-6 text-center">
        <p className="text-sm font-medium text-text">Bitte bestätigen Sie Ihre E-Mail-Adresse.</p>
        <p className="mt-2 text-sm text-text-secondary">
          Wir haben Ihnen eine Bestätigungsmail geschickt. Klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        type="text"
        label="Name"
        placeholder="Ihr vollständiger Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="email"
        type="email"
        label="E-Mail"
        placeholder="name@firma.de"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="password"
        type="password"
        label="Passwort"
        placeholder="Mindestens 8 Zeichen"
        error={errors.password?.message}
        {...register("password")}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      <Button type="submit" className="w-full" loading={loading}>
        Registrieren
      </Button>
    </form>
  );
}

export { SignupForm };
