import {
  CheckCircle2,
  Crown,
  X,
} from "lucide-react";

import { useState } from "react";

import character from "@/assets/character.png";
import adultMale from "@/assets/adult-male.png";
import teenFemale from "@/assets/teen-female.png";
import teenMale from "@/assets/teen-male.png";
import kidFemale from "@/assets/kid-female.png";
import kidMale from "@/assets/kid-male.png";

import { FestiveAnimatedSquad } from "./FestiveAnimatedSquad";

import {
  useFestive,
  type AgeGroup,
  type GenderFit,
} from "./FestiveContext";

export function FestiveSquadReveal() {
  const {
    partyMembers,
    selectedFestival,
    finalizedLooksByMember,
    setActiveMemberId,
  } = useFestive();

  const [showSquad, setShowSquad] =
    useState(false);

  const finalizedCount =
    partyMembers.filter((member) => {
      const look =
        finalizedLooksByMember[
          member.id
        ];

      return (
        look?.festivalId ===
        selectedFestival.id
      );
    }).length;

  const totalMembers =
    partyMembers.length;

  const allReady =
    totalMembers > 0 &&
    finalizedCount === totalMembers;

  function getFallbackCharacter(
    ageGroup?: AgeGroup,
    genderFit?: GenderFit,
  ) {
    if (
      ageGroup === "adult" &&
      genderFit === "female"
    ) {
      return character;
    }

    if (
      ageGroup === "adult" &&
      genderFit === "male"
    ) {
      return adultMale;
    }

    if (
      ageGroup === "teen" &&
      genderFit === "female"
    ) {
      return teenFemale;
    }

    if (
      ageGroup === "teen" &&
      genderFit === "male"
    ) {
      return teenMale;
    }

    if (
      ageGroup === "kid" &&
      genderFit === "female"
    ) {
      return kidFemale;
    }

    if (
      ageGroup === "kid" &&
      genderFit === "male"
    ) {
      return kidMale;
    }

    return character;
  }

  function openMember(
    memberId: string,
  ) {
    setActiveMemberId(memberId);
    setShowSquad(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={
          finalizedCount === 0
        }
        onClick={() =>
          setShowSquad(true)
        }
        className={`w-full max-w-md rounded-lg border px-8 py-3 transition-all ${
          finalizedCount > 0
            ? "border-gold/45 bg-secondary/30 text-gold hover:border-gold hover:bg-gold/5"
            : "cursor-not-allowed border-gold/20 text-muted-foreground opacity-50"
        }`}
      >
        <span className="flex items-center justify-center gap-2 font-display text-xs tracking-[0.15em] uppercase">
          <Crown className="size-4" />

          {allReady
            ? "Reveal Complete Squad"
            : "Reveal Festive Squad"}
        </span>

        <span className="mt-1 block text-[9px] text-muted-foreground">
          {finalizedCount} of{" "}
          {totalMembers} ready
        </span>
      </button>

      {showSquad && (
        <div className="fixed inset-0 z-[120] overflow-hidden bg-[#160704]">
          {/* TOP BAR */}

          <header className="flex h-[68px] items-center justify-between border-b border-gold/20 bg-[#210b05] px-5">
            <div>
              <p className="text-[7px] tracking-[0.3em] text-gold/60 uppercase">
                Festive Ready AI
              </p>

              <h2 className="mt-1 font-display text-lg tracking-[0.1em] text-gold uppercase">
                {selectedFestival.name} Family Wish
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <p className="hidden text-[8px] text-muted-foreground sm:block">
                {finalizedCount} /{" "}
                {totalMembers} family
                members ready
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowSquad(false)
                }
                className="flex size-9 items-center justify-center rounded-full border border-gold/30 bg-black/30 text-gold hover:border-gold"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {/* MAIN SCREEN */}

          <main className="grid h-[calc(100vh-68px)] grid-cols-[150px_minmax(0,1fr)] gap-3 p-3 lg:grid-cols-[170px_minmax(0,1fr)]">
            {/* LEFT — FAMILY */}

            <aside className="flex min-h-0 flex-col rounded-xl border border-gold/20 bg-black/25 p-2">
              <p className="mb-2 text-center font-display text-[8px] tracking-[0.14em] text-gold uppercase">
                Family
              </p>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                {partyMembers.map(
                  (member) => {
                    const look =
                      finalizedLooksByMember[
                        member.id
                      ];

                    const isReady =
                      look?.festivalId ===
                      selectedFestival.id;

                    const fallback =
                      getFallbackCharacter(
                        member.ageGroup,
                        member.genderFit,
                      );

                    const image =
                      isReady
                        ? look.tryOnResult
                            ?.url ??
                          fallback
                        : fallback;

                    return (
                      <div
                        key={
                          member.id
                        }
                        className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border ${
                          isReady
                            ? "border-gold/40 bg-gold/5"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        <div className="flex min-h-0 flex-1 items-end justify-center overflow-hidden">
                          <img
                            src={
                              image
                            }
                            alt={
                              member.name
                            }
                            className={`h-full w-full object-contain object-bottom ${
                              isReady
                                ? ""
                                : "opacity-30 grayscale"
                            }`}
                          />
                        </div>

                        <div className="shrink-0 border-t border-gold/10 px-1.5 py-1.5 text-center">
                          <p className="truncate font-display text-[8px] text-gold">
                            {
                              member.name
                            }
                          </p>

                          {isReady ? (
                            <div className="mt-0.5 flex items-center justify-center gap-1 text-[6px] text-gold/60">
                              <CheckCircle2 className="size-2" />
                              Ready
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openMember(
                                  member.id,
                                )
                              }
                              className="mt-0.5 text-[6px] text-gold/70 underline"
                            >
                              Style
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </aside>

            {/* CENTER + CONTROLS WILL LIVE HERE */}

            <section className="min-h-0 overflow-hidden rounded-xl border border-gold/20 bg-black/20 p-3">
              <div className="flex h-full min-h-0 items-center justify-center">
                <FestiveAnimatedSquad />
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  );
}