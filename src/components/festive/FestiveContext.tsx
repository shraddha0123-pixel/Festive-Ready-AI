import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* =========================================================
   TYPES
   ========================================================= */

export type AgeGroup =
  | "adult"
  | "teen"
  | "kid";

export type GenderFit =
  | "female"
  | "male"
  | "unisex";

export type StylePreference = {
  outfitBudget: number;
  jewelleryBudget: number;
  shoesBudget: number;
  accessoryBudget: number;
  color: string;
  style: string;
};

export type PartyMember = {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  genderFit: GenderFit;
  isMainProfile: boolean;
  photoUrl?: string;
  preference: StylePreference;
};

export type Festival = {
  id: string;
  name: string;
  date: string;
  emoji: string;
  tagline: string;
};

export type VirtualTryOnResult = {
  url: string;
  itemName: string;
};

/* =========================================================
   EQUIPMENT
   ========================================================= */

export type EquipmentSlot =
  | "outfit"
  | "necklace"
  | "earrings"
  | "bangles"
  | "ring"
  | "shoes"
  | "accessory";

export type EquippedItem = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  image?: string;
  price?: string | number;
  productUrl?: string;
  category?: string;
};

export type EquippedItems =
  Partial<
    Record<
      EquipmentSlot,
      EquippedItem
    >
  >;

export type EquipmentByMember =
  Record<
    string,
    EquippedItems
  >;

/* =========================================================
   FINALIZED LOOK
   ========================================================= */

export type FinalizedLook = {
  memberId: string;
  memberName: string;

  ageGroup: AgeGroup;
  genderFit: GenderFit;

  festivalId: string;
  festivalName: string;
  festivalEmoji: string;

  preference: StylePreference;

  equippedItems: EquippedItems;

  tryOnResult:
    | VirtualTryOnResult
    | null;

  finalizedAt: string;
};

export type FinalizedLooksByMember =
  Record<
    string,
    FinalizedLook
  >;

/* =========================================================
   FESTIVALS
   ========================================================= */

export const festivals: Festival[] = [
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    date: "28 Aug 2026",
    emoji: "🪢",
    tagline: "Sibling & family looks",
  },
  {
    id: "janmashtami",
    name: "Janmashtami",
    date: "4 Sep 2026",
    emoji: "🦚",
    tagline: "Traditional festive styling",
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    date: "14 Sep 2026",
    emoji: "🌺",
    tagline: "Ethnic celebration looks",
  },
  {
    id: "navratri",
    name: "Navratri",
    date: "11 Oct 2026",
    emoji: "💃",
    tagline: "Garba & colour styling",
  },
  {
    id: "diwali",
    name: "Diwali",
    date: "8 Nov 2026",
    emoji: "🪔",
    tagline: "Grand festive looks",
  },
];

/* =========================================================
   DEFAULTS
   ========================================================= */

const defaultPreference: StylePreference = {
  outfitBudget: 25000,
  jewelleryBudget: 10000,
  shoesBudget: 3000,
  accessoryBudget: 2000,
  color: "All Colours",
  style: "All Styles",
};

const mainProfile: PartyMember = {
  id: "me",
  name: "My Look",
  ageGroup: "adult",
  genderFit: "female",
  isMainProfile: true,
  preference: {
    ...defaultPreference,
  },
};

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY =
  "festive-ready-ai-demo-state-v1";

type SavedFestiveState = {
  partyMembers?: PartyMember[];
  activeMemberId?: string;
  selectedFestivalId?: string;
  reminders?: string[];
  equipmentByMember?: EquipmentByMember;
  finalizedLooksByMember?: FinalizedLooksByMember;
};

/* =========================================================
   CONTEXT TYPE
   ========================================================= */

