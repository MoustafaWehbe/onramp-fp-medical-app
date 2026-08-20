import {
  ClipboardList,
  HeartPulse,
  LayoutGrid,
  PlayCircle,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export const LANDING_SECTIONS = [
  { id: "hero", label: "landing.overview", icon: HeartPulse },
  { id: "how-it-works", label: "landing.howItWorksNav", icon: ClipboardList },
  { id: "features", label: "landing.featuresNav", icon: LayoutGrid },
  { id: "showcase", label: "landing.inActionNav", icon: PlayCircle },
  { id: "get-started", label: "landing.startNav", icon: Rocket },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  icon: LucideIcon;
}>;

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]["id"];
