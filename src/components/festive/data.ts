import {
  Circle,
  CircleDot,
  Crown,
  Footprints,
  Gem,
  Shirt,
  Sparkle,
  type LucideIcon,
} from "lucide-react";

import necklace from "@/assets/item-necklace.jpg";
import earrings from "@/assets/item-earrings.jpg";
import juttis from "@/assets/item-juttis.jpg";

/*
 * WOMEN
 */

import banarasiLehenga from "@/assets/outfits/banarasi-lehenga.jpg";
import yellowBollywoodLehenga from "@/assets/outfits/yellow-bollywood-lehenga.jpg";
import blushEmbroideredLehenga from "@/assets/outfits/blush-embroidered-lehenga.jpg";
import pinkSalwarKameez from "@/assets/outfits/pink-salwar-kameez.jpg";
import raniPinkPaithaniSaree from "@/assets/outfits/rani-pink-paithani-saree.jpg";
import kanjivaramSoftSilkSaree from "@/assets/outfits/kanjivaram-soft-silk-saree.jpg";

/*
 * MEN
 */

import sonishaKurtaPajama from "@/assets/outfits/sonisha-kurta-pajama.jpg";
import kisahIndowesternSherwani from "@/assets/outfits/kisah-indowestern-sherwani.jpg";
import proEthicIndoWestern from "@/assets/outfits/pro-ethic-indo-western.jpg";

/*
 * KIDS
 */

import kidsRedGoldLehenga from "@/assets/outfits/kids-red-gold-lehenga.jpg";

/*
 * EQUIPMENT
 */

export type SlotKey =
  | "outfit"
  | "necklace"
  | "earrings"
  | "bangles"
  | "ring"
  | "shoes"
  | "accessory";

export type ProductGenderFit =
  | "female"
  | "male"
  | "unisex";

export type ProductAgeGroup =
  | "adult"
  | "teen"
  | "kid";

export const slots: {
  key: SlotKey;
  label: string;
  icon: LucideIcon;
  equipped?: string;
}[] = [
  {
    key: "outfit",
    label: "Outfit",
    icon: Shirt,
  },
  {
    key: "necklace",
    label: "Necklace",
    icon: Gem,
  },
  {
    key: "earrings",
    label: "Earrings",
    icon: Sparkle,
  },
  {
    key: "bangles",
    label: "Bangles",
    icon: Circle,
  },
  {
    key: "ring",
    label: "Ring",
    icon: CircleDot,
  },
  {
    key: "shoes",
    label: "Shoes",
    icon: Footprints,
  },
  {
    key: "accessory",
    label: "Accessory",
    icon: Crown,
  },
];

/*
 * CATEGORIES
 */

export const categories = [
  "Outfits",
  "Jewellery",
  "Shoes",
  "Accessories",
] as const;

export type Category =
  (typeof categories)[number];

/*
 * PRODUCT
 */

export type Item = {
  id: string;
  name: string;
  price: string;
  rarity: string;

  category: Category;
  slot: SlotKey;

  image: string;

  tryOnImage?: string;

  productUrl?: string;

  genderFit?: ProductGenderFit;

  ageGroup?: ProductAgeGroup;

  equipped?: boolean;
};

/*
 * PRODUCTS
 */

