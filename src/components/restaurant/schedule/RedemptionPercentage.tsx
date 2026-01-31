
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface RedemptionPercentageProps {
  initialPercentage: number;
  onChange: (value: number) => void;
}

export const RedemptionPercentage = ({ initialPercentage, onChange }: RedemptionPercentageProps) => {
  const [percentage, setPercentage] = useState<number>(initialPercentage);

  const handleChange = (values: number[]) => {
    const newValue = values[0];
    setPercentage(newValue);
    onChange(newValue);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-xl font-medium">Maximum Bill Redemption</h2>
      <p className="text-muted-foreground">
        Set the maximum percentage of a bill that customers can pay with points.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Maximum percentage: {percentage}%</Label>
          </div>
          <Slider
            value={[percentage]}
            min={25}
            max={100}
            step={5}
            onValueChange={handleChange}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
