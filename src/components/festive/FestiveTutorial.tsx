import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  WandSparkles,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

/*
 * ============================================================
 * STORAGE
 * ============================================================
 */

const TUTORIAL_COMPLETE_KEY =
  "festive-ready-ai-tutorial-complete-v5";

const TUTORIAL_NAME_KEY =
  "festive-ready-ai-tutorial-name-v1";

/*
 * ============================================================
 * PROJECT INTRO
 *
 * Short on purpose.
 * Goal: total final recording stays under 2:30.
 * ============================================================
 */

const INTRO_SCRIPT =
  "Festive shopping gets fragmented across family members, styles and budgets. " +
  "Festive Ready AI turns that journey into an RPG-inspired family dressing room, using YouCam Virtual Try-On for outfit previews and YouCam background removal for personalized festive greeting cards. " +
  "Here is how it works.";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type StepId =
  | "welcome"
  | "festival"
  | "family"
  | "photo"
  | "products"
  | "try-on"
  | "equip"
  | "finalize"
  | "final-look"
  | "squad"
  | "wish-studio"
  | "share";

type FamilyStage =
  | "overview"
  | "add"
  | "switch";

type ProductsPhase =
  | "collection"
  | "filters";

type EquipPhase =
  | "button"
  | "panel";

type TourStep = {
  id: StepId;
  title: string;
  description: string;
  narration: string;
  tips: string[];
};

type TargetRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

/*
 * ============================================================
 * JUDGE-FOCUSED TOUR SCRIPT
 * ============================================================
 */

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Festive Ready AI",
    description:
      "A guided walkthrough of the complete festive styling experience.",
    narration: "",
    tips: [],
  },

  {
    id: "festival",
    title: "Plan Around the Festival",
    description:
      "Choose the celebration and start festive planning before the last-minute rush.",
    narration:
      "Start with the festival planner. It keeps upcoming celebrations visible, lets you choose the occasion, and supports optional reminders so festive planning can begin early.",
    tips: [
      "Choose the festival you are styling for.",
      "Upcoming festivals and optional reminders help users plan ahead.",
    ],
  },

  {
    id: "family",
    title: "Build Your Festive Party",
    description:
      "Create independent festive profiles for yourself and your family.",
    narration:
      "This is your Festive Party. My Look represents you. Add family members with their name, age group and preferred fit, then switch between profiles anytime.",
    tips: [
      "Style up to four family members.",
      "Each profile keeps its own festive styling state.",
    ],
  },

  {
    id: "photo",
    title: "Upload a Standing Photo",
    description:
      "The selected member's photo becomes the input for virtual try-on.",
    narration:
      "Upload a clear, front-facing, standing photo for the selected family member. This gives the virtual try-on its best input.",
    tips: [
      "Use a clear JPG or PNG.",
      "Each member can use their own photo.",
    ],
  },

  {
    id: "products",
    title: "Explore Real Festive Products",
    description:
      "Browse the collection across outfits, jewellery, shoes and accessories.",
    narration:
      "Explore real festive products across Outfits, Jewellery, Shoes and Accessories. Product prices and shopping links stay connected to the styling experience.",
    tips: [
      "Browse different festive product categories.",
      "View Product connects users to the retailer.",
    ],
  },

  {
    id: "try-on",
    title: "Try It On With YouCam",
    description:
      "Preview an outfit on the member's real uploaded photo.",
    narration:
      "Now use YouCam Apparel Virtual Try-On to preview the selected outfit directly on the user's uploaded photo before making a decision.",
    tips: [
      "Try On creates the AI outfit preview.",
      "The real user photo remains the basis of the experience.",
    ],
  },

  {
    id: "equip",
    title: "Equip Your Choice",
    description:
      "Turn selected products into an RPG-style festive loadout.",
    narration:
      "Try On previews the outfit. Equip decides. Equipping a product saves it into the active member's RPG-style festive loadout.",
    tips: [
      "Try On = preview.",
      "Equip = choose it for the final look.",
    ],
  },

  {
    id: "finalize",
    title: "Finalize This Look",
    description:
      "Save the completed styling for the active family member.",
    narration:
      "Once the photo and equipped outfit are ready, Finalize My Look saves this member's completed festive styling.",
    tips: [
      "Equip an outfit before finalizing.",
      "Repeat the flow for additional family members.",
    ],
  },

  {
    id: "final-look",
    title: "Review the Final Look",
    description:
      "Check the completed member before moving into the family experience.",
    narration:
      "The Final Look screen brings together the final image, festival, equipped products and budget summary in one review.",
    tips: [
      "Review the final image.",
      "Check equipped products and budget before continuing.",
    ],
  },

  {
    id: "squad",
    title: "Reveal the Festive Squad",
    description:
      "Bring finalized family members together.",
    narration:
      "Finalize family looks, then reveal the Festive Squad. The ready counter shows how many members are complete.",
    tips: [
      "Ready members appear together.",
      "Unfinished members can still be styled later.",
    ],
  },

  {
    id: "wish-studio",
    title: "Create the Family Wish",
    description:
      "Transform completed family looks into a personalized festive greeting.",
    narration:
      "In the Wish Studio, YouCam background removal creates clean family cutouts. Choose a festive scene and bring the finalized looks together in one greeting.",
    tips: [
      "Prepare Cutouts uses YouCam background removal.",
      "Choose a festive scene for the family card.",
    ],
  },

  {
    id: "share",
    title: "Download & Celebrate",
    description:
      "Export the personalized greeting and share the celebration.",
    narration:
      "Finally, download the greeting card or share it through WhatsApp. Festive Ready AI turns festive shopping into a journey: plan, try, equip and celebrate.",
    tips: [
      "Download the finished card.",
      "Share the festive wish with friends and family.",
    ],
  },
];

/*
 * ============================================================
 * VOICE
 * ============================================================
 */

const femaleVoiceHints = [
  "zira",
  "samantha",
  "victoria",
  "aria",
  "jenny",
  "sonia",
  "libby",
  "natasha",
  "ava",
  "emma",
  "olivia",
  "aditi",
  "heera",
  "priya",
  "neerja",
  "raveena",
  "swara",
  "kavya",
  "veena",
  "female",
  "woman",
];

function chooseNarratorVoice(
  voices: SpeechSynthesisVoice[],
) {
  if (voices.length === 0) {
    return null;
  }

  /*
   * 1. Microsoft Zira.
   */
  const zira =
    voices.find((voice) =>
      voice.name
        .toLowerCase()
        .includes("zira"),
    );

  if (zira) {
    return zira;
  }

  /*
   * 2. Another English female-style voice.
   */
  const femaleEnglish =
    voices.find((voice) => {
      const name =
        voice.name.toLowerCase();

      const language =
        voice.lang.toLowerCase();

      return (
        language.startsWith("en") &&
        femaleVoiceHints.some(
          (hint) =>
            name.includes(hint),
        )
      );
    });

  if (femaleEnglish) {
    return femaleEnglish;
  }

  /*
   * 3. Indian English.
   */
  const indianEnglish =
    voices.find((voice) =>
      voice.lang
        .toLowerCase()
        .startsWith("en-in"),
    );

  if (indianEnglish) {
    return indianEnglish;
  }

  /*
   * 4. Any English voice.
   */
  const english =
    voices.find((voice) =>
      voice.lang
        .toLowerCase()
        .startsWith("en"),
    );

  return (
    english ??
    voices[0] ??
    null
  );
}

