"use client";

import { Menu, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  warehouseName?: string;
  onMenuClick: () => void;
}

function Header({ warehouseName, onMenuClick }: HeaderProps) {

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Full page navigation clears all client state and avoids
    // Turbopack panic from router.push + router.refresh race condition
    window.location.href = "/login";
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Menü öffnen"
          className="rounded-[6px] p-2.5 text-text-secondary hover:bg-bg md:hidden"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        {warehouseName && (
          <h1 className="text-sm font-semibold text-text">{warehouseName}</h1>
        )}
      </div>
      <button
        onClick={handleLogout}
        aria-label="Abmelden"
        className="flex items-center gap-2 rounded-[6px] px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text transition-colors"
      >
        <LogOut size={16} strokeWidth={1.5} />
        <span className="hidden sm:inline">Abmelden</span>
      </button>
    </header>
  );
}

export { Header };