export const items: Item[] = [
  /*
   * ============================================================
   * WOMEN — ADULT
   * ============================================================
   */

  {
    id: "banarasi-lehenga",

    name: "Banarasi Partywear Lehenga",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "adult",

    image: banarasiLehenga,

    tryOnImage: banarasiLehenga,

    productUrl:
      "https://www.amazon.com/dp/B0F3XMX7MS?tag=festivereadya-20",
  },

  {
    id: "yellow-bollywood-lehenga",

    name: "Yellow Bollywood Wedding Lehenga",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "adult",

    image: yellowBollywoodLehenga,

    tryOnImage: yellowBollywoodLehenga,

    productUrl:
      "https://www.amazon.com/dp/B0H4M89C8C?tag=festivereadya-20",
  },

  {
    id: "blush-embroidered-lehenga",

    name: "Blush Embroidered Lehenga Choli",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "adult",

    image: blushEmbroideredLehenga,

    tryOnImage: blushEmbroideredLehenga,

    productUrl:
      "https://www.amazon.com/dp/B0GL7PTH8V?tag=festivereadya-20",
  },

  {
    id: "pink-salwar-kameez",

    name: "Pink Designer Salwar Kameez",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "adult",

    image: pinkSalwarKameez,

    tryOnImage: pinkSalwarKameez,

    productUrl:
      "https://www.amazon.com/dp/B0C4Z3Q8ZT?tag=festivereadya-20",
  },

  {
    id: "rani-pink-paithani-saree",

    name: "Rani Pink Paithani Silk Saree",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "adult",

    image: raniPinkPaithaniSaree,

    tryOnImage: raniPinkPaithaniSaree,

    productUrl:
      "https://www.amazon.com/dp/B0C4TMZPHV?tag=festivereadya-20",
  },

  {
    id: "kanjivaram-soft-silk-saree",

    name: "Kanjivaram Soft Silk Saree",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "adult",

    image: kanjivaramSoftSilkSaree,

    tryOnImage: kanjivaramSoftSilkSaree,

    productUrl:
      "https://www.amazon.com/dp/B0D4MFXZBY?tag=festivereadya-20",
  },

  /*
   * ============================================================
   * MEN — ADULT
   * ============================================================
   */

  {
    id: "sonisha-kurta-pajama",

    name: "Sonisha Traditional Kurta Pajama",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "male",

    ageGroup: "adult",

    image: sonishaKurtaPajama,

    tryOnImage: sonishaKurtaPajama,

    productUrl:
      "https://www.amazon.com/dp/B0B579QNDM?tag=festivereadya-20",
  },

  {
    id: "kisah-indowestern-sherwani",

    name: "KISAH Indo-Western Sherwani",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "male",

    ageGroup: "adult",

    image: kisahIndowesternSherwani,

    tryOnImage: kisahIndowesternSherwani,

    productUrl:
      "https://www.amazon.com/dp/B0CD2HWXQ1?tag=festivereadya-20",
  },

  {
    id: "pro-ethic-indo-western",

    name: "Pro Ethic Indo-Western Kurta Set",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "male",

    ageGroup: "adult",

    image: proEthicIndoWestern,

    tryOnImage: proEthicIndoWestern,

    productUrl:
      "https://www.amazon.com/dp/B0GCNJNY9F?tag=festivereadya-20",
  },

  /*
   * ============================================================
   * KIDS — FEMALE
   * ============================================================
   */

  {
    id: "kids-red-gold-lehenga",

    name: "Red Gold Kids Lehenga Choli",

    price: "See Amazon Price",

    rarity: "Featured",

    category: "Outfits",

    slot: "outfit",

    genderFit: "female",

    ageGroup: "kid",

    image: kidsRedGoldLehenga,

    /*
     * Intentionally no tryOnImage yet.
     *
     * We will enable kid VTO only after
     * confirming it works safely with YouCam.
     */

    productUrl:
      "https://www.amazon.com/dp/B0BPHV9R38?tag=festivereadya-20",
  },

  /*
   * ============================================================
   * TEMP JEWELLERY / SHOES
   * ============================================================
   */

  {
    id: "2",

    name: "Kundan Ruby Haar",

    price: "₹9,250",

    rarity: "Epic",

    category: "Jewellery",

    slot: "necklace",

    image: necklace,
  },

  {
    id: "3",

    name: "Pearl Jhumka Drops",

    price: "₹3,600",

    rarity: "Rare",

    category: "Jewellery",

    slot: "earrings",

    image: earrings,
  },

  {
    id: "4",

    name: "Marigold Silk Juttis",

    price: "₹2,180",

    rarity: "Rare",

    category: "Shoes",

    slot: "shoes",

    image: juttis,
  },
];