/*
 * ============================================================
 * GENERIC DOM HELPERS
 * ============================================================
 */

function normalizeText(
  element: Element | null,
) {
  return (
    element?.textContent ?? ""
  )
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findButton(
  text: string,
  root: ParentNode = document,
  exact = false,
) {
  const expected =
    text.toLowerCase();

  return (
    Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "button",
      ),
    ).find((button) => {
      const value =
        normalizeText(button);

      return exact
        ? value === expected
        : value.includes(expected);
    }) ?? null
  );
}

function findTextElement(
  text: string,
  exact = false,
) {
  const expected =
    text.toLowerCase();

  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "h1,h2,h3,h4,p,span,label",
      ),
    ).find((element) => {
      const value =
        normalizeText(element);

      return exact
        ? value === expected
        : value.includes(expected);
    }) ?? null
  );
}

function findAncestor(
  start: HTMLElement | null,
  predicate: (
    element: HTMLElement,
  ) => boolean,
  maxDepth = 8,
) {
  let current =
    start;

  for (
    let depth = 0;
    current && depth < maxDepth;
    depth += 1
  ) {
    if (
      predicate(current)
    ) {
      return current;
    }

    current =
      current.parentElement;
  }

  return null;
}

function findEmptyIconButton(
  root: ParentNode,
) {
  return (
    Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        "button",
      ),
    ).find(
      (button) =>
        normalizeText(
          button,
        ) === "",
    ) ?? null
  );
}

/*
 * ============================================================
 * FESTIVAL
 * ============================================================
 */

function getFestivalButton() {
  return (
    document.querySelector<HTMLButtonElement>(
      '[data-tour="festival"]',
    ) ??
    null
  );
}

function getFestivalDrawer() {
  const heading =
    findTextElement(
      "Choose Your Festival",
      true,
    );

  if (!heading) {
    return null;
  }

  /*
   * Find the smallest container that
   * contains the actual festival cards.
   */
  return findAncestor(
    heading.parentElement,
    (element) => {
      const text =
        normalizeText(
          element,
        );

      const buttons =
        element.querySelectorAll(
          "button",
        ).length;

      return (
        text.includes(
          "choose your festival",
        ) &&
        text.includes(
          "pick the celebration",
        ) &&
        buttons >= 4
      );
    },
    8,
  );
}

function closeFestivalDrawer() {
  const drawer =
    getFestivalDrawer();

  if (!drawer) {
    return;
  }

  /*
   * Close X is the icon-only button.
   * Festival card buttons contain text,
   * so this avoids clicking a festival.
   */
  const closeButton =
    findEmptyIconButton(
      drawer,
    );

  closeButton?.click();
}

/*
 * ============================================================
 * FAMILY
 * ============================================================
 */

function getFamilyStrip() {
  const heading =
    findTextElement(
      "My Festive Party",
      true,
    );

  if (!heading) {
    return (
      document.querySelector<HTMLElement>(
        '[data-tour="family"]',
      ) ?? null
    );
  }

  /*
   * Whole family strip, not just My Look.
   * This fixes the previous spotlight issue.
   */
  return (
    findAncestor(
      heading.parentElement,
      (element) => {
        const text =
          normalizeText(
            element,
          );

        return (
          text.includes(
            "my festive party",
          ) &&
          text.includes(
            "style up to 4 family members",
          ) &&
          text.includes(
            "add member",
          )
        );
      },
      7,
    ) ??
    heading.parentElement
  );
}

function getAddMemberButton() {
  const strip =
    getFamilyStrip();

  if (!strip) {
    return null;
  }

  return (
    Array.from(
      strip.querySelectorAll<HTMLButtonElement>(
        "button",
      ),
    ).find((button) =>
      normalizeText(
        button,
      ).includes(
        "add member",
      ),
    ) ?? null
  );
}

function getFamilyDrawer() {
  const heading =
    findTextElement(
      "Add Family Member",
      true,
    );

  if (!heading) {
    return null;
  }

  return findAncestor(
    heading.parentElement,
    (element) => {
      const text =
        normalizeText(
          element,
        );

      return (
        text.includes(
          "add family member",
        ) &&
        text.includes(
          "member name",
        ) &&
        text.includes(
          "age group",
        ) &&
        text.includes(
          "gender / fit",
        ) &&
        text.includes(
          "add to party",
        )
      );
    },
    8,
  );
}

function closeFamilyDrawer() {
  const drawer =
    getFamilyDrawer();

  if (!drawer) {
    return;
  }

  const cancel =
    findButton(
      "Cancel",
      drawer,
      true,
    );

  if (cancel) {
    cancel.click();
    return;
  }

  findEmptyIconButton(
    drawer,
  )?.click();
}

function getFamilyMemberButtons() {
  const strip =
    getFamilyStrip();

  if (!strip) {
    return [];
  }

  return Array.from(
    strip.querySelectorAll<HTMLButtonElement>(
      "button",
    ),
  ).filter((button) => {
    const text =
      normalizeText(
        button,
      );

    if (
      text.includes(
        "add member",
      )
    ) {
      return false;
    }

    if (
      text.includes(
        "main profile",
      )
    ) {
      return true;
    }

    const age =
      text.includes("adult") ||
      text.includes("teen") ||
      text.includes("kid");

    const fit =
      text.includes("female") ||
      text.includes("male") ||
      text.includes("unisex");

    return (
      age &&
      fit
    );
  });
}

/*
 * ============================================================
 * PHOTO / DRESSING CHAMBER
 * ============================================================
 */

function getDressingChamber() {
  const heading =
    findTextElement(
      "Dressing Chamber",
    );

  if (!heading) {
    return null;
  }

  return (
    heading.closest(
      ".panel-ornate",
    ) as HTMLElement | null
  );
}

function getPhotoTarget() {
  const labels =
    Array.from(
      document.querySelectorAll<HTMLLabelElement>(
        "label",
      ),
    );

  const upload =
    labels.find((label) =>
      normalizeText(
        label,
      ).includes(
        "upload standing photo",
      ),
    );

  if (upload) {
    return upload;
  }

  const change =
    labels.find((label) =>
      normalizeText(
        label,
      ).includes(
        "change photo",
      ),
    );

  return (
    change ??
    getDressingChamber()
  );
}

/*
 * ============================================================
 * PRODUCTS
 * ============================================================
 */

function getCollectionPanel() {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "aside",
      ),
    ).find((aside) => {
      const heading =
        aside.querySelector(
          "h2",
        );

      return normalizeText(
        heading,
      ).includes(
        "collection",
      );
    }) ?? null
  );
}

function ensureOutfitsSelected() {
  const panel =
    getCollectionPanel();

  if (!panel) {
    return;
  }

  const outfits =
    findButton(
      "Outfits",
      panel,
      true,
    );

  outfits?.click();

  const list =
    panel.querySelector<HTMLElement>(
      "ul",
    );

  if (list) {
    list.scrollTop = 0;
  }
}

function getFiltersTarget() {
  const panel =
    getCollectionPanel();

  if (!panel) {
    return null;
  }

  const budget =
    Array.from(
      panel.querySelectorAll<HTMLElement>(
        "p,span,label",
      ),
    ).find((element) =>
      normalizeText(
        element,
      ).includes(
        "budget",
      ),
    );

  if (!budget) {
    return panel;
  }

  /*
   * Find smallest filter block containing
   * Budget + Style + Colour/Color.
   */
  return (
    findAncestor(
      budget.parentElement,
      (element) => {
        const text =
          normalizeText(
            element,
          );

        return (
          text.includes(
            "budget",
          ) &&
          text.includes(
            "style",
          ) &&
          (
            text.includes(
              "colour",
            ) ||
            text.includes(
              "color",
            )
          )
        );
      },
      6,
    ) ??
    budget.parentElement
  );
}

