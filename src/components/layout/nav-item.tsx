"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-primary-light text-primary"
          : "text-text-secondary hover:bg-bg hover:text-text"
      )}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span>{label}</span>
    </Link>
  );
}

export { NavItem, type NavItemProps };
