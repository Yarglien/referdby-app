import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  maxImages: number;
  currentImagesCount: number;
}

export const ImageUploader = ({ onImagesSelected, maxImages, currentImagesCount }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = currentImagesCount + files.length;
    
    if (totalImages > maxImages) {
      toast.error(t('restaurant.maxImagesWarning', { maxImages }));
      return;
    }
    onImagesSelected(files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const totalImages = currentImagesCount + files.length;
    
    if (totalImages > maxImages) {
      toast.error(t('restaurant.maxImagesWarning', { maxImages }));
      return;
    }
    onImagesSelected(files);
  };

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      toast.info(t('restaurant.cameraComingSoon'));
    } catch (error) {
      toast.error(t('restaurant.cameraNotAvailable'));
    }
  };

  return (
    <div
      className="border-2 border-dashed border-input rounded-lg p-8 text-center space-y-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Upload className="h-4 w-4 mr-2" />
          {t('restaurant.uploadPhotos')}
        </Button>
        <Button
          onClick={handleTakePhoto}
          variant="secondary"
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Camera className="h-4 w-4 mr-2" />
          {t('restaurant.takePhoto')}
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
      />
    </div>
  );
};