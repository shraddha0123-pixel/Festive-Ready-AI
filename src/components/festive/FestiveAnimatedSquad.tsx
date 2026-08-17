import {
  CheckCircle2,
  Download,
  Loader2,
  MessageCircle,
  Sparkles,
  WandSparkles,
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

type CutoutCache = Record<string, string>;

type RemoveBackgroundResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

const DIWALI_BACKGROUNDS = [
  {
    id: "diwali-1",
    name: "Royal Palace",
    url: "/festive-backgrounds/diwali-1.png",
  },
  {
    id: "diwali-2",
    name: "Rangoli Hall",
    url: "/festive-backgrounds/diwali-2.png",
  },
  {
    id: "diwali-3",
    name: "Golden Courtyard",
    url: "/festive-backgrounds/diwali-3.png",
  },
];

export function FestiveAnimatedSquad() {
  const {
    partyMembers,
    selectedFestival,
    finalizedLooksByMember,
  } = useFestive();

  const [cutouts, setCutouts] = useState<
    Record<string, string>
  >({});

  const [preparing, setPreparing] =
    useState(false);

  const [preparingName, setPreparingName] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [
    selectedBackground,
    setSelectedBackground,
  ] = useState(
    DIWALI_BACKGROUNDS[0]!.url,
  );

  /*
   * FINALIZED MEMBERS
   */

  const readyMembers =
    partyMembers.flatMap((member) => {
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
    });

  /*
   * FALLBACK CHARACTER
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
   * CACHE
   */

  function readCache() {
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
      // Ignore cache errors.
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

  /*
   * RESTORE CUTOUTS
   */

  useEffect(() => {
    const cache =
      readCache();

    const restored: Record<
      string,
      string
    > = {};

    for (
      const member of partyMembers
    ) {
      const look =
        finalizedLooksByMember[
          member.id
        ];

      if (
        look?.festivalId !==
        selectedFestival.id
      ) {
        continue;
      }

      const finalizedUrl =
        look.tryOnResult?.url;

      if (!finalizedUrl) {
        restored[
          member.id
        ] =
          getFallbackCharacter(
            member.ageGroup,
            member.genderFit,
          );

        continue;
      }

      const cacheId = [
        selectedFestival.id,
        member.id,
        finalizedUrl,
      ].join("::");

      const cached =
        cache[cacheId];

      if (cached) {
        restored[
          member.id
        ] = cached;
      }
    }

    setCutouts(restored);
  }, [
    selectedFestival.id,
    finalizedLooksByMember,
    partyMembers,
  ]);

  /*
   * REMOVE BACKGROUND
   */

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

  async function prepareCutouts() {
    if (
      readyMembers.length === 0
    ) {
      return;
    }

    setPreparing(true);
    setError(null);

    try {
      const cache =
        readCache();

      const nextCutouts = {
        ...cutouts,
      };

      for (
        const {
          member,
          look,
        } of readyMembers
      ) {
        setPreparingName(
          member.name,
        );

        const finalizedUrl =
          look.tryOnResult?.url;

        if (!finalizedUrl) {
          nextCutouts[
            member.id
          ] =
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
          nextCutouts[
            member.id
          ] = cached;

          continue;
        }

        const transparentUrl =
          await removeBackground(
            finalizedUrl,
          );

        nextCutouts[
          member.id
        ] =
          transparentUrl;

        cache[cacheId] =
          transparentUrl;

        saveCache(cache);

        setCutouts({
          ...nextCutouts,
        });
      }

      setCutouts({
        ...nextCutouts,
      });
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Could not prepare cutouts.",
      );
    } finally {
      setPreparing(false);
      setPreparingName("");
    }
  }

  /*
   * FAMILY POSITION
   */

  function getPosition(
    index: number,
    count: number,
  ) {
    if (count === 1) {
      return {
        left: "27%",
        width: "46%",
        bottom: "5%",
      };
    }

    if (count === 2) {
      const positions = [
        {
          left: "13%",
          width: "39%",
          bottom: "5%",
        },
        {
          left: "48%",
          width: "39%",
          bottom: "5%",
        },
      ];

      return (
        positions[index] ??
        positions[0]!
      );
    }

    if (count === 3) {
      const positions = [
        {
          left: "4%",
          width: "34%",
          bottom: "5%",
        },
        {
          left: "33%",
          width: "34%",
          bottom: "5%",
        },
        {
          left: "62%",
          width: "34%",
          bottom: "5%",
        },
      ];

      return (
        positions[index] ??
        positions[0]!
      );
    }

    const positions = [
      {
        left: "1%",
        width: "27%",
        bottom: "5%",
      },
      {
        left: "25%",
        width: "27%",
        bottom: "5%",
      },
      {
        left: "49%",
        width: "27%",
        bottom: "5%",
      },
      {
        left: "73%",
        width: "27%",
        bottom: "5%",
      },
    ];

    return (
      positions[index] ??
      positions[0]!
    );
  }

  const preparedCount =
    readyMembers.filter(
      ({ member }) =>
        Boolean(
          cutouts[
            member.id
          ],
        ),
    ).length;

  /*
   * CANVAS IMAGE
   */

  function loadCanvasImage(
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
              "Could not load image for card.",
            ),
          );

        image.src = src;
      },
    );
  }

  /*
   * CREATE FINAL CARD PNG
   */

  async function createCardBlob() {
    const width = 1080;
    const height = 1920;

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext(
        "2d",
      );

    if (!ctx) {
      throw new Error(
        "Could not create card.",
      );
    }

    /*
     * BACKGROUND
     */

    const background =
      await loadCanvasImage(
        selectedBackground,
      );

    const bgScale =
      Math.max(
        width /
          background.width,
        height /
          background.height,
      );

    const bgWidth =
      background.width *
      bgScale;

    const bgHeight =
      background.height *
      bgScale;

    ctx.drawImage(
      background,
      (width - bgWidth) / 2,
      (height - bgHeight) / 2,
      bgWidth,
      bgHeight,
    );

    /*
     * TOP GRADIENT
     */

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        500,
      );

    gradient.addColorStop(
      0,
      "rgba(0,0,0,0.55)",
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)",
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      width,
      520,
    );

    /*
     * TEXT
     */

    ctx.textAlign =
      "center";

    ctx.fillStyle =
      "#ffe4a0";

    ctx.font =
      "700 25px Arial";

    ctx.fillText(
      "FESTIVE READY AI",
      width / 2,
      75,
    );

    ctx.fillStyle =
      "#ffd66b";

    ctx.font =
      "700 76px Georgia";

    ctx.fillText(
      "Happy Diwali",
      width / 2,
      170,
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "30px Arial";

    ctx.fillText(
      "May your home glow with happiness,",
      width / 2,
      225,
    );

    ctx.fillText(
      "love and beautiful memories.",
      width / 2,
      270,
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
      const {
        member,
      } =
        readyMembers[
          index
        ]!;

      const fallback =
        getFallbackCharacter(
          member.ageGroup,
          member.genderFit,
        );

      const imageUrl =
        cutouts[
          member.id
        ] ?? fallback;

      const person =
        await loadCanvasImage(
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
        height * 0.58;

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
        "rgba(0,0,0,0.65)";

      ctx.shadowBlur = 25;

      ctx.shadowOffsetY =
        15;

      ctx.drawImage(
        person,
        x,
        y,
        drawWidth,
        drawHeight,
      );

      ctx.restore();
    }

    /*
     * BOTTOM BRAND
     */

    const bottomGradient =
      ctx.createLinearGradient(
        0,
        height - 180,
        0,
        height,
      );

    bottomGradient.addColorStop(
      0,
      "rgba(0,0,0,0)",
    );

    bottomGradient.addColorStop(
      1,
      "rgba(0,0,0,0.75)",
    );

    ctx.fillStyle =
      bottomGradient;

    ctx.fillRect(
      0,
      height - 200,
      width,
      200,
    );

    ctx.fillStyle =
      "#ffe19a";

    ctx.font =
      "700 24px Arial";

    ctx.fillText(
      "FESTIVE READY AI × YOUCAM",
      width / 2,
      height - 55,
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

  /*
   * DOWNLOAD
   */

  async function downloadCard() {
    setError(null);
    setExporting(true);

    try {
      const blob =
        await createCardBlob();

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
        "festive-ready-diwali-card.png";

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
      setExporting(false);
    }
  }

  /*
   * SHARE
   */

  async function shareCard() {
    setError(null);
    setExporting(true);

    try {
      const blob =
        await createCardBlob();

      const file =
        new File(
          [blob],
          "festive-ready-diwali-card.png",
          {
            type: "image/png",
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
            "Happy Diwali ✨",

          text:
            "Happy Diwali from our Festive Ready AI family ✨",

          files: [file],
        });

        return;
      }

      /*
       * DESKTOP:
       * Download first, then open WhatsApp.
       */

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
        "festive-ready-diwali-card.png";

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

      const message =
        encodeURIComponent(
          "Happy Diwali ✨ Our Festive Ready AI family wish!",
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
      setExporting(false);
    }
  }

  /*
   * EMPTY
   */

  if (
    readyMembers.length === 0
  ) {
    return (
      <div className="text-center">
        <Sparkles className="mx-auto size-5 text-gold" />

        <p className="mt-2 text-[9px] text-muted-foreground">
          Finalize at least one
          look first.
        </p>
      </div>
    );
  }

  /*
   * UI
   */

  return (
    <div className="flex h-full min-h-0 w-full gap-3 overflow-hidden">
      {/* CENTER CARD */}

      <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black/20 p-2">
        <div
          className="relative overflow-hidden rounded-xl border border-gold/40 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          style={{
            height:
              "min(100%, 600px)",

            maxHeight:
              "600px",

            aspectRatio:
              "9 / 16",

            backgroundImage:
              `url("${selectedBackground}")`,

            backgroundSize:
              "cover",

            backgroundPosition:
              "center",
          }}
        >
          {/* OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25" />

          {/* GREETING */}

          <div className="absolute left-[7%] right-[7%] top-[4%] z-40 text-center">
            <p className="text-[6px] tracking-[0.28em] text-[#ffe39a] uppercase drop-shadow-md">
              Festive Ready AI
            </p>

            <h2 className="mt-2 font-display text-[24px] tracking-[0.06em] text-[#ffd66b] drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
              Happy Diwali
            </h2>

            <p className="mx-auto mt-1 max-w-[270px] text-[7px] leading-relaxed text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              May your home glow
              with happiness, love
              and beautiful memories.
            </p>
          </div>

          {/* FAMILY */}

          {readyMembers.map(
            (
              {
                member,
              },
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
                  className="absolute z-30 flex h-[58%] items-end justify-center"
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
                    src={
                      image
                    }
                    alt={`${member.name} festive look`}
                    className="max-h-full max-w-full object-contain object-bottom"
                    style={{
                      filter:
                        "drop-shadow(0 14px 14px rgba(0,0,0,0.65))",
                    }}
                  />
                </div>
              );
            },
          )}

          {/* BRAND */}

          <div className="absolute bottom-2 left-0 right-0 z-50 text-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-3 py-1 backdrop-blur-sm">
              <Sparkles className="size-2.5 text-gold" />

              <span className="text-[5px] tracking-[0.13em] text-white/85">
                FESTIVE READY AI × YOUCAM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}

      <aside className="flex h-full w-[230px] shrink-0 flex-col overflow-hidden rounded-xl border border-gold/25 bg-[#190904]/90 p-3">
        {/* TITLE */}

        <div className="shrink-0">
          <p className="font-display text-[9px] tracking-[0.14em] text-gold uppercase">
            Create Your Wish
          </p>

          <p className="mt-1 text-[7px] text-muted-foreground">
            Choose your Diwali
            scene.
          </p>
        </div>

        {/* BACKGROUNDS */}

        <div className="mt-3 shrink-0">
          <p className="mb-2 text-[7px] tracking-[0.1em] text-gold/70 uppercase">
            Background
          </p>

          <div className="grid grid-cols-3 gap-1.5">
            {DIWALI_BACKGROUNDS.map(
              (background) => {
                const active =
                  selectedBackground ===
                  background.url;

                return (
                  <button
                    key={
                      background.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedBackground(
                        background.url,
                      )
                    }
                    className={`overflow-hidden rounded-md border ${
                      active
                        ? "border-gold ring-1 ring-gold/60"
                        : "border-white/10"
                    }`}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={
                          background.url
                        }
                        alt={
                          background.name
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                );
              },
            )}
          </div>

          <p className="mt-1 text-center text-[6px] text-gold/60">
            {
              DIWALI_BACKGROUNDS.find(
                (item) =>
                  item.url ===
                  selectedBackground,
              )?.name
            }
          </p>
        </div>

        {/* FAMILY CUTOUTS */}

        <div className="mt-3 shrink-0 rounded-lg border border-gold/15 bg-black/25 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[6px] tracking-[0.1em] text-gold/60 uppercase">
                Family Cutouts
              </p>

              <p className="mt-0.5 text-[8px] text-white/80">
                {preparedCount} /{" "}
                {readyMembers.length} ready
              </p>
            </div>

            {preparedCount ===
              readyMembers.length && (
              <CheckCircle2 className="size-4 text-gold" />
            )}
          </div>

          <button
            type="button"
            disabled={
              preparing
            }
            onClick={() =>
              void prepareCutouts()
            }
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2 py-2 text-[7px] text-gold"
          >
            {preparing ? (
              <>
                <Loader2 className="size-3 animate-spin" />

                {preparingName}
              </>
            ) : preparedCount ===
              readyMembers.length ? (
              "Cutouts Ready ✓"
            ) : (
              <>
                <WandSparkles className="size-3" />

                Prepare Cutouts
              </>
            )}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-2 shrink-0 rounded-md border border-red-400/20 bg-red-950/30 p-2 text-[7px] text-red-200">
            {error}
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-3 shrink-0 space-y-2 border-t border-gold/15 pt-3">
          <button
            type="button"
            disabled={
              exporting
            }
            onClick={() =>
              void downloadCard()
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold/60 bg-gold/10 px-3 py-2.5 font-display text-[8px] tracking-[0.08em] text-gold uppercase transition hover:bg-gold/20 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Download className="size-3" />
            )}

            Download Card
          </button>

          <button
            type="button"
            disabled={
              exporting
            }
            onClick={() =>
              void shareCard()
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 font-display text-[8px] tracking-[0.06em] text-[#071b0c] uppercase transition hover:brightness-110 disabled:opacity-50"
          >
            <MessageCircle className="size-3" />

            Share WhatsApp
          </button>
        </div>

        <p className="mt-2 shrink-0 text-center text-[6px] text-muted-foreground">
          Festive Ready AI × YouCam
        </p>
      </aside>
    </div>
  );
}