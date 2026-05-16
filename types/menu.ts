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

export interface WorkingHoursRow {
  days: string;
  hours: string;
}

export interface Venue {
  greeting: string;
  name: string;
  subtitle: string;
  status: string;
  hours: string;
  wifi: {
    networkName: string;
    password: string;
  };
  instagram: string;
  phone: string;
  workingHours: WorkingHoursRow[];
}

export interface MenuData {
  venue: Venue;
  branches: Branch[];
  items: MenuItem[];
}

export type Lang = "tr" | "en";
