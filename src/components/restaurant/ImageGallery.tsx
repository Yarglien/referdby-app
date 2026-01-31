import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  onDeleteImage?: (photoUrl: string) => void;
  isEditable?: boolean;
}

export const ImageGallery = ({ images, onDeleteImage, isEditable = false }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images.length) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Current Photos</h2>
      <div className="relative">
        <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
          <img
            src={images[currentIndex]}
            alt={`Restaurant photo ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          {isEditable && onDeleteImage && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onDeleteImage(images[currentIndex])}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </>
        )}
        
        {images.length > 1 && (
          <div className="flex justify-center mt-2 space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};