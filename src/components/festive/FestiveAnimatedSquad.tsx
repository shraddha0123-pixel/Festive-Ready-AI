import {
  CheckCircle2,
  Download,
  Loader2,
  MessageCircle,
  Sparkles,
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

import {
  useFestive,
  type AgeGroup,
  type GenderFit,
} from "./FestiveContext";

const CUTOUT_CACHE_KEY =
  "festive-ready-ai-cutout-cache-v1";

const FESTIVE_READY_URL =
  "https://festivereadyai.com";

const CARD_ONE_BACKGROUND =
  "/festive-backgrounds/diwali-3.png";

const CARD_TWO_BACKGROUND =
  "/festive-backgrounds/diwali-2.png";

type CardDesign =
  | "happy-diwali"
  | "final-look";

type CutoutCache = Record<
  string,
  string
>;

type RemoveBackgroundResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

export function FestiveAnimatedSquad() {
  const {
    partyMembers,
    selectedFestival,
    finalizedLooksByMember,
  } = useFestive();

  const [
    selectedDesign,
    setSelectedDesign,
  ] =
    useState<CardDesign>(
      "happy-diwali",
    );

  const [cutouts, setCutouts] =
    useState<Record<string, string>>(
      {},
    );

  const [preparing, setPreparing] =
    useState(false);

  const [exporting, setExporting] =
    useState<
      "download" | "share" | null
    >(null);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const readyMembers =
    partyMembers.flatMap(
      (member) => {
        const look =
          finalizedLooksByMember[
            member.id
          ];

        if (
          look?.festivalId !==
          selectedFestival.id
        ) {
          return [];
        }

        return [
          {
            member,
            look,
          },
        ];
      },
    );

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

  function readCache(): CutoutCache {
    try {
      const raw =
        localStorage.getItem(
          CUTOUT_CACHE_KEY,
        );

      if (!raw) {
        return {};
      }

      return JSON.parse(
        raw,
      ) as CutoutCache;
    } catch {
      return {};
    }
  }

  function saveCache(
    cache: CutoutCache,
  ) {
    try {
      localStorage.setItem(
        CUTOUT_CACHE_KEY,
        JSON.stringify(cache),
      );
    } catch {
      // Ignore storage errors.
    }
  }

  function getCacheId(
    memberId: string,
    imageUrl: string,
  ) {
    return [
      selectedFestival.id,
      memberId,
      imageUrl,
    ].join("::");
  }

  async function removeBackground(
    imageUrl: string,
  ) {
    const formData =
      new FormData();

    formData.append(
      "personUrl",
      imageUrl,
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
      (await response.json()) as RemoveBackgroundResponse;

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

    return payload.url;
  }

  /*
   * Restore existing CharacterStage
   * cutouts first.
   * If missing, prepare automatically.
   */
  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      if (
        readyMembers.length === 0
      ) {
        setCutouts({});
        return;
      }

      setPreparing(true);
      setError(null);

      const cache =
        readCache();

      const next: Record<
        string,
        string
      > = {};

      try {
        for (
          const {
            member,
            look,
          } of readyMembers
        ) {
          if (cancelled) {
            return;
          }

          const finalizedUrl =
            look.tryOnResult?.url;

          if (!finalizedUrl) {
            next[member.id] =
              getFallbackCharacter(
                member.ageGroup,
                member.genderFit,
              );

            continue;
          }

          const cacheId =
            getCacheId(
              member.id,
              finalizedUrl,
            );

          const cached =
            cache[cacheId];

          if (cached) {
            next[member.id] =
              cached;

            setCutouts({
              ...next,
            });

            continue;
          }

          try {
            const transparentUrl =
              await removeBackground(
                finalizedUrl,
              );

            next[member.id] =
              transparentUrl;

            cache[cacheId] =
              transparentUrl;

            saveCache(cache);
          } catch {
            /*
             * Do not break final demo.
             * Use finalized VTO if needed.
             */
            next[member.id] =
              finalizedUrl;
          }

          setCutouts({
            ...next,
          });
        }

        if (!cancelled) {
          setCutouts({
            ...next,
          });
        }
      } catch (
        prepareError
      ) {
        if (!cancelled) {
          setError(
            prepareError instanceof
              Error
              ? prepareError.message
              : "Could not prepare festive cards.",
          );
        }
      } finally {
        if (!cancelled) {
          setPreparing(false);
        }
      }
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [
    selectedFestival.id,
    finalizedLooksByMember,
    partyMembers,
  ]);

  function getPosition(
    index: number,
    count: number,
  ) {
    if (count === 1) {
      return {
        left: "14%",
        width: "72%",
        bottom: "7%",
      };
    }

    if (count === 2) {
      return [
        {
          left: "5%",
          width: "49%",
          bottom: "6%",
        },
        {
          left: "46%",
          width: "49%",
          bottom: "6%",
        },
      ][index]!;
    }

    if (count === 3) {
      return [
        {
          left: "1%",
          width: "37%",
          bottom: "6%",
        },
        {
          left: "31.5%",
          width: "37%",
          bottom: "6%",
        },
        {
          left: "62%",
          width: "37%",
          bottom: "6%",
        },
      ][index]!;
    }

    return [
      {
        left: "0%",
        width: "29%",
        bottom: "6%",
      },
      {
        left: "24%",
        width: "29%",
        bottom: "6%",
      },
      {
        left: "48%",
        width: "29%",
        bottom: "6%",
      },
      {
        left: "72%",
        width: "28%",
        bottom: "6%",
      },
    ][index]!;
  }

  function loadImage(
    src: string,
  ) {
    return new Promise<HTMLImageElement>(
      (
        resolve,
        reject,
      ) => {
        const image =
          new Image();

        image.crossOrigin =
          "anonymous";

        image.onload = () =>
          resolve(image);

        image.onerror = () =>
          reject(
            new Error(
              "Could not load festive card image.",
            ),
          );

        image.src = src;
      },
    );
  }

  function drawBackground(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number,
  ) {
    const scale =
      Math.max(
        width /
          image.width,
        height /
          image.height,
      );

    const drawWidth =
      image.width *
      scale;

    const drawHeight =
      image.height *
      scale;

    ctx.drawImage(
      image,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  }

  async function createCardBlob(
    design: CardDesign,
  ) {
    const width = 1080;
    const height = 1920;

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Could not create card.",
      );
    }

    const background =
      await loadImage(
        design ===
          "happy-diwali"
          ? CARD_ONE_BACKGROUND
          : CARD_TWO_BACKGROUND,
      );

    drawBackground(
      ctx,
      background,
      width,
      height,
    );

    /*
     * Slight cinematic overlay.
     */
    const overlay =
      ctx.createLinearGradient(
        0,
        0,
        0,
        height,
      );

    overlay.addColorStop(
      0,
      "rgba(25,5,1,0.14)",
    );

    overlay.addColorStop(
      0.5,
      "rgba(15,2,0,0)",
    );

    overlay.addColorStop(
      1,
      "rgba(12,2,0,0.34)",
    );

    ctx.fillStyle = overlay;

    ctx.fillRect(
      0,
      0,
      width,
      height,
    );

    /*
     * FAMILY
     */
    for (
      let index = 0;
      index <
      readyMembers.length;
      index += 1
    ) {
      const { member } =
        readyMembers[index]!;

      const fallback =
        getFallbackCharacter(
          member.ageGroup,
          member.genderFit,
        );

      const imageUrl =
        cutouts[member.id] ??
        fallback;

      const person =
        await loadImage(
          imageUrl,
        );

      const position =
        getPosition(
          index,
          readyMembers.length,
        );

      const left =
        Number.parseFloat(
          position.left,
        ) / 100;

      const widthRatio =
        Number.parseFloat(
          position.width,
        ) / 100;

      const bottom =
        Number.parseFloat(
          position.bottom,
        ) / 100;

      const boxWidth =
        width *
        widthRatio;

      const maxHeight =
        height *
        (design ===
        "happy-diwali"
          ? 0.75
          : 0.78);

      const scale =
        Math.min(
          boxWidth /
            person.width,
          maxHeight /
            person.height,
        );

      const drawWidth =
        person.width *
        scale;

      const drawHeight =
        person.height *
        scale;

      const x =
        width * left +
        (boxWidth -
          drawWidth) /
          2;

      const y =
        height -
        height *
          bottom -
        drawHeight;

      ctx.save();

      ctx.shadowColor =
        "rgba(0,0,0,0.62)";

      ctx.shadowBlur = 30;

      ctx.shadowOffsetY = 16;

      ctx.drawImage(
        person,
        x,
        y,
        drawWidth,
        drawHeight,
      );

      ctx.restore();
    }

    ctx.textAlign =
      "center";

    /*
     * CARD 1
     */
    if (
      design ===
      "happy-diwali"
    ) {
      const gradient =
        ctx.createLinearGradient(
          0,
          height - 430,
          0,
          height,
        );

      gradient.addColorStop(
        0,
        "rgba(10,1,0,0)",
      );

      gradient.addColorStop(
        0.5,
        "rgba(10,1,0,0.60)",
      );

      gradient.addColorStop(
        1,
        "rgba(8,1,0,0.95)",
      );

      ctx.fillStyle =
        gradient;

      ctx.fillRect(
        0,
        height - 470,
        width,
        470,
      );

      ctx.fillStyle =
        "#ffe09a";

      ctx.font =
        "700 63px Georgia";

      ctx.fillText(
        "Happy Diwali 2026",
        width / 2,
        height - 165,
      );

      ctx.fillStyle =
        "#fff0c9";

      ctx.font =
        "700 34px Arial";

      ctx.fillText(
        "FESTIVE READY",
        width / 2,
        height - 105,
      );
    }

    /*
     * CARD 2
     */
    if (
      design ===
      "final-look"
    ) {
      const topGradient =
        ctx.createLinearGradient(
          0,
          0,
          0,
          400,
        );

      topGradient.addColorStop(
        0,
        "rgba(8,1,0,0.88)",
      );

      topGradient.addColorStop(
        1,
        "rgba(8,1,0,0)",
      );

      ctx.fillStyle =
        topGradient;

      ctx.fillRect(
        0,
        0,
        width,
        430,
      );

      ctx.fillStyle =
        "#ffe09a";

      ctx.font =
        "700 78px Georgia";

      ctx.fillText(
        "Shubh Deepawali",
        width / 2,
        130,
      );

      const bottomGradient =
        ctx.createLinearGradient(
          0,
          height - 340,
          0,
          height,
        );

      bottomGradient.addColorStop(
        0,
        "rgba(10,1,0,0)",
      );

      bottomGradient.addColorStop(
        0.55,
        "rgba(10,1,0,0.67)",
      );

      bottomGradient.addColorStop(
        1,
        "rgba(8,1,0,0.95)",
      );

      ctx.fillStyle =
        bottomGradient;

      ctx.fillRect(
        0,
        height - 390,
        width,
        390,
      );

      ctx.fillStyle =
        "#ffe1a1";

      ctx.font =
        "700 38px Arial";

      ctx.fillText(
        "MY FINAL LOOK READY • FESTIVE READY AI",
        width / 2,
        height - 105,
      );
    }

    /*
     * WATERMARK
     */
    ctx.fillStyle =
      "rgba(255,236,194,0.90)";

    ctx.font =
      "600 20px Arial";

    ctx.fillText(
      "FESTIVE READY AI • festivereadyai.com",
      width / 2,
      height - 30,
    );

    return new Promise<Blob>(
      (
        resolve,
        reject,
      ) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error(
                  "Card export failed.",
                ),
              );
            }
          },
          "image/png",
          1,
        );
      },
    );
  }

  function downloadBlob(
    blob: Blob,
    filename: string,
  ) {
    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = url;
    link.download =
      filename;

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(
        url,
      );
    }, 1000);
  }

  async function downloadSelected() {
    setExporting(
      "download",
    );

    setError(null);

    try {
      const blob =
        await createCardBlob(
          selectedDesign,
        );

      downloadBlob(
        blob,
        selectedDesign ===
          "happy-diwali"
          ? "festive-ready-happy-diwali.png"
          : "festive-ready-final-look.png",
      );
    } catch (
      downloadError
    ) {
      setError(
        downloadError instanceof
          Error
          ? downloadError.message
          : "Download failed.",
      );
    } finally {
      setExporting(null);
    }
  }

  async function shareSelected() {
    setExporting("share");
    setError(null);

    try {
      const blob =
        await createCardBlob(
          selectedDesign,
        );

      const filename =
        selectedDesign ===
          "happy-diwali"
          ? "festive-ready-happy-diwali.png"
          : "festive-ready-final-look.png";

      const file =
        new File(
          [blob],
          filename,
          {
            type:
              "image/png",
          },
        );

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          title:
            "Festive Ready AI ✨",

          text:
            `Happy Diwali ✨ ${FESTIVE_READY_URL}`,

          files: [file],
        });

        return;
      }

      /*
       * Desktop fallback:
       * download + WhatsApp.
       */
      downloadBlob(
        blob,
        filename,
      );

      const message =
        encodeURIComponent(
          `Happy Diwali ✨ My Festive Ready AI look is ready! ${FESTIVE_READY_URL}`,
        );

      window.open(
        `https://wa.me/?text=${message}`,
        "_blank",
      );
    } catch (
      shareError
    ) {
      setError(
        shareError instanceof
          Error
          ? shareError.message
          : "Sharing failed.",
      );
    } finally {
      setExporting(null);
    }
  }

  if (
    readyMembers.length === 0
  ) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <Sparkles className="mx-auto size-6 text-gold" />

          <p className="mt-3 font-display text-sm text-gold">
            Finalize Your Look First
          </p>
        </div>
      </div>
    );
  }

  function renderCard(
    design: CardDesign,
  ) {
    const active =
      selectedDesign ===
      design;

    const happy =
      design ===
      "happy-diwali";

    return (
      <button
        type="button"
        onClick={() =>
          setSelectedDesign(
            design,
          )
        }
        className={`flex min-h-0 flex-1 flex-col rounded-xl border p-2 text-left transition ${
          active
            ? "border-gold bg-gold/5"
            : "border-gold/15 bg-black/15"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="font-display text-[9px] tracking-[0.12em] text-gold uppercase">
              {happy
                ? "Festive Portrait"
                : "Final Look Greeting"}
            </p>

            <p className="text-[6px] text-muted-foreground">
              {happy
                ? "Happy Diwali 2026"
                : "Shubh Deepawali"}
            </p>
          </div>

          {active && (
            <div className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[6px] text-gold">
              <CheckCircle2 className="size-2.5" />
              Selected
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative h-full max-h-[580px] overflow-hidden rounded-lg border border-gold/25 bg-black"
            style={{
              aspectRatio:
                "9 / 16",

              backgroundImage:
                `url("${
                  happy
                    ? CARD_ONE_BACKGROUND
                    : CARD_TWO_BACKGROUND
                }")`,

              backgroundSize:
                "cover",

              backgroundPosition:
                "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/45" />

            {!happy && (
              <div className="absolute left-0 right-0 top-[4%] z-50 text-center">
                <p className="font-display text-[21px] text-[#ffe2a0] drop-shadow-lg">
                  Shubh Deepawali
                </p>
              </div>
            )}

            {readyMembers.map(
              (
                { member },
                index,
              ) => {
                const position =
                  getPosition(
                    index,
                    readyMembers.length,
                  );

                const fallback =
                  getFallbackCharacter(
                    member.ageGroup,
                    member.genderFit,
                  );

                const image =
                  cutouts[
                    member.id
                  ] ?? fallback;

                return (
                  <div
                    key={
                      member.id
                    }
                    className="absolute z-30 flex h-[76%] items-end justify-center"
                    style={{
                      left:
                        position.left,

                      width:
                        position.width,

                      bottom:
                        position.bottom,
                    }}
                  >
                    <img
                      src={image}
                      alt={`${member.name} festive look`}
                      className="max-h-full max-w-full object-contain object-bottom"
                      style={{
                        filter:
                          "drop-shadow(0 15px 15px rgba(0,0,0,0.60))",
                      }}
                    />
                  </div>
                );
              },
            )}

            {preparing && (
              <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/30">
                <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-[#190904]/90 px-4 py-2 text-[7px] text-gold">
                  <Loader2 className="size-3 animate-spin" />
                  Preparing character...
                </div>
              </div>
            )}

            {happy ? (
              <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0d0200]/95 via-[#160401]/70 to-transparent px-4 pb-7 pt-20 text-center">
                <p className="font-display text-[18px] text-[#ffe2a0]">
                  Happy Diwali 2026
                </p>

                <p className="mt-1 text-[8px] tracking-[0.12em] text-[#fff0c6] uppercase">
                  Festive Ready
                </p>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0d0200]/95 via-[#160401]/70 to-transparent px-4 pb-7 pt-16 text-center">
                <p className="font-display text-[10px] tracking-[0.04em] text-[#ffe2a0] uppercase">
                  My Final Look Ready
                </p>

                <p className="mt-1 text-[6px] text-[#fff0c6]">
                  Festive Ready AI
                </p>
              </div>
            )}

            <div className="absolute bottom-1.5 left-0 right-0 z-[60] text-center">
              <span className="text-[4.5px] text-[#ffe9b5]/85">
                FESTIVE READY AI • festivereadyai.com
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full gap-3 overflow-hidden">
      <div className="flex min-w-0 flex-1 gap-3 overflow-hidden">
        {renderCard(
          "happy-diwali",
        )}

        {renderCard(
          "final-look",
        )}
      </div>

      <aside className="flex h-full w-[225px] shrink-0 flex-col rounded-xl border border-gold/25 bg-[#190904]/90 p-4">
        <Sparkles className="size-5 text-gold" />

        <p className="mt-3 font-display text-[11px] tracking-[0.12em] text-gold uppercase">
          Your Festive Wishes
        </p>

        <p className="mt-2 text-[8px] leading-relaxed text-muted-foreground">
          Two ready-to-share festive
          designs are created
          automatically from your
          finalized YouCam look.
        </p>

        <div className="mt-4 rounded-lg border border-gold/15 bg-black/25 p-3">
          <p className="text-[6px] tracking-[0.1em] text-gold/60 uppercase">
            Family Ready
          </p>

          <p className="mt-1 text-[9px] text-white/90">
            {readyMembers.length}{" "}
            {readyMembers.length ===
            1
              ? "member"
              : "members"}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-[7px] text-gold">
            {preparing ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3" />
                Cards ready
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-amber-400/25 bg-amber-950/20 p-2 text-[7px] text-amber-100">
            {error}
          </div>
        )}

        <div className="mt-auto space-y-2">
          <button
            type="button"
            disabled={
              preparing ||
              exporting !== null
            }
            onClick={() =>
              void downloadSelected()
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold/60 bg-gold/10 px-3 py-3 font-display text-[8px] text-gold uppercase disabled:opacity-40"
          >
            {exporting ===
            "download" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Download className="size-3" />
            )}

            Download Selected
          </button>

          <button
            type="button"
            disabled={
              preparing ||
              exporting !== null
            }
            onClick={() =>
              void shareSelected()
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-3 font-display text-[8px] text-[#071b0c] uppercase disabled:opacity-40"
          >
            {exporting ===
            "share" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <MessageCircle className="size-3" />
            )}

            Share WhatsApp
          </button>

          <p className="pt-2 text-center text-[6px] text-gold/45">
            FESTIVE READY AI • festivereadyai.com
          </p>
        </div>
      </aside>
    </div>
  );
}