import {
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  useFestive,
  type AgeGroup,
  type GenderFit,
  type PartyMember,
} from "./FestiveContext";

const ageLabels: Record<
  AgeGroup,
  string
> = {
  adult: "Adult",
  teen: "Teen",
  kid: "Kid",
};

const genderLabels: Record<
  GenderFit,
  string
> = {
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
    updateMember,
    removeMember,
  } = useFestive();

  /* =========================================================
     ADD MEMBER STATE
     ========================================================= */

  const [
    showAddForm,
    setShowAddForm,
  ] = useState(false);

  const [
    newName,
    setNewName,
  ] = useState("");

  const [
    newAgeGroup,
    setNewAgeGroup,
  ] = useState<AgeGroup>(
    "adult",
  );

  const [
    newGenderFit,
    setNewGenderFit,
  ] = useState<GenderFit>(
    "female",
  );

  /* =========================================================
     EDIT MEMBER STATE
     ========================================================= */

  const [
    editingMemberId,
    setEditingMemberId,
  ] = useState<string | null>(
    null,
  );

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    editAgeGroup,
    setEditAgeGroup,
  ] = useState<AgeGroup>(
    "adult",
  );

  const [
    editGenderFit,
    setEditGenderFit,
  ] = useState<GenderFit>(
    "female",
  );

  const remainingSlots =
    Math.max(
      0,
      4 - partyMembers.length,
    );

  /* =========================================================
     ADD MEMBER
     ========================================================= */

  function handleAddMember() {
    if (!newName.trim()) {
      return;
    }

    addMember(
      newName,
      newAgeGroup,
      newGenderFit,
    );

    setNewName("");
    setNewAgeGroup("adult");
    setNewGenderFit("female");

    setShowAddForm(false);
  }

  /* =========================================================
     START EDIT
     ========================================================= */

  function startEditing(
    member: PartyMember,
  ) {
    if (member.isMainProfile) {
      return;
    }

    setShowAddForm(false);

    setEditingMemberId(
      member.id,
    );

    setEditName(
      member.name,
    );

    setEditAgeGroup(
      member.ageGroup,
    );

    setEditGenderFit(
      member.genderFit,
    );
  }

  /* =========================================================
     SAVE EDIT
     ========================================================= */

  function handleSaveEdit() {
    if (
      !editingMemberId ||
      !editName.trim()
    ) {
      return;
    }

    updateMember(
      editingMemberId,
      editName,
      editAgeGroup,
      editGenderFit,
    );

    setEditingMemberId(
      null,
    );

    setEditName("");
  }

  /* =========================================================
     REMOVE MEMBER
     ========================================================= */

  function handleRemoveMember() {
    if (!editingMemberId) {
      return;
    }

    const member =
      partyMembers.find(
        (item) =>
          item.id ===
          editingMemberId,
      );

    if (!member) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${member.name} from your festive party?`,
      );

    if (!confirmed) {
      return;
    }

    removeMember(
      editingMemberId,
    );

    setEditingMemberId(
      null,
    );

    setEditName("");
  }

  return (
    <section className="panel-ornate rounded-xl p-4">

      {/* =====================================================
          PARTY ROW
          ===================================================== */}

      <div className="flex flex-wrap items-center gap-4">

        {/* TITLE */}

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

        {/* MEMBERS */}

        <div className="flex flex-wrap gap-2">

          {partyMembers.map(
            (member) => {
              const active =
                activeMemberId ===
                member.id;

              return (
                <div
                  key={member.id}

                  className={`relative min-w-[140px] rounded-lg border transition-all ${
                    active
                      ? "border-gold bg-secondary/60 shadow-[var(--shadow-glow)]"
                      : "border-border bg-background/40 hover:border-gold/60"
                  }`}
                >

                  {/* MEMBER SELECT */}

                  <button
                    type="button"

                    onClick={() =>
                      setActiveMemberId(
                        member.id,
                      )
                    }

                    className="flex w-full items-center gap-2 px-3 py-2 text-left"
                  >

                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-background/40">

                      <UserRound className="size-4 text-gold" />

                    </span>

                    <span className="min-w-0 flex-1">

                      <span className="block max-w-[90px] truncate text-xs text-foreground">
                        {member.name}
                      </span>

                      <span className="block whitespace-nowrap text-[10px] text-muted-foreground">

                        {member.isMainProfile
                          ? "Main Profile"
                          : `${ageLabels[member.ageGroup]} • ${genderLabels[member.genderFit]}`}

                      </span>

                    </span>

                  </button>

                  {/* CLEAR EDIT BUTTON */}

                  {!member.isMainProfile && (
                    <button
                      type="button"

                      onClick={() =>
                        startEditing(
                          member,
                        )
                      }

                      className="flex w-full items-center justify-center gap-1.5 border-t border-gold/15 px-2 py-1.5 text-[8px] tracking-[0.12em] text-gold/70 uppercase transition-all hover:bg-gold/10 hover:text-gold"
                    >

                      <Pencil className="size-3" />

                      Edit

                    </button>
                  )}

                </div>
              );
            },
          )}

          {/* EMPTY PARTY SLOTS */}

          {Array.from({
            length:
              remainingSlots,
          }).map(
            (_, index) => (
              <button
                key={index}

                type="button"

                onClick={() => {
                  setEditingMemberId(
                    null,
                  );

                  setShowAddForm(
                    true,
                  );
                }}

                className="flex min-w-[140px] items-center gap-2 rounded-lg border border-dashed border-gold/30 bg-background/25 px-3 py-2 text-muted-foreground transition-all hover:border-gold hover:text-gold"
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
                    {partyMembers.length +
                      index +
                      1}
                  </span>

                </span>

              </button>
            ),
          )}

        </div>

      </div>

      {/* =====================================================
          ADD MEMBER FORM
          ===================================================== */}

      {showAddForm && (
        <div className="relative mt-4 rounded-xl border border-gold/30 bg-background/30 p-4">

          <button
            type="button"

            onClick={() =>
              setShowAddForm(
                false,
              )
            }

            className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md border border-gold/20 text-muted-foreground hover:border-gold hover:text-gold"
          >

            <X className="size-3.5" />

          </button>

          <p className="mb-4 font-display text-xs tracking-[0.16em] text-gold uppercase">
            Add Family Member
          </p>

          <div className="flex flex-wrap items-end gap-3">

            <div>

              <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                Member Name
              </label>

              <input
                value={
                  newName
                }

                onChange={(event) =>
                  setNewName(
                    event.target.value,
                  )
                }

                placeholder="e.g. Mom, Dad, Riya"

                className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
              />

            </div>

            <div>

              <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                Age Group
              </label>

              <select
                value={
                  newAgeGroup
                }

                onChange={(event) =>
                  setNewAgeGroup(
                    event.target
                      .value as AgeGroup,
                  )
                }

                className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
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
                value={
                  newGenderFit
                }

                onChange={(event) =>
                  setNewGenderFit(
                    event.target
                      .value as GenderFit,
                  )
                }

                className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
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

              onClick={
                handleAddMember
              }

              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background"
            >
              Add to Party
            </button>

            <button
              type="button"

              onClick={() =>
                setShowAddForm(
                  false,
                )
              }

              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT MEMBER FORM
          ===================================================== */}

      {editingMemberId && (
        <div className="relative mt-4 rounded-xl border border-gold/40 bg-background/35 p-4">

          <button
            type="button"

            onClick={() =>
              setEditingMemberId(
                null,
              )
            }

            className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md border border-gold/20 text-muted-foreground hover:border-gold hover:text-gold"
          >

            <X className="size-3.5" />

          </button>

          <div className="mb-4">

            <p className="font-display text-xs tracking-[0.16em] text-gold uppercase">
              Edit Family Member
            </p>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Their equipped items and finalized look stay saved.
            </p>

          </div>

          <div className="flex flex-wrap items-end gap-3">

            {/* NAME */}

            <div>

              <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                Member Name
              </label>

              <input
                value={
                  editName
                }

                onChange={(event) =>
                  setEditName(
                    event.target.value,
                  )
                }

                className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
              />

            </div>

            {/* AGE */}

            <div>

              <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                Age Group
              </label>

              <select
                value={
                  editAgeGroup
                }

                onChange={(event) =>
                  setEditAgeGroup(
                    event.target
                      .value as AgeGroup,
                  )
                }

                className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
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

            {/* GENDER */}

            <div>

              <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                Gender / Fit
              </label>

              <select
                value={
                  editGenderFit
                }

                onChange={(event) =>
                  setEditGenderFit(
                    event.target
                      .value as GenderFit,
                  )
                }

                className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
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

            {/* SAVE */}

            <button
              type="button"

              onClick={
                handleSaveEdit
              }

              className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-background"
            >
              Save Changes
            </button>

            {/* REMOVE */}

            <button
              type="button"

              onClick={
                handleRemoveMember
              }

              className="inline-flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/20 px-4 py-2 text-sm text-red-300 hover:border-red-400"
            >

              <Trash2 className="size-4" />

              Remove Member

            </button>

          </div>

        </div>
      )}

    </section>
  );
}