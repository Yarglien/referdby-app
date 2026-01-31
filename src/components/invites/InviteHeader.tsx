
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const InviteHeader = () => {
  const navigate = useNavigate();
  const { data: profile } = useCurrentUser();
  
  const handleBackClick = () => {
    // Navigate to appropriate home page based on user role
    switch (profile?.role) {
      case 'manager':
        navigate('/restaurant-manager');
        break;
      case 'server':
        navigate('/server-home');
        break;
      default:
        navigate('/');
    }
  };
  
  return (
    <div className="p-4 flex items-center gap-4 border-b">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleBackClick}
        className="!w-14 !h-14 text-primary hover:text-primary/80 transition-colors flex items-center justify-center"
      >
        <ArrowLeft className="!w-10 !h-10" />
      </Button>
      <h1 className="text-xl font-semibold">Invite User or Restaurant</h1>
    </div>
  );
};
