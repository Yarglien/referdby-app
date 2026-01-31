
import { Settings, Utensils, Image, Clock, Calendar, Share2, Users, Cog, Dice6, QrCode, Gamepad } from "lucide-react";

export const managementButtons = [
  { icon: Settings, label: "Restaurant Details", path: "/restaurant-details", nextPath: "/restaurant-amenities" },
  { icon: Utensils, label: "Restaurant Amenities", path: "/restaurant-amenities", nextPath: "/restaurant-images" },
  { icon: Image, label: "Restaurant Images", path: "/restaurant-images", nextPath: "/opening-hours" },
  { icon: Clock, label: "Opening Hours", path: "/opening-hours", nextPath: "/redemption-schedule" },
  { icon: Calendar, label: "Redemption Profiles", path: "/redemption-schedule", nextPath: "/server-administration" },
  { icon: Cog, label: "Server Administration", path: "/server-administration", nextPath: "/restaurant-manager" },
];

export const commonButtons = [
  { icon: Share2, label: "Active Referrals", path: "/active-referrals" },
  { icon: Users, label: "Active Redeemers", path: "/active-redeemers" },
  { icon: QrCode, label: "Scan Customer Code", path: "/scan-customer-code" },
  { icon: Dice6, label: "Code for Roll for Meal", path: "/roll-token" },
  { icon: Gamepad, label: "Active Rollers", path: "/active-rollers" },
];
