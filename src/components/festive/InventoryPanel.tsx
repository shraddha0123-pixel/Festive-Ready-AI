import { useState } from "react";

import {
  ExternalLink,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import {
  categories,
  items,
  type Category,
  type Item,
} from "./data";

import { useFestive } from "./FestiveContext";

/* =========================================================
   FILTER OPTIONS
   ========================================================= */

const styles = [
  "All Styles",
  "Royal Traditional",
  "Modern Festive",
  "Minimal Elegant",
  "Elegant Festive",
  "Designer",
  "Fusion",
  "Cute Traditional",
];

const colors = [
  "All Colours",
  "Gold",
  "Gold & Green",
  "Classic Gold",
  "Green",
  "Red",
  "Blue",
  "Black",
  "Yellow",
  "Pink",
  "Blush Pink",
  "Beige",
  "Pastel",
  "Bright Colours",
];

type ProductFilterMeta = {
  styles: string[];
  colors: string[];
};

const productFilterMeta: Record<
  string,
  ProductFilterMeta
> = {
  "banarasi-lehenga": {
    styles: [
      "Royal Traditional",
      "Elegant Festive",
      "Designer",
    ],
    colors: [
      "Gold",
      "Gold & Green",
      "Classic Gold",
      "Red",
    ],
  },

  "yellow-bollywood-lehenga": {
    styles: [
      "Royal Traditional",
      "Designer",
    ],
    colors: [
      "Yellow",
    ],
  },

  "blush-embroidered-lehenga": {
    styles: [
      "Royal Traditional",
      "Designer",
    ],
    colors: [
      "Blush Pink",
      "Beige",
      "Gold",
    ],
  },

  "pink-salwar-kameez": {
    styles: [
      "Elegant Festive",
      "Designer",
    ],
    colors: [
      "Pink",
    ],
  },

  "rani-pink-paithani-saree": {
    styles: [
      "Royal Traditional",
    ],
    colors: [
      "Pink",
      "Gold",
    ],
  },

  "kanjivaram-soft-silk-saree": {
    styles: [
      "Royal Traditional",
    ],
    colors: [],
  },

  "sonisha-kurta-pajama": {
    styles: [
      "Royal Traditional",
    ],
    colors: [],
  },

  "kisah-indowestern-sherwani": {
    styles: [
      "Royal Traditional",
      "Designer",
      "Fusion",
    ],
    colors: [],
  },

  "pro-ethic-indo-western": {
    styles: [
      "Modern Festive",
      "Designer",
      "Fusion",
    ],
    colors: [],
  },

  "kids-red-gold-lehenga": {
    styles: [
      "Cute Traditional",
      "Royal Traditional",
    ],
    colors: [
      "Red",
      "Gold",
      "Bright Colours",
    ],
  },

  "2": {
    styles: [
      "Royal Traditional",
      "Elegant Festive",
    ],
    colors: [
      "Gold",
      "Classic Gold",
      "Red",
    ],
  },

  "3": {
    styles: [
      "Minimal Elegant",
      "Elegant Festive",
    ],
    colors: [
      "Pastel",
      "Gold",
    ],
  },

  "4": {
    styles: [
      "Royal Traditional",
      "Elegant Festive",
    ],
    colors: [
      "Gold",
      "Classic Gold",
    ],
  },
};

/* =========================================================
   PRICE
   ========================================================= */

function getNumericPrice(
  price: string,
) {
  if (!price.includes("₹")) {
    return null;
  }

  const numeric =
    price.replace(
      /[^0-9]/g,
      "",
    );

  if (!numeric) {
    return null;
  }

  return Number(numeric);
}

/* =========================================================
   YOUCAM CACHE
   ========================================================= */

type CachedTryOnResult = {
  url: string;
  itemName: string;
  savedAt?: number;
};

const TRY_ON_CACHE_KEY =
  "festive-ready-ai-vto-cache-v2";

/*
 * We intentionally use a new cache key.
 *
 * v1 may contain old YouCam URLs from the
 * previous implementation.
 */
const OLD_TRY_ON_CACHE_KEY =
  "festive-ready-ai-vto-cache-v1";

const TRY_ON_CACHE_MAX_AGE =
  15 * 60 * 1000;

function readTryOnCache(): Record<
  string,
  CachedTryOnResult
> {
  if (
    typeof window ===
    "undefined"
  ) {
    return {};
  }

  try {
    const saved =
      window.sessionStorage.getItem(
        TRY_ON_CACHE_KEY,
      );

    if (!saved) {
      return {};
    }

    return JSON.parse(
      saved,
    ) as Record<
      string,
      CachedTryOnResult
    >;
  } catch {
    return {};
  }
}

function saveTryOnCache(
  cache: Record<
    string,
    CachedTryOnResult
  >,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      TRY_ON_CACHE_KEY,
      JSON.stringify(
        cache,
      ),
    );
  } catch (error) {
    console.error(
      "Could not save Try-On cache:",
      error,
    );
  }
}

