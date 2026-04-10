"use client";

import { NavItem } from "./nav-item";
import {
  LayoutDashboard,
  Container,
  CalendarCheck,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/docks", label: "Rampen", icon: Container },
  { href: "/bookings", label: "Buchungen", icon: CalendarCheck },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-surface transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-bold text-text">SlotDock</span>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1 text-text-secondary hover:bg-bg md:hidden"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
      </aside>
    </>
  );
}

export { Sidebar };
