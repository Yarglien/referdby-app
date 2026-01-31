import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { RestaurantNav } from "@/components/RestaurantNav";

export const InvalidPoints = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b flex items-center gap-4">
        <Link to="/active-redeemers">
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold">Points Redemption</h1>
      </header>
      <main className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Cannot process redemption - unable to verify available points
          </AlertDescription>
        </Alert>
      </main>
      <RestaurantNav />
    </div>
  );
};