import {
  ClipboardList,
  HeartPulse,
  LayoutGrid,
  PlayCircle,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export const LANDING_SECTIONS = [
  { id: "hero", label: "Overview", icon: HeartPulse },
  { id: "how-it-works", label: "How it works", icon: ClipboardList },
  { id: "features", label: "Features", icon: LayoutGrid },
  { id: "showcase", label: "In action", icon: PlayCircle },
  { id: "get-started", label: "Start", icon: Rocket },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  icon: LucideIcon;
}>;

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]["id"];
