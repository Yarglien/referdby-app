
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PhotoRequirementToggleProps {
  restaurantId: string;
}

export const PhotoRequirementToggle = ({ restaurantId }: PhotoRequirementToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant-photo-setting', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('require_bill_photos')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId
  });

  const handleToggle = async (requirePhotos: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ require_bill_photos: requirePhotos })
        .eq('id', restaurantId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['restaurant-photo-setting', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['manager-restaurant'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      
      toast.success(`Photo requirement ${requirePhotos ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating photo requirement:', error);
      toast.error("Failed to update photo requirement");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bill Photo Requirement</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const requirePhotos = restaurant?.require_bill_photos ?? true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill Photo Requirement</CardTitle>
        <CardDescription>
          Control whether photos are required when processing bills and redemptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="photo-requirement">Require Bill Photos</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, staff must upload a photo when processing bills or redemptions
            </p>
          </div>
          <Switch
            id="photo-requirement"
            checked={requirePhotos}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Current Setting:</p>
          <p className="flex items-center gap-2">
            {requirePhotos ? (
              <>
                <Check className="h-4 w-4 text-primary" />
                Photos are required for all bill processing and redemptions
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-destructive" />
                Photos are optional for bill processing and redemptions
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
