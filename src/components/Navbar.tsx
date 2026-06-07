import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Get Help" },
  { to: "/audit", label: "Audit Log" },
  { to: "/governance", label: "Governance" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-lg">
            JS
          </div>
          <span className="font-display text-lg text-foreground hidden sm:inline">
            JanSeva Protocol
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative"
              activeProps={{
                className:
                  "px-3 py-2 text-sm text-primary font-medium relative after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-px after:h-0.5 after:bg-primary",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/submit"
            className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Shield size={14} /> Submit Issue
          </Link>
          <button
            type="button"
            className="md:hidden p-2 text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-md"
                activeProps={{ className: "px-3 py-2.5 text-sm text-primary font-medium bg-primary-light rounded-md" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="mt-1 bg-primary text-primary-foreground px-3 py-2.5 rounded-md text-sm font-medium text-center"
            >
              Submit Issue
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
