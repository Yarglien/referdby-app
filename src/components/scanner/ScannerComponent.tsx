import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScannerComponentProps {
  onScan: (result: any) => void;
  scanning: boolean;
}

export const ScannerComponent = ({ onScan, scanning }: ScannerComponentProps) => {
  const isMobile = useIsMobile();
  const scannerHeight = isMobile ? 300 : 500;
  
  if (!scanning) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="text-center">
          <p className="text-lg mb-4">Processing scan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card">
      <div className={`${isMobile ? "" : "max-w-2xl mx-auto"} relative`}>
        {/* Scanner with finder disabled - we use custom overlay */}
        <Scanner
          onScan={(result) => {
            try {
              onScan(result);
            } catch (error) {
              console.error('Scanner error:', error);
              toast.error("Scanner error occurred. Please try again.");
            }
          }}
          styles={{ 
            container: { 
              borderRadius: '0.5rem',
              width: '100%', 
              height: `${scannerHeight}px`,
              background: 'transparent',
              position: 'relative',
              overflow: 'hidden'
            },
            video: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              background: 'transparent'
            }
          }}
          components={{
            finder: false
          }}
          constraints={{
            facingMode: isMobile ? 'environment' : undefined
          }}
        />
        
        {/* Custom finder overlay that aligns with camera view */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: '0.5rem', overflow: 'hidden' }}
        >
          {/* Corner borders - red finder box */}
          <div className="absolute inset-4">
            {/* Top-left corner */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500" />
            {/* Top-right corner */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500" />
            {/* Bottom-left corner */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500" />
            {/* Bottom-right corner */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
