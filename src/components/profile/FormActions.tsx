
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface FormActionsProps {
  onLogout: () => Promise<void>;
}

export const FormActions = ({ onLogout }: FormActionsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        type="submit" 
        className="bg-primary text-white w-auto"
      >
        {t('profile.saveChanges')}
      </Button>

      <Button 
        variant="destructive" 
        className="w-auto"
        type="button"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('=== LOGOUT BUTTON CLICKED ===');
          console.log('About to call onLogout function');
          try {
            await onLogout();
            console.log('onLogout completed successfully');
          } catch (error) {
            console.error('Error during logout:', error);
          }
        }}
      >
        {t('profile.logout')}
      </Button>

      <div className="pt-3">
        <Link to="/terms-and-conditions" className="text-secondary hover:underline">
          {t('profile.termsAndConditions')}
        </Link>
      </div>
    </div>
  );
};
