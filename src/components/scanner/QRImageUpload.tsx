import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import QrScanner from 'qr-scanner';

interface QRImageUploadProps {
  onScan: (result: any) => void;
  disabled?: boolean;
}

export const QRImageUpload = ({ onScan, disabled = false }: QRImageUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Scan QR code from image
      const result = await QrScanner.scanImage(file);
      
      // Process the result in the same format as the camera scanner
      const formattedResult = [{
        rawValue: result
      }];
      
      onScan(formattedResult);
      toast.success('QR code detected successfully!');
      
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error('No QR code found in the image. Please try another image.');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload QR Code Image</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a screenshot or image of a QR code from social media
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={disabled || isProcessing}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          variant="outline"
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isProcessing ? 'Processing...' : 'Choose Image'}
        </Button>
      </div>

      {uploadedImage && (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Uploaded QR code"
            className="w-full max-w-sm mx-auto rounded-lg shadow-md"
          />
          <Button
            onClick={clearImage}
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};