function getCachedTryOn(
  cacheKey: string,
) {
  const cache =
    readTryOnCache();

  return (
    cache[cacheKey] ??
    null
  );
}

function saveCachedTryOn(
  cacheKey: string,
  result: CachedTryOnResult,
) {
  const cache =
    readTryOnCache();

  cache[cacheKey] =
    result;

  saveTryOnCache(
    cache,
  );
}

function removeCachedTryOn(
  cacheKey: string,
) {
  const cache =
    readTryOnCache();

  delete cache[
    cacheKey
  ];

  saveTryOnCache(
    cache,
  );
}

function clearOldCacheOnce() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      OLD_TRY_ON_CACHE_KEY,
    );
  } catch {
    // Safe to ignore.
  }
}

/* =========================================================
   IMAGE URL VALIDATION

   Important:
   YouCam may return a temporary image URL.

   Before showing a cached or freshly generated URL,
   confirm that the browser can actually render it.
   ========================================================= */

function canLoadImage(
  url: string,
  timeoutMs = 7000,
) {
  return new Promise<boolean>(
    (resolve) => {
      const image =
        new Image();

      let finished =
        false;

      const finish = (
        result: boolean,
      ) => {
        if (finished) {
          return;
        }

        finished =
          true;

        window.clearTimeout(
          timeout,
        );

        image.onload =
          null;

        image.onerror =
          null;

        resolve(
          result,
        );
      };

      const timeout =
        window.setTimeout(
          () => {
            finish(false);
          },
          timeoutMs,
        );

      image.onload =
        () => {
          finish(true);
        };

      image.onerror =
        () => {
          finish(false);
        };

      /*
       * Do NOT set crossOrigin here.
       *
       * We only need to know whether a normal <img>
       * element can display the returned URL.
       */
      image.src =
        url;
    },
  );
}

