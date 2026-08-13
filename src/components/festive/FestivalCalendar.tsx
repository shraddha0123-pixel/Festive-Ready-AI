import { Bell, CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

const festivals = [
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    date: "28 Aug 2026",
    emoji: "🪢",
  },
  {
    id: "janmashtami",
    name: "Janmashtami",
    date: "4 Sep 2026",
    emoji: "🦚",
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    date: "14 Sep 2026",
    emoji: "🌺",
  },
  {
    id: "navratri",
    name: "Navratri",
    date: "11 Oct 2026",
    emoji: "💃",
  },
  {
    id: "diwali",
    name: "Diwali",
    date: "8 Nov 2026",
    emoji: "🪔",
  },
];

export function FestivalCalendar() {
  const [selectedFestival, setSelectedFestival] =
    useState(festivals[0]);

  const [open, setOpen] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);

  return (
    <section className="panel-ornate relative rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-gold/40 bg-background/40 text-xl">
            {selectedFestival.emoji}
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <CalendarDays className="size-3.5 text-gold" />

              <p className="text-[10px] tracking-[0.18em] text-gold uppercase">
                Upcoming Festival
              </p>
            </div>

            <p className="font-display text-sm text-foreground">
              {selectedFestival.name}
            </p>

            <p className="text-[10px] text-muted-foreground">
              {selectedFestival.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReminderOn(!reminderOn)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-[10px] uppercase transition-all ${
              reminderOn
                ? "border-gold bg-gold/10 text-gold"
                : "border-border text-muted-foreground hover:border-gold/50"
            }`}
          >
            <Bell className="size-3.5" />
            {reminderOn ? "Reminder On" : "Remind Me"}
          </button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 rounded-md border border-gold/40 px-3 py-2 text-[10px] text-gold uppercase"
          >
            Change
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-gold/40 bg-background p-2 shadow-xl">
          {festivals.map((festival) => (
            <button
              key={festival.id}
              type="button"
              onClick={() => {
                setSelectedFestival(festival);
                setOpen(false);
                setReminderOn(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-secondary/60"
            >
              <span className="text-lg">
                {festival.emoji}
              </span>

              <span>
                <span className="block text-xs text-foreground">
                  {festival.name}
                </span>

                <span className="block text-[10px] text-muted-foreground">
                  {festival.date}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}