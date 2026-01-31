import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReferralAvatarProps {
  imageUrl?: string;
  fallbackText: string;
  size?: "sm" | "md" | "lg";
}

export const ReferralAvatar = ({ 
  imageUrl, 
  fallbackText,
  size = "md" 
}: ReferralAvatarProps) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }[size];

  return (
    <Avatar className={sizeClass}>
      <AvatarImage
        src={imageUrl}
        alt={fallbackText}
      />
      <AvatarFallback>
        {fallbackText?.substring(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};