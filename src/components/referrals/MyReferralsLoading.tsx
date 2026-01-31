
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { MyReferralsHeader } from "./MyReferralsHeader";

export const MyReferralsLoading = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <MyReferralsHeader />
      
      {/* Active Referrals Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Referrals</h2>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>

      {/* Used Referrals Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Used Referrals</h2>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
