import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewMode } from "@/contexts/ViewModeContext";
import { Building2, User } from "lucide-react";

export const ViewModeSelector = () => {
  const { viewMode, setViewMode, canSwitchViews } = useViewMode();

  if (!canSwitchViews) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pt-safe-top border-b bg-background shrink-0">
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
      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-[calc(env(safe-area-inset-top,0px)+1rem+4.5rem)] shrink-0" aria-hidden />
    </>
  );
};