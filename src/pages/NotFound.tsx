import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4 cyber-grid">
      <Shield className="h-12 w-12 text-[hsl(var(--neon-purple))]" />
      <h1 className="font-display text-4xl font-black gradient-text">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <Link to="/" className="btn-glow font-display text-sm tracking-wide">Return Home</Link>
    </div>
  );
}
