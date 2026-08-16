import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
  ageGroup?: AgeGroup;
  genderFit?: GenderFit;
  isMainProfile?: boolean;
  photoUrl?: string;
  preference?: StylePreference;
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

/*
 * RPG EQUIPMENT
 */

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

  price?:
    | string
    | number;

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

/*
 * FESTIVALS
 */

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

/*
 * DEFAULT CONTEST PREFERENCES
 *
 * IMPORTANT:
 * Show complete collection by default.
 */

const defaultPreference: StylePreference = {
  outfitBudget: 25000,
  jewelleryBudget: 10000,
  shoesBudget: 3000,
  accessoryBudget: 2000,

  color: "All Colours",

  style: "All Styles",
};

/*
 * MAIN PROFILE
 *
 * Hackathon demo:
 * My Look = Adult Female
 */

const mainProfile: PartyMember = {
  id: "me",

  name: "My Look",

  ageGroup: "adult",

  genderFit: "female",

  isMainProfile: true,

  preference: defaultPreference,
};

/*
 * LOCAL STORAGE
 */

const STORAGE_KEY =
  "festive-ready-ai-demo-state-v1";

type SavedFestiveState = {
  partyMembers?: PartyMember[];

  activeMemberId?: string;

  selectedFestivalId?: string;

  reminders?: string[];

  equipmentByMember?:
    EquipmentByMember;
};

/*
 * CONTEXT TYPE
 */

