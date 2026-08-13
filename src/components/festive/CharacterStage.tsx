import { Gamepad2, RotateCw, Sparkles, Undo2, ZoomIn } from "lucide-react";
import character from "@/assets/character.png";
import { Embers } from "./Embers";

const controls = [
  { label: "Rotate", icon: RotateCw },
  { label: "Zoom", icon: ZoomIn },
  { label: "Reset View", icon: Undo2 },
];

export function CharacterStage() {
  return (
    <section className="flex min-h-0 flex-col gap-5">
      <div className="panel-ornate relative h-[650px] overflow-hidden rounded-2xl">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--ember) 22%, transparent), transparent 65%)",
          }}
        />

        <Embers />

        <div className="relative flex h-full items-center justify-center overflow-hidden px-6">
          <div
            aria-hidden
            className="animate-glow absolute bottom-10 h-24 w-[420px] max-w-[80%] rounded-[50%]"
            style={{
              background:
                "radial-gradient(ellipse, color-mix(in oklab, var(--gold) 45%, transparent), transparent 70%)",
              filter: "blur(14px)",
            }}
          />

          <img
            src={character}
            alt="Festive character wearing an emerald and gold Diwali lehenga"
            width={768}
            height={1280}
            className="relative h-[560px] w-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
          />

          <div className="absolute left-5 top-5 rounded-md border border-gold/40 bg-background/60 px-3 py-1.5 text-[10px] tracking-[0.22em] text-gold uppercase">
            Dressing Chamber 
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {controls.map((c) => {
          const Icon = c.icon;

          return (
            <button
              key={c.label}
              type="button"
              className="flex items-center gap-2 rounded-full border border-gold/40 bg-secondary/40 px-4 py-2 text-xs tracking-[0.14em] uppercase transition-all hover:border-gold hover:text-gold hover:shadow-[var(--shadow-glow)]"
            >
              <Icon className="size-4" strokeWidth={1.5} />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="w-full max-w-md rounded-lg px-8 py-3.5 font-display text-sm tracking-[0.2em] text-primary-foreground uppercase transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-gold)" }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Sparkles className="size-4" strokeWidth={1.8} />
            Finalize My Look
          </span>
        </button>

        <button
          type="button"
          disabled
          className="w-full max-w-md cursor-not-allowed rounded-lg border border-dashed border-gold/35 px-8 py-3 font-display text-xs tracking-[0.2em] text-muted-foreground uppercase"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Gamepad2 className="size-4" strokeWidth={1.5} />
            Generate My 3D Character
          </span>
        </button>

        <p className="text-[11px] text-muted-foreground/80">
          Available after your look is finalized.
        </p>
      </div>
    </section>
  );
}