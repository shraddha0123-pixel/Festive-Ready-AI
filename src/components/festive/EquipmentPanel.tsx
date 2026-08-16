import { slots } from "./data";
import { useFestive } from "./FestiveContext";

export function EquipmentPanel() {
  const {
    activeMember,
    equippedItems,
    unequipSlot,
  } = useFestive();

  return (
    <aside className="panel-ornate flex h-[860px] flex-col gap-3 rounded-xl p-4">

      {/* HEADER */}

      <div>
        <h2 className="font-display text-sm tracking-[0.22em] text-gold uppercase">
          Equipment
        </h2>

        <p className="mt-1 text-[10px] tracking-[0.12em] text-muted-foreground">
          {activeMember.name}
        </p>

        <div className="gold-rule mt-2" />
      </div>

      {/* EQUIPMENT SLOTS */}

      <ul className="flex flex-col gap-2.5">

        {slots.map((slot) => {
          /*
           * REAL EQUIPMENT STATE
           *
           * This comes from FestiveContext
           * for the CURRENT active member.
           */
          const equippedItem =
            equippedItems[
              slot.key
            ];

          const equipped =
            Boolean(
              equippedItem,
            );

          const Icon =
            slot.icon;

          return (
            <li
              key={
                slot.key
              }
            >
              <div
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-[var(--shadow-glow)] ${
                  equipped
                    ? "border-gold/60 bg-secondary/50"
                    : "border-border bg-background/40 border-dashed"
                }`}
              >

                {/* ICON / PRODUCT IMAGE */}

                <div
                  className={`flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border text-lg transition-colors ${
                    equipped
                      ? "border-gold/70 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_oklab,var(--gold)_28%,transparent),transparent_70%)]"
                      : "border-border/70 text-muted-foreground"
                  }`}
                >
                  {equippedItem?.image ? (
                    <img
                      src={
                        equippedItem.image
                      }
                      alt={
                        equippedItem.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon
                      className="size-5"
                      strokeWidth={
                        1.4
                      }
                    />
                  )}
                </div>

                {/* SLOT DETAILS */}

                <div className="min-w-0 flex-1 pr-1">

                  <span className="block text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {slot.label}
                  </span>

                  <span
                    className={`block truncate text-sm ${
                      equipped
                        ? "text-gold"
                        : "text-muted-foreground/70 italic"
                    }`}
                  >
                    {equippedItem?.name ??
                      "Empty slot"}
                  </span>

                  {/* PRICE */}

                  {equippedItem?.price && (
                    <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                      {
                        equippedItem.price
                      }
                    </span>
                  )}
                </div>

                {/* UNEQUIP */}

                {equipped && (
                  <button
                    type="button"
                    onClick={() =>
                      unequipSlot(
                        slot.key,
                      )
                    }
                    className="shrink-0 rounded-md border border-gold/30 px-2 py-1 text-[8px] tracking-[0.1em] text-muted-foreground uppercase transition-all hover:border-gold/70 hover:text-gold"
                    title={`Unequip ${equippedItem?.name ?? slot.label}`}
                  >
                    Remove
                  </button>
                )}

              </div>
            </li>
          );
        })}

      </ul>

      {/* ACTIVE LOADOUT STATUS */}

      <div className="mt-auto rounded-lg border border-gold/20 bg-background/20 px-3 py-2">

        <p className="text-[9px] tracking-[0.15em] text-muted-foreground uppercase">
          Active Loadout
        </p>

        <p className="mt-1 truncate text-xs text-gold">
          {activeMember.name}
        </p>

      </div>

    </aside>
  );
}