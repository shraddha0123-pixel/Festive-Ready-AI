import { useState } from "react";
import { useFestive } from "@/components/festive/FestiveContext";


const colorOptions = [
  "Gold & Green",
  "Royal Blue",
  "Red & Maroon",
  "Pastel Pink",
  "White & Silver",
  "Bright Colours",
];


const styleOptions = [
  "Royal Traditional",
  "Elegant Festive",
  "Modern Fusion",
  "Minimal Premium",
  "Cute Traditional",
];


export function StylePreferences() {

  const festive = useFestive();


  const activeMember =
    festive.activeMember;


  const updatePreference =
    festive.updatePreference;



  const existingPreference =
    activeMember.preference ?? {
      budget: 20000,
      color: "Gold & Green",
      style: "Royal Traditional",
    };



  const [budget, setBudget] =
    useState(existingPreference.budget);


  const [color, setColor] =
    useState(existingPreference.color);


  const [style, setStyle] =
    useState(existingPreference.style);



  function savePreferences() {

    updatePreference({
      budget,
      color,
      style,
    });

  }



  return (

    <section className="panel-ornate rounded-xl p-4">

      <div className="mb-4">

        <p className="font-display text-xs tracking-[0.18em] text-gold uppercase">
          Style Preferences
        </p>


        <p className="text-[10px] text-muted-foreground">
          Styling {activeMember.name}
        </p>

      </div>



      <div className="grid gap-3 md:grid-cols-3">


        <div>

          <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
            Budget
          </label>


          <input
            type="number"
            value={budget}
            onChange={(event) =>
              setBudget(
                Number(event.target.value),
              )
            }
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground"
          />

        </div>




        <div>

          <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
            Favourite Colour
          </label>


          <select
            value={color}
            onChange={(event) =>
              setColor(event.target.value)
            }
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground"
          >

            {colorOptions.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>




        <div>

          <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
            Style Vibe
          </label>


          <select
            value={style}
            onChange={(event) =>
              setStyle(event.target.value)
            }
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground"
          >

            {styleOptions.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>


      </div>



      <button
        type="button"
        onClick={savePreferences}
        className="mt-4 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-background"
      >
        Save Style
      </button>


    </section>

  );

}