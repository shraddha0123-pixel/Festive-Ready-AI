import { slots } from "./data";

export function EquipmentPanel() {
  return (
    <aside className="panel-ornate flex h-[860px] flex-col gap-3 rounded-xl p-4">
      <div>
        <h2 className="font-display text-sm tracking-[0.22em] text-gold uppercase">Equipment</h2>
        <div className="gold-rule mt-2" />
      </div>

      <ul className="flex flex-col gap-2.5">
        {slots.map((slot) => {
          const equipped = Boolean(slot.equipped);
          const Icon = slot.icon;
          return (
            <li key={slot.key}>
              <button
                type="button"
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-[var(--shadow-glow)] ${
                  equipped
                    ? "border-gold/60 bg-secondary/50"
                    : "border-border bg-background/40 border-dashed"
                }`}
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-md border text-lg transition-colors ${
                    equipped
                      ? "border-gold/70 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklab,var(--gold)_28%,transparent),transparent_70%)]"
                      : "border-border/70 text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.4} />
                </span>
                <span className="min-w-0 flex-1 pr-1">
                  <span className="block text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {slot.label}
                  </span>
                  <span
                    className={`block truncate text-sm ${equipped ? "text-gold" : "text-muted-foreground/70 italic"}`}
                  >
                    {slot.equipped ?? "Empty slot"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
