import { useFestive } from "./FestiveContext";
import { useState } from "react";

const colors = [
  "Gold",
  "Green",
  "Red",
  "Blue",
  "Pastel",
  "Black",
];

const styles = [
  "Royal Traditional",
  "Modern Festive",
  "Minimal Elegant",
  "Designer",
  "Fusion",
];

export function StylePreferences() {
  const {
    activeMember,
    updatePreference,
  } = useFestive();

  const current =
    activeMember.preference ?? {
      outfitBudget: 25000,
      jewelleryBudget: 10000,
      shoesBudget: 3000,
      accessoryBudget: 2000,
      color: "Gold",
      style: "Royal Traditional",
    };

  const [color, setColor] = useState(
    current.color,
  );

  const [style, setStyle] = useState(
    current.style,
  );


  const savePreferences = () => {
    updatePreference({
      ...current,
      color,
      style,
    });
  };


  return (
    <section className="panel-ornate rounded-xl p-4">

      <div className="mb-3">
        <p className="font-display text-xs tracking-[0.18em] text-gold uppercase">
          Style Preferences
        </p>

        <p className="text-[10px] text-muted-foreground">
          Styling for {activeMember.name}
        </p>
      </div>


      <div className="space-y-3">

        <div>
          <label className="text-[10px] text-gold uppercase">
            Preferred Colour
          </label>

          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((item) => (
              <button
                key={item}
                onClick={() => setColor(item)}
                className={`rounded-md border px-3 py-1 text-xs ${
                  color === item
                    ? "border-gold text-gold"
                    : "border-border"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>


        <div>
          <label className="text-[10px] text-gold uppercase">
            Style
          </label>

          <select
            value={style}
            onChange={(e) =>
              setStyle(e.target.value)
            }
            className="mt-2 w-full rounded-md border border-gold/30 bg-background px-3 py-2"
          >
            {styles.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>


        <button
          onClick={savePreferences}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background"
        >
          Save Style
        </button>

      </div>

    </section>
  );
}