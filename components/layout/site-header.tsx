"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu, Phone, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EMERGENCY_NUMBER } from "@/lib/constants";
import { isStaffRole } from "@/lib/roles";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isStaff = isStaffRole(session?.user?.role);

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = isStaff
    ? [...NAV_LINKS, { href: "/dashboard", label: "Dashboard" } as const]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={`tel:${EMERGENCY_NUMBER}`}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
            aria-label={`Call emergency services on ${EMERGENCY_NUMBER}`}
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-destructive" />
            </span>
            <Phone className="hidden size-3.5 sm:block" aria-hidden="true" />
            <span>{EMERGENCY_NUMBER}</span>
          </a>
          <ThemeToggle />
          {session && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 h-[calc(100dvh-4rem)] border-t border-border bg-background animate-in fade-in slide-in-from-top-2 md:hidden"
        >
          <nav aria-label="Mobile" className="container py-4">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                  >
                    {link.href === "/dashboard" && (
                      <LayoutDashboard className="size-4" aria-hidden="true" />
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              {session ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut aria-hidden="true" />
                  Sign out
                </Button>
              ) : (
                <Link
                  href="/auth/signin"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "w-full",
                  )}
                >
                  Moderator sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