type FestiveContextValue = {
  partyMembers: PartyMember[];

  activeMemberId: string;

  activeMember: PartyMember;

  selectedFestival: Festival;

  reminders: string[];

  standingPhoto:
    File | null;

  standingPhotoCutoutUrl:
    string | null;

  tryOnResult:
    VirtualTryOnResult | null;

  equipmentByMember:
    EquipmentByMember;

  equippedItems:
    EquippedItems;

  equipItem: (
    item: EquippedItem,
  ) => void;

  unequipSlot: (
    slot: EquipmentSlot,
  ) => void;

  isItemEquipped: (
    itemId: string,
  ) => boolean;

  finalizedLooksByMember:
    FinalizedLooksByMember;

  finalizedLook:
    FinalizedLook | null;

  finalizeCurrentLook:
    () => FinalizedLook;

  clearFinalizedLook:
    (memberId?: string) => void;

  addMember: (
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) => void;

  updateMember: (
    memberId: string,
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) => void;

  removeMember: (
    memberId: string,
  ) => void;

  setActiveMemberId: (
    id: string,
  ) => void;

  setSelectedFestival: (
    festival: Festival,
  ) => void;

  toggleReminder: (
    festivalId: string,
  ) => void;

  updatePreference: (
    preference: StylePreference,
  ) => void;

  setStandingPhoto: (
    file: File | null,
  ) => void;

  setStandingPhotoCutoutUrl: (
    url: string | null,
  ) => void;

  setTryOnResult: (
    result:
      | VirtualTryOnResult
      | null,
  ) => void;
};

const FestiveContext =
  createContext<
    FestiveContextValue | null
  >(null);

/* =========================================================
   PROVIDER
   ========================================================= */

