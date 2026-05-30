import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Upload, FileText, LayoutDashboard, AlertTriangle, Eye, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlowCursor from "@/components/GlowCursor";
import Footer from "@/components/Footer";

const problems = [
  { icon: AlertTriangle, title: "Deepfake Abuse",     desc: "AI-generated fake images used to harass and defame real victims." },
  { icon: Eye,           title: "No Verification Tool", desc: "Victims have no accessible way to prove an image is fake." },
  { icon: Lock,          title: "No Legal Pathway",   desc: "Without forensic evidence, filing a cybercrime complaint is nearly impossible." },
];

const steps = [
  { n: "01", title: "Upload Image",      desc: "Drag and drop any suspicious JPEG, PNG, or WEBP image." },
  { n: "02", title: "AI Analysis",       desc: "Our 5-layer forensic engine scans for manipulation signals." },
  { n: "03", title: "View Results",      desc: "Get per-layer scores, confidence rating, and a final verdict." },
  { n: "04", title: "Download Report",   desc: "Receive a status-conditional forensic evidence document." },
  { n: "05", title: "Report to Authorities", desc: "Follow direct links to cybercrime portals in India, UK, US, or EU." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen cyber-grid">
      <AnimatedBackground />
      <GlowCursor />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--neon-purple))/30] bg-[hsl(var(--neon-purple))/10] px-4 py-1.5 text-xs text-[hsl(var(--neon-purple))] uppercase tracking-widest">
            <Shield className="h-3.5 w-3.5" />
            <span>AI-Powered Cyber Forensics</span>
          </div>
          <h1 className="mb-4 font-display text-4xl font-black tracking-wide sm:text-6xl">
            <span className="gradient-text">SHE-GUARD</span>{" "}
            <span className="text-foreground">AI</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Detect image manipulation, deepfakes, and AI-generated fakes.
            Generate verifiable forensic evidence. Report to cybercrime authorities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/upload" className="btn-glow font-display text-sm tracking-wide">
              Analyse an Image
            </Link>
            <Link to="/report"
              className="rounded-lg border border-border px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-[hsl(var(--neon-purple))/50] transition-colors">
              File an Incident Report
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Problem statement */}
      <section className="relative z-10 py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-12 text-center font-display text-2xl font-bold tracking-wide"
          >
            The Problem We <span className="gradient-text-accent">Solve</span>
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {problems.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="glass-card-hover text-center"
              >
                <Icon className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--neon-pink))]" aria-hidden="true" />
                <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-12 text-center font-display text-2xl font-bold tracking-wide"
          >
            How It <span className="gradient-text">Works</span>
          </motion.h2>
          <div className="space-y-4">
            {steps.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="glass-card flex items-start gap-4"
              >
                <span className="font-display text-2xl font-black gradient-text shrink-0">{n}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="mb-4 font-display text-2xl font-bold">
            Ready to <span className="gradient-text">verify an image</span>?
          </h2>
          <p className="mb-6 text-muted-foreground">Upload any suspicious image and get a real forensic analysis in seconds.</p>
          <Link to="/upload" className="btn-glow font-display text-sm tracking-wide">
            Start Analysis
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
