import {
  User,
} from "lucide-react";

import {
  useFestive,
} from "./FestiveContext";

export function FestiveHeader() {
  const {
    selectedFestival,
  } = useFestive();

  return (
    <header className="panel-ornate relative z-20 flex flex-wrap items-center gap-6 rounded-xl px-6 py-4">

      {/* ============================================================
          FESTIVE READY AI BRAND
          ============================================================ */}

      <div className="flex items-center gap-4">

        {/* FIXED PROJECT LOGO FOR NOW */}

        <div className="animate-glow flex size-11 items-center justify-center rounded-md border border-gold/50 text-xl shadow-[var(--shadow-glow)]">
          🪔
        </div>

        <div>

          <h1 className="gold-text text-2xl leading-none font-semibold">
            Festive Ready AI
          </h1>

          <p className="mt-1 text-xs tracking-wide text-muted-foreground">
            Build your real-world festive look like you equip on self.
          </p>

        </div>

      </div>

      {/* ============================================================
          RIGHT SIDE
          ============================================================ */}

      <div className="ml-auto flex flex-wrap items-center gap-3">

        {/* SELECTED FESTIVAL */}

        <div className="flex items-center gap-3 rounded-md border border-gold/40 bg-secondary/40 px-3 py-2">

          {/* FESTIVAL-SPECIFIC ICON */}

          <div className="flex size-8 items-center justify-center rounded-md border border-gold/30 bg-background/30 text-lg">
            {selectedFestival.emoji}
          </div>

          <div className="leading-tight">

            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Festival
            </p>

            <p className="font-display text-sm text-gold">
              {selectedFestival.name}
            </p>

          </div>

        </div>

        {/* PROFILE */}

        <button
          type="button"

          className="flex size-10 items-center justify-center rounded-full border border-gold/50 bg-secondary/60 text-sm transition-all hover:shadow-[var(--shadow-glow)]"

          aria-label="Profile"
        >

          <User
            className="size-4 text-gold"
            strokeWidth={1.5}
          />

        </button>

      </div>

    </header>
  );
}