function getTryOnButton() {
  const panel =
    getCollectionPanel();

  if (!panel) {
    return null;
  }

  return (
    findButton(
      "Try On",
      panel,
      true,
    ) ??
    findButton(
      "Generating",
      panel,
    )
  );
}

function getEquipButton() {
  const panel =
    getCollectionPanel();

  if (!panel) {
    return null;
  }

  return (
    Array.from(
      panel.querySelectorAll<HTMLButtonElement>(
        "button",
      ),
    ).find((button) => {
      const text =
        normalizeText(
          button,
        );

      return (
        text === "equip" ||
        text === "equipped"
      );
    }) ?? null
  );
}

function getCurrentProductImage() {
  const action =
    getTryOnButton() ??
    getEquipButton();

  const card =
    action?.closest(
      "li",
    );

  return (
    card?.querySelector<HTMLImageElement>(
      "img",
    )?.src ??
    null
  );
}

/*
 * ============================================================
 * EQUIPMENT
 * ============================================================
 */

function getEquipmentPanel() {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "aside",
      ),
    ).find((aside) => {
      const heading =
        aside.querySelector(
          "h2",
        );

      return (
        normalizeText(
          heading,
        ) ===
        "equipment"
      );
    }) ?? null
  );
}

/*
 * ============================================================
 * FINALIZE / FINAL LOOK
 * ============================================================
 */

function getFinalizeButton() {
  return findButton(
    "Finalize My Look",
  );
}

function getFinalLookModal() {
  const heading =
    findTextElement(
      "Final Look Ready",
      true,
    );

  if (!heading) {
    return null;
  }

  return (
    heading.closest(
      ".fixed",
    ) as HTMLElement | null
  );
}

function closeFinalLookModal() {
  const modal =
    getFinalLookModal();

  if (!modal) {
    return;
  }

  const labelledClose =
    modal.querySelector<HTMLButtonElement>(
      'button[aria-label*="Close"]',
    );

  if (labelledClose) {
    labelledClose.click();
    return;
  }

  const returnButton =
    findButton(
      "Return To Dressing Chamber",
      modal,
    );

  if (returnButton) {
    returnButton.click();
    return;
  }

  findEmptyIconButton(
    modal,
  )?.click();
}

/*
 * ============================================================
 * SQUAD
 * ============================================================
 */

function getRevealSquadButton() {
  return (
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "button",
      ),
    ).find((button) => {
      const text =
        normalizeText(
          button,
        );

      return (
        text.includes(
          "reveal festive squad",
        ) ||
        text.includes(
          "reveal complete squad",
        )
      );
    }) ?? null
  );
}

function getSquadOverlay() {
  const heading =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "h2",
      ),
    ).find((element) =>
      normalizeText(
        element,
      ).includes(
        "family wish",
      ),
    );

  if (!heading) {
    return null;
  }

  return (
    heading.closest(
      ".fixed",
    ) as HTMLElement | null
  );
}

function getSquadHeader() {
  return (
    getSquadOverlay()
      ?.querySelector<HTMLElement>(
        "header",
      ) ??
    null
  );
}

function closeSquadOverlay() {
  const overlay =
    getSquadOverlay();

  if (!overlay) {
    return;
  }

  const closeButton =
    overlay.querySelector<HTMLButtonElement>(
      "header button",
    );

  closeButton?.click();
}

/*
 * ============================================================
 * WISH STUDIO
 * ============================================================
 */

function getWishStudioTarget() {
  const overlay =
    getSquadOverlay();

  if (!overlay) {
    return null;
  }

  const title =
    Array.from(
      overlay.querySelectorAll<HTMLElement>(
        "p,h2,h3",
      ),
    ).find((element) =>
      normalizeText(
        element,
      ).includes(
        "create your wish",
      ),
    );

  if (!title) {
    return null;
  }

  return (
    title.closest(
      "aside",
    ) as HTMLElement | null
  );
}

function getShareTarget() {
  const overlay =
    getSquadOverlay();

  if (!overlay) {
    return null;
  }

  const download =
    findButton(
      "Download Card",
      overlay,
      true,
    );

  if (!download) {
    return null;
  }

  return (
    download.parentElement as HTMLElement | null
  );
}

/*
 * ============================================================
 * SCROLL ANIMATION
 * ============================================================
 */

function animateWindowScroll(
  destination: number,
  duration: number,
) {
  const start =
    window.scrollY;

  const distance =
    destination - start;

  const startTime =
    performance.now();

  let animationFrame = 0;

  function tick(
    now: number,
  ) {
    const progress =
      Math.min(
        1,
        (now - startTime) /
          duration,
      );

    const eased =
      progress < 0.5
        ? 2 *
          progress *
          progress
        : 1 -
          Math.pow(
            -2 * progress +
              2,
            2,
          ) /
            2;

    window.scrollTo(
      0,
      start +
        distance *
          eased,
    );

    if (
      progress < 1
    ) {
      animationFrame =
        window.requestAnimationFrame(
          tick,
        );
    }
  }

  animationFrame =
    window.requestAnimationFrame(
      tick,
    );

  return () => {
    window.cancelAnimationFrame(
      animationFrame,
    );
  };
}

/*
 * ============================================================
 * ICON
 * ============================================================
 */

