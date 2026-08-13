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

import lehenga from "@/assets/item-lehenga.jpg";
import necklace from "@/assets/item-necklace.jpg";
import earrings from "@/assets/item-earrings.jpg";
import juttis from "@/assets/item-juttis.jpg";


export type SlotKey =
  | "outfit"
  | "necklace"
  | "earrings"
  | "bangles"
  | "ring"
  | "shoes"
  | "accessory";


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
    equipped: "Emerald Zari Lehenga",
  },
  {
    key: "necklace",
    label: "Necklace",
    icon: Gem,
    equipped: "Kundan Ruby Haar",
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


export const categories = [
  "Outfits",
  "Jewellery",
  "Shoes",
  "Accessories",
] as const;

export type Category = (typeof categories)[number];


export type Item = {
  id: string;
  name: string;
  price: string;
  rarity: string;
  category: Category;
  image: string;
  equipped?: boolean;
};


export const items: Item[] = [
  {
    id: "1",
    name: "Emerald Zari Lehenga",
    price: "₹18,400",
    rarity: "Legendary",
    category: "Outfits",
    image: lehenga,
    equipped: true,
  },
  {
    id: "2",
    name: "Kundan Ruby Haar",
    price: "₹9,250",
    rarity: "Epic",
    category: "Jewellery",
    image: necklace,
    equipped: true,
  },
  {
    id: "3",
    name: "Pearl Jhumka Drops",
    price: "₹3,600",
    rarity: "Rare",
    category: "Jewellery",
    image: earrings,
  },
  {
    id: "4",
    name: "Marigold Silk Juttis",
    price: "₹2,180",
    rarity: "Rare",
    category: "Shoes",
    image: juttis,
  },

  {
    id: "5",
    name: "Royal Silk Kurta",
    price: "₹6,800",
    rarity: "Epic",
    category: "Outfits",
    image: lehenga,
  },
  {
    id: "6",
    name: "Classic Sherwani",
    price: "₹15,500",
    rarity: "Legendary",
    category: "Outfits",
    image: lehenga,
  },
  {
    id: "7",
    name: "Royal Banarasi Saree",
    price: "₹12,900",
    rarity: "Epic",
    category: "Outfits",
    image: lehenga,
  },
  {
    id: "8",
    name: "Ruby Anarkali Suit",
    price: "₹8,400",
    rarity: "Rare",
    category: "Outfits",
    image: lehenga,
  },
  {
    id: "9",
    name: "Kids Mini Kurta Set",
    price: "₹3,200",
    rarity: "Rare",
    category: "Outfits",
    image: lehenga,
  },
  {
    id: "10",
    name: "Kids Lehenga Choli",
    price: "₹4,500",
    rarity: "Rare",
    category: "Outfits",
    image: lehenga,
  },
];