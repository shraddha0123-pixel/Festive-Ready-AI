import { useState } from "react";
import { categories, items, type Category } from "./data";

export function InventoryPanel() {
  const [active, setActive] = useState<Category>("Outfits");

  const visible = items.filter(
    (i) => i.category === active,
  );

  return (
    <aside className="panel-ornate flex h-[860px] flex-col gap-3 rounded-xl p-4">
      <div>
        <h2 className="font-display text-sm tracking-[0.22em] text-gold uppercase">
          Diwali Collection
        </h2>

        <div className="gold-rule mt-2" />
      </div>

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.12em] uppercase transition-all ${
              active === c
                ? "border-gold/70 bg-secondary/70 text-gold"
                : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul 
        className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "color-mix(in oklab, var(--gold) 40%, transparent) transparent",
        }}
      >
        {visible.map((item) => (
          <li
            key={item.id}
            className="group rounded-lg border border-border bg-background/40 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                width={512}
                height={512}
                className="size-16 shrink-0 rounded-md border border-gold/40 object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {item.name}
                </p>

                <p className="text-[10px] tracking-[0.18em] text-accent-foreground/70 uppercase">
                  {item.rarity}
                </p>

                <p className="mt-1 font-display text-sm text-gold">
                  {item.price}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-md border border-gold/40 px-2 py-1.5 text-[11px] tracking-[0.12em] uppercase transition-colors hover:border-gold hover:text-gold"
              >
                Try On
              </button>

              <button
                type="button"
                className="flex-1 rounded-md px-2 py-1.5 text-[11px] tracking-[0.12em] text-primary-foreground uppercase transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--gradient-gold)" }}
              >
                {item.equipped ? "Equipped" : "Equip"}
              </button>
            </div>
          </li>
        ))}

        {visible.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
            No items discovered in this category yet.
          </li>
        )}
      </ul>
    </aside>
  );
}