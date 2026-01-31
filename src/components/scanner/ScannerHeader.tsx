
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScannerHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const ScannerHeader = ({ 
  title = "Scan Customer Code", 
  showBackButton = true,
  onBack
}: ScannerHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="p-4 flex items-center gap-4 border-b">
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="text-primary hover:text-primary/80 transition-colors w-10 h-10 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      )}
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
};
