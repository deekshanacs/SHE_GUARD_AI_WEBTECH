import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 py-6 text-center text-xs text-muted-foreground">
      <div className="flex items-center justify-center gap-2">
        <Shield className="h-3.5 w-3.5 text-[hsl(var(--neon-purple))]" aria-hidden="true" />
        <span>SHE-GUARD AI · K.S. Rangasamy College of Technology · Dept. of CSE (AIML) · 2025–26</span>
      </div>
    </footer>
  );
}
