
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SettingsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="p-4 border-b flex justify-between items-center bg-background">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>
    </header>
  );
};
