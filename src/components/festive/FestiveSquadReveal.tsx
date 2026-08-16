import {
  CheckCircle2,
  Crown,
  Sparkles,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import character from "@/assets/character.png";
import adultMale from "@/assets/adult-male.png";
import teenFemale from "@/assets/teen-female.png";
import teenMale from "@/assets/teen-male.png";
import kidFemale from "@/assets/kid-female.png";
import kidMale from "@/assets/kid-male.png";

import { Embers } from "./Embers";

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

  const [
    showSquad,
    setShowSquad,
  ] = useState(false);

  /*
   * ============================================================
   * FINALIZED LOOKS FOR CURRENT FESTIVAL
   * ============================================================
   */

  const finalizedCount =
    partyMembers.filter(
      (member) => {
        const look =
          finalizedLooksByMember[
            member.id
          ];

        return (
          look?.festivalId ===
          selectedFestival.id
        );
      },
    ).length;

  const totalMembers =
    partyMembers.length;

  const allReady =
    totalMembers > 0 &&
    finalizedCount ===
      totalMembers;

  /*
   * ============================================================
   * FALLBACK CHARACTER
   * ============================================================
   */

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

  /*
   * ============================================================
   * FESTIVAL BACKGROUND
   * ============================================================
   */

  function getFestivalBackground() {
    switch (
      selectedFestival.id
    ) {
      case "diwali":
        return `
          radial-gradient(
            circle at 50% 20%,
            rgba(255, 196, 64, 0.30),
            transparent 32%
          ),
          radial-gradient(
            circle at 15% 80%,
            rgba(255, 120, 20, 0.18),
            transparent 28%
          ),
          radial-gradient(
            circle at 85% 75%,
            rgba(255, 187, 51, 0.16),
            transparent 30%
          ),
          linear-gradient(
            180deg,
            rgba(60, 20, 5, 0.96),
            rgba(15, 6, 3, 0.99)
          )
        `;

      case "raksha-bandhan":
        return `
          radial-gradient(
            circle at 50% 20%,
            rgba(255, 195, 80, 0.22),
            transparent 32%
          ),
          radial-gradient(
            circle at 18% 70%,
            rgba(190, 30, 45, 0.20),
            transparent 30%
          ),
          linear-gradient(
            180deg,
            rgba(72, 16, 18, 0.97),
            rgba(20, 5, 7, 0.99)
          )
        `;

      case "janmashtami":
        return `
          radial-gradient(
            circle at 50% 18%,
            rgba(90, 190, 220, 0.22),
            transparent 32%
          ),
          radial-gradient(
            circle at 15% 75%,
            rgba(30, 110, 150, 0.20),
            transparent 30%
          ),
          linear-gradient(
            180deg,
            rgba(8, 34, 48, 0.97),
            rgba(4, 12, 18, 0.99)
          )
        `;

      case "ganesh-chaturthi":
        return `
          radial-gradient(
            circle at 50% 18%,
            rgba(255, 180, 45, 0.25),
            transparent 32%
          ),
          radial-gradient(
            circle at 15% 75%,
            rgba(235, 85, 25, 0.18),
            transparent 30%
          ),
          linear-gradient(
            180deg,
            rgba(68, 28, 5, 0.97),
            rgba(18, 7, 2, 0.99)
          )
        `;

      case "navratri":
        return `
          radial-gradient(
            circle at 50% 18%,
            rgba(240, 100, 180, 0.20),
            transparent 32%
          ),
          radial-gradient(
            circle at 15% 75%,
            rgba(100, 70, 210, 0.18),
            transparent 30%
          ),
          linear-gradient(
            180deg,
            rgba(48, 12, 48, 0.97),
            rgba(14, 4, 18, 0.99)
          )
        `;

      default:
        return `
          radial-gradient(
            circle at 50% 20%,
            rgba(218, 165, 32, 0.22),
            transparent 35%
          ),
          linear-gradient(
            180deg,
            rgba(55, 20, 8, 0.97),
            rgba(12, 5, 3, 0.99)
          )
        `;
    }
  }

  /*
   * ============================================================
   * OPEN MEMBER
   * ============================================================
   */

  function openMember(
    memberId: string,
  ) {
    setActiveMemberId(
      memberId,
    );

    setShowSquad(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      {/* ============================================================
          COMPACT SQUAD BUTTON
          ============================================================ */}

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
            : "cursor-not-allowed border-dashed border-gold/20 text-muted-foreground opacity-50"
        }`}
      >
        <span className="flex items-center justify-center gap-2 font-display text-xs tracking-[0.15em] uppercase">

          <Crown className="size-4" />

          {allReady
            ? "Reveal Complete Squad"
            : "Reveal Festive Squad"}

        </span>

        <span className="mt-1 block text-[9px] tracking-normal text-muted-foreground">

          {finalizedCount}
          {" of "}
          {totalMembers}
          {" family look"}
          {totalMembers === 1
            ? ""
            : "s"}
          {" finalized"}

        </span>
      </button>

      {/* ============================================================
          FESTIVE SQUAD REVEAL
          ============================================================ */}

      {showSquad && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/90 backdrop-blur-xl">

          <div
            className="relative min-h-screen"
            style={{
              background:
                getFestivalBackground(),
            }}
          >

            <Embers />

            {/* CLOSE */}

            <button
              type="button"

              onClick={() =>
                setShowSquad(false)
              }

              className="fixed right-5 top-5 z-[150] flex size-11 items-center justify-center rounded-full border border-gold/40 bg-background/80 text-gold shadow-xl backdrop-blur-md transition-all hover:border-gold"
              aria-label="Close squad reveal"
            >
              <X className="size-5" />
            </button>

            <div className="relative z-20 mx-auto flex min-h-screen max-w-[1450px] flex-col px-5 py-10">

              {/* TITLE */}

              <div className="mx-auto mb-8 max-w-3xl text-center">

                <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold shadow-[0_0_40px_rgba(218,165,32,0.18)]">

                  <Crown className="size-6" />

                </div>

                <p className="mt-5 text-[9px] tracking-[0.4em] text-gold/70 uppercase">
                  Festive Ready AI
                </p>

                <h2 className="mt-3 font-display text-3xl tracking-[0.16em] text-gold uppercase sm:text-4xl lg:text-5xl">
                  Your Festive Squad
                </h2>

                <p className="mt-3 text-sm text-muted-foreground">

                  {selectedFestival.emoji}
                  {" "}
                  {selectedFestival.name}

                  {" • "}

                  {finalizedCount}
                  {" of "}
                  {totalMembers}
                  {" heroes ready"}

                </p>

                {allReady && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[10px] tracking-[0.12em] text-gold uppercase">

                    <Sparkles className="size-4" />

                    Entire Squad Is Festive Ready

                  </div>
                )}

              </div>

              {/* =====================================================
                  SQUAD LAYOUT

                  1 = single hero
                  2 = twinning layout
                  3 = three-person squad
                  4 = full party
                  ===================================================== */}

              <div
                className={`mx-auto grid w-full gap-5 ${
                  totalMembers === 1
                    ? "max-w-md grid-cols-1"
                    : totalMembers === 2
                      ? "max-w-4xl grid-cols-1 sm:grid-cols-2"
                      : totalMembers === 3
                        ? "max-w-6xl grid-cols-1 sm:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >

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

                    const finalImage =
                      isReady
                        ? look.tryOnResult
                            ?.url ??
                          fallback
                        : fallback;

                    const equipmentCount =
                      isReady
                        ? Object.values(
                            look.equippedItems,
                          ).filter(Boolean)
                            .length
                        : 0;

                    const outfit =
                      isReady
                        ? look.equippedItems
                            .outfit
                        : undefined;

                    return (
                      <article
                        key={member.id}

                        className={`group relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${
                          isReady
                            ? "border-gold/45 bg-black/30 shadow-[0_0_35px_rgba(218,165,32,0.10)]"
                            : "border-gold/15 bg-black/20"
                        }`}
                      >

                        {/* MEMBER IMAGE */}

                        <div className="relative h-[420px] overflow-hidden">

                          <div
                            aria-hidden
                            className="absolute inset-0"
                            style={{
                              background:
                                isReady
                                  ? "radial-gradient(circle at 50% 50%, rgba(218,165,32,0.15), rgba(0,0,0,0.08) 48%, rgba(0,0,0,0.50) 100%)"
                                  : "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.65))",
                            }}
                          />

                          <div
                            aria-hidden
                            className="absolute bottom-5 left-1/2 h-16 w-[75%] -translate-x-1/2 rounded-[50%]"
                            style={{
                              background:
                                "radial-gradient(ellipse, rgba(240,180,50,0.28), transparent 70%)",
                              filter:
                                "blur(12px)",
                            }}
                          />

                          <div className="absolute inset-0 flex items-end justify-center">

                            <img
                              src={
                                finalImage
                              }

                              alt={`${member.name} festive squad look`}

                              className={`max-h-[410px] w-auto max-w-full object-contain object-bottom transition-all duration-500 ${
                                isReady
                                  ? "drop-shadow-[0_24px_30px_rgba(0,0,0,0.75)] group-hover:scale-[1.02]"
                                  : "opacity-30 grayscale"
                              }`}
                            />

                          </div>

                          {/* STATUS */}

                          <div className="absolute left-3 top-3">

                            {isReady ? (
                              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-background/85 px-3 py-1.5 text-[8px] tracking-[0.12em] text-gold uppercase backdrop-blur-md">

                                <CheckCircle2 className="size-3" />

                                Finalized

                              </div>
                            ) : (
                              <div className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[8px] tracking-[0.12em] text-muted-foreground uppercase backdrop-blur-md">

                                Not Finalized

                              </div>
                            )}

                          </div>

                        </div>

                        {/* MEMBER INFO */}

                        <div className="relative border-t border-gold/15 p-4">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="font-display text-lg tracking-[0.08em] text-gold">
                                {member.name}
                              </p>

                              <p className="mt-1 text-[9px] tracking-[0.1em] text-muted-foreground uppercase">

                                {member.ageGroup ??
                                  "Member"}

                                {" • "}

                                {member.genderFit ??
                                  "Festive"}

                              </p>

                            </div>

                            {isReady && (
                              <Sparkles className="mt-1 size-4 shrink-0 text-gold" />
                            )}

                          </div>

                          {isReady ? (
                            <>
                              <div className="mt-4 rounded-lg border border-gold/15 bg-background/25 p-3">

                                <p className="text-[8px] tracking-[0.14em] text-gold/60 uppercase">
                                  Equipped Outfit
                                </p>

                                <p className="mt-1 truncate text-xs">
                                  {outfit?.name ??
                                    "Festive Outfit"}
                                </p>

                              </div>

                              <div className="mt-3 flex items-center justify-between text-[9px] text-muted-foreground">

                                <span>
                                  {equipmentCount}
                                  {" "}
                                  gear item
                                  {equipmentCount ===
                                  1
                                    ? ""
                                    : "s"}
                                </span>

                                <span className="text-gold">
                                  Ready ✓
                                </span>

                              </div>
                            </>
                          ) : (
                            <button
                              type="button"

                              onClick={() =>
                                openMember(
                                  member.id,
                                )
                              }

                              className="mt-4 w-full rounded-lg border border-gold/30 px-4 py-2.5 text-[9px] tracking-[0.12em] text-gold uppercase transition-all hover:border-gold hover:bg-gold/5"
                            >
                              Style This Member
                            </button>
                          )}

                        </div>

                      </article>
                    );
                  },
                )}

              </div>

              {/* BOTTOM MESSAGE */}

              <div className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-gold/25 bg-black/25 px-6 py-5 text-center backdrop-blur-md">

                {allReady ? (
                  <>
                    <p className="font-display text-lg tracking-[0.14em] text-gold uppercase">
                      Squad Quest Complete ✨
                    </p>

                    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                      Your family is ready for{" "}
                      {selectedFestival.name}.
                      Next we can turn this
                      festive squad into a
                      shareable Squad Reel.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-sm tracking-[0.12em] text-gold uppercase">
                      Complete Your Squad
                    </p>

                    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                      Finalize the remaining{" "}
                      {totalMembers -
                        finalizedCount}{" "}
                      family look
                      {totalMembers -
                        finalizedCount ===
                      1
                        ? ""
                        : "s"}{" "}
                      to complete your{" "}
                      {selectedFestival.name}{" "}
                      squad.
                    </p>
                  </>
                )}

              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
}