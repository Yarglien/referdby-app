
interface ServerHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
  restaurantPhoto?: string;
  restaurantName?: string;
}

export const ServerHeader = ({ 
  firstName, 
  lastName, 
  restaurantPhoto, 
  restaurantName 
}: ServerHeaderProps) => {
  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Welcome to ReferdBy</h1>
      </div>

      <div className="space-y-4">
        {restaurantPhoto && (
          <div className="w-full max-w-md h-40 rounded-lg overflow-hidden mx-auto">
            <img 
              src={restaurantPhoto} 
              alt={restaurantName || "Restaurant"} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h2 className="text-xl font-semibold text-primary">
          {restaurantName || "No restaurant found"}
        </h2>
        <p className="text-muted-foreground">
          {firstName} {lastName}
        </p>
      </div>
    </div>
  );
};
