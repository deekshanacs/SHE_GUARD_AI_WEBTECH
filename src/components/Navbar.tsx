import { Link, useLocation } from "react-router-dom";
import { Shield, Upload, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/",          label: "Home",      icon: Shield },
  { to: "/upload",    label: "Analyse",   icon: Upload },
  { to: "/report",    label: "Report",    icon: FileText },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[hsl(var(--neon-purple))]" />
          <span className="font-display text-lg font-bold gradient-text">SHE-GUARD AI</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                pathname === to
                  ? "bg-[hsl(var(--neon-purple))/15] text-[hsl(var(--neon-purple))]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
