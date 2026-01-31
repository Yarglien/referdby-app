
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Star, Users, MapPin } from "lucide-react";

interface UserOnboardingCarouselProps {
  onComplete: () => void;
}

export const UserOnboardingCarousel = ({ onComplete }: UserOnboardingCarouselProps) => {
  const randomInitialSlide = Math.floor(Math.random() * 3);
  const [currentSlide, setCurrentSlide] = useState(randomInitialSlide);

  const slides = [
    {
      title: "Earn Points When you Eat out",
      subtitle: "Points mean cheaper meals in future",
      icon: Star
    },
    {
      title: "Learn where the locals eat",
      subtitle: "Get Referred to the best places in town by people you trust",
      icon: MapPin
    },
    {
      title: "Invite Others to the Network",
      subtitle: "Invite anyone, friends, family, guests, work colleagues or even your favourite local restaurant - every time they use ReferedBy you earn points",
      icon: Users
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <Carousel 
          className="w-full"
          opts={{
            startIndex: randomInitialSlide,
            align: 'start'
          }}
          setApi={(api) => {
            api?.on('select', () => {
              setCurrentSlide(api.selectedScrollSnap());
            });
          }}
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="flex flex-col items-center justify-between min-h-[400px] p-6">
                <div className="space-y-6 text-center">
                  <h2 className="text-2xl font-bold text-primary">{slide.title}</h2>
                  <p className="text-lg text-muted-foreground">{slide.subtitle}</p>
                </div>
                <slide.icon className="w-32 h-32 text-primary mt-6" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-4 mt-6">
            <CarouselPrevious />
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <CarouselNext />
          </div>
        </Carousel>
        <div className="flex justify-center mt-6">
          <Button onClick={onComplete}>Skip</Button>
        </div>
      </div>
    </div>
  );
};
