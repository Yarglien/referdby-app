
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const RedeemHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 flex items-center gap-4 border-b">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate(-1)}
        className="text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>
      <h1 className="text-xl font-semibold">Redeem Points</h1>
    </div>
  );
};
