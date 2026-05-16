export interface BilingualText {
  name: string;
  desc?: string | null;
}

export interface MenuItem {
  id: string;
  cat: string;
  price: number;
  tr: BilingualText;
  en: BilingualText;
  badge?: string;
  hue?: number;
  image?: string | null;
  section?: string;
}

export interface BranchCategory {
  id: string;
  tr: string;
  en: string;
  emoji?: string;
  colorHue: number;
}

export interface Branch {
  id: string;
  tr: string;
  en: string;
  comingSoon: boolean;
  colorHue: number;
  catIds: string[];
  categories: BranchCategory[];
}

export interface MenuMeta {
  name: string;
  tagline: { tr: string; en: string };
  wifi: { name: string; pass: string };
  instagram: string;
  phone: string;
}

export interface MenuData {
  meta: MenuMeta;
  branches: Branch[];
  items: MenuItem[];
}

export type Lang = "tr" | "en";
