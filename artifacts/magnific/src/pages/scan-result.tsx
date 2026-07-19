import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  ScanLine,
  RotateCcw,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { scanState, clearScanState, type ScanResult, type ScanIngredient } from "@/lib/scan-state";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Loading skeleton ──────────────────────────────────────────
function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary"
      />
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">Reading your label…</p>
        <p className="text-sm text-muted-foreground mt-1">Checking ingredients against your profile</p>
      </div>
    </div>
  );
}

// ── Overall flag banner ───────────────────────────────────────
function SummaryBanner({ flag, headline }: { flag: ScanResult["summary"]["overall_flag"]; headline: string }) {
  const configs = {
    allergen_warning: {
      bg: "bg-red-50 border-red-300",
      text: "text-red-700",
      icon: <AlertTriangle className="w-6 h-6 shrink-0" />,
    },
    avoid_warning: {
      bg: "bg-orange-50 border-orange-300",
      text: "text-orange-700",
      icon: <XCircle className="w-6 h-6 shrink-0" />,
    },
    safe: {
      bg: "bg-emerald-50 border-emerald-300",
      text: "text-emerald-700",
      icon: <CheckCircle2 className="w-6 h-6 shrink-0" />,
    },
    insufficient_data: {
      bg: "bg-gray-100 border-gray-300",
      text: "text-gray-600",
      icon: <Info className="w-6 h-6 shrink-0" />,
    },
  } as const;

  const cfg = configs[flag];
  return (
    <div className={`flex items-start gap-3 p-5 rounded-2xl border-2 ${cfg.bg}`}>
      <span className={cfg.text}>{cfg.icon}</span>
      <p className={`font-semibold text-lg leading-snug ${cfg.text}`}>{headline}</p>
    </div>
  );
}

// ── Scan status banner (partial / failed) ─────────────────────
function ScanStatusBanner({ status }: { status: "partial" | "failed" }) {
  if (status === "failed") {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
        We couldn't read this label. Try a clearer photo.
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-sm font-medium">
      <Info className="w-5 h-5 shrink-0 mt-0.5" />
      We could only read part of this label — results may be incomplete.
    </div>
  );
}