export function FestiveProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    partyMembers,
    setPartyMembers,
  ] = useState<PartyMember[]>([
    mainProfile,
  ]);

  const [
    activeMemberId,
    setActiveMemberId,
  ] = useState(
    mainProfile.id,
  );

  const [
    selectedFestival,
    setSelectedFestival,
  ] = useState<Festival>(
    festivals[0]!,
  );

  const [
    reminders,
    setReminders,
  ] = useState<string[]>([]);

  /*
   * Browser File objects stay
   * session-only.
   */

  const [
    standingPhotos,
    setStandingPhotos,
  ] = useState<
    Record<string, File>
  >({});

  const [
    standingPhotoCutouts,
    setStandingPhotoCutouts,
  ] = useState<
    Record<string, string>
  >({});

  const [
    tryOnResults,
    setTryOnResults,
  ] = useState<
    Record<
      string,
      VirtualTryOnResult
    >
  >({});

  const [
    equipmentByMember,
    setEquipmentByMember,
  ] = useState<
    EquipmentByMember
  >({});

  const [
    finalizedLooksByMember,
    setFinalizedLooksByMember,
  ] = useState<
    FinalizedLooksByMember
  >({});

  const [
    storageReady,
    setStorageReady,
  ] = useState(false);

  /* =======================================================
     LOAD SAVED DATA
     ======================================================= */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (!saved) {
        setStorageReady(true);
        return;
      }

      const parsed =
        JSON.parse(
          saved,
        ) as SavedFestiveState;

      /*
       * Normalize old saved users so
       * TypeScript and old localStorage
       * data stay safe.
       */

      const rawMembers =
        Array.isArray(
          parsed.partyMembers,
        ) &&
        parsed.partyMembers.length > 0
          ? parsed.partyMembers
          : [mainProfile];

      const savedMembers: PartyMember[] =
        rawMembers.map(
          (
            member,
          ): PartyMember => {
            const isMain =
              member.id ===
              mainProfile.id;

            return {
              ...member,

              id:
                member.id,

              name:
                isMain
                  ? "My Look"
                  : member.name?.trim() ||
                    "Family Member",

              ageGroup:
                isMain
                  ? "adult"
                  : member.ageGroup ??
                    "adult",

              genderFit:
                isMain
                  ? "female"
                  : member.genderFit ??
                    "unisex",

              isMainProfile:
                isMain,

              preference: {
                ...defaultPreference,

                ...(
                  member.preference ??
                  {}
                ),

                color:
                  "All Colours",

                style:
                  "All Styles",
              },
            };
          },
        );

      setPartyMembers(
        savedMembers,
      );

      /*
       * Active member
       */

      const activeExists =
        savedMembers.some(
          (member) =>
            member.id ===
            parsed.activeMemberId,
        );

      if (
        parsed.activeMemberId &&
        activeExists
      ) {
        setActiveMemberId(
          parsed.activeMemberId,
        );
      } else {
        setActiveMemberId(
          mainProfile.id,
        );
      }

      /*
       * Festival
       */

      if (
        parsed.selectedFestivalId
      ) {
        const restoredFestival =
          festivals.find(
            (festival) =>
              festival.id ===
              parsed.selectedFestivalId,
          );

        if (restoredFestival) {
          setSelectedFestival(
            restoredFestival,
          );
        }
      }

      /*
       * Reminders
       */

      if (
        Array.isArray(
          parsed.reminders,
        )
      ) {
        setReminders(
          parsed.reminders,
        );
      }

      /*
       * Equipment
       */

      if (
        parsed.equipmentByMember &&
        typeof parsed.equipmentByMember ===
          "object"
      ) {
        setEquipmentByMember(
          parsed.equipmentByMember,
        );
      }

      /*
       * Finalized looks
       */

      if (
        parsed.finalizedLooksByMember &&
        typeof parsed.finalizedLooksByMember ===
          "object"
      ) {
        setFinalizedLooksByMember(
          parsed.finalizedLooksByMember,
        );
      }
    } catch (error) {
      console.error(
        "Could not restore Festive Ready state:",
        error,
      );
    } finally {
      setStorageReady(true);
    }
  }, []);

  /* =======================================================
     SAVE DATA
     ======================================================= */

  useEffect(() => {
    if (
      !storageReady ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const stateToSave: SavedFestiveState =
      {
        partyMembers,
        activeMemberId,

        selectedFestivalId:
          selectedFestival.id,

        reminders,
        equipmentByMember,
        finalizedLooksByMember,
      };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          stateToSave,
        ),
      );
    } catch (error) {
      console.error(
        "Could not save Festive Ready state:",
        error,
      );
    }
  }, [
    storageReady,
    partyMembers,
    activeMemberId,
    selectedFestival,
    reminders,
    equipmentByMember,
    finalizedLooksByMember,
  ]);

  /* =======================================================
     ACTIVE MEMBER DATA
     ======================================================= */

  const activeMember =
    partyMembers.find(
      (member) =>
        member.id ===
        activeMemberId,
    ) ??
    partyMembers[0] ??
    mainProfile;

  const standingPhoto =
    standingPhotos[
      activeMemberId
    ] ?? null;

  const standingPhotoCutoutUrl =
    standingPhotoCutouts[
      activeMemberId
    ] ?? null;

  const tryOnResult =
    tryOnResults[
      activeMemberId
    ] ?? null;

  const equippedItems =
    equipmentByMember[
      activeMemberId
    ] ?? {};

  const finalizedLook =
    finalizedLooksByMember[
      activeMemberId
    ] ?? null;

  /* =======================================================
     FINALIZE CURRENT LOOK
     ======================================================= */

  function finalizeCurrentLook(): FinalizedLook {
    const equipmentSnapshot: EquippedItems =
      Object.fromEntries(
        Object.entries(
          equippedItems,
        ).map(
          ([slot, item]) => [
            slot,
            item
              ? { ...item }
              : item,
          ],
        ),
      ) as EquippedItems;

    const finalized: FinalizedLook = {
      memberId:
        activeMember.id,

      memberName:
        activeMember.name,

      ageGroup:
        activeMember.ageGroup,

      genderFit:
        activeMember.genderFit,

      festivalId:
        selectedFestival.id,

      festivalName:
        selectedFestival.name,

      festivalEmoji:
        selectedFestival.emoji,

      preference: {
        ...activeMember.preference,
      },

      equippedItems:
        equipmentSnapshot,

      tryOnResult:
        tryOnResult
          ? {
              ...tryOnResult,
            }
          : null,

      finalizedAt:
        new Date().toISOString(),
    };

    setFinalizedLooksByMember(
      (current) => ({
        ...current,

        [activeMember.id]:
          finalized,
      }),
    );

    return finalized;
  }

  /* =======================================================
     CLEAR FINALIZED LOOK
     ======================================================= */

  function clearFinalizedLook(
    memberId?: string,
  ) {
    const targetId =
      memberId ??
      activeMemberId;

    setFinalizedLooksByMember(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          targetId
        ];

        return next;
      },
    );
  }

  /* =======================================================
     ADD MEMBER
     ======================================================= */

  function addMember(
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) {
    const cleanName =
      name.trim();

    if (
      !cleanName ||
      partyMembers.length >= 4
    ) {
      return;
    }

    const newMember: PartyMember = {
      id:
        `member-${Date.now()}`,

      name:
        cleanName,

      ageGroup,

      genderFit,

      isMainProfile:
        false,

      preference: {
        outfitBudget:
          ageGroup === "kid"
            ? 5000
            : 15000,

        jewelleryBudget:
          ageGroup === "kid"
            ? 1000
            : 5000,

        shoesBudget:
          ageGroup === "kid"
            ? 1000
            : 3000,

        accessoryBudget:
          ageGroup === "kid"
            ? 1000
            : 2000,

        color:
          "All Colours",

        style:
          "All Styles",
      },
    };

    setPartyMembers(
      (current) => [
        ...current,
        newMember,
      ],
    );

    setEquipmentByMember(
      (current) => ({
        ...current,

        [newMember.id]:
          {},
      }),
    );

    setActiveMemberId(
      newMember.id,
    );
  }

  /* =======================================================
     EDIT MEMBER
     ======================================================= */

  function updateMember(
    memberId: string,
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) {
    if (
      memberId ===
      mainProfile.id
    ) {
      return;
    }

    const cleanName =
      name.trim();

    if (!cleanName) {
      return;
    }

    setPartyMembers(
      (current) =>
        current.map(
          (member) =>
            member.id ===
            memberId
              ? {
                  ...member,

                  name:
                    cleanName,

                  ageGroup,

                  genderFit,
                }
              : member,
        ),
    );

    /*
     * Keep finalized look connected
     * to the same member ID.
     */

    setFinalizedLooksByMember(
      (current) => {
        const existing =
          current[
            memberId
          ];

        if (!existing) {
          return current;
        }

        return {
          ...current,

          [memberId]: {
            ...existing,

            memberName:
              cleanName,

            ageGroup,

            genderFit,
          },
        };
      },
    );
  }

  /* =======================================================
     REMOVE MEMBER
     ======================================================= */

  function removeMember(
    memberId: string,
  ) {
    /*
     * My Look can never be deleted.
     */

    if (
      memberId ===
      mainProfile.id
    ) {
      return;
    }

    setPartyMembers(
      (current) =>
        current.filter(
          (member) =>
            member.id !==
            memberId,
        ),
    );

    if (
      activeMemberId ===
      memberId
    ) {
      setActiveMemberId(
        mainProfile.id,
      );
    }

    setEquipmentByMember(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          memberId
        ];

        return next;
      },
    );

    setFinalizedLooksByMember(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          memberId
        ];

        return next;
      },
    );

    setStandingPhotos(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          memberId
        ];

        return next;
      },
    );

    setStandingPhotoCutouts(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          memberId
        ];

        return next;
      },
    );

    setTryOnResults(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          memberId
        ];

        return next;
      },
    );
  }

  /* =======================================================
     PREFERENCES
     ======================================================= */

  function updatePreference(
    preference:
      StylePreference,
  ) {
    setPartyMembers(
      (current) =>
        current.map(
          (member) =>
            member.id ===
            activeMemberId
              ? {
                  ...member,
                  preference,
                }
              : member,
        ),
    );
  }

  /* =======================================================
     EQUIPMENT
     ======================================================= */

  function equipItem(
    item: EquippedItem,
  ) {
    setEquipmentByMember(
      (current) => {
        const currentEquipment =
          current[
            activeMemberId
          ] ?? {};

        return {
          ...current,

          [activeMemberId]: {
            ...currentEquipment,

            [item.slot]:
              item,
          },
        };
      },
    );
  }

  function unequipSlot(
    slot: EquipmentSlot,
  ) {
    setEquipmentByMember(
      (current) => {
        const nextEquipment = {
          ...(
            current[
              activeMemberId
            ] ?? {}
          ),
        };

        delete nextEquipment[
          slot
        ];

        return {
          ...current,

          [activeMemberId]:
            nextEquipment,
        };
      },
    );
  }

  function isItemEquipped(
    itemId: string,
  ) {
    return Object.values(
      equippedItems,
    ).some(
      (item) =>
        item?.id ===
        itemId,
    );
  }

  /* =======================================================
     PHOTO
     ======================================================= */

  function setStandingPhoto(
    file: File | null,
  ) {
    setStandingPhotos(
      (current) => {
        const next = {
          ...current,
        };

        if (file) {
          next[
            activeMemberId
          ] = file;
        } else {
          delete next[
            activeMemberId
          ];
        }

        return next;
      },
    );

    /*
     * New photo clears old
     * cutout and old VTO.
     */

    setStandingPhotoCutouts(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          activeMemberId
        ];

        return next;
      },
    );

    setTryOnResults(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          activeMemberId
        ];

        return next;
      },
    );
  }

  function setStandingPhotoCutoutUrl(
    url: string | null,
  ) {
    setStandingPhotoCutouts(
      (current) => {
        const next = {
          ...current,
        };

        if (url) {
          next[
            activeMemberId
          ] = url;
        } else {
          delete next[
            activeMemberId
          ];
        }

        return next;
      },
    );
  }

  /* =======================================================
     YOUCAM RESULT
     ======================================================= */

  function setTryOnResult(
    result:
      | VirtualTryOnResult
      | null,
  ) {
    setTryOnResults(
      (current) => {
        const next = {
          ...current,
        };

        if (result) {
          next[
            activeMemberId
          ] = result;
        } else {
          delete next[
            activeMemberId
          ];
        }

        return next;
      },
    );
  }

  /* =======================================================
     REMINDERS
     ======================================================= */

  function toggleReminder(
    festivalId: string,
  ) {
    setReminders(
      (current) => {
        if (
          current.includes(
            festivalId,
          )
        ) {
          return current.filter(
            (id) =>
              id !==
              festivalId,
          );
        }

        return [
          ...current,
          festivalId,
        ];
      },
    );
  }

  /* =======================================================
     PROVIDER
     ======================================================= */

  return (
    <FestiveContext.Provider
      value={{
        partyMembers,

        activeMemberId,

        activeMember,

        selectedFestival,

        reminders,

        standingPhoto,

        standingPhotoCutoutUrl,

        tryOnResult,

        equipmentByMember,

        equippedItems,

        equipItem,

        unequipSlot,

        isItemEquipped,

        finalizedLooksByMember,

        finalizedLook,

        finalizeCurrentLook,

        clearFinalizedLook,

        addMember,

        updateMember,

        removeMember,

        setActiveMemberId,

        setSelectedFestival,

        toggleReminder,

        updatePreference,

        setStandingPhoto,

        setStandingPhotoCutoutUrl,

        setTryOnResult,
      }}
    >
      {children}
    </FestiveContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useFestive() {
  const context =
    useContext(
      FestiveContext,
    );

  if (!context) {
    throw new Error(
      "useFestive must be used inside FestiveProvider",
    );
  }

  return context;
} 