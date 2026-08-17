import {
  Loader2,
  RotateCw,
  Sparkles,
  Undo2,
  Upload,
  WandSparkles,
  X,
  ZoomIn,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import character from "@/assets/character.png";

import adultMale from "@/assets/adult-male.png";
import teenFemale from "@/assets/teen-female.png";
import teenMale from "@/assets/teen-male.png";
import kidFemale from "@/assets/kid-female.png";
import kidMale from "@/assets/kid-male.png";

import { Embers } from "./Embers";
import { FestiveSquadReveal } from "./FestiveSquadReveal";
import { useFestive } from "./FestiveContext";

/*
 * IMPORTANT:
 * This is intentionally the SAME cache key used
 * by FestiveAnimatedSquad.
 *
 * A cutout prepared here can therefore be reused
 * later inside the Wish Studio without another
 * unnecessary YouCam background-removal request.
 */
const CUTOUT_CACHE_KEY =
  "festive-ready-ai-cutout-cache-v1";

type CutoutCache =
  Record<string, string>;

type RemoveBackgroundResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

export function CharacterStage() {
  const {
    activeMember,

    selectedFestival,

    standingPhoto,
    setStandingPhoto,

    standingPhotoCutoutUrl,
    setStandingPhotoCutoutUrl,

    tryOnResult,
    setTryOnResult,

    equippedItems,

    finalizeCurrentLook,
  } = useFestive();

  const [
    standingPhotoPreview,
    setStandingPhotoPreview,
  ] = useState<string | null>(
    null,
  );

  const [
    photoError,
    setPhotoError,
  ] = useState<string | null>(
    null,
  );

  const [
    finalizeError,
    setFinalizeError,
  ] = useState<string | null>(
    null,
  );

  const [
    characterError,
    setCharacterError,
  ] = useState<string | null>(
    null,
  );

  const [
    preparingCharacter,
    setPreparingCharacter,
  ] = useState(false);

  const [
    showFinalLook,
    setShowFinalLook,
  ] = useState(false);

  const [
    figureScale,
    setFigureScale,
  ] = useState(1);

  /*
   * ============================================================
   * CUTOUT CACHE
   * ============================================================
   */

  function readCutoutCache() {
    if (
      typeof window ===
      "undefined"
    ) {
      return {} as CutoutCache;
    }

    try {
      const raw =
        window.localStorage.getItem(
          CUTOUT_CACHE_KEY,
        );

      if (!raw) {
        return {} as CutoutCache;
      }

      return JSON.parse(
        raw,
      ) as CutoutCache;
    } catch {
      return {} as CutoutCache;
    }
  }

  function saveCutoutCache(
    cache: CutoutCache,
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      window.localStorage.setItem(
        CUTOUT_CACHE_KEY,
        JSON.stringify(cache),
      );
    } catch (error) {
      console.error(
        "Could not save cutout cache:",
        error,
      );
    }
  }

  function getCurrentCutoutCacheId(
    imageUrl: string,
  ) {
    return [
      selectedFestival.id,
      activeMember.id,
      imageUrl,
    ].join("::");
  }

  /*
   * ============================================================
   * PHOTO PREVIEW
   * ============================================================
   */

  useEffect(() => {
    if (!standingPhoto) {
      setStandingPhotoPreview(
        null,
      );

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
   * ============================================================
   * RESTORE PREPARED CHARACTER
   *
   * When:
   * - member changes
   * - festival changes
   * - VTO result changes
   *
   * Check the SAME cache used by Wish Studio.
   * ============================================================
   */

  useEffect(() => {
    setCharacterError(null);

    if (!tryOnResult?.url) {
      if (standingPhotoCutoutUrl) {
        setStandingPhotoCutoutUrl(
          null,
        );
      }

      return;
    }

    const cache =
      readCutoutCache();

    const cacheId =
      getCurrentCutoutCacheId(
        tryOnResult.url,
      );

    const cached =
      cache[cacheId] ??
      null;

    if (
      cached !==
      standingPhotoCutoutUrl
    ) {
      setStandingPhotoCutoutUrl(
        cached,
      );
    }
  }, [
    activeMember.id,
    selectedFestival.id,
    tryOnResult?.url,
    standingPhotoCutoutUrl,
  ]);

  /*
   * ============================================================
   * RESET VIEW
   * ============================================================
   */

  useEffect(() => {
    setFigureScale(1);

    setShowFinalLook(false);

    setFinalizeError(null);
    setCharacterError(null);
  }, [
    activeMember.id,
    tryOnResult?.url,
  ]);

  /*
   * ============================================================
   * VTO / EQUIPMENT MATCH
   *
   * We only prepare a cutout when the outfit that was
   * previewed is the outfit that was actually equipped.
   * ============================================================
   */

  const tryOnMatchesEquippedOutfit =
    Boolean(
      tryOnResult &&
        equippedItems.outfit &&
        equippedItems.outfit.name ===
          tryOnResult.itemName,
    );

  /*
   * If the user changes the equipped outfit after preparing
   * a character, do not continue showing a stale cutout.
   */
  useEffect(() => {
    if (
      !standingPhotoCutoutUrl ||
      !tryOnResult
    ) {
      return;
    }

    if (
      !equippedItems.outfit ||
      equippedItems.outfit.name !==
        tryOnResult.itemName
    ) {
      setStandingPhotoCutoutUrl(
        null,
      );
    }
  }, [
    equippedItems.outfit?.id,
    tryOnResult?.itemName,
    standingPhotoCutoutUrl,
  ]);

  /*
   * ============================================================
   * PHOTO UPLOAD
   * ============================================================
   */

  function handlePhotoUpload(
    file: File | undefined,
  ) {
    setPhotoError(null);
    setFinalizeError(null);
    setCharacterError(null);

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
     * Photo belongs only to current member.
     * FestiveContext also clears old cutout + old VTO.
     */

    setStandingPhoto(
      file,
    );

    setTryOnResult(
      null,
    );

    setStandingPhotoCutoutUrl(
      null,
    );

    setFigureScale(1);
  }

  /*
   * ============================================================
   * ORIGINAL PHOTO
   * ============================================================
   */

  function showOriginalPhoto() {
    setTryOnResult(
      null,
    );

    setStandingPhotoCutoutUrl(
      null,
    );

    setCharacterError(null);
    setFinalizeError(null);
    setFigureScale(1);
  }

  /*
   * ============================================================
   * RPG FALLBACK CHARACTER
   * ============================================================
   */

  function getFallbackCharacter() {
    if (
      activeMember.ageGroup ===
        "adult" &&
      activeMember.genderFit ===
        "female"
    ) {
      return character;
    }

    if (
      activeMember.ageGroup ===
        "adult" &&
      activeMember.genderFit ===
        "male"
    ) {
      return adultMale;
    }

    if (
      activeMember.ageGroup ===
        "teen" &&
      activeMember.genderFit ===
        "female"
    ) {
      return teenFemale;
    }

    if (
      activeMember.ageGroup ===
        "teen" &&
      activeMember.genderFit ===
        "male"
    ) {
      return teenMale;
    }

    if (
      activeMember.ageGroup ===
        "kid" &&
      activeMember.genderFit ===
        "female"
    ) {
      return kidFemale;
    }

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
   * ============================================================
   * DISPLAY PRIORITY
   *
   * 1. Prepared transparent YouCam character
   * 2. YouCam VTO result
   * 3. Uploaded photo
   * 4. RPG fallback
   * ============================================================
   */

  const displayImage =
    standingPhotoCutoutUrl ??
    tryOnResult?.url ??
    standingPhotoPreview ??
    fallbackCharacter;

  const isUserImage =
    Boolean(
      standingPhotoCutoutUrl ||
        standingPhoto ||
        tryOnResult,
    );

  /*
   * ============================================================
   * CURRENT PREFERENCES
   * ============================================================
   */

  const preference =
    activeMember.preference;

  /*
   * ============================================================
   * EQUIPPED ITEMS
   * ============================================================
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
   * ============================================================
   * JEWELLERY CHECK
   * ============================================================
   */

  const hasJewellery =
    Boolean(
      equippedItems.necklace ||
        equippedItems.earrings ||
        equippedItems.bangles ||
        equippedItems.ring,
    );

  /*
   * ============================================================
   * PREPARE CHARACTER
   *
   * Real YouCam background removal.
   * API key remains server-side.
   * ============================================================
   */

  async function prepareCharacter() {
    setCharacterError(null);
    setFinalizeError(null);

    if (!tryOnResult?.url) {
      setCharacterError(
        "Create a Virtual Try-On result first.",
      );

      return;
    }

    if (!equippedItems.outfit) {
      setCharacterError(
        "Equip the previewed outfit before preparing your character.",
      );

      return;
    }

    if (
      equippedItems.outfit.name !==
      tryOnResult.itemName
    ) {
      setCharacterError(
        "The equipped outfit does not match this Virtual Try-On preview. Equip the previewed outfit first.",
      );

      return;
    }

    /*
     * CACHE FIRST
     */

    const cache =
      readCutoutCache();

    const cacheId =
      getCurrentCutoutCacheId(
        tryOnResult.url,
      );

    const cached =
      cache[cacheId];

    if (cached) {
      setStandingPhotoCutoutUrl(
        cached,
      );

      return;
    }

    setPreparingCharacter(
      true,
    );

    try {
      const formData =
        new FormData();

      /*
       * Same contract already used by
       * FestiveAnimatedSquad.
       */

      formData.append(
        "personUrl",
        tryOnResult.url,
      );

      const response =
        await fetch(
          "/api/youcam-remove-bg",
          {
            method: "POST",
            body: formData,
          },
        );

      const payload =
        (await response.json()) as
          RemoveBackgroundResponse;

      if (
        !response.ok ||
        !payload.success ||
        !payload.url
      ) {
        throw new Error(
          payload.error ??
            "Background removal failed.",
        );
      }

      /*
       * DISPLAY IN DRESSING CHAMBER
       */

      setStandingPhotoCutoutUrl(
        payload.url,
      );

      /*
       * SAVE USING SAME WISH-STUDIO CACHE KEY
       */

      cache[cacheId] =
        payload.url;

      saveCutoutCache(
        cache,
      );

      console.log(
        "YouCam background removal successful. Prepared character cached for Wish Studio.",
      );
    } catch (error) {
      console.error(
        "YouCam background-removal error:",
        error,
      );

      setCharacterError(
        error instanceof Error
          ? error.message
          : "Could not prepare your character.",
      );
    } finally {
      setPreparingCharacter(
        false,
      );
    }
  }

  /*
   * ============================================================
   * ZOOM
   * ============================================================
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
    setCharacterError(null);

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
     * If a VTO preview exists, protect against
     * finalizing a different equipped outfit.
     */

    if (
      tryOnResult &&
      equippedItems.outfit.name !==
        tryOnResult.itemName
    ) {
      setFinalizeError(
        "Your Virtual Try-On preview does not match the equipped outfit. Try On the equipped outfit before finalizing.",
      );

      return;
    }

    finalizeCurrentLook();

    setShowFinalLook(
      true,
    );
  }

  return (
    <>
      <section className="flex min-h-0 flex-col gap-5">

        {/* =====================================================
            RPG DRESSING CHAMBER
            ===================================================== */}

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
                  onClick={
                    showOriginalPhoto
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
                  standingPhotoCutoutUrl
                    ? `${activeMember.name} prepared festive character`
                    : tryOnResult
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

          {/* VTO / PREPARE CHARACTER */}

          {tryOnResult && (
            <div className="absolute bottom-5 left-1/2 z-30 w-[min(420px,calc(100%-40px))] -translate-x-1/2 rounded-xl border border-gold/50 bg-background/90 px-4 py-3 text-center shadow-2xl backdrop-blur-md">

              {standingPhotoCutoutUrl ? (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-gold uppercase">
                    ✨ Character Ready
                  </p>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Background removed with YouCam
                  </p>

                  <p className="mt-1 text-xs">
                    {tryOnResult.itemName}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-gold uppercase">
                    ✨ Virtual Try-On Ready
                  </p>

                  <p className="mt-1 text-xs">
                    {tryOnResult.itemName}
                  </p>

                  {tryOnMatchesEquippedOutfit ? (
                    <>
                      <button
                        type="button"
                        disabled={
                          preparingCharacter
                        }
                        onClick={() =>
                          void prepareCharacter()
                        }
                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-2 text-[9px] font-semibold tracking-[0.1em] text-gold uppercase transition-all hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {preparingCharacter ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Removing Background...
                          </>
                        ) : (
                          <>
                            <WandSparkles className="size-3.5" />
                            Prepare Character
                          </>
                        )}
                      </button>

                      <p className="mt-1 text-[8px] text-muted-foreground">
                        Powered by YouCam Background Removal
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-[8px] text-muted-foreground">
                      Equip this previewed outfit to prepare your RPG character.
                    </p>
                  )}
                </>
              )}

            </div>
          )}

          {/* PHOTO ERROR */}

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

          {/* CHARACTER ERROR */}

          {characterError && (
            <div className="absolute left-1/2 top-20 z-50 flex max-w-[88%] -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/95 px-3 py-2 text-[10px] text-amber-100">

              {characterError}

              <button
                type="button"
                onClick={() =>
                  setCharacterError(
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

                    {standingPhotoCutoutUrl
                      ? "Prepared RPG Character"
                      : tryOnResult
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
                      {standingPhotoCutoutUrl
                        ? "Character Prepared ✓"
                        : "Outfit Equipped ✓"}
                    </p>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {standingPhotoCutoutUrl
                        ? "Ready for the Festive Squad and Wish Studio"
                        : "Ready for Festive Ready Score"}
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