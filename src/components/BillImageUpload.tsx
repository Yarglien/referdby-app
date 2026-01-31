
import { Camera, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BillImageUploadProps {
  onImageSelected: (file: File) => void;
}

export const BillImageUpload = ({ onImageSelected }: BillImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'initial' | 'camera' | 'file'>('initial');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraClick = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setMode('camera');
      cameraInputRef.current?.click();
    } catch (error) {
      toast.error("Unable to access camera. Please check your camera permissions.");
    }
  };

  const handleFileClick = () => {
    setMode('file');
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onImageSelected(selectedImage);
      toast.success("Bill image uploaded successfully");
    }
  };

  const handleRetake = () => {
    if (mode === 'camera') {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const resetSelection = () => {
    setMode('initial');
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        ref={cameraInputRef}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      
      {previewUrl ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg font-semibold text-center">
            Review Bill Image
          </div>
          <img 
            src={previewUrl} 
            alt="Bill preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRetake}
            >
              Retake Photo
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleConfirm}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Confirm & Upload
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={resetSelection}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleCameraClick}
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-lg border border-input bg-background hover:bg-accent/10 transition-colors w-full"
          >
            <Camera className="w-5 h-5" />
            <div className="flex flex-col items-center">
              <span className="font-medium">Take Photo</span>
              <span className="text-sm text-muted-foreground">Use your camera</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={handleFileClick}
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-lg border border-input bg-background hover:bg-accent/10 transition-colors w-full"
          >
            <Upload className="w-5 h-5" />
            <div className="flex flex-col items-center">
              <span className="font-medium">Upload File</span>
              <span className="text-sm text-muted-foreground">Choose from gallery</span>
            </div>
          </button>
          
          <span className="text-sm text-muted-foreground text-center mt-2">
            Upload a clear photo of the bill
          </span>
        </div>
      )}
    </div>
  );
};
