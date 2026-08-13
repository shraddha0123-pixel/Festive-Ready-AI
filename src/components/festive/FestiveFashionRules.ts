export type FashionRule = {
  ageGroup: "adult" | "teen" | "kid";
  genderFit: "female" | "male" | "unisex";
  outfits: string[];
};


export const festiveFashionRules = {
  diwali: [
    {
      ageGroup: "adult",
      genderFit: "male",
      outfits: [
        "Kurta Pajama",
        "Nehru Jacket",
        "Sherwani",
        "Indo-Western",
        "Dhoti Kurta",
      ],
    },

    {
      ageGroup: "adult",
      genderFit: "female",
      outfits: [
        "Saree",
        "Lehenga",
        "Anarkali",
        "Salwar Suit",
        "Sharara",
        "Ghagra Choli",
      ],
    },

    {
      ageGroup: "teen",
      genderFit: "male",
      outfits: [
        "Trendy Kurta",
        "Festive Jacket",
        "Indo-Western",
      ],
    },

    {
      ageGroup: "teen",
      genderFit: "female",
      outfits: [
        "Fusion Wear",
        "Lehenga",
        "Anarkali",
        "Kurti Set",
      ],
    },

    {
      ageGroup: "kid",
      genderFit: "male",
      outfits: [
        "Mini Kurta Set",
        "Little Sherwani",
        "Dhoti Kurta",
      ],
    },

    {
      ageGroup: "kid",
      genderFit: "female",
      outfits: [
        "Lehenga Choli",
        "Ethnic Frock",
        "Mini Anarkali",
      ],
    },
  ],
};
export function getRecommendedOutfits(
  festivalId: string,
  ageGroup: "adult" | "teen" | "kid",
  genderFit: "female" | "male" | "unisex",
) {
  const festivalRules =
    festiveFashionRules[
      festivalId as keyof typeof festiveFashionRules
    ];

  if (!festivalRules) {
    return [];
  }

  const matchingRule = festivalRules.find(
    (rule) =>
      rule.ageGroup === ageGroup &&
      rule.genderFit === genderFit,
  );

  return matchingRule?.outfits ?? [];
}