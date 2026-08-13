import {
  Bell,
  BellRing,
  CalendarDays,
  ChevronDown,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  festivals,
  useFestive,
  type AgeGroup,
  type GenderFit,
} from "@/components/festive/FestiveContext";

type OpenPanel = "member" | "festival" | null;

const ageLabels: Record<AgeGroup, string> = {
  adult: "Adult",
  teen: "Teen",
  kid: "Kid",
};

const genderLabels: Record<GenderFit, string> = {
  female: "Female",
  male: "Male",
  unisex: "Unisex",
};

export function FestiveControlBar() {
  const [openPanel, setOpenPanel] =
    useState<OpenPanel>(null);

  const [newName, setNewName] = useState("");

  const [newAgeGroup, setNewAgeGroup] =
    useState<AgeGroup>("adult");

  const [newGenderFit, setNewGenderFit] =
    useState<GenderFit>("female");

  const {
    partyMembers,
    activeMemberId,
    selectedFestival,
    reminders,
    addMember,
    setActiveMemberId,
    setSelectedFestival,
    toggleReminder,
  } = useFestive();

  const remainingSlots =
    4 - partyMembers.length;

  const addMemberAndClose = () => {
    const cleanName = newName.trim();

    if (
      !cleanName ||
      partyMembers.length >= 4
    ) {
      return;
    }

    addMember(
      cleanName,
      newAgeGroup,
      newGenderFit,
    );

    setNewName("");
    setNewAgeGroup("adult");
    setNewGenderFit("female");
    setOpenPanel(null);
  };

  const selectedReminderOn =
    reminders.includes(selectedFestival.id);

  return (
    <section className="panel-ornate rounded-xl p-4">
      <div className="grid gap-3 lg:grid-cols-[3fr_1fr]">
        {/* FAMILY PARTY */}
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="mr-1 flex items-center gap-2">
            <Users
              className="size-5 text-gold"
              strokeWidth={1.5}
            />

            <div>
              <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">
                My Festive Party
              </p>

              <p className="text-[10px] text-muted-foreground">
                Style up to 4 family members
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {partyMembers.map((member) => {
              const active =
                activeMemberId === member.id;

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() =>
                    setActiveMemberId(member.id)
                  }
                  className={`flex min-w-28 items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                    active
                      ? "border-gold bg-secondary/60 shadow-[var(--shadow-glow)]"
                      : "border-border bg-background/30 hover:border-gold/60"
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-background/40">
                    <UserRound className="size-4 text-gold" />
                  </span>

                  <span className="min-w-0 text-left">
                    <span className="block truncate text-xs text-foreground">
                      {member.name}
                    </span>

                    <span className="block truncate text-[10px] text-muted-foreground">
                      {member.isMainProfile
                        ? "Main Profile"
                        : `${
                            ageLabels[
                              member.ageGroup!
                            ]
                          } · ${
                            genderLabels[
                              member.genderFit!
                            ]
                          }`}
                    </span>
                  </span>
                </button>
              );
            })}

            {Array.from({
              length: remainingSlots,
            }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setOpenPanel("member")
                }
                className="flex min-w-28 items-center gap-2 rounded-lg border border-dashed border-gold/30 bg-background/20 px-3 py-2 text-muted-foreground transition-all hover:border-gold hover:text-gold"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-gold/30">
                  <Plus className="size-4" />
                </span>

                <span className="text-left">
                  <span className="block text-xs">
                    Add Member
                  </span>

                  <span className="block text-[10px]">
                    Party slot{" "}
                    {partyMembers.length +
                      index +
                      1}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* FESTIVAL */}
        <button
          type="button"
          onClick={() =>
            setOpenPanel("festival")
          }
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
            openPanel === "festival"
              ? "border-gold bg-secondary/60 shadow-[var(--shadow-glow)]"
              : "border-gold/30 bg-background/25 hover:border-gold/70"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-background/40 text-xl">
              {selectedFestival.emoji}
            </div>

            <div className="min-w-0">
              <div className="mb-0.5 flex items-center gap-1.5">
                <CalendarDays className="size-3 text-gold" />

                <p className="text-[9px] tracking-[0.16em] text-gold uppercase">
                  Festival
                </p>
              </div>

              <p className="truncate font-display text-sm text-foreground">
                {selectedFestival.name}
              </p>

              <p className="text-[10px] text-muted-foreground">
                {selectedFestival.date}
              </p>
            </div>
          </div>

          <ChevronDown className="size-4 shrink-0 text-gold" />
        </button>
      </div>

      {/* SHARED DRAWER */}
      {openPanel && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-background/30 p-4">
          {/* ADD MEMBER */}
          {openPanel === "member" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-display text-xs tracking-[0.18em] text-gold uppercase">
                    Add Family Member
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    Create another festive party profile
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel(null)
                  }
                  className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-gold hover:text-gold"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                    Member Name
                  </label>

                  <input
                    value={newName}
                    onChange={(event) =>
                      setNewName(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Mom, Dad, Riya"
                    className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                    Age Group
                  </label>

                  <select
                    value={newAgeGroup}
                    onChange={(event) =>
                      setNewAgeGroup(
                        event.target
                          .value as AgeGroup,
                      )
                    }
                    className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none"
                  >
                    <option value="adult">
                      Adult
                    </option>
                    <option value="teen">
                      Teen
                    </option>
                    <option value="kid">
                      Kid
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                    Gender / Fit
                  </label>

                  <select
                    value={newGenderFit}
                    onChange={(event) =>
                      setNewGenderFit(
                        event.target
                          .value as GenderFit,
                      )
                    }
                    className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none"
                  >
                    <option value="female">
                      Female
                    </option>
                    <option value="male">
                      Male
                    </option>
                    <option value="unisex">
                      Unisex
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addMemberAndClose}
                  className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background"
                >
                  Add to Party
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel(null)
                  }
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* FESTIVAL PICKER */}
          {openPanel === "festival" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-display text-xs tracking-[0.18em] text-gold uppercase">
                    Choose Your Festival
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    Pick the celebration you are
                    styling for
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel(null)
                  }
                  className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-gold hover:text-gold"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {festivals.map((festival) => {
                  const selected =
                    festival.id ===
                    selectedFestival.id;

                  const reminderOn =
                    reminders.includes(
                      festival.id,
                    );

                  return (
                    <div
                      key={festival.id}
                      className={`min-w-[170px] flex-1 rounded-lg border p-3 transition-all ${
                        selected
                          ? "border-gold bg-secondary/60"
                          : "border-border bg-background/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFestival(
                            festival,
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xl">
                            {festival.emoji}
                          </span>

                          <span className="text-[9px] text-gold">
                            {festival.date}
                          </span>
                        </div>

                        <p className="font-display text-xs text-foreground">
                          {festival.name}
                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {festival.tagline}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleReminder(
                            festival.id,
                          )
                        }
                        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[9px] uppercase transition-all ${
                          reminderOn
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        {reminderOn ? (
                          <BellRing className="size-3" />
                        ) : (
                          <Bell className="size-3" />
                        )}

                        {reminderOn
                          ? "Reminder On"
                          : "Remind Me"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <p className="text-[10px] text-muted-foreground">
                  Selected:{" "}
                  <span className="text-gold">
                    {selectedFestival.name}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    toggleReminder(
                      selectedFestival.id,
                    )
                  }
                  className="flex items-center gap-2 rounded-md border border-gold/30 px-3 py-2 text-[10px] text-gold"
                >
                  {selectedReminderOn ? (
                    <BellRing className="size-3.5" />
                  ) : (
                    <Bell className="size-3.5" />
                  )}

                  {selectedReminderOn
                    ? "Reminder On"
                    : "Remind Me"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}