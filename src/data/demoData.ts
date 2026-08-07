import { WardrobeItem } from "@/db/wardrobe.repository";

export interface DemoWishlistItem {
  id: number;
  title: string;
  imageUri: string;
  retailer: string;
  price: string;
  rawUrl: string;
}

export const DEMO_WARDROBE_ITEMS: (WardrobeItem & { title: string; demoWearCount: string; status: string; bg: string })[] = [
  {
    id: 1,
    title: "Linen Wrap Dress",
    imageUri: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=80",
    category: "Tops",
    dominantColor: "#C97B84",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: Date.now() - 86400000 * 5,
    demoWearCount: "3× this mo.",
    status: "Confirmed ✓",
    bg: "#F3DEE1",
  },
  {
    id: 2,
    title: "Knit Cardigan",
    imageUri: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80",
    category: "Tops",
    dominantColor: "#8FA377",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: Date.now() - 86400000 * 40,
    demoWearCount: "Resting 40d",
    status: "Resting 40d",
    bg: "#E4EADA",
  },
  {
    id: 3,
    title: "Chikankari Kurta",
    imageUri: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&auto=format&fit=crop&q=80",
    category: "Ethnic",
    dominantColor: "#E3A857",
    pattern: "embroidered",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: Date.now() - 86400000 * 2,
    demoWearCount: "5× this mo.",
    status: "Confirmed ✓",
    bg: "#FBEBD1",
  },
  {
    id: 4,
    title: "Suede Loafers",
    imageUri: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=500&auto=format&fit=crop&q=80",
    category: "Shoes",
    dominantColor: "#B79FD6",
    pattern: "solid",
    confidenceState: "needs_review",
    lifecycleState: "active",
    createdAt: Date.now() - 86400000 * 15,
    demoWearCount: "Needs a peek ⚠️",
    status: "Needs a peek ⚠️",
    bg: "#EEE6F5",
  },
  {
    id: 5,
    title: "Straight-Fit Denim",
    imageUri: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80",
    category: "Bottoms",
    dominantColor: "#4A3226",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: Date.now() - 86400000 * 3,
    demoWearCount: "4× this mo.",
    status: "Confirmed ✓",
    bg: "#F3E6D3",
  },
  {
    id: 6,
    title: "Classic Blazer",
    imageUri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80",
    category: "Tops",
    dominantColor: "#5F7A4C",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: Date.now() - 86400000 * 12,
    demoWearCount: "2× this mo.",
    status: "Confirmed ✓",
    bg: "#E4EADA",
  },
];

export const DEMO_WISHLIST_ITEMS: DemoWishlistItem[] = [
  {
    id: 101,
    title: "Straight-Fit Trousers",
    imageUri: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=80",
    retailer: "Myntra",
    price: "₹1,499",
    rawUrl: "https://www.myntra.com/trousers/101",
  },
  {
    id: 102,
    title: "Woven Tote Bag",
    imageUri: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=80",
    retailer: "Ajio",
    price: "₹899",
    rawUrl: "https://www.ajio.com/bag/102",
  },
];
