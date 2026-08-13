import { Flame, Sparkles, User } from "lucide-react";

export function FestiveHeader() {
  return (
    <header className="panel-ornate relative z-20 flex flex-wrap items-center gap-6 rounded-xl px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="animate-glow flex size-11 items-center justify-center rounded-md border border-gold/50 text-xl shadow-[var(--shadow-glow)]">
          🪔
        </div>
        <div>
          <h1 className="gold-text text-2xl leading-none font-semibold">Festive Ready AI</h1>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">
            Build your real-world festive look like you equip an RPG character.
          </p>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-secondary/40 px-3 py-2">
          <Sparkles className="size-4 text-gold" strokeWidth={1.5} />
          <div className="leading-tight">
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Festival
            </p>
            <p className="font-display text-sm text-gold">Diwali</p>
          </div>
        </div>

        <div className="min-w-44 rounded-md border border-gold/40 bg-secondary/40 px-3 py-2">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="tracking-[0.18em] text-muted-foreground uppercase">Budget</span>
            <span className="text-gold">₹27,650 / ₹40,000</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/70">
            <div
              className="h-full rounded-full"
              style={{ width: "69%", background: "var(--gradient-gold)" }}
            />
          </div>
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-gold/50 bg-secondary/60 text-sm transition-all hover:shadow-[var(--shadow-glow)]"
          aria-label="Profile"
        >
          <User className="size-4 text-gold" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