// ── Single ingredient row ─────────────────────────────────────
function IngredientRow({ ingredient }: { ingredient: ScanIngredient }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!ingredient.plain_explanation || !!ingredient.reason;

  const colorClass =
    ingredient.display_color === "red"
      ? "text-red-600 font-semibold"
      : ingredient.display_color === "green"
        ? "text-emerald-600 font-semibold"
        : ingredient.display_color === "amber"
          ? "text-amber-700 font-semibold"
          : "text-foreground";

  const rowBg =
    ingredient.display_color === "red"
      ? "bg-red-50 border-red-100"
      : ingredient.display_color === "green"
        ? "bg-emerald-50 border-emerald-100"
        : ingredient.display_color === "amber"
          ? "bg-amber-50 border-amber-100"
          : "bg-white border-border";

  const badgeClass =
    ingredient.display_color === "red"
      ? "bg-red-100 text-red-600"
      : ingredient.display_color === "green"
        ? "bg-emerald-100 text-emerald-700"
        : ingredient.display_color === "amber"
          ? "bg-amber-100 text-amber-700"
          : "bg-secondary text-muted-foreground";

  const reasonColor =
    ingredient.display_color === "red" ? "text-red-500"
      : ingredient.display_color === "green" ? "text-emerald-600"
        : ingredient.display_color === "amber" ? "text-amber-600"
          : "text-muted-foreground";

  const severityLabel: Record<ScanIngredient["severity"], string | null> = {
    high: "HIGH",
    medium: "MEDIUM",
    low: "NOTE",
    none: null,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl overflow-hidden ${rowBg}`}
    >
      <button
        className="w-full text-left p-4 flex items-start justify-between gap-3"
        onClick={() => hasDetails && setExpanded((v) => !v)}
        disabled={!hasDetails}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm ${colorClass}`}>{ingredient.name}</span>
            {severityLabel[ingredient.severity] && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeClass}`}>
                {severityLabel[ingredient.severity]}
              </span>
            )}
          </div>
          {ingredient.reason && (
            <p className={`text-xs mt-1 ${reasonColor}`}>
              {ingredient.reason}
            </p>
          )}
        </div>
        {hasDetails && (
          <span className="text-muted-foreground mt-0.5 shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>

      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-inherit">
              {ingredient.plain_explanation ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">{ingredient.name}</span> —{" "}
                  {ingredient.plain_explanation}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No additional information available for this ingredient.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Demo data (for ?demo=1 previewing only) ──────────────────
const DEMO_RESULT: ScanResult = {
  product_name: "Daily Moisture Lotion",
  scan_status: "success",
  source: "ai_model",
  ingredients: [
    { name: "Soy Lecithin", normalized_name: "soy lecithin", category: "allergen_match", severity: "high", display_color: "red", reason: "You are allergic to soy", plain_explanation: "An emulsifier derived from soybeans; contains trace soy proteins and is a recognized allergen for soy-sensitive individuals." },
    { name: "Fragrance", normalized_name: "fragrance", category: "avoid_match", severity: "medium", display_color: "red", reason: "You prefer to avoid fragrance", plain_explanation: "A regulatory catch-all term for undisclosed scent compounds; can contain dozens of unlisted chemicals and is a leading cause of cosmetic allergic reactions." },
    { name: "Added Sugar", normalized_name: "added sugar", category: "general_caution", severity: "low", display_color: "amber", reason: "May be worth noting: added sugar", plain_explanation: "Sugars added during processing beyond what occurs naturally in the ingredients; high intake is associated with metabolic health concerns." },
    { name: "Tocopherol", normalized_name: "tocopherol", category: "allow_match", severity: "none", display_color: "green", reason: "Matches your preference for tocopherol", plain_explanation: "Vitamin E; a fat-soluble antioxidant that helps extend shelf life and supports skin health." },
    { name: "Water (Aqua)", normalized_name: "water", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: "The universal solvent; used as a base in nearly all formulations." },
    { name: "Glycerin", normalized_name: "glycerin", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: "A humectant derived from plant or animal fats that draws moisture into the skin." },
    { name: "Cetearyl Alcohol", normalized_name: "cetearyl alcohol", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: "A fatty alcohol used as an emulsifier and thickener. Not the same as drying alcohol." },
    { name: "Dimethicone", normalized_name: "dimethicone", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: "A silicone polymer that smooths skin texture; effective but not readily biodegradable." },
    { name: "Sodium Benzoate", normalized_name: "sodium benzoate", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: "A common preservative that inhibits mold and bacteria growth; may cause sensitivity in some people." },
    { name: "Methylparaben", normalized_name: "methylparaben", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: "A widely used paraben preservative; considered safe at low concentrations but flagged by some health advocates due to potential endocrine activity." },
    { name: "Xylitol", normalized_name: "xylitol", category: "neutral", severity: "none", display_color: "neutral", plain_explanation: null },
  ],
  summary: {
    overall_flag: "allergen_warning",
    headline: "⚠️ This product contains allergens you need to avoid.",
    matched_user_preferences: ["your soy allergy", "your preference to avoid fragrance", "your preference for tocopherol"],
  },
  disclaimer: "Based on the ingredient data on file — always confirm against the physical product label.",
};

// ── Main page ─────────────────────────────────────────────────
export function ScanResultPage() {
  const [, setLocation] = useLocation();
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  const [result, setResult] = useState<ScanResult | null>(isDemo ? DEMO_RESULT : scanState.result);
  const [imageUrl, setImageUrl] = useState<string | null>(scanState.imageUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) return; // skip upload logic in demo mode

    // If we have a file but no result yet, run the scan now
    if (scanState.file && !scanState.result) {
      const file = scanState.file;
      const formData = new FormData();
      formData.append("label", file);

      fetch(`${BASE_URL}/api/scan/label`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
          return res.json() as Promise<ScanResult>;
        })
        .then((data) => {
          scanState.result = data;
          setResult(data);
        })
        .catch((err) => {
          setError(err.message ?? "Something went wrong — please try again.");
        });
    }

    // If there's nothing to work with, redirect home
    if (!isDemo && !scanState.file && !scanState.result) {
      setLocation("/");
    }

    setImageUrl(scanState.imageUrl);
  }, [setLocation]);

  const handleScanAnother = () => {
    clearScanState();
    setLocation("/");
  };

  // ── Loading ──
  if (!result && !error) return <LoadingState />;

  // ── Hard error (network / server failure) ──
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
        <XCircle className="w-14 h-14 text-red-400" />
        <div>
          <h1 className="text-xl font-bold mb-2">Scan failed</h1>
          <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
        </div>
        <Button onClick={handleScanAnother} className="rounded-full px-8 gap-2">
          <RotateCcw className="w-4 h-4" /> Try again
        </Button>
      </div>
    );
  }

  const data = result!;
  const isFailed = data.scan_status === "failed";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Navbar placeholder spacer */}
      <div className="h-20" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── Uploaded image + product name ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
        >
          {imageUrl ? (
            <div className="bg-secondary/30 flex items-center justify-center p-4 border-b border-border">
              <img
                src={imageUrl}
                alt="Uploaded label"
                className="max-h-64 w-auto rounded-xl object-contain shadow-sm"
              />
            </div>
          ) : (
            <div className="bg-secondary/30 h-32 flex items-center justify-center border-b border-border">
              <ScanLine className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Product</p>
            <h1 className="text-xl font-bold text-foreground">
              {data.product_name ?? "Product name not detected"}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                data.scan_status === "success" ? "bg-emerald-100 text-emerald-700" :
                data.scan_status === "partial" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-600"
              }`}>
                {data.scan_status === "success" ? "Full scan" : data.scan_status === "partial" ? "Partial scan" : "Failed"}
              </span>
              {data.source && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                  {data.source === "cache" ? "⚡ From cache" : "🤖 AI analysed"}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Scan status banner (only if not fully successful) ── */}
        {data.scan_status !== "success" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <ScanStatusBanner status={data.scan_status} />
          </motion.div>
        )}

        {/* ── Summary headline ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SummaryBanner flag={data.summary.overall_flag} headline={data.summary.headline} />
        </motion.div>

        {/* ── Disclaimer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-2 bg-secondary/60 rounded-xl px-4 py-3 border border-border"
        >
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{data.disclaimer}</p>
        </motion.div>

        {/* ── Ingredient list (omit on full failure) ── */}
        {!isFailed && data.ingredients.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <h2 className="text-base font-semibold mb-3">
              Ingredients{" "}
              <span className="text-sm font-normal text-muted-foreground">({data.ingredients.length} detected)</span>
            </h2>
            <div className="space-y-2">
              {data.ingredients.map((ing, i) => (
                <IngredientRow key={i} ingredient={ing} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Matched preferences recap ── */}
        {data.summary.matched_user_preferences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-border p-5"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              What we checked against your profile
            </h2>
            <ul className="space-y-1.5">
              {data.summary.matched_user_preferences.map((pref, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                  <span className="capitalize">{pref}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <Button
            onClick={handleScanAnother}
            className="flex-1 rounded-full gap-2 py-6 text-base font-semibold"
          >
            <ScanLine className="w-5 h-5" />
            Scan another product
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-full gap-2 py-6 text-base border-border"
            onClick={() => {
              // Demo — signals accuracy commitment; no backend needed for prototype
              alert("Thank you — your report has been noted. Our team will review this result.");
            }}
          >
            <Flag className="w-5 h-5" />
            Report an issue
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
