import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RestaurantNav } from "@/components/RestaurantNav";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ImageUploader } from "@/components/restaurant/ImageUploader";
import { ImageGallery } from "@/components/restaurant/ImageGallery";
import { resizeImage } from "@/utils/imageUtils";
import { useTranslation } from 'react-i18next';

const RestaurantImages = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const MAX_IMAGES = 10;
  const { t } = useTranslation();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });

  useEffect(() => {
    // Only redirect if we have definitely loaded the profile and it's invalid
    if (profile === null) {
      console.log('No profile found, redirecting to auth');
      navigate('/auth');
    } else if (profile && profile.role !== 'manager') {
      console.log('User is not a manager, redirecting to home');
      navigate('/');
    }
    // Don't redirect if profile is still undefined (loading)
  }, [profile, navigate]);

  const { data: restaurant, refetch } = useQuery({
    queryKey: ['restaurant'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('manager_id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleImagesSelected = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      if (!restaurant) return;
      
      const updatedPhotos = restaurant.photos?.filter(photo => photo !== photoUrl) || [];
      
      const { error } = await supabase
        .from('restaurants')
        .update({ photos: updatedPhotos })
        .eq('id', restaurant.id);

      if (error) throw error;
      
      toast.success(t('restaurant.photoDeletedSuccess'));
      refetch();
    } catch (error) {
      toast.error(t('restaurant.failedToDeletePhoto'));
      console.error("Delete photo error:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (!restaurant) return;

      // If no new images, just navigate to next step
      if (!images.length) {
        navigate("/opening-hours");
        return;
      }

      // Resize images before converting to base64
      const resizedImagePromises = images.map(async (file) => {
        const resizedBlob = await resizeImage(file);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(resizedBlob);
        });
      });

      const base64Images = await Promise.all(resizedImagePromises);
      const currentPhotos = restaurant.photos || [];
      const updatedPhotos = [...currentPhotos, ...base64Images];

      const { error } = await supabase
        .from('restaurants')
        .update({ photos: updatedPhotos })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast.success(t('restaurant.imagesSavedSuccess'));
      setImages([]);
      refetch();
      navigate("/opening-hours");
    } catch (error) {
      toast.error(t('restaurant.failedToSaveImages'));
      console.error("Save images error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 pt-safe-top">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/restaurant-manager")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t('restaurant.images')}</h1>
      </div>

      <p className="text-muted-foreground">
        {t('restaurant.maxPhotosWarning')}
      </p>

      {restaurant?.photos && restaurant.photos.length > 0 ? (
        <ImageGallery 
          images={restaurant.photos} 
          onDeleteImage={handleDeletePhoto}
          isEditable={true}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t('restaurant.noPhotosFound')}
        </div>
      )}

      <ImageUploader 
        onImagesSelected={handleImagesSelected}
        maxImages={MAX_IMAGES}
        currentImagesCount={restaurant?.photos?.length || 0}
      />

      {images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('restaurant.newPhotosToUpload')}</h2>
          <ImageGallery 
            images={images.map(image => URL.createObjectURL(image))} 
            isEditable={false}
          />
        </div>
      )}

      <div className="flex justify-center">
        <Button 
          className="bg-primary hover:bg-primary/90 text-white px-8" 
          onClick={handleSave}
        >
          {t('common.save')}
        </Button>
      </div>
      <RestaurantNav />
    </div>
  );
};

export default RestaurantImages;