
import { Link } from "react-router-dom";
import { ArrowLeft, Dice6 } from "lucide-react";

export const ActiveRollersHeader = () => {
  return (
    <>
      <header className="p-4 border-b flex items-center gap-4">
        <Link 
          to="/restaurant-manager"
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Active Roll Tokens</h1>
      </header>

      <div className="flex items-center gap-2 px-4 mt-4 mb-2">
        <Dice6 className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Roll for Meal Tokens</h2>
      </div>
    </>
  );
};
