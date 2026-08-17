import {
  Bell,
  BellRing,
  CalendarDays,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
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
  type PartyMember,
} from "@/components/festive/FestiveContext";

type OpenPanel =
  | "member"
  | "edit-member"
  | "festival"
  | null;

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

export function FestiveControlBar() {
  const [
    openPanel,
    setOpenPanel,
  ] = useState<OpenPanel>(
    null,
  );

  /*
   * =========================================================
   * ADD MEMBER STATE
   * =========================================================
   */

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

  /*
   * =========================================================
   * EDIT MEMBER STATE
   * =========================================================
   */

  const [
    editingMemberId,
    setEditingMemberId,
  ] = useState<
    string | null
  >(null);

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

  /*
   * =========================================================
   * FESTIVE CONTEXT
   * =========================================================
   */

  const {
    partyMembers,
    activeMemberId,
    selectedFestival,
    reminders,
    addMember,
    updateMember,
    removeMember,
    setActiveMemberId,
    setSelectedFestival,
    toggleReminder,
  } = useFestive();

  const remainingSlots =
    Math.max(
      0,
      4 - partyMembers.length,
    );

  /*
   * =========================================================
   * ADD MEMBER
   * =========================================================
   */

  function addMemberAndClose() {
    const cleanName =
      newName.trim();

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

    setNewAgeGroup(
      "adult",
    );

    setNewGenderFit(
      "female",
    );

    setOpenPanel(
      null,
    );
  }

  /*
   * =========================================================
   * START EDIT MEMBER
   * =========================================================
   */

  function startEditingMember(
    member: PartyMember,
  ) {
    if (
      member.isMainProfile
    ) {
      return;
    }

    setActiveMemberId(
      member.id,
    );

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

    setOpenPanel(
      "edit-member",
    );
  }

  /*
   * =========================================================
   * SAVE MEMBER EDIT
   * =========================================================
   */

  function saveMemberEdit() {
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

    setOpenPanel(
      null,
    );
  }

  /*
   * =========================================================
   * REMOVE MEMBER
   * =========================================================
   */

  function deleteMember() {
    if (
      !editingMemberId
    ) {
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

    setOpenPanel(
      null,
    );
  }

  /*
   * =========================================================
   * REMINDER
   * =========================================================
   */

  const selectedReminderOn =
    reminders.includes(
      selectedFestival.id,
    );

  return (
    <>
      {/* =========================================================
          COMPACT STICKY FAMILY BAR
          ========================================================= */}

      <section className="panel-ornate sticky top-2 z-[80] rounded-xl px-3 py-2 backdrop-blur-xl">

        <div className="grid items-center gap-2 lg:grid-cols-[minmax(0,1fr)_230px]">

          {/* =====================================================
              FAMILY PARTY
              ===================================================== */}

          <div
            data-tour="family"
            className="flex min-w-0 items-center gap-2"
          >

            {/* TITLE */}

            <div className="mr-1 flex shrink-0 items-center gap-2">

              <Users
                className="size-4 text-gold"
                strokeWidth={
                  1.5
                }
              />

              <div>

                <p className="font-display text-[10px] tracking-[0.16em] text-gold uppercase">
                  My Festive Party
                </p>

                <p className="hidden text-[8px] text-muted-foreground xl:block">
                  Style up to 4 family members
                </p>

              </div>

            </div>

            {/* =================================================
                MEMBER SWITCHER
                ================================================= */}

            <div className="flex min-w-0 flex-1 flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {partyMembers.map(
                (member) => {
                  const active =
                    activeMemberId ===
                    member.id;

                  return (
                    <div
                      key={
                        member.id
                      }

                      className={`relative min-w-[118px] shrink-0 overflow-hidden rounded-lg border transition-all ${
                        active
                          ? "border-gold bg-secondary/60 shadow-[var(--shadow-glow)]"
                          : "border-border bg-background/30 hover:border-gold/60"
                      }`}
                    >

                      {/* SELECT MEMBER */}

                      <button
                        type="button"

                        onClick={() =>
                          setActiveMemberId(
                            member.id,
                          )
                        }

                        className="flex w-full items-center gap-2 px-2 py-1.5 pr-8 text-left"
                      >

                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-background/40">

                          <UserRound className="size-3.5 text-gold" />

                        </span>

                        <span className="min-w-0 text-left">

                          <span className="block max-w-[78px] truncate text-[11px] text-foreground">
                            {member.name}
                          </span>

                          <span className="block max-w-[78px] truncate text-[8px] text-muted-foreground">

                            {member.isMainProfile
                              ? "Main Profile"
                              : `${ageLabels[member.ageGroup]} · ${genderLabels[member.genderFit]}`}

                          </span>

                        </span>

                      </button>

                      {/* EDIT MEMBER */}

                      {!member.isMainProfile && (
                        <button
                          type="button"

                          onClick={() =>
                            startEditingMember(
                              member,
                            )
                          }

                          className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md border border-gold/15 bg-background/35 text-gold/70 transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-gold"

                          aria-label={`Edit ${member.name}`}

                          title={`Edit ${member.name}`}
                        >

                          <Pencil className="size-3" />

                        </button>
                      )}

                    </div>
                  );
                },
              )}

              {/* =================================================
                  ADD MEMBER
                  ================================================= */}

              {remainingSlots >
                0 && (
                <button
                  type="button"

                  onClick={() => {
                    setEditingMemberId(
                      null,
                    );

                    setOpenPanel(
                      "member",
                    );
                  }}

                  className="flex min-w-[104px] shrink-0 items-center gap-2 rounded-lg border border-dashed border-gold/30 bg-background/20 px-2 py-1.5 text-muted-foreground transition-all hover:border-gold hover:text-gold"
                >

                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-gold/30">

                    <Plus className="size-3.5" />

                  </span>

                  <span className="min-w-0 text-left">

                    <span className="block text-[10px]">
                      Add Member
                    </span>

                    <span className="block text-[8px]">

                      {remainingSlots}
                      {" "}

                      {remainingSlots ===
                      1
                        ? "slot left"
                        : "slots left"}

                    </span>

                  </span>

                </button>
              )}

            </div>

          </div>

          {/* =====================================================
              FESTIVAL BUTTON
              ===================================================== */}

          <button
            type="button"
            data-tour="festival"

            onClick={() =>
              setOpenPanel(
                "festival",
              )
            }

            className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-gold/30 bg-background/25 px-3 py-1.5 text-left transition-all hover:border-gold/70"
          >

            <div className="flex min-w-0 items-center gap-2">

              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gold/40 bg-background/40 text-base">

                {selectedFestival.emoji}

              </div>

              <div className="min-w-0">

                <div className="mb-0.5 flex items-center gap-1.5">

                  <CalendarDays className="size-3 text-gold" />

                  <p className="text-[8px] tracking-[0.14em] text-gold uppercase">
                    Festival
                  </p>

                </div>

                <p className="truncate font-display text-xs text-foreground">
                  {selectedFestival.name}
                </p>

                <p className="text-[8px] text-muted-foreground">
                  {selectedFestival.date}
                </p>

              </div>

            </div>

            <ChevronDown className="size-4 shrink-0 text-gold" />

          </button>

        </div>

        {/* =========================================================
            ADD / EDIT DRAWER
            ========================================================= */}

        {openPanel &&
          openPanel !==
            "festival" && (
          <div className="absolute left-0 right-0 top-full z-[90] mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-gold/30 bg-background/95 p-4 shadow-2xl backdrop-blur-xl">

            {/* =====================================================
                ADD MEMBER
                ===================================================== */}

            {openPanel ===
              "member" && (
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
                      setOpenPanel(
                        null,
                      )
                    }

                    className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-gold hover:text-gold"
                  >

                    <X className="size-4" />

                  </button>

                </div>

                <div className="flex flex-wrap items-end gap-3">

                  {/* NAME */}

                  <div>

                    <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                      Member Name
                    </label>

                    <input
                      value={
                        newName
                      }

                      onChange={(
                        event,
                      ) =>
                        setNewName(
                          event.target
                            .value,
                        )
                      }

                      placeholder="e.g. Mom, Dad, Riya"

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
                        newAgeGroup
                      }

                      onChange={(
                        event,
                      ) =>
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

                  {/* GENDER */}

                  <div>

                    <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                      Gender / Fit
                    </label>

                    <select
                      value={
                        newGenderFit
                      }

                      onChange={(
                        event,
                      ) =>
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
                      addMemberAndClose
                    }

                    className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background"
                  >
                    Add to Party
                  </button>

                  <button
                    type="button"

                    onClick={() =>
                      setOpenPanel(
                        null,
                      )
                    }

                    className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground"
                  >
                    Cancel
                  </button>

                </div>

              </>
            )}

            {/* =====================================================
                EDIT MEMBER
                ===================================================== */}

            {openPanel ===
              "edit-member" && (
              <>

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <p className="font-display text-xs tracking-[0.18em] text-gold uppercase">
                      Edit Family Member
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Their equipped items and finalized look stay saved.
                    </p>

                  </div>

                  <button
                    type="button"

                    onClick={() => {
                      setEditingMemberId(
                        null,
                      );

                      setOpenPanel(
                        null,
                      );
                    }}

                    className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-gold hover:text-gold"
                  >

                    <X className="size-4" />

                  </button>

                </div>

                <div className="flex flex-wrap items-end gap-3">

                  {/* EDIT NAME */}

                  <div>

                    <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                      Member Name
                    </label>

                    <input
                      value={
                        editName
                      }

                      onChange={(
                        event,
                      ) =>
                        setEditName(
                          event.target
                            .value,
                        )
                      }

                      className="rounded-md border border-gold/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
                    />

                  </div>

                  {/* EDIT AGE */}

                  <div>

                    <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                      Age Group
                    </label>

                    <select
                      value={
                        editAgeGroup
                      }

                      onChange={(
                        event,
                      ) =>
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

                  {/* EDIT GENDER */}

                  <div>

                    <label className="mb-1 block text-[10px] tracking-widest text-gold uppercase">
                      Gender / Fit
                    </label>

                    <select
                      value={
                        editGenderFit
                      }

                      onChange={(
                        event,
                      ) =>
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
                      saveMemberEdit
                    }

                    className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-background"
                  >
                    Save Changes
                  </button>

                  {/* REMOVE */}

                  <button
                    type="button"

                    onClick={
                      deleteMember
                    }

                    className="inline-flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/20 px-4 py-2 text-sm text-red-300 transition-all hover:border-red-400 hover:bg-red-950/40"
                  >

                    <Trash2 className="size-4" />

                    Remove Member

                  </button>

                </div>

              </>
            )}

          </div>
        )}

      </section>

      {/* =========================================================
          FESTIVAL MODAL
          ========================================================= */}

      {openPanel ===
        "festival" && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Choose festival"
        >

          <div className="panel-ornate relative max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-gold/40 bg-background/95 p-5 shadow-2xl">

            {/* HEADER */}

            <div className="mb-4 flex items-center justify-between">

              <div>

                <p className="font-display text-sm tracking-[0.18em] text-gold uppercase">
                  Choose Your Festival
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Pick the celebration you are styling for
                </p>

              </div>

              <button
                type="button"

                onClick={() =>
                  setOpenPanel(
                    null,
                  )
                }

                className="flex size-9 items-center justify-center rounded-full border border-gold/30 text-gold transition-all hover:border-gold hover:bg-gold/10"
              >

                <X className="size-4" />

              </button>

            </div>

            {/* FESTIVALS */}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

              {festivals.map(
                (festival) => {
                  const selected =
                    festival.id ===
                    selectedFestival.id;

                  const reminderOn =
                    reminders.includes(
                      festival.id,
                    );

                  return (
                    <div
                      key={
                        festival.id
                      }

                      className={`rounded-xl border p-3 transition-all ${
                        selected
                          ? "border-gold bg-secondary/60 shadow-[var(--shadow-glow)]"
                          : "border-border bg-background/30 hover:border-gold/50"
                      }`}
                    >

                      {/* SELECT FESTIVAL */}

                      <button
                        type="button"

                        onClick={() => {
                          setSelectedFestival(
                            festival,
                          );

                          setOpenPanel(
                            null,
                          );
                        }}

                        className="w-full text-left"
                      >

                        <div className="mb-3 flex items-center justify-between">

                          <span className="text-2xl">
                            {festival.emoji}
                          </span>

                          <span className="text-[8px] text-gold">
                            {festival.date}
                          </span>

                        </div>

                        <p className="font-display text-xs text-foreground">
                          {festival.name}
                        </p>

                        <p className="mt-1 min-h-[30px] text-[9px] leading-relaxed text-muted-foreground">
                          {festival.tagline}
                        </p>

                        {selected && (
                          <p className="mt-2 text-[8px] tracking-[0.12em] text-gold uppercase">
                            Selected ✓
                          </p>
                        )}

                      </button>

                      {/* REMINDER */}

                      <button
                        type="button"

                        onClick={() =>
                          toggleReminder(
                            festival.id,
                          )
                        }

                        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[8px] uppercase transition-all ${
                          reminderOn
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
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
                },
              )}

            </div>

            {/* FOOTER */}

            <div className="mt-4 flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-[10px] text-muted-foreground">

                Current festival:{" "}

                <span className="font-medium text-gold">
                  {selectedFestival.emoji}
                  {" "}
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

                className="flex items-center justify-center gap-2 rounded-md border border-gold/30 px-3 py-2 text-[9px] text-gold"
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

          </div>

        </div>
      )}
    </>
  );
}