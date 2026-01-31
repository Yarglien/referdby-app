import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewMode } from "@/contexts/ViewModeContext";
import { Building2, User } from "lucide-react";

export const ViewModeSelector = () => {
  const { viewMode, setViewMode, canSwitchViews } = useViewMode();

  if (!canSwitchViews) {
    return null;
  }

  return (
    <div className="flex justify-center p-4 border-b bg-background">
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'restaurant' | 'personal')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="restaurant" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Restaurant
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};