import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-display">
              JS
            </div>
            <span className="font-display text-base">JanSeva Protocol</span>
          </div>
          <p className="font-display text-xl text-foreground leading-snug mb-3">
            Justice for everyone.
            <br />
            Owned by no one.
          </p>
          <p className="text-xs text-muted-foreground">MIT Licensed · Built in public</p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Platform
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-foreground hover:text-primary">
                  Submit Issue
                </Link>
              </li>
              <li>
                <Link to="/audit" className="text-foreground hover:text-primary">
                  Audit Log
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-foreground hover:text-primary">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/governance" className="text-foreground hover:text-primary">
                  Governance
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Project
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground hover:text-primary">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:text-primary">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground hover:text-primary">
                  License (MIT)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-xs text-muted-foreground text-center">
          JanSeva Protocol — Open source civic infrastructure. No owner. No gatekeeper. Forever.
        </div>
      </div>
    </footer>
  );
}
