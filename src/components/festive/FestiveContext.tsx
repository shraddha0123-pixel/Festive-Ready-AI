import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";


export type AgeGroup = "adult" | "teen" | "kid";


export type GenderFit =
  | "female"
  | "male"
  | "unisex";


// NEW: Personal styling preferences
export type StylePreference = {
  budget: number;
  color: string;
  style: string;
};


export type PartyMember = {
  id: string;
  name: string;
  ageGroup?: AgeGroup;
  genderFit?: GenderFit;
  isMainProfile?: boolean;

  // YouCam person photo later
  photoUrl?: string;

  // NEW: Each family member gets their own preferences
  preference?: StylePreference;
};


export type Festival = {
  id: string;
  name: string;
  date: string;
  emoji: string;
  tagline: string;
};


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


const defaultPreference: StylePreference = {
  budget: 40000,
  color: "Gold & Green",
  style: "Royal Traditional",
};


const mainProfile: PartyMember = {
  id: "me",
  name: "My Look",
  isMainProfile: true,

  preference: defaultPreference,
};


type FestiveContextValue = {
  partyMembers: PartyMember[];
  activeMemberId: string;
  activeMember: PartyMember;

  selectedFestival: Festival;
  reminders: string[];

  addMember: (
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) => void;

  setActiveMemberId: (id: string) => void;

  setSelectedFestival: (
    festival: Festival,
  ) => void;

  toggleReminder: (
    festivalId: string,
  ) => void;

  // NEW: Update selected person's preferences
  updatePreference: (
    preference: StylePreference,
  ) => void;
};


const FestiveContext =
  createContext<FestiveContextValue | null>(
    null,
  );


export function FestiveProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [partyMembers, setPartyMembers] =
    useState<PartyMember[]>([
      mainProfile,
    ]);


  const [activeMemberId, setActiveMemberId] =
    useState(mainProfile.id);


  const [
    selectedFestival,
    setSelectedFestival,
  ] = useState<Festival>(
    festivals[0]!,
  );


  const [reminders, setReminders] =
    useState<string[]>([]);


  const activeMember =
    partyMembers.find(
      (member) =>
        member.id === activeMemberId,
    ) ?? mainProfile;



  const addMember = (
    name: string,
    ageGroup: AgeGroup,
    genderFit: GenderFit,
  ) => {

    const cleanName = name.trim();


    if (
      !cleanName ||
      partyMembers.length >= 4
    ) {
      return;
    }


    const newMember: PartyMember = {
      id: `member-${Date.now()}`,
      name: cleanName,
      ageGroup,
      genderFit,

      preference: {
        budget:
          ageGroup === "kid"
            ? 8000
            : 20000,

        color:
          ageGroup === "kid"
            ? "Bright Colours"
            : "Classic Gold",

        style:
          ageGroup === "kid"
            ? "Cute Traditional"
            : "Elegant Festive",
      },
    };


    setPartyMembers((current) => [
      ...current,
      newMember,
    ]);


    setActiveMemberId(
      newMember.id,
    );
  };



  const updatePreference = (
    preference: StylePreference,
  ) => {

    setPartyMembers((current) =>
      current.map((member) =>
        member.id === activeMemberId
          ? {
              ...member,
              preference,
            }
          : member,
      ),
    );
  };



  const toggleReminder = (
    festivalId: string,
  ) => {

    setReminders((current) => {

      if (
        current.includes(festivalId)
      ) {

        return current.filter(
          (id) =>
            id !== festivalId,
        );

      }


      return [
        ...current,
        festivalId,
      ];

    });

  };



  const value: FestiveContextValue = {

    partyMembers,

    activeMemberId,

    activeMember,

    selectedFestival,

    reminders,

    addMember,

    setActiveMemberId,

    setSelectedFestival,

    toggleReminder,

    updatePreference,

  };



  return (
    <FestiveContext.Provider
      value={value}
    >
      {children}
    </FestiveContext.Provider>
  );

}



export function useFestive() {

  const context =
    useContext(FestiveContext);


  if (!context) {

    throw new Error(
      "useFestive must be used inside FestiveProvider",
    );

  }


  return context;

}