function StepIcon({
  id,
}: {
  id: StepId;
}) {
  const iconClass =
    "size-5 text-gold";

  switch (id) {
    case "festival":
      return (
        <CalendarDays
          className={iconClass}
        />
      );

    case "family":
      return (
        <Users
          className={iconClass}
        />
      );

    case "photo":
      return (
        <Camera
          className={iconClass}
        />
      );

    case "products":
      return (
        <ShoppingBag
          className={iconClass}
        />
      );

    case "try-on":
      return (
        <Sparkles
          className={iconClass}
        />
      );

    case "equip":
      return (
        <ShieldCheck
          className={iconClass}
        />
      );

    case "finalize":
    case "final-look":
      return (
        <CheckCircle2
          className={iconClass}
        />
      );

    case "squad":
      return (
        <Crown
          className={iconClass}
        />
      );

    case "wish-studio":
      return (
        <WandSparkles
          className={iconClass}
        />
      );

    case "share":
      return (
        <Download
          className={iconClass}
        />
      );

    default:
      return (
        <Sparkles
          className={iconClass}
        />
      );
  }
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export function FestiveTutorial() {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    introRunning,
    setIntroRunning,
  ] = useState(false);

  const [
    tourStarted,
    setTourStarted,
  ] = useState(false);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const [
    targetRect,
    setTargetRect,
  ] = useState<TargetRect | null>(
    null,
  );

  const [
    voiceEnabled,
    setVoiceEnabled,
  ] = useState(true);

  const [
    userName,
    setUserName,
  ] = useState("");

  const [
    availableVoices,
    setAvailableVoices,
  ] = useState<
    SpeechSynthesisVoice[]
  >([]);

  const [
    familyStage,
    setFamilyStage,
  ] = useState<FamilyStage>(
    "overview",
  );

  const [
    productsPhase,
    setProductsPhase,
  ] = useState<ProductsPhase>(
    "collection",
  );

  const [
    equipPhase,
    setEquipPhase,
  ] = useState<EquipPhase>(
    "button",
  );

  const [
    productPreview,
    setProductPreview,
  ] = useState<string | null>(
    null,
  );

  const familyInitialCountRef =
    useRef(0);

  const step =
    tourSteps[currentStep] ??
    tourSteps[0]!;

  const narratorVoice =
    useMemo(
      () =>
        chooseNarratorVoice(
          availableVoices,
        ),
      [availableVoices],
    );

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    setMounted(true);

    const savedName =
      window.localStorage.getItem(
        TUTORIAL_NAME_KEY,
      );

    if (savedName) {
      setUserName(
        savedName,
      );
    }

    const complete =
      window.localStorage.getItem(
        TUTORIAL_COMPLETE_KEY,
      );

    if (!complete) {
      setIsOpen(true);
      setCurrentStep(0);
      setTourStarted(false);
      setIntroRunning(false);
    }
  }, []);

  /*
   * ============================================================
   * LOAD SYSTEM VOICES
   * ============================================================
   */

  useEffect(() => {
    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    function loadVoices() {
      const voices =
        window.speechSynthesis.getVoices();

      if (
        voices.length > 0
      ) {
        setAvailableVoices(
          voices,
        );
      }
    }

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    const retryOne =
      window.setTimeout(
        loadVoices,
        250,
      );

    const retryTwo =
      window.setTimeout(
        loadVoices,
        800,
      );

    const retryThree =
      window.setTimeout(
        loadVoices,
        1500,
      );

    return () => {
      window.clearTimeout(
        retryOne,
      );

      window.clearTimeout(
        retryTwo,
      );

      window.clearTimeout(
        retryThree,
      );

      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, []);

  /*
   * ============================================================
   * SPEECH
   * ============================================================
   */

  const speakText =
    useCallback(
      (text: string) => {
        if (
          !voiceEnabled ||
          !(
            "speechSynthesis" in
            window
          )
        ) {
          return;
        }

        window.speechSynthesis.cancel();

        const utterance =
          new SpeechSynthesisUtterance(
            text,
          );

        if (
          narratorVoice
        ) {
          utterance.voice =
            narratorVoice;

          utterance.lang =
            narratorVoice.lang;
        } else {
          utterance.lang =
            "en-US";
        }

        /*
         * Faster than previous 0.9.
         * Still natural enough for judges.
         */
        utterance.rate = 1.07;
        utterance.pitch = 1.02;
        utterance.volume = 1;

        window.speechSynthesis.speak(
          utterance,
        );
      },
      [
        narratorVoice,
        voiceEnabled,
      ],
    );

  const speakStep =
    useCallback(
      (stepIndex: number) => {
        const selected =
          tourSteps[
            stepIndex
          ];

        if (
          !selected ||
          !selected.narration
        ) {
          return;
        }

        speakText(
          selected.narration,
        );
      },
      [speakText],
    );

  /*
   * ============================================================
   * BEGIN DETAILED TOUR
   * ============================================================
   */

  const beginDetailedTour =
    useCallback(() => {
      if (
        "speechSynthesis" in
        window
      ) {
        window.speechSynthesis.cancel();
      }

      setIntroRunning(false);

      animateWindowScroll(
        0,
        450,
      );

      window.setTimeout(
        () => {
          setTourStarted(true);
          setCurrentStep(1);
        },
        400,
      );
    }, []);

  /*
   * ============================================================
   * START TOUR
   * ============================================================
   */

  function startTour() {
    const cleanName =
      userName.trim();

    if (cleanName) {
      window.localStorage.setItem(
        TUTORIAL_NAME_KEY,
        cleanName,
      );
    }

    closeFestivalDrawer();
    closeFamilyDrawer();
    closeFinalLookModal();
    closeSquadOverlay();

    setCurrentStep(0);
    setTourStarted(false);
    setTargetRect(null);

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    setIntroRunning(true);
  }

  /*
   * ============================================================
   * FAST PROJECT OVERVIEW
   *
   * ~17 seconds total.
   * ============================================================
   */

  useEffect(() => {
    if (
      !introRunning
    ) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    const intro =
      userName.trim()
        ? `Welcome, ${userName.trim()}. ${INTRO_SCRIPT}`
        : INTRO_SCRIPT;

    const speechTimer =
      window.setTimeout(
        () => {
          speakText(
            intro,
          );
        },
        250,
      );

    let cancelScroll =
      () => {};

    /*
     * Scroll down.
     */
    const downTimer =
      window.setTimeout(
        () => {
          const bottom =
            Math.max(
              0,
              document.documentElement
                .scrollHeight -
                window.innerHeight,
            );

          cancelScroll();

          cancelScroll =
            animateWindowScroll(
              bottom,
              5200,
            );
        },
        2200,
      );

    /*
     * Scroll back to top.
     */
    const upTimer =
      window.setTimeout(
        () => {
          cancelScroll();

          cancelScroll =
            animateWindowScroll(
              0,
              5200,
            );
        },
        7900,
      );

    /*
     * Start detailed tutorial.
     */
    const finishTimer =
      window.setTimeout(
        () => {
          beginDetailedTour();
        },
        16500,
      );

    return () => {
      window.clearTimeout(
        speechTimer,
      );

      window.clearTimeout(
        downTimer,
      );

      window.clearTimeout(
        upTimer,
      );

      window.clearTimeout(
        finishTimer,
      );

      cancelScroll();
    };
  }, [
    beginDetailedTour,
    introRunning,
    speakText,
    userName,
  ]);

  /*
   * ============================================================
   * NORMAL STEP NARRATION
   * ============================================================
   */

  useEffect(() => {
    if (
      !isOpen ||
      !tourStarted ||
      introRunning ||
      currentStep === 0
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          speakStep(
            currentStep,
          );
        },
        250,
      );

    return () => {
      window.clearTimeout(
        timer,
      );

      if (
        "speechSynthesis" in
        window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    currentStep,
    introRunning,
    isOpen,
    speakStep,
    tourStarted,
  ]);

  /*
   * ============================================================
   * FESTIVAL
   *
   * Button first -> actual picker.
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "festival"
    ) {
      return;
    }

    if (
      getFestivalDrawer()
    ) {
      return;
    }

    const button =
      getFestivalButton();

    if (!button) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          button.click();
        },
        1700,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    currentStep,
    step.id,
    tourStarted,
  ]);

  /*
   * ============================================================
   * FAMILY FLOW
   *
   * Overview -> Add Member -> Whole family strip.
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "family"
    ) {
      return;
    }

    familyInitialCountRef.current =
      getFamilyMemberButtons().length;

    setFamilyStage(
      "overview",
    );

    const timer =
      window.setTimeout(
        () => {
          const addButton =
            getAddMemberButton();

          if (!addButton) {
            setFamilyStage(
              "switch",
            );

            return;
          }

          setFamilyStage(
            "add",
          );

          addButton.click();
        },
        3200,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    currentStep,
    step.id,
    tourStarted,
  ]);

  /*
   * Detect actual family-member creation.
   */
  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "family" ||
      familyStage !== "add"
    ) {
      return;
    }

    function checkMembers() {
      const count =
        getFamilyMemberButtons().length;

      if (
        count >
        familyInitialCountRef.current
      ) {
        setFamilyStage(
          "switch",
        );
      }
    }

    checkMembers();

    const observer =
      new MutationObserver(
        checkMembers,
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    return () => {
      observer.disconnect();
    };
  }, [
    familyStage,
    step.id,
    tourStarted,
  ]);

  /*
   * Explain switching only after
   * member has been added.
   */
  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "family" ||
      familyStage !== "switch"
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          speakText(
            "You can now switch between My Look and any family member. Each profile keeps its own photo, products and festive look.",
          );
        },
        300,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    familyStage,
    speakText,
    step.id,
    tourStarted,
  ]);

  /*
   * ============================================================
   * PRODUCTS -> FILTERS
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "products"
    ) {
      return;
    }

    ensureOutfitsSelected();

    setProductsPhase(
      "collection",
    );

    /*
     * Let the main product narration finish,
     * then move spotlight to filters.
     */
    const timer =
      window.setTimeout(
        () => {
          setProductsPhase(
            "filters",
          );

          speakText(
            "Users can narrow the collection using budget, style and colour preferences for the active family member.",
          );
        },
        7500,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    currentStep,
    speakText,
    step.id,
    tourStarted,
  ]);

  /*
   * ============================================================
   * EQUIP BUTTON -> EQUIPMENT PANEL
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "equip"
    ) {
      return;
    }

    ensureOutfitsSelected();

    setEquipPhase(
      "button",
    );

    const timer =
      window.setTimeout(
        () => {
          setEquipPhase(
            "panel",
          );

          speakText(
            "Equipped outfits, jewellery, shoes and accessories appear here as the active member's RPG equipment.",
          );
        },
        7200,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    currentStep,
    speakText,
    step.id,
    tourStarted,
  ]);

  /*
   * ============================================================
   * FINALIZE -> FINAL LOOK DETECTION
   *
   * IMPORTANT:
   * We do NOT auto-click Finalize.
   * This avoids the previous error when
   * no outfit was equipped.
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "finalize"
    ) {
      return;
    }

    function detectFinalLook() {
      if (
        !getFinalLookModal()
      ) {
        return;
      }

      const index =
        tourSteps.findIndex(
          (item) =>
            item.id ===
            "final-look",
        );

      if (
        index >= 0
      ) {
        setCurrentStep(
          index,
        );
      }
    }

    detectFinalLook();

    const observer =
      new MutationObserver(
        detectFinalLook,
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    return () => {
      observer.disconnect();
    };
  }, [
    step.id,
    tourStarted,
  ]);

  /*
   * ============================================================
   * SQUAD AUTO OPEN
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      step.id !== "squad"
    ) {
      return;
    }

    closeFinalLookModal();

    if (
      getSquadOverlay()
    ) {
      return;
    }

    const reveal =
      getRevealSquadButton();

    if (
      !reveal ||
      reveal.disabled
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          reveal.click();
        },
        1500,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    step.id,
    tourStarted,
  ]);

  /*
   * Keep Squad open for Wish + Share.
   */
  useEffect(() => {
    if (
      !tourStarted ||
      (
        step.id !==
          "wish-studio" &&
        step.id !== "share"
      )
    ) {
      return;
    }

    if (
      getSquadOverlay()
    ) {
      return;
    }

    const reveal =
      getRevealSquadButton();

    if (
      reveal &&
      !reveal.disabled
    ) {
      reveal.click();
    }
  }, [
    step.id,
    tourStarted,
  ]);

  /*
   * ============================================================
   * CURRENT TARGET
   * ============================================================
   */

  const getCurrentTarget =
    useCallback(() => {
      switch (
        step.id
      ) {
        case "festival":
          return (
            getFestivalDrawer() ??
            getFestivalButton()
          );

        case "family":
          if (
            familyStage ===
            "add"
          ) {
            return (
              getFamilyDrawer() ??
              getAddMemberButton() ??
              getFamilyStrip()
            );
          }

          /*
           * Whole strip for switching.
           * Do not spotlight only My Look.
           */
          return getFamilyStrip();

        case "photo":
          return getPhotoTarget();

        case "products":
          return productsPhase ===
            "filters"
            ? getFiltersTarget()
            : getCollectionPanel();

        case "try-on":
          return getTryOnButton();

        case "equip":
          return equipPhase ===
            "panel"
            ? getEquipmentPanel()
            : getEquipButton();

        case "finalize":
          return getFinalizeButton();

        case "final-look":
          return (
            getFinalLookModal() ??
            getFinalizeButton()
          );

        case "squad":
          return (
            getSquadHeader() ??
            getRevealSquadButton()
          );

        case "wish-studio":
          return getWishStudioTarget();

        case "share":
          return getShareTarget();

        default:
          return null;
      }
    }, [
      equipPhase,
      familyStage,
      productsPhase,
      step.id,
    ]);

  /*
   * ============================================================
   * UPDATE SPOTLIGHT
   * ============================================================
   */

  const updateTarget =
    useCallback(() => {
      if (
        !isOpen ||
        !tourStarted ||
        introRunning ||
        currentStep === 0
      ) {
        setTargetRect(
          null,
        );

        return;
      }

      const element =
        getCurrentTarget();

      if (!element) {
        setTargetRect(
          null,
        );

        return;
      }

      const rect =
        element.getBoundingClientRect();

      const outsideViewport =
        rect.top < 0 ||
        rect.bottom >
          window.innerHeight;

      if (
        outsideViewport
      ) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      setTargetRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });

      if (
        step.id ===
          "products" ||
        step.id ===
          "try-on" ||
        step.id ===
          "equip"
      ) {
        setProductPreview(
          getCurrentProductImage(),
        );
      } else {
        setProductPreview(
          null,
        );
      }
    }, [
      currentStep,
      getCurrentTarget,
      introRunning,
      isOpen,
      step.id,
      tourStarted,
    ]);

  /*
   * ============================================================
   * KEEP TARGET IN SYNC
   * ============================================================
   */

  useEffect(() => {
    if (
      !isOpen ||
      !tourStarted ||
      introRunning ||
      currentStep === 0
    ) {
      return;
    }

    updateTarget();

    const one =
      window.setTimeout(
        updateTarget,
        250,
      );

    const two =
      window.setTimeout(
        updateTarget,
        650,
      );

    const observer =
      new MutationObserver(
        () => {
          window.requestAnimationFrame(
            updateTarget,
          );
        },
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    window.addEventListener(
      "resize",
      updateTarget,
    );

    window.addEventListener(
      "scroll",
      updateTarget,
      true,
    );

    return () => {
      window.clearTimeout(
        one,
      );

      window.clearTimeout(
        two,
      );

      observer.disconnect();

      window.removeEventListener(
        "resize",
        updateTarget,
      );

      window.removeEventListener(
        "scroll",
        updateTarget,
        true,
      );
    };
  }, [
    currentStep,
    introRunning,
    isOpen,
    tourStarted,
    updateTarget,
  ]);

  /*
   * ============================================================
   * CLEAN UP OTHER WINDOWS BETWEEN STEPS
   * ============================================================
   */

  useEffect(() => {
    if (
      !tourStarted ||
      introRunning ||
      currentStep === 0
    ) {
      return;
    }

    if (
      step.id !==
      "festival"
    ) {
      closeFestivalDrawer();
    }

    if (
      step.id !==
      "family"
    ) {
      closeFamilyDrawer();
    }

    if (
      step.id !==
        "finalize" &&
      step.id !==
        "final-look"
    ) {
      closeFinalLookModal();
    }

    if (
      step.id !==
        "squad" &&
      step.id !==
        "wish-studio" &&
      step.id !==
        "share"
    ) {
      closeSquadOverlay();
    }

    if (
      step.id ===
        "products" ||
      step.id ===
        "try-on" ||
      step.id ===
        "equip"
    ) {
      ensureOutfitsSelected();
    }

    const timer =
      window.setTimeout(
        updateTarget,
        300,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    currentStep,
    introRunning,
    step.id,
    tourStarted,
    updateTarget,
  ]);

  /*
   * ============================================================
   * OPEN / COMPLETE
   * ============================================================
   */

  function openTour() {
    closeFestivalDrawer();
    closeFamilyDrawer();
    closeFinalLookModal();
    closeSquadOverlay();

    if (
      "speechSynthesis" in
      window
    ) {
      window.speechSynthesis.cancel();
    }

    setCurrentStep(0);
    setTourStarted(false);
    setIntroRunning(false);
    setTargetRect(null);
    setProductPreview(null);
    setIsOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function completeTour() {
    closeFestivalDrawer();
    closeFamilyDrawer();
    closeFinalLookModal();
    closeSquadOverlay();

    window.localStorage.setItem(
      TUTORIAL_COMPLETE_KEY,
      "true",
    );

    if (
      "speechSynthesis" in
      window
    ) {
      window.speechSynthesis.cancel();
    }

    setIsOpen(false);
    setTourStarted(false);
    setIntroRunning(false);
    setTargetRect(null);
    setProductPreview(null);
  }

  function skipTour() {
    completeTour();
  }

  /*
   * ============================================================
   * NEXT
   * ============================================================
   */

  function goNext() {
    if (
      step.id ===
      "family"
    ) {
      closeFamilyDrawer();
    }

    if (
      step.id ===
      "final-look"
    ) {
      closeFinalLookModal();
    }

    if (
      currentStep >=
      tourSteps.length - 1
    ) {
      completeTour();
      return;
    }

    setCurrentStep(
      (previous) =>
        previous + 1,
    );
  }

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  function goBack() {
    if (
      currentStep <= 1
    ) {
      closeFestivalDrawer();
      closeFamilyDrawer();
      closeFinalLookModal();
      closeSquadOverlay();

      if (
        "speechSynthesis" in
        window
      ) {
        window.speechSynthesis.cancel();
      }

      setCurrentStep(0);
      setTourStarted(false);
      setIntroRunning(false);
      setTargetRect(null);

      return;
    }

    if (
      step.id ===
      "family"
    ) {
      closeFamilyDrawer();
    }

    if (
      step.id ===
      "final-look"
    ) {
      closeFinalLookModal();
    }

    if (
      step.id ===
      "squad"
    ) {
      closeSquadOverlay();
    }

    setCurrentStep(
      (previous) =>
        previous - 1,
    );
  }

  /*
   * ============================================================
   * VOICE CONTROLS
   * ============================================================
   */

  function toggleVoice() {
    if (
      voiceEnabled
    ) {
      if (
        "speechSynthesis" in
        window
      ) {
        window.speechSynthesis.cancel();
      }

      setVoiceEnabled(
        false,
      );

      return;
    }

    setVoiceEnabled(
      true,
    );
  }

  function replayVoice() {
    if (
      !voiceEnabled
    ) {
      return;
    }

    if (
      introRunning
    ) {
      const intro =
        userName.trim()
          ? `Welcome, ${userName.trim()}. ${INTRO_SCRIPT}`
          : INTRO_SCRIPT;

      speakText(
        intro,
      );

      return;
    }

    speakStep(
      currentStep,
    );
  }

  /*
   * ============================================================
   * NOT MOUNTED
   * ============================================================
   */

  if (!mounted) {
    return null;
  }

  /*
   * ============================================================
   * CLOSED — HOW IT WORKS BUTTON
   * ============================================================
   */

  if (!isOpen) {
    return createPortal(
      <button
        type="button"
        onClick={openTour}
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full border border-gold/50 bg-background/90 px-4 py-2.5 text-xs font-semibold text-gold shadow-2xl backdrop-blur-xl transition-all hover:border-gold hover:bg-secondary"
      >
        <Sparkles className="size-4" />

        How It Works?
      </button>,
      document.body,
    );
  }

  /*
   * ============================================================
   * WELCOME WINDOW
   * ============================================================
   */

  if (
    currentStep === 0 &&
    !introRunning
  ) {
    return createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">

        <div className="panel-ornate relative w-full max-w-lg overflow-hidden rounded-2xl border border-gold/45 bg-background/95 p-6 shadow-2xl">

          <button
            type="button"
            onClick={skipTour}
            aria-label="Skip tutorial"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-gold/20 text-muted-foreground transition-all hover:border-gold hover:text-gold"
          >
            <X className="size-4" />
          </button>

          <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-gold/40 bg-gold/10">
            <Sparkles className="size-6 text-gold" />
          </div>

          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">
            Under 2.5 Minute Guided Experience
          </p>

          <h2 className="font-display text-2xl text-foreground">
            Welcome to Festive Ready AI
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            First, we’ll quickly show you the complete app. Then the real controls will be highlighted while the narrator guides you through the experience.
          </p>

          <div className="mt-6">

            <label
              htmlFor="festive-tour-name"
              className="mb-2 block text-[10px] font-semibold tracking-[0.16em] text-gold uppercase"
            >
              What should we call you?{" "}

              <span className="text-muted-foreground normal-case">
                Optional
              </span>
            </label>

            <input
              id="festive-tour-name"
              value={userName}
              onChange={(event) =>
                setUserName(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  startTour();
                }
              }}
              placeholder="Your name"
              className="w-full rounded-lg border border-gold/30 bg-background/70 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold"
            />

          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">

            <div className="rounded-xl border border-gold/20 bg-gold/5 p-3">

              <Sparkles className="size-4 text-gold" />

              <p className="mt-2 text-[10px] font-semibold text-gold">
                YouCam VTO
              </p>

              <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                Preview festive outfits on the user’s photo.
              </p>

            </div>

            <div className="rounded-xl border border-gold/20 bg-gold/5 p-3">

              <WandSparkles className="size-4 text-gold" />

              <p className="mt-2 text-[10px] font-semibold text-gold">
                Background Removal
              </p>

              <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                Prepare family cutouts for the final greeting.
              </p>

            </div>

          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">

            <button
              type="button"
              onClick={toggleVoice}
              className="flex items-center gap-2 rounded-lg border border-gold/25 px-3 py-2 text-xs text-gold hover:border-gold"
            >
              {voiceEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}

              {voiceEnabled
                ? "Voice On"
                : "Voice Off"}
            </button>

            <button
              type="button"
              onClick={skipTour}
              className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={startTour}
              className="ml-auto flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-background hover:brightness-110"
            >
              Start Guided Tour

              <ChevronRight className="size-4" />
            </button>

          </div>

        </div>

      </div>,
      document.body,
    );
  }

  /*
   * ============================================================
   * CLEAR APP OVERVIEW
   *
   * No dark overlay here.
   * User sees complete real application.
   * ============================================================
   */

  if (
    introRunning
  ) {
    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[10000]">

        <div className="pointer-events-auto fixed bottom-5 left-5 w-[min(380px,calc(100vw-40px))] rounded-2xl border border-gold/40 bg-background/90 p-4 shadow-2xl backdrop-blur-xl">

          <div className="flex items-start gap-3">

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
              <Sparkles className="size-5 text-gold" />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[8px] font-semibold tracking-[0.18em] text-gold uppercase">
                Project Overview
              </p>

              <h3 className="mt-1 font-display text-base text-foreground">
                Festive Ready AI
              </h3>

              <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">
                Quick overview first — then we’ll guide you through the real workflow.
              </p>

            </div>

          </div>

          <div className="mt-3 flex items-center gap-2 text-[9px] text-muted-foreground">

            <Volume2 className="size-3.5 text-gold" />

            YouCam VTO

            <span className="text-gold/40">
              •
            </span>

            RPG Styling

            <span className="text-gold/40">
              •
            </span>

            Family Wish

          </div>

          <div className="mt-3 flex items-center gap-2">

            <button
              type="button"
              onClick={toggleVoice}
              className="flex size-8 items-center justify-center rounded-lg border border-gold/20 text-gold"
            >
              {voiceEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </button>

            <button
              type="button"
              onClick={replayVoice}
              disabled={!voiceEnabled}
              title="Replay overview"
              className="flex size-8 items-center justify-center rounded-lg border border-gold/20 text-gold disabled:opacity-30"
            >
              <RotateCcw className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={beginDetailedTour}
              className="ml-auto rounded-lg border border-gold/30 px-3 py-2 text-[10px] font-semibold text-gold hover:border-gold"
            >
              Skip Overview →
            </button>

          </div>

        </div>

      </div>,
      document.body,
    );
  }

  /*
   * ============================================================
   * DYNAMIC TOOLTIP CONTENT
   * ============================================================
   */

  let displayTitle =
    step.title;

  let displayDescription =
    step.description;

  if (
    step.id === "family" &&
    familyStage === "add"
  ) {
    displayTitle =
      "Add One Family Member";

    displayDescription =
      "Enter a name, select Age Group and Gender / Fit, then click Add to Party.";
  }

  if (
    step.id === "family" &&
    familyStage === "switch"
  ) {
    displayTitle =
      "Switch Between Profiles";

    displayDescription =
      "The full Festive Party is highlighted. Try switching between My Look and the new member.";
  }

  if (
    step.id === "products" &&
    productsPhase === "filters"
  ) {
    displayTitle =
      "Personalize the Collection";

    displayDescription =
      "Use Budget, Style and Colour to narrow the festive products for the active profile.";
  }

  if (
    step.id === "equip" &&
    equipPhase === "panel"
  ) {
    displayTitle =
      "Your RPG Equipment";

    displayDescription =
      "Equipped products appear in the left panel as the active member's RPG-style loadout.";
  }

  if (
    step.id === "final-look" &&
    !getFinalLookModal()
  ) {
    displayDescription =
      "Try On, Equip and Finalize the current member first. The Final Look Ready screen will then appear.";
  }

  /*
   * ============================================================
   * SPOTLIGHT POSITIONING
   * ============================================================
   */

  const viewportWidth =
    window.innerWidth;

  const viewportHeight =
    window.innerHeight;

  const padding = 8;

  const hole =
    targetRect
      ? {
          top: Math.max(
            6,
            targetRect.top -
              padding,
          ),

          left: Math.max(
            6,
            targetRect.left -
              padding,
          ),

          right: Math.min(
            viewportWidth - 6,
            targetRect.right +
              padding,
          ),

          bottom: Math.min(
            viewportHeight - 6,
            targetRect.bottom +
              padding,
          ),
        }
      : null;

  const tooltipWidth =
    Math.min(
      385,
      viewportWidth - 32,
    );

  const showProductPreview =
    Boolean(
      productPreview &&
        (
          step.id ===
            "products" ||
          step.id ===
            "try-on" ||
          (
            step.id ===
              "equip" &&
            equipPhase ===
              "button"
          )
        ),
    );

  const estimatedHeight =
    showProductPreview
      ? 380
      : 330;

  let tooltipLeft =
    Math.max(
      16,
      viewportWidth / 2 -
        tooltipWidth / 2,
    );

  let tooltipTop =
    Math.max(
      16,
      viewportHeight / 2 -
        estimatedHeight / 2,
    );

  if (
    targetRect
  ) {
    const roomRight =
      viewportWidth -
      targetRect.right;

    const roomLeft =
      targetRect.left;

    const centerY =
      targetRect.top +
      targetRect.height / 2;

    if (
      roomRight >
      tooltipWidth + 28
    ) {
      tooltipLeft =
        targetRect.right +
        18;

      tooltipTop =
        Math.max(
          16,
          Math.min(
            viewportHeight -
              estimatedHeight -
              16,
            centerY -
              estimatedHeight / 2,
          ),
        );
    } else if (
      roomLeft >
      tooltipWidth + 28
    ) {
      tooltipLeft =
        targetRect.left -
        tooltipWidth -
        18;

      tooltipTop =
        Math.max(
          16,
          Math.min(
            viewportHeight -
              estimatedHeight -
              16,
            centerY -
              estimatedHeight / 2,
          ),
        );
    } else {
      tooltipLeft =
        Math.max(
          16,
          Math.min(
            viewportWidth -
              tooltipWidth -
              16,
            targetRect.left +
              targetRect.width /
                2 -
              tooltipWidth /
                2,
          ),
        );

      const enoughBelow =
        targetRect.bottom +
          estimatedHeight +
          24 <
        viewportHeight;

      tooltipTop =
        enoughBelow
          ? targetRect.bottom +
            16
          : Math.max(
              16,
              targetRect.top -
                estimatedHeight -
                16,
            );
    }

    /*
     * Large windows:
     * Final Look / Squad Studio.
     */
    const largeTarget =
      targetRect.width >
        viewportWidth * 0.68 ||
      targetRect.height >
        viewportHeight * 0.68;

    if (
      largeTarget
    ) {
      tooltipLeft =
        Math.max(
          16,
          viewportWidth -
            tooltipWidth -
            24,
        );

      tooltipTop =
        Math.max(
          16,
          viewportHeight -
            estimatedHeight -
            24,
        );
    }
  }

  const progress =
    (
      currentStep /
      (
        tourSteps.length -
        1
      )
    ) *
    100;

  /*
   * ============================================================
   * MAIN SPOTLIGHT UI
   * ============================================================
   */

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10000]">

      {hole ? (
        <>
          {/*
           * LIGHTER 45% DIM
           *
           * Previous 75% dim hid too much of the app.
           */}

          <div
            className="pointer-events-auto fixed left-0 right-0 top-0 bg-black/45"
            style={{
              height:
                hole.top,
            }}
          />

          <div
            className="pointer-events-auto fixed left-0 bg-black/45"
            style={{
              top:
                hole.top,

              width:
                hole.left,

              height:
                hole.bottom -
                hole.top,
            }}
          />

          <div
            className="pointer-events-auto fixed right-0 bg-black/45"
            style={{
              top:
                hole.top,

              width:
                viewportWidth -
                hole.right,

              height:
                hole.bottom -
                hole.top,
            }}
          />

          <div
            className="pointer-events-auto fixed bottom-0 left-0 right-0 bg-black/45"
            style={{
              top:
                hole.bottom,
            }}
          />

          {/*
           * The highlighted real element stays clickable
           * because there is NO overlay over the hole.
           */}

          <div
            className="pointer-events-none fixed rounded-xl border-2 border-gold shadow-[0_0_0_3px_rgba(212,175,55,0.12),0_0_38px_rgba(212,175,55,0.52)]"
            style={{
              top:
                hole.top,

              left:
                hole.left,

              width:
                hole.right -
                hole.left,

              height:
                hole.bottom -
                hole.top,
            }}
          >

            <div className="absolute -left-3 -top-3 flex size-7 items-center justify-center rounded-full border border-gold bg-background shadow-[0_0_18px_rgba(212,175,55,0.75)]">

              <Sparkles className="size-3.5 animate-pulse text-gold" />

            </div>

          </div>

        </>
      ) : (
        <div className="pointer-events-auto fixed inset-0 bg-black/45" />
      )}

      {/*
       * ========================================================
       * GUIDE CARD
       * ========================================================
       */}

      <div
        className="panel-ornate pointer-events-auto fixed overflow-hidden rounded-2xl border border-gold/45 bg-background/95 shadow-2xl backdrop-blur-xl"
        style={{
          width:
            tooltipWidth,

          top:
            tooltipTop,

          left:
            tooltipLeft,
        }}
      >

        {/* Progress */}

        <div className="h-1 w-full bg-gold/10">

          <div
            className="h-full bg-gold transition-all duration-500"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

        <div className="p-5">

          {/* Header */}

          <div className="mb-3 flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">

                <StepIcon
                  id={step.id}
                />

              </div>

              <div>

                <p className="text-[8px] font-semibold tracking-[0.18em] text-gold uppercase">
                  Guided Experience
                </p>

                <p className="text-[9px] text-muted-foreground">
                  Step{" "}
                  {currentStep}{" "}
                  of{" "}
                  {tourSteps.length -
                    1}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={skipTour}
              className="text-[10px] text-muted-foreground hover:text-gold"
            >
              Skip
            </button>

          </div>

          {/* Main text */}

          <h3 className="font-display text-lg text-foreground">
            {displayTitle}
          </h3>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {displayDescription}
          </p>

          {/* Festival note */}

          {step.id ===
            "festival" &&
            getFestivalDrawer() && (
            <div className="mt-3 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">

              <div className="flex items-start gap-2">

                <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-gold" />

                <p className="text-[9px] leading-4 text-muted-foreground">
                  Upcoming celebrations stay visible here, and users can turn festival reminders on or off.
                </p>

              </div>

            </div>
          )}

          {/* Family add */}

          {step.id ===
            "family" &&
            familyStage ===
              "add" && (
            <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3">

              <p className="text-[9px] font-semibold text-gold">
                Try it now
              </p>

              <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                Add one member. The highlighted form is the real working family-profile form.
              </p>

            </div>
          )}

          {/* Family switching */}

          {step.id ===
            "family" &&
            familyStage ===
              "switch" && (
            <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3">

              <p className="text-[9px] font-semibold text-gold">
                Switch profiles
              </p>

              <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                Click My Look or the family member you just created. The whole party strip is highlighted.
              </p>

            </div>
          )}

          {/* Product preview */}

          {showProductPreview &&
            productPreview && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-gold/20 bg-black/20 p-2.5">

              <img
                src={productPreview}
                alt="Current festive product"
                className="size-16 shrink-0 rounded-lg border border-gold/30 object-cover"
              />

              <div>

                <p className="text-[9px] font-semibold tracking-[0.12em] text-gold uppercase">
                  Festive Product
                </p>

                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                  This product is coming directly from the active festive collection.
                </p>

              </div>

            </div>
          )}

          {/* Filters */}

          {step.id ===
            "products" &&
            productsPhase ===
              "filters" && (
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">

              <div className="rounded-lg border border-gold/20 bg-gold/5 px-2 py-2">
                <p className="text-[8px] text-gold">
                  Budget
                </p>
              </div>

              <div className="rounded-lg border border-gold/20 bg-gold/5 px-2 py-2">
                <p className="text-[8px] text-gold">
                  Style
                </p>
              </div>

              <div className="rounded-lg border border-gold/20 bg-gold/5 px-2 py-2">
                <p className="text-[8px] text-gold">
                  Colour
                </p>
              </div>

            </div>
          )}

          {/* Try On interactive */}

          {step.id ===
            "try-on" && (
            <div className="mt-3 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">

              <p className="text-[9px] leading-4 text-muted-foreground">
                The highlighted Try On button remains clickable — use the real YouCam VTO during the demo.
              </p>

            </div>
          )}

          {/* Equipment */}

          {step.id ===
            "equip" &&
            equipPhase ===
              "panel" && (
            <div className="mt-3 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">

              <p className="text-[9px] leading-4 text-muted-foreground">
                Outfit • Jewellery • Shoes • Accessories become RPG equipment for the active family member.
              </p>

            </div>
          )}

          {/* Finalize warning */}

          {step.id ===
            "finalize" && (
            <div className="mt-3 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">

              <p className="text-[9px] leading-4 text-muted-foreground">
                For the clean demo flow: Try On → Equip → Finalize.
              </p>

            </div>
          )}

          {/* Wish */}

          {step.id ===
            "wish-studio" &&
            targetRect && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">

              <WandSparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />

              <p className="text-[9px] leading-4 text-muted-foreground">
                Prepare Cutouts → YouCam background removal → choose a scene → create the greeting.
              </p>

            </div>
          )}

          {/* Share */}

          {step.id ===
            "share" &&
            targetRect && (
            <div className="mt-3 flex gap-2">

              <div className="flex flex-1 items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-2.5 py-2 text-[9px] text-gold">

                <Download className="size-3.5" />

                Download

              </div>

              <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-2.5 py-2 text-[9px] text-foreground">

                <MessageCircle className="size-3.5" />

                WhatsApp

              </div>

            </div>
          )}

          {/* Tips */}

          <div className="mt-3 space-y-1.5">

            {step.tips.map(
              (tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-2 text-[9px] leading-4 text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-gold" />

                  <span>
                    {tip}
                  </span>
                </div>
              ),
            )}

          </div>

          {/* Missing state */}

          {!targetRect && (
            <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2">

              <p className="text-[9px] leading-4 text-amber-100">

                {step.id ===
                "final-look"
                  ? "Complete Try On, Equip and Finalize first. The Final Look Ready window will then appear."

                  : step.id ===
                      "squad"
                    ? "Finalize at least one family member first to unlock the Festive Squad."

                    : step.id ===
                          "wish-studio" ||
                        step.id ===
                          "share"
                      ? "This becomes available after a finalized member enters the Festive Squad."

                      : "This control is not currently visible. You can continue safely."}

              </p>

            </div>
          )}

          {/* Controls */}

          <div className="mt-5 flex items-center gap-2">

            <button
              type="button"
              onClick={toggleVoice}
              title={
                voiceEnabled
                  ? "Mute voice"
                  : "Turn voice on"
              }
              className="flex size-8 items-center justify-center rounded-lg border border-gold/20 text-gold hover:border-gold"
            >
              {voiceEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </button>

            <button
              type="button"
              onClick={replayVoice}
              disabled={!voiceEnabled}
              title="Replay narration"
              className="flex size-8 items-center justify-center rounded-lg border border-gold/20 text-gold hover:border-gold disabled:opacity-30"
            >
              <RotateCcw className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={goBack}
              className="ml-auto flex items-center gap-1 rounded-lg border border-gold/25 px-3 py-2 text-xs text-foreground hover:border-gold"
            >
              <ChevronLeft className="size-4" />

              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-background hover:brightness-110"
            >
              {currentStep ===
              tourSteps.length - 1
                ? "Start Styling"
                : "Next"}

              {currentStep !==
                tourSteps.length -
                  1 && (
                <ChevronRight className="size-4" />
              )}
            </button>

          </div>

        </div>

      </div>

    </div>,
    document.body,
  );
}