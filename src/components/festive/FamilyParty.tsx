import { Plus, UserRound, Users } from "lucide-react";
import { useState } from "react";
import {
  useFestive,
  type AgeGroup,
  type GenderFit,
} from "./FestiveContext";

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

export function FamilyParty() {
  const {
    partyMembers,
    activeMemberId,
    setActiveMemberId,
    addMember,
  } = useFestive();

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [newName, setNewName] =
    useState("");

  const [newAgeGroup, setNewAgeGroup] =
    useState<AgeGroup>("adult");

  const [newGenderFit, setNewGenderFit] =
    useState<GenderFit>("female");

  const remainingSlots =
    4 - partyMembers.length;

  const handleAddMember = () => {
    if (!newName.trim()) return;

    addMember(
      newName,
      newAgeGroup,
      newGenderFit,
    );

    setNewName("");
    setNewAgeGroup("adult");
    setNewGenderFit("female");
    setShowAddForm(false);
  };

  return (
    <section className="panel-ornate rounded-xl p-4">

      <div className="flex flex-wrap items-center gap-4">

        <div className="mr-2 flex items-center gap-2">

          <Users
            className="size-5 text-gold"
            strokeWidth={1.5}
          />

          <div>
            <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">
              My Festive Party
            </p>

            <p className="text-[11px] text-muted-foreground">
              Style up to 4 family members
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-2">

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
                className={`flex min-w-32 items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                  active
                    ? "border-gold bg-secondary/60 shadow-[var(--shadow-glow)]"
                    : "border-border bg-background/40 hover:border-gold/60"
                }`}
              >

                <span className="flex size-8 items-center justify-center rounded-full border border-gold/40 bg-background/40">
                  <UserRound className="size-4 text-gold" />
                </span>

                <span className="text-left">

                  <span className="block text-xs text-foreground">
                    {member.name}
                  </span>

                  <span className="block text-[10px] text-muted-foreground">

                    {member.isMainProfile
                      ? "Main Profile"
                      : `${ageLabels[member.ageGroup!]} • ${
                          genderLabels[member.genderFit!]
                        }`
                    }

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
                setShowAddForm(true)
              }
              className="flex min-w-32 items-center gap-2 rounded-lg border border-dashed border-gold/30 bg-background/25 px-3 py-2 text-muted-foreground transition-all hover:border-gold hover:text-gold"
            >

              <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-gold/30">
                <Plus className="size-4" />
              </span>

              <span className="text-left">

                <span className="block text-xs">
                  Add Member
                </span>

                <span className="block text-[10px]">
                  Party slot{" "}
                  {partyMembers.length + index + 1}
                </span>

              </span>

            </button>

          ))}

        </div>

      </div>

      {showAddForm && (

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-gold/30 bg-background/30 p-4">

          <div>
            <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
              Member Name
            </label>

            <input
              value={newName}
              onChange={(event) =>
                setNewName(event.target.value)
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
                  event.target.value as AgeGroup,
                )
              }
              className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="adult">Adult</option>
              <option value="teen">Teen</option>
              <option value="kid">Kid</option>
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
                  event.target.value as GenderFit,
                )
              }
              className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background"
          >
            Add to Party
          </button>

          <button
            type="button"
            onClick={() =>
              setShowAddForm(false)
            }
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            Cancel
          </button>

        </div>

      )}

    </section>
  );
}