type FestiveContextValue = {
  partyMembers: PartyMember[];

  activeMemberId: string;

  activeMember: PartyMember;

  selectedFestival: Festival;

  reminders: string[];

  /*
   * USER PHOTO
   */

  standingPhoto:
    File | null;

  /*
   * OLD BACKGROUND REMOVAL
   */

  standingPhotoCutoutUrl:
    string | null;

  /*
   * YOUCAM
   */

  tryOnResult:
    VirtualTryOnResult | null;

  /*
   * EQUIPMENT
   */

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

  /*
   * PARTY
   */

  addMember: (
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) => void;

  setActiveMemberId: (
    id: string,
  ) => void;

  /*
   * FESTIVAL
   */

  setSelectedFestival: (
    festival: Festival,
  ) => void;

  toggleReminder: (
    festivalId: string,
  ) => void;

  /*
   * PREFERENCES
   */

  updatePreference: (
    preference: StylePreference,
  ) => void;

  /*
   * PHOTO
   */

  setStandingPhoto: (
    file: File | null,
  ) => void;

  setStandingPhotoCutoutUrl: (
    url: string | null,
  ) => void;

  /*
   * VTO
   */

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

/*
 * PROVIDER
 */

export function FestiveProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * PARTY
   */

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

  /*
   * FESTIVAL
   */

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
   * USER PHOTOS
   *
   * Browser File objects are not
   * stored in localStorage.
   */

  const [
    standingPhotos,
    setStandingPhotos,
  ] = useState<
    Record<string, File>
  >({});

  /*
   * OLD BACKGROUND CUTOUT STORAGE
   */

  const [
    standingPhotoCutouts,
    setStandingPhotoCutouts,
  ] = useState<
    Record<string, string>
  >({});

  /*
   * YOUCAM RESULTS PER PERSON
   */

  const [
    tryOnResults,
    setTryOnResults,
  ] = useState<
    Record<
      string,
      VirtualTryOnResult
    >
  >({});

  /*
   * EQUIPMENT PER PERSON
   */

  const [
    equipmentByMember,
    setEquipmentByMember,
  ] = useState<
    EquipmentByMember
  >({});

  /*
   * STORAGE READY
   */

  const [
    storageReady,
    setStorageReady,
  ] = useState(false);

  /*
   * ============================================================
   * LOAD SAVED STATE
   * ============================================================
   */

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
       * Restore members.
       *
       * Contest behaviour:
       *
       * ALL existing users start with:
       * All Styles
       * All Colours
       *
       * Main "My Look" is also forced
       * to Adult Female.
       */

      const savedMembers = (
        Array.isArray(
          parsed.partyMembers,
        ) &&
        parsed.partyMembers.length > 0
          ? parsed.partyMembers
          : [mainProfile]
      ).map((member) => {
        const nextMember: PartyMember = {
          ...member,

          preference: {
            ...(member.preference ??
              defaultPreference),

            color:
              "All Colours",

            style:
              "All Styles",
          },
        };

        /*
         * Main profile only.
         */

        if (
          member.id ===
          mainProfile.id
        ) {
          return {
            ...nextMember,

            name:
              "My Look",

            ageGroup:
              "adult",

            genderFit:
              "female",

            isMainProfile:
              true,
          };
        }

        return nextMember;
      });

      setPartyMembers(
        savedMembers,
      );

      /*
       * Restore active member.
       */

      const savedActiveExists =
        savedMembers.some(
          (member) =>
            member.id ===
            parsed.activeMemberId,
        );

      if (
        parsed.activeMemberId &&
        savedActiveExists
      ) {
        setActiveMemberId(
          parsed.activeMemberId,
        );
      } else {
        setActiveMemberId(
          savedMembers[0]?.id ??
            mainProfile.id,
        );
      }

      /*
       * Restore festival.
       */

      if (
        parsed.selectedFestivalId
      ) {
        const savedFestival =
          festivals.find(
            (festival) =>
              festival.id ===
              parsed.selectedFestivalId,
          );

        if (savedFestival) {
          setSelectedFestival(
            savedFestival,
          );
        }
      }

      /*
       * Restore reminders.
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
       * Restore equipment.
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
    } catch (error) {
      console.error(
        "Could not restore Festive Ready state:",
        error,
      );
    } finally {
      setStorageReady(true);
    }
  }, []);

  /*
   * ============================================================
   * SAVE STATE
   * ============================================================
   */

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
  ]);

  /*
   * ACTIVE MEMBER
   */

  const activeMember =
    partyMembers.find(
      (member) =>
        member.id ===
        activeMemberId,
    ) ??
    partyMembers[0] ??
    mainProfile;

  /*
   * ACTIVE PHOTO
   */

  const standingPhoto =
    standingPhotos[
      activeMemberId
    ] ?? null;

  /*
   * OLD CUTOUT
   */

  const standingPhotoCutoutUrl =
    standingPhotoCutouts[
      activeMemberId
    ] ?? null;

  /*
   * ACTIVE VTO RESULT
   */

  const tryOnResult =
    tryOnResults[
      activeMemberId
    ] ?? null;

  /*
   * ACTIVE EQUIPMENT
   */

  const equippedItems =
    equipmentByMember[
      activeMemberId
    ] ?? {};

  /*
   * ============================================================
   * ADD MEMBER
   * ============================================================
   */

  const addMember = (
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) => {
    const cleanName =
      name.trim();

    if (
      !cleanName ||
      partyMembers.length >= 4
    ) {
      return;
    }

    const newMember: PartyMember = {
      id: `member-${Date.now()}`,

      name:
        cleanName,

      ageGroup,

      genderFit,

      /*
       * Contest default:
       * show all products immediately.
       */

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

    /*
     * Empty equipment for new member.
     */

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
  };

  /*
   * ============================================================
   * UPDATE PREFERENCES
   * ============================================================
   */

  const updatePreference = (
    preference:
      StylePreference,
  ) => {
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
  };

  /*
   * ============================================================
   * EQUIP
   * ============================================================
   *
   * One item per slot.
   */

  const equipItem = (
    item: EquippedItem,
  ) => {
    setEquipmentByMember(
      (current) => {
        const currentMemberEquipment =
          current[
            activeMemberId
          ] ?? {};

        return {
          ...current,

          [activeMemberId]: {
            ...currentMemberEquipment,

            [item.slot]:
              item,
          },
        };
      },
    );
  };

  /*
   * REMOVE EQUIPPED ITEM
   */

  const unequipSlot = (
    slot: EquipmentSlot,
  ) => {
    setEquipmentByMember(
      (current) => {
        const currentMemberEquipment =
          current[
            activeMemberId
          ] ?? {};

        const nextMemberEquipment =
          {
            ...currentMemberEquipment,
          };

        delete nextMemberEquipment[
          slot
        ];

        return {
          ...current,

          [activeMemberId]:
            nextMemberEquipment,
        };
      },
    );
  };

  /*
   * CHECK EQUIPPED
   */

  const isItemEquipped = (
    itemId: string,
  ) => {
    return Object.values(
      equippedItems,
    ).some(
      (item) =>
        item?.id ===
        itemId,
    );
  };

  /*
   * ============================================================
   * SET STANDING PHOTO
   * ============================================================
   */

  const setStandingPhoto = (
    file: File | null,
  ) => {
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
     * Clear old cutout.
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

    /*
     * New photo = clear old VTO.
     */

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
  };

  /*
   * OLD CUTOUT SETTER
   */

  const setStandingPhotoCutoutUrl =
    (
      url: string | null,
    ) => {
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
    };

  /*
   * ============================================================
   * SET VTO RESULT
   * ============================================================
   */

  const setTryOnResult = (
    result:
      | VirtualTryOnResult
      | null,
  ) => {
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
  };

  /*
   * FESTIVAL REMINDER
   */

  const toggleReminder = (
    festivalId: string,
  ) => {
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
  };

  /*
   * PROVIDER
   */

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

        addMember,

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

/*
 * HOOK
 */

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