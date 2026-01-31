
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Store } from "lucide-react";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export const OnboardingCarousel = ({ onComplete }: OnboardingCarouselProps) => {
  const randomInitialSlide = Math.floor(Math.random() * 3);
  const [currentSlide, setCurrentSlide] = useState(randomInitialSlide);

  const slides = [
    {
      title: "Welcome To ReferdBy",
      subtitle: "A proven driver of increased traffic to your restaurant",
      points: [
        "Access new customers",
        "Reward those who drive business to your restaurant",
        "Increase business on slow days"
      ],
      icon: Users
    },
    {
      title: "Drive up your Digital Footprint",
      subtitle: "Rewarding Repeat Customers",
      icon: TrendingUp
    },
    {
      title: "Stand out from the Chains",
      subtitle: "Let people know where the locals eat",
      icon: Store
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
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
                  {slide.points && (
                    <ul className="space-y-2 text-left">
                      {slide.points.map((point, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <slide.icon className="w-32 h-32 text-primary mt-6" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center gap-4">
            <CarouselPrevious className="relative left-0 translate-y-0" />
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
            <CarouselNext className="relative right-0 translate-y-0" />
          </div>
        </Carousel>
        <div className="flex justify-center mt-6">
          <Button onClick={onComplete} variant="default">Skip</Button>
        </div>
      </div>
    </div>
  );
};
