import {
  useEffect,
  useState,
} from "react";

import {
  RotateCw,
  Sparkles,
  Undo2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";

import character from "@/assets/character.png";

import adultMale from "@/assets/adult-male.png";
import teenFemale from "@/assets/teen-female.png";
import teenMale from "@/assets/teen-male.png";
import kidFemale from "@/assets/kid-female.png";
import kidMale from "@/assets/kid-male.png";

import { Embers } from "./Embers";
import { FestiveSquadReveal } from "./FestiveSquadReveal";
import { useFestive } from "./FestiveContext";

export function CharacterStage() {
  const {
    activeMember,

    selectedFestival,

    standingPhoto,
    setStandingPhoto,

    tryOnResult,
    setTryOnResult,

    equippedItems,

    finalizeCurrentLook,
  } = useFestive();

  const [
    standingPhotoPreview,
    setStandingPhotoPreview,
  ] = useState<string | null>(null);

  const [
    photoError,
    setPhotoError,
  ] = useState<string | null>(null);

  const [
    finalizeError,
    setFinalizeError,
  ] = useState<string | null>(null);

  const [
    showFinalLook,
    setShowFinalLook,
  ] = useState(false);

  const [
    figureScale,
    setFigureScale,
  ] = useState(1);

  /*
   * Create preview for the CURRENT
   * active member's uploaded photo.
   */

  useEffect(() => {
    if (!standingPhoto) {
      setStandingPhotoPreview(null);
      return;
    }

    const previewUrl =
      URL.createObjectURL(
        standingPhoto,
      );

    setStandingPhotoPreview(
      previewUrl,
    );

    return () => {
      URL.revokeObjectURL(
        previewUrl,
      );
    };
  }, [standingPhoto]);

  /*
   * Reset zoom when switching member
   * or when a new YouCam result appears.
   */

  useEffect(() => {
    setFigureScale(1);

    setShowFinalLook(false);

    setFinalizeError(null);
  }, [
    activeMember.id,
    tryOnResult?.url,
  ]);

  /*
   * PHOTO UPLOAD
   */

  function handlePhotoUpload(
    file: File | undefined,
  ) {
    setPhotoError(null);
    setFinalizeError(null);

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        file.type.toLowerCase(),
      )
    ) {
      setPhotoError(
        "Please upload a JPG or PNG photo.",
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setPhotoError(
        "Photo must be under 10 MB.",
      );

      return;
    }

    /*
     * Photo belongs only to the
     * currently selected family member.
     */

    setStandingPhoto(file);

    setTryOnResult(null);

    setFigureScale(1);
  }

  /*
   * ============================================================
   * RPG FALLBACK CHARACTER
   * ============================================================
   */

  function getFallbackCharacter() {
    /*
     * ADULT FEMALE
     */

    if (
      activeMember.ageGroup ===
        "adult" &&
      activeMember.genderFit ===
        "female"
    ) {
      return character;
    }

    /*
     * ADULT MALE
     */

    if (
      activeMember.ageGroup ===
        "adult" &&
      activeMember.genderFit ===
        "male"
    ) {
      return adultMale;
    }

    /*
     * TEEN FEMALE
     */

    if (
      activeMember.ageGroup ===
        "teen" &&
      activeMember.genderFit ===
        "female"
    ) {
      return teenFemale;
    }

    /*
     * TEEN MALE
     */

    if (
      activeMember.ageGroup ===
        "teen" &&
      activeMember.genderFit ===
        "male"
    ) {
      return teenMale;
    }

    /*
     * KID FEMALE
     */

    if (
      activeMember.ageGroup ===
        "kid" &&
      activeMember.genderFit ===
        "female"
    ) {
      return kidFemale;
    }

    /*
     * KID MALE
     */

    if (
      activeMember.ageGroup ===
        "kid" &&
      activeMember.genderFit ===
        "male"
    ) {
      return kidMale;
    }

    return character;
  }

  const fallbackCharacter =
    getFallbackCharacter();

  /*
   * DISPLAY PRIORITY
   *
   * 1. YouCam result
   * 2. Uploaded photo
   * 3. RPG fallback
   */

  const displayImage =
    tryOnResult?.url ??
    standingPhotoPreview ??
    fallbackCharacter;

  const isUserImage =
    Boolean(
      standingPhoto ||
        tryOnResult,
    );

  /*
   * CURRENT PREFERENCES
   */

  const preference =
    activeMember.preference;

  /*
   * EQUIPPED ITEMS
   */

  const equippedList =
    Object.entries(
      equippedItems,
    ).filter(
      (
        entry,
      ): entry is [
        string,
        NonNullable<
          (typeof entry)[1]
        >,
      ] => Boolean(entry[1]),
    );

  /*
   * JEWELLERY CHECK
   */

  const hasJewellery =
    Boolean(
      equippedItems.necklace ||
      equippedItems.earrings ||
      equippedItems.bangles ||
      equippedItems.ring,
    );

  /*
   * ZOOM
   */

  function handleZoom() {
    setFigureScale(
      (current) => {
        if (
          current >= 1.3
        ) {
          return 1;
        }

        return (
          current + 0.1
        );
      },
    );
  }

  function resetView() {
    setFigureScale(1);
  }

  /*
   * ============================================================
   * FINALIZE MY LOOK
   * ============================================================
   */

  function handleFinalize() {
    setFinalizeError(null);

    if (
      !standingPhoto &&
      !tryOnResult
    ) {
      setFinalizeError(
        "Upload your photo before finalizing your festive look.",
      );

      return;
    }

    if (!equippedItems.outfit) {
      setFinalizeError(
        "Equip an outfit before finalizing your festive look.",
      );

      return;
    }

    /*
     * Save finalized snapshot
     * for the active family member.
     */

    finalizeCurrentLook();

    setShowFinalLook(true);
  }

  return (
    <>
      <section className="flex min-h-0 flex-col gap-5">

        {/* RPG DRESSING CHAMBER */}

        <div className="panel-ornate relative h-[650px] overflow-hidden rounded-2xl">

          {/* ROYAL CHAMBER BACKGROUND */}

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 38%, rgba(218,165,32,0.22) 0%, rgba(105,48,15,0.18) 35%, rgba(10,5,2,0.58) 82%)",
            }}
          />

          {/* VERTICAL ROYAL SPOTLIGHT */}

          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-full w-[78%] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,190,70,0.05), rgba(255,215,130,0.15), rgba(255,190,70,0.05), transparent)",
            }}
          />

          <Embers />

          {/* TITLE */}

          <div className="absolute left-5 top-5 z-30">

            <p className="font-display text-[11px] tracking-[0.22em] text-gold uppercase">
              Dressing Chamber
            </p>

            <p className="mt-1 text-[10px] text-muted-foreground">
              {activeMember.name}
            </p>

          </div>

          {/* PHOTO CONTROLS */}

          {standingPhoto && (
            <div className="absolute right-5 top-5 z-30 flex gap-2">

              {tryOnResult && (
                <button
                  type="button"

                  onClick={() =>
                    setTryOnResult(
                      null,
                    )
                  }

                  className="rounded-lg border border-gold/40 bg-background/80 px-3 py-2 text-[9px] tracking-[0.12em] text-gold uppercase hover:border-gold"
                >
                  Original
                </button>
              )}

              <label className="cursor-pointer rounded-lg border border-gold/40 bg-background/80 px-3 py-2 text-[9px] tracking-[0.12em] text-gold uppercase hover:border-gold">

                Change Photo

                <input
                  type="file"

                  accept="image/jpeg,image/png"

                  className="hidden"

                  onChange={(event) =>
                    handlePhotoUpload(
                      event.target
                        .files?.[0],
                    )
                  }
                />

              </label>

            </div>
          )}

          {/* CHARACTER STAGE */}

          <div className="absolute inset-x-0 bottom-0 top-14 flex items-end justify-center overflow-hidden">

            {/* GOLD FLOOR GLOW */}

            <div
              aria-hidden

              className="absolute bottom-8 left-1/2 h-28 w-[80%] max-w-[440px] -translate-x-1/2 rounded-[50%]"

              style={{
                background:
                  "radial-gradient(ellipse, rgba(240,180,50,0.45), rgba(130,70,20,0.14) 48%, transparent 72%)",

                filter:
                  "blur(18px)",
              }}
            />

            {/* RPG PLATFORM */}

            <div
              aria-hidden

              className="absolute bottom-7 left-1/2 h-16 w-[65%] max-w-[360px] -translate-x-1/2 rounded-[50%] border border-gold/30"
            />

            {/* CHARACTER */}

            <div
              className="relative z-10 flex h-full w-full items-end justify-center"

              style={{
                transform:
                  `scale(${figureScale})`,

                transformOrigin:
                  "center bottom",

                transition:
                  "transform 250ms ease",
              }}
            >

              <img
                src={
                  displayImage
                }

                alt={
                  tryOnResult
                    ? `${activeMember.name} virtual try-on`
                    : standingPhoto
                      ? `${activeMember.name} uploaded photo`
                      : `${activeMember.name} RPG character`
                }

                className={
                  isUserImage
                    ? "h-[585px] w-auto max-w-none translate-y-[25px] object-contain object-bottom drop-shadow-[0_28px_32px_rgba(0,0,0,0.72)]"
                    : "h-[555px] w-auto object-contain object-bottom drop-shadow-[0_30px_50px_rgba(0,0,0,0.7)]"
                }
              />

            </div>

          </div>

          {/* UPLOAD */}

          {!standingPhoto && (
            <div className="absolute bottom-5 left-1/2 z-30 w-[calc(100%-40px)] max-w-md -translate-x-1/2">

              <div className="rounded-xl border border-gold/40 bg-background/90 p-4 text-center shadow-2xl backdrop-blur-md">

                <p className="font-display text-sm tracking-[0.14em] text-gold">
                  Enter The Dressing Chamber
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Upload a front-facing full-body photo
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground/70">
                  Your real face stays the same
                </p>

                <label
                  className="mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-[10px] tracking-[0.15em] text-primary-foreground uppercase"

                  style={{
                    background:
                      "var(--gradient-gold)",
                  }}
                >

                  <Upload className="size-4" />

                  Upload Standing Photo

                  <input
                    type="file"

                    accept="image/jpeg,image/png"

                    className="hidden"

                    onChange={(event) =>
                      handlePhotoUpload(
                        event.target
                          .files?.[0],
                      )
                    }
                  />

                </label>

              </div>

            </div>
          )}

          {/* READY FOR VTO */}

          {standingPhoto &&
            !tryOnResult && (
              <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-gold/40 bg-background/90 px-5 py-2 text-center backdrop-blur-md">

                <p className="text-[10px] text-gold">
                  ✓ Ready for Virtual Try-On
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  Choose an outfit and click Try On
                </p>

              </div>
            )}

          {/* VTO RESULT */}

          {tryOnResult && (
            <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-gold/50 bg-background/90 px-5 py-2 text-center">

              <p className="text-[10px] text-gold uppercase">
                ✨ Virtual Try-On
              </p>

              <p className="mt-1 text-xs">
                {
                  tryOnResult.itemName
                }
              </p>

            </div>
          )}

          {/* ERROR */}

          {photoError && (
            <div className="absolute left-1/2 top-20 z-50 flex max-w-[85%] -translate-x-1/2 items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/95 px-3 py-2 text-[10px] text-red-200">

              {photoError}

              <button
                type="button"

                onClick={() =>
                  setPhotoError(
                    null,
                  )
                }
              >
                <X className="size-4" />
              </button>

            </div>
          )}

        </div>

        {/* VIEW CONTROLS */}

        <div className="flex flex-wrap items-center justify-center gap-2">

          <button
            type="button"

            className="flex items-center gap-2 rounded-full border border-gold/40 bg-secondary/40 px-4 py-2 text-xs tracking-[0.14em] uppercase opacity-60"
          >
            <RotateCw className="size-4" />

            Rotate
          </button>

          <button
            type="button"

            onClick={
              handleZoom
            }

            className="flex items-center gap-2 rounded-full border border-gold/40 bg-secondary/40 px-4 py-2 text-xs tracking-[0.14em] uppercase transition-all hover:border-gold hover:text-gold"
          >
            <ZoomIn className="size-4" />

            Zoom
          </button>

          <button
            type="button"

            onClick={
              resetView
            }

            className="flex items-center gap-2 rounded-full border border-gold/40 bg-secondary/40 px-4 py-2 text-xs tracking-[0.14em] uppercase transition-all hover:border-gold hover:text-gold"
          >
            <Undo2 className="size-4" />

            Reset View
          </button>

        </div>

        {/* FINAL ACTIONS */}

        <div className="flex flex-col items-center gap-3">

          <button
            type="button"

            onClick={
              handleFinalize
            }

            className="w-full max-w-md rounded-lg px-8 py-3.5 font-display text-sm tracking-[0.2em] text-primary-foreground uppercase transition-transform hover:scale-[1.01]"

            style={{
              background:
                "var(--gradient-gold)",
            }}
          >

            <span className="inline-flex items-center gap-2">

              <Sparkles className="size-4" />

              Finalize My Look

            </span>

          </button>

          {finalizeError && (
            <div className="w-full max-w-md rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-2 text-center text-[10px] text-amber-200">
              {finalizeError}
            </div>
          )}

          {/* FESTIVE SQUAD REVEAL */}

          <FestiveSquadReveal />

        </div>

      </section>

      {/* ============================================================
          FINAL LOOK RESULT
          ============================================================ */}

      {showFinalLook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">

          <div className="panel-ornate relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-gold/40 bg-background shadow-[0_0_80px_rgba(218,165,32,0.22)]">

            {/* FINAL BACKGROUND */}

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 15%, rgba(218,165,32,0.15), transparent 45%)",
              }}
            />

            <Embers />

            {/* CLOSE */}

            <button
              type="button"

              onClick={() =>
                setShowFinalLook(
                  false,
                )
              }

              className="absolute right-4 top-4 z-30 flex size-9 items-center justify-center rounded-full border border-gold/40 bg-background/90 text-gold transition-colors hover:border-gold"
              aria-label="Close final look"
            >
              <X className="size-4" />
            </button>

            <div className="relative z-10 p-5 sm:p-7">

              {/* HEADING */}

              <div className="mb-6 text-center">

                <p className="text-[9px] tracking-[0.32em] text-gold/70 uppercase">
                  Festive Ready AI
                </p>

                <h2 className="mt-2 font-display text-2xl tracking-[0.16em] text-gold uppercase sm:text-3xl">
                  Final Look Ready
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">

                  {activeMember.name}

                  {" • "}

                  {selectedFestival.emoji}

                  {" "}

                  {selectedFestival.name}

                </p>

              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

                {/* FINAL IMAGE */}

                <div className="relative min-h-[500px] overflow-hidden rounded-2xl border border-gold/30 bg-black/30">

                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 45%, rgba(218,165,32,0.20), rgba(70,30,10,0.12) 42%, rgba(0,0,0,0.45) 90%)",
                    }}
                  />

                  <div
                    aria-hidden
                    className="absolute bottom-5 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[50%]"
                    style={{
                      background:
                        "radial-gradient(ellipse, rgba(240,180,50,0.38), transparent 70%)",

                      filter:
                        "blur(12px)",
                    }}
                  />

                  <div className="relative z-10 flex min-h-[500px] items-end justify-center">

                    <img
                      src={
                        displayImage
                      }

                      alt={`${activeMember.name} final festive look`}

                      className="max-h-[520px] w-auto max-w-full object-contain object-bottom drop-shadow-[0_30px_40px_rgba(0,0,0,0.75)]"
                    />

                  </div>

                  <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold/40 bg-background/85 px-4 py-2 text-[9px] tracking-[0.15em] text-gold uppercase backdrop-blur-md">

                    {tryOnResult
                      ? "AI Virtual Try-On Look"
                      : "Original Festive Look"}

                  </div>

                </div>

                {/* FINAL SUMMARY */}

                <div className="flex flex-col gap-4">

                  {/* FESTIVAL */}

                  <div className="rounded-xl border border-gold/25 bg-secondary/20 p-4">

                    <p className="text-[9px] tracking-[0.18em] text-gold/70 uppercase">
                      Festival Quest
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">

                      <div>

                        <p className="font-display text-lg text-gold">

                          {selectedFestival.emoji}

                          {" "}

                          {selectedFestival.name}

                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {selectedFestival.tagline}
                        </p>

                      </div>

                      <p className="text-right text-[10px] text-muted-foreground">
                        {selectedFestival.date}
                      </p>

                    </div>

                  </div>

                  {/* STYLE PROFILE */}

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-gold/20 bg-secondary/20 p-3">

                      <p className="text-[8px] tracking-[0.16em] text-muted-foreground uppercase">
                        Style
                      </p>

                      <p className="mt-1 text-sm text-gold">
                        {preference?.style ??
                          "All Styles"}
                      </p>

                    </div>

                    <div className="rounded-xl border border-gold/20 bg-secondary/20 p-3">

                      <p className="text-[8px] tracking-[0.16em] text-muted-foreground uppercase">
                        Colour
                      </p>

                      <p className="mt-1 text-sm text-gold">
                        {preference?.color ??
                          "All Colours"}
                      </p>

                    </div>

                  </div>

                  {/* EQUIPMENT */}

                  <div className="rounded-xl border border-gold/25 bg-secondary/20 p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <p className="text-[9px] tracking-[0.18em] text-gold/70 uppercase">
                        Equipped Gear
                      </p>

                      <p className="text-[9px] text-muted-foreground">

                        {equippedList.length}

                        {" "}

                        item

                        {equippedList.length ===
                        1
                          ? ""
                          : "s"}

                      </p>

                    </div>

                    <div className="space-y-2">

                      {equippedList.map(
                        ([
                          slot,
                          item,
                        ]) => (
                          <div
                            key={`${slot}-${item.id}`}

                            className="flex items-center gap-3 rounded-lg border border-gold/15 bg-background/30 p-2.5"
                          >

                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }

                                alt={
                                  item.name
                                }

                                className="size-12 rounded-md border border-gold/20 object-cover"
                              />
                            ) : (
                              <div className="flex size-12 items-center justify-center rounded-md border border-gold/20 bg-secondary/30 text-lg">
                                ✦
                              </div>
                            )}

                            <div className="min-w-0 flex-1">

                              <p className="text-[8px] tracking-[0.14em] text-gold/60 uppercase">
                                {slot}
                              </p>

                              <p className="truncate text-xs">
                                {item.name}
                              </p>

                              {item.price !==
                                undefined && (
                                <p className="mt-0.5 text-[9px] text-muted-foreground">

                                  {typeof item.price ===
                                  "number"
                                    ? `₹${item.price.toLocaleString(
                                        "en-IN",
                                      )}`
                                    : item.price}

                                </p>
                              )}

                            </div>

                            {item.productUrl && (
                              <a
                                href={
                                  item.productUrl
                                }

                                target="_blank"

                                rel="noreferrer"

                                className="rounded-md border border-gold/30 px-2.5 py-1.5 text-[8px] tracking-[0.1em] text-gold uppercase hover:border-gold"
                              >
                                View
                              </a>
                            )}

                          </div>
                        ),
                      )}

                    </div>

                  </div>

                  {/* EQUIPPED CATEGORY BUDGETS */}

                  <div className="rounded-xl border border-gold/25 bg-secondary/20 p-4">

                    <p className="mb-3 text-[9px] tracking-[0.18em] text-gold/70 uppercase">
                      Equipped Gear Budget
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                      {/* OUTFIT */}

                      {equippedItems.outfit && (
                        <div>

                          <p className="text-[8px] text-muted-foreground uppercase">
                            Outfit Budget Limit
                          </p>

                          <p className="text-xs">

                            ₹

                            {(
                              preference?.outfitBudget ??
                              0
                            ).toLocaleString(
                              "en-IN",
                            )}

                          </p>

                        </div>
                      )}

                      {/* JEWELLERY */}

                      {hasJewellery && (
                        <div>

                          <p className="text-[8px] text-muted-foreground uppercase">
                            Jewellery Budget Limit
                          </p>

                          <p className="text-xs">

                            ₹

                            {(
                              preference?.jewelleryBudget ??
                              0
                            ).toLocaleString(
                              "en-IN",
                            )}

                          </p>

                        </div>
                      )}

                      {/* SHOES */}

                      {equippedItems.shoes && (
                        <div>

                          <p className="text-[8px] text-muted-foreground uppercase">
                            Shoes Budget Limit
                          </p>

                          <p className="text-xs">

                            ₹

                            {(
                              preference?.shoesBudget ??
                              0
                            ).toLocaleString(
                              "en-IN",
                            )}

                          </p>

                        </div>
                      )}

                      {/* ACCESSORY */}

                      {equippedItems.accessory && (
                        <div>

                          <p className="text-[8px] text-muted-foreground uppercase">
                            Accessory Budget Limit
                          </p>

                          <p className="text-xs">

                            ₹

                            {(
                              preference?.accessoryBudget ??
                              0
                            ).toLocaleString(
                              "en-IN",
                            )}

                          </p>

                        </div>
                      )}

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="rounded-xl border border-gold/35 bg-gold/5 p-4 text-center">

                    <p className="text-[9px] tracking-[0.2em] text-gold/70 uppercase">
                      Look Status
                    </p>

                    <p className="mt-2 font-display text-lg tracking-[0.14em] text-gold uppercase">
                      Outfit Equipped ✓
                    </p>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                      Ready for Festive Ready Score
                    </p>

                  </div>

                </div>

              </div>

              {/* RETURN */}

              <div className="mt-6 flex justify-center">

                <button
                  type="button"

                  onClick={() =>
                    setShowFinalLook(
                      false,
                    )
                  }

                  className="rounded-lg px-8 py-3 font-display text-xs tracking-[0.16em] text-primary-foreground uppercase"

                  style={{
                    background:
                      "var(--gradient-gold)",
                  }}
                >
                  Return To Dressing Chamber
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
}