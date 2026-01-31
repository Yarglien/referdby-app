import { supabase } from "@/integrations/supabase/client";

export const uploadBillImage = async (restaurantId: string, file: File) => {
  try {
    // Sanitize the filename to prevent URL issues
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${restaurantId}/${Date.now()}-${sanitizedFileName}`;

    // Upload to restaurant-bills bucket
    const { data: imageData, error: imageError } = await supabase.storage
      .from('restaurant-bills')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (imageError) {
      console.error('Error uploading image:', imageError);
      if (imageError.message.includes('Bucket not found')) {
        throw new Error('Storage not properly configured. Please contact support.');
      }
      throw imageError;
    }

    if (!imageData) {
      throw new Error('No image data returned from upload');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-bills')
      .getPublicUrl(imageData.path);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('Successfully uploaded image:', {
      path: imageData.path,
      publicUrl
    });

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadBillImage:', error);
    throw error;
  }
};