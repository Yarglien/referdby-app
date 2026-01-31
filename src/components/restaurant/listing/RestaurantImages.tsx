import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RestaurantImagesProps {
  images: string[];
  currentImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
}

export const RestaurantImages = ({ 
  images, 
  currentImageIndex, 
  onPrevImage, 
  onNextImage 
}: RestaurantImagesProps) => {
  const currentImage = images[currentImageIndex];

  return (
    <div className="relative">
      <img
        src={currentImage}
        alt="Restaurant"
        className="w-full h-64 object-cover rounded-lg"
      />
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-between px-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={onPrevImage}
            className="bg-black/50 hover:bg-black/70"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onNextImage}
            className="bg-black/50 hover:bg-black/70"
          >
            <ArrowLeft className="h-4 w-4 text-white rotate-180" />
          </Button>
        </div>
      )}
    </div>
  );
};