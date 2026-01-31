
import { RestaurantNav } from "@/components/RestaurantNav";

export const BillEntryLoading = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Bill Entry</h1>
      </header>
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <RestaurantNav />
    </div>
  );
};
