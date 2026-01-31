
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TakeawayToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const TakeawayToggle = ({ value, onChange }: TakeawayToggleProps) => {
  return (
    <div className="flex items-center space-x-2 justify-start my-4">
      <Switch 
        id="takeaway-mode"
        checked={value} 
        onCheckedChange={onChange}
      />
      <Label htmlFor="takeaway-mode" className="text-primary">
        This is a takeaway order
      </Label>
    </div>
  );
};
