
import { RestaurantNav } from "@/components/RestaurantNav";

export const NoReferralState = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Bill Entry</h1>
      </header>
      <main className="p-4">
        <div className="text-center text-muted-foreground">
          No referral data found. Please select a referral from the active referrals list.
        </div>
      </main>
      <RestaurantNav />
    </div>
  );
};
