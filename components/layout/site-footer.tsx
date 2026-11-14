import Link from "next/link";
import { EMERGENCY_NUMBER } from "@/lib/constants";
import { NAV_LINKS } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="container flex flex-col gap-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-semibold text-foreground">iWitness</span> ·
          Anonymous incident reporting. In an emergency, call{" "}
          <a
            href={`tel:${EMERGENCY_NUMBER}`}
            className="font-medium text-destructive underline-offset-4 hover:underline"
          >
            {EMERGENCY_NUMBER}
          </a>{" "}
          first.
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/auth/signin" className="hover:text-foreground">
                Moderator sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
