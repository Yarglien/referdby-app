import { useToast } from "@/hooks/use-toast";

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-4 relative">
        {children}
      </div>
    </div>
  );
};