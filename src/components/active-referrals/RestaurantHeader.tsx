
interface RestaurantHeaderProps {
  name: string | undefined;
  photo?: string;
}

export const RestaurantHeader = ({ name, photo }: RestaurantHeaderProps) => {
  return (
    <div className="flex flex-col items-center p-6 border-b">
      {photo ? (
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
          <img 
            src={photo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-3xl text-primary">
            {name ? name.substring(0, 2).toUpperCase() : ''}
          </span>
        </div>
      )}
      <h2 className="text-xl font-semibold text-primary">
        {name || 'Loading...'}
      </h2>
    </div>
  );
};
