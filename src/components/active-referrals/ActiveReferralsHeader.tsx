
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ActiveReferralsHeaderProps {
  backPath: string;
}

export const ActiveReferralsHeader = ({ backPath }: ActiveReferralsHeaderProps) => {
  return (
    <header className="p-4 border-b flex items-center gap-4">
      <Link 
        to={backPath}
        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-bold"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>
      <h1 className="text-2xl font-bold">Active Referrals</h1>
    </header>
  );
};