function wait(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

async function waitForGeneratedImage(
  url: string,
) {
  /*
   * Sometimes a newly generated file takes
   * a moment to become available after the
   * API task reports success.
   */

  for (
    let attempt = 0;
    attempt < 3;
    attempt += 1
  ) {
    const loadable =
      await canLoadImage(
        url,
        7000,
      );

    if (loadable) {
      return true;
    }

    if (
      attempt < 2
    ) {
      await wait(
        1200 *
          (attempt + 1),
      );
    }
  }

  return false;
}

/* =========================================================
   INVENTORY PANEL
   ========================================================= */

export function InventoryPanel() {
  /*
   * Remove old v1 cache immediately.
   *
   * Safe because the actual VTO result still comes
   * from the real YouCam server route.
   */
  clearOldCacheOnce();

  const [
    active,
    setActive,
  ] =
    useState<Category>(
      "Outfits",
    );

  const [
    tryingOnItemId,
    setTryingOnItemId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    tryOnError,
    setTryOnError,
  ] =
    useState<string | null>(
      null,
    );

  const {
    activeMember,
    selectedFestival,
    updatePreference,
    standingPhoto,
    setTryOnResult,
    equipItem,
    isItemEquipped,
  } = useFestive();

  /* =======================================================
     BUDGET
     ======================================================= */

  const currentBudget =
    active === "Outfits"
      ? activeMember
          .preference
          ?.outfitBudget
      : active ===
          "Jewellery"
        ? activeMember
            .preference
            ?.jewelleryBudget
        : active ===
            "Shoes"
          ? activeMember
              .preference
              ?.shoesBudget
          : activeMember
              .preference
              ?.accessoryBudget;

  /* =======================================================
     STYLE
     ======================================================= */

  const currentStyle =
    activeMember
      .preference
      ?.style &&
    styles.includes(
      activeMember
        .preference.style,
    )
      ? activeMember
          .preference.style
      : "All Styles";

  /* =======================================================
     COLOUR
     ======================================================= */

  const currentColor =
    activeMember
      .preference
      ?.color &&
    colors.includes(
      activeMember
        .preference.color,
    )
      ? activeMember
          .preference.color
      : "All Colours";

  /* =======================================================
     EXACT MEMBER COLLECTION CHECK
     ======================================================= */

  const hasExactMemberOutfits =
    items.some(
      (item) => {
        if (
          item.category !==
          "Outfits"
        ) {
          return false;
        }

        if (
          item.ageGroup !==
          activeMember.ageGroup
        ) {
          return false;
        }

        const memberGender =
          activeMember.genderFit;

        if (
          memberGender !==
            "female" &&
          memberGender !==
            "male"
        ) {
          return true;
        }

        return (
          !item.genderFit ||
          item.genderFit ===
            "unisex" ||
          item.genderFit ===
            memberGender
        );
      },
    );

  /* =======================================================
     FILTER PRODUCTS
     ======================================================= */

  const visible =
    items.filter(
      (item) => {
        if (
          item.category !==
          active
        ) {
          return false;
        }

        if (
          active ===
          "Outfits"
        ) {
          const memberGender =
            activeMember.genderFit;

          if (
            (
              memberGender ===
                "female" ||
              memberGender ===
                "male"
            ) &&
            item.genderFit &&
            item.genderFit !==
              "unisex" &&
            item.genderFit !==
              memberGender
          ) {
            return false;
          }

          if (
            hasExactMemberOutfits &&
            item.ageGroup &&
            item.ageGroup !==
              activeMember.ageGroup
          ) {
            return false;
          }
        }

        const itemPrice =
          getNumericPrice(
            item.price,
          );

        if (
          itemPrice !==
            null &&
          currentBudget &&
          itemPrice >
            currentBudget
        ) {
          return false;
        }

        const meta =
          productFilterMeta[
            item.id
          ];

        if (
          currentStyle !==
            "All Styles" &&
          meta &&
          meta.styles
            .length > 0 &&
          !meta.styles.includes(
            currentStyle,
          )
        ) {
          return false;
        }

        if (
          currentColor !==
            "All Colours" &&
          meta &&
          meta.colors
            .length > 0 &&
          !meta.colors.includes(
            currentColor,
          )
        ) {
          return false;
        }

        return true;
      },
    );

  /* =======================================================
     BUDGET CHANGE
     ======================================================= */

  function handleBudgetChange(
    value: number,
  ) {
    if (
      !activeMember.preference
    ) {
      return;
    }

    const nextPreference = {
      ...activeMember.preference,
    };

    if (
      active ===
      "Outfits"
    ) {
      nextPreference.outfitBudget =
        value;
    } else if (
      active ===
      "Jewellery"
    ) {
      nextPreference.jewelleryBudget =
        value;
    } else if (
      active ===
      "Shoes"
    ) {
      nextPreference.shoesBudget =
        value;
    } else {
      nextPreference.accessoryBudget =
        value;
    }

    updatePreference(
      nextPreference,
    );
  }

  /* =======================================================
     EQUIP
     ======================================================= */

  function handleEquip(
    item: Item,
  ) {
    equipItem({
      id: item.id,
      name: item.name,
      slot: item.slot,
      image: item.image,
      price: item.price,

      productUrl:
        item.productUrl ??
        "",

      category:
        item.category,
    });
  }

  /* =======================================================
     TRY ON
     ======================================================= */

  async function handleTryOn(
    item: Item,
  ) {
    setTryOnError(
      null,
    );

    if (
      item.category !==
      "Outfits"
    ) {
      setTryOnError(
        "Virtual Try-On is currently available for outfits.",
      );

      return;
    }

    if (
      !standingPhoto
    ) {
      setTryOnError(
        "Upload your standing photo in the Dressing Chamber first.",
      );

      return;
    }

    if (
      !item.tryOnImage
    ) {
      setTryOnError(
        "This product does not have a Try-On reference image yet.",
      );

      return;
    }

    /*
     * Important:
     * Clear the previous preview before starting
     * a new request.
     *
     * This prevents the tutorial from treating
     * an older preview as the new result.
     */

    setTryOnResult(
      null,
    );

    const photoFingerprint = [
      standingPhoto.name,
      standingPhoto.size,
      standingPhoto.lastModified,
      standingPhoto.type,
    ].join("-");

    const cacheKey = [
      activeMember.id,
      photoFingerprint,
      item.id,
      item.tryOnImage,
    ].join("::");

    setTryingOnItemId(
      item.id,
    );

    try {
      /* =====================================================
         CHECK CACHE
         ===================================================== */

      const cachedResult =
        getCachedTryOn(
          cacheKey,
        );

      if (
        cachedResult
      ) {
        const age =
          cachedResult.savedAt
            ? Date.now() -
              cachedResult.savedAt
            : Number.POSITIVE_INFINITY;

        const fresh =
          age <
          TRY_ON_CACHE_MAX_AGE;

        if (fresh) {
          console.log(
            "Checking saved YouCam Try-On result...",
          );

          const cachedImageWorks =
            await canLoadImage(
              cachedResult.url,
              5000,
            );

          if (
            cachedImageWorks
          ) {
            console.log(
              "Using verified saved Try-On result. No new YouCam request.",
            );

            setTryOnResult({
              url:
                cachedResult.url,

              itemName:
                cachedResult.itemName,
            });

            return;
          }
        }

        /*
         * Old, expired or broken signed URL.
         */

        console.warn(
          "Saved Try-On URL is unavailable. Removing cache and creating a fresh YouCam result.",
        );

        removeCachedTryOn(
          cacheKey,
        );
      }

      /* =====================================================
         LOAD PRODUCT REFERENCE IMAGE
         ===================================================== */

      const outfitResponse =
        await fetch(
          item.tryOnImage,
        );

      if (
        !outfitResponse.ok
      ) {
        throw new Error(
          "Could not load the outfit reference image.",
        );
      }

      const outfitBlob =
        await outfitResponse.blob();

      const extension =
        outfitBlob.type.includes(
          "png",
        )
          ? "png"
          : "jpg";

      const outfitFile =
        new File(
          [outfitBlob],
          `try-on-${item.id}.${extension}`,
          {
            type:
              outfitBlob.type ||
              "image/jpeg",
          },
        );

      const formData =
        new FormData();

      formData.append(
        "person",
        standingPhoto,
      );

      formData.append(
        "outfit",
        outfitFile,
      );

      console.log(
        "Starting fresh YouCam Clothes VTO...",
      );

      console.log(
        "Person:",
        activeMember.name,
      );

      console.log(
        "Outfit:",
        item.name,
      );

      /* =====================================================
         REAL YOUCAM SERVER ROUTE
         ===================================================== */

      const response =
        await fetch(
          "/api/youcam-tryon",
          {
            method: "POST",
            body: formData,
          },
        );

      const text =
        await response.text();

      let payload: {
        success?: boolean;
        url?: string;
        taskId?: string;
        error?: string;
      };

      try {
        payload =
          JSON.parse(
            text,
          );
      } catch {
        throw new Error(
          `YouCam server returned invalid data: ${text.slice(
            0,
            200,
          )}`,
        );
      }

      if (
        !response.ok ||
        !payload.url
      ) {
        throw new Error(
          payload.error ||
            "YouCam Virtual Try-On failed.",
        );
      }

      console.log(
        "YouCam task returned result URL. Verifying image...",
      );

      /*
       * VERY IMPORTANT:
       *
       * Do not immediately show payload.url.
       *
       * First confirm the browser can actually
       * render it. This prevents the broken-image
       * state seen in the Dressing Chamber.
       */

      const imageWorks =
        await waitForGeneratedImage(
          payload.url,
        );

      if (
        !imageWorks
      ) {
        throw new Error(
          "YouCam finished generating the outfit, but the returned image could not be loaded. Please click Try On again.",
        );
      }

      const result = {
        url:
          payload.url,

        itemName:
          item.name,
      };

      /* =====================================================
         CACHE VERIFIED RESULT
         ===================================================== */

      saveCachedTryOn(
        cacheKey,
        {
          ...result,
          savedAt:
            Date.now(),
        },
      );

      /* =====================================================
         DISPLAY VERIFIED RESULT
         ===================================================== */

      setTryOnResult(
        result,
      );

      console.log(
        "YouCam Clothes VTO successful. Verified image displayed and cached.",
      );
    } catch (error) {
      console.error(
        "YouCam Try-On error:",
        error,
      );

      /*
       * Never leave a broken URL in the chamber.
       */

      setTryOnResult(
        null,
      );

      removeCachedTryOn(
        cacheKey,
      );

      setTryOnError(
        error instanceof Error
          ? error.message
          : "YouCam Virtual Try-On failed.",
      );
    } finally {
      setTryingOnItemId(
        null,
      );
    }
  }

  /* =========================================================
     UI
     ========================================================= */

  return (
    <aside className="panel-ornate flex h-[860px] flex-col gap-3 rounded-xl p-4">

      {/* TITLE */}

      <div>
        <h2 className="font-display text-sm tracking-[0.22em] text-gold uppercase">
          {selectedFestival.name} Collection
        </h2>

        <div className="gold-rule mt-2" />
      </div>

      {/* ERROR */}

      {tryOnError && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/35 px-3 py-2 text-[10px] leading-relaxed text-red-200">
          {tryOnError}
        </div>
      )}

      {/* CATEGORIES */}

      <div className="flex shrink-0 flex-wrap gap-1.5">
        {categories.map(
          (category) => (
            <button
              key={category}
              type="button"

              onClick={() => {
                setActive(
                  category,
                );

                setTryOnError(
                  null,
                );
              }}

              className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.12em] uppercase transition-all ${
                active ===
                category
                  ? "border-gold/70 bg-secondary/70 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
              }`}
            >
              {category}
            </button>
          ),
        )}
      </div>

      {/* FILTERS */}

      <div className="flex items-center justify-between gap-2 rounded-lg border border-gold/20 bg-background/20 px-2 py-1.5">

        {/* BUDGET */}

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-gold">
            💰 ₹
            {currentBudget
              ? Math.round(
                  currentBudget /
                    1000,
                )
              : 25}
            K
          </span>

          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"

            value={
              currentBudget ??
              25000
            }

            onChange={(event) =>
              handleBudgetChange(
                Number(
                  event.target
                    .value,
                ),
              )
            }

            className="h-1 w-16 accent-yellow-500"
          />
        </div>

        {/* STYLE */}

        <select
          value={
            currentStyle
          }

          onChange={(event) => {
            if (
              !activeMember.preference
            ) {
              return;
            }

            updatePreference({
              ...activeMember.preference,

              style:
                event.target.value,
            });
          }}

          className="max-w-[108px] rounded-full border border-gold/30 bg-background px-1.5 py-0.5 text-[9px] text-gold"
        >
          {styles.map(
            (style) => (
              <option
                key={style}
                value={style}
              >
                {style}
              </option>
            ),
          )}
        </select>

        {/* COLOUR */}

        <select
          value={
            currentColor
          }

          onChange={(event) => {
            if (
              !activeMember.preference
            ) {
              return;
            }

            updatePreference({
              ...activeMember.preference,

              color:
                event.target.value,
            });
          }}

          className="max-w-[95px] rounded-full border border-gold/30 bg-background px-1.5 py-0.5 text-[9px] text-gold"
        >
          {colors.map(
            (color) => (
              <option
                key={color}
                value={color}
              >
                {color}
              </option>
            ),
          )}
        </select>
      </div>

      {/* PRODUCTS */}

      <ul
        className="
          flex flex-1 flex-col gap-3
          overflow-y-scroll pr-2

          [&::-webkit-scrollbar]:w-2

          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-[#160b06]

          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:border
          [&::-webkit-scrollbar-thumb]:border-[#c89b3c]/30
          [&::-webkit-scrollbar-thumb]:bg-[#75501c]

          hover:[&::-webkit-scrollbar-thumb]:bg-[#a87a28]
        "

        style={{
          scrollbarWidth:
            "thin",

          scrollbarColor:
            "#8b6525 #160b06",
        }}
      >
        {visible.map(
          (item) => {
            const generating =
              tryingOnItemId ===
              item.id;

            const equipped =
              isItemEquipped(
                item.id,
              );

            const canTryOn =
              item.category ===
                "Outfits" &&
              Boolean(
                item.tryOnImage,
              );

            const isRealProduct =
              Boolean(
                item.productUrl,
              );

            return (
              <li
                key={item.id}

                className={`group rounded-lg border bg-background/40 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-[var(--shadow-glow)] ${
                  isRealProduct
                    ? "border-gold/60"
                    : "border-border"
                }`}
              >

                {/* BADGE */}

                {isRealProduct && (
                  <div className="mb-2 inline-flex rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[8px] tracking-[0.13em] text-gold uppercase">
                    Real Product
                  </div>
                )}

                {/* PRODUCT */}

                <div className="flex gap-3">
                  <img
                    src={
                      item.image
                    }

                    alt={
                      item.name
                    }

                    loading="lazy"
                    width={512}
                    height={512}

                    className="size-16 shrink-0 rounded-md border border-gold/40 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {item.name}
                    </p>

                    <p className="text-[10px] tracking-[0.18em] text-accent-foreground/70 uppercase">
                      {item.rarity}
                    </p>

                    <p className="mt-1 font-display text-sm text-gold">
                      {item.price}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="mt-3 flex gap-2">

                  {/* TRY ON */}

                  <button
                    type="button"

                    onClick={() =>
                      void handleTryOn(
                        item,
                      )
                    }

                    disabled={
                      tryingOnItemId !==
                        null ||
                      !canTryOn
                    }

                    title={
                      canTryOn
                        ? "Try this outfit on your uploaded photo"
                        : "Try-On reference image not added yet"
                    }

                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gold/40 px-2 py-1.5 text-[11px] tracking-[0.12em] uppercase transition-all hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {generating ? (
                      <>
                        <LoaderCircle className="size-3.5 animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        Try On
                      </>
                    )}
                  </button>

                  {/* EQUIP */}

                  <button
                    type="button"

                    disabled={
                      equipped
                    }

                    onClick={() =>
                      handleEquip(
                        item,
                      )
                    }

                    className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] tracking-[0.12em] uppercase transition-all ${
                      equipped
                        ? "cursor-default border-gold/50 bg-gold/10 text-gold"
                        : "border-transparent text-primary-foreground hover:brightness-110"
                    }`}

                    style={
                      equipped
                        ? undefined
                        : {
                            background:
                              "var(--gradient-gold)",
                          }
                    }
                  >
                    {equipped
                      ? "Equipped"
                      : "Equip"}
                  </button>

                </div>

                {/* PRODUCT LINK */}

                {item.productUrl && (
                  <a
                    href={
                      item.productUrl
                    }

                    target="_blank"

                    rel="noopener noreferrer sponsored"

                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-gold/30 bg-background/30 px-3 py-2 text-[10px] tracking-[0.12em] text-gold uppercase transition-all hover:border-gold hover:bg-secondary/40"
                  >
                    View Product
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </li>
            );
          },
        )}

        {/* EMPTY */}

        {visible.length ===
          0 && (
          <li className="rounded-lg border border-dashed border-gold/25 px-3 py-8 text-center">

            <p className="text-xs text-gold">
              No matching items
            </p>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Increase your budget or try another style / colour.
            </p>

          </li>
        )}
      </ul>

    </aside>
  );
}