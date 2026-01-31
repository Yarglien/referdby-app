
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { RestaurantNav } from "@/components/RestaurantNav";

export const RedeemLoading = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b flex items-center gap-4">
        <Link to="/active-redeemers">
          <ArrowLeft className="w-6 h-6 text-primary hover:text-primary/80 transition-colors" />
        </Link>
        <h1 className="text-2xl font-bold">Points Redemption</h1>
      </header>
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <RestaurantNav />
    </div>
  );
};
