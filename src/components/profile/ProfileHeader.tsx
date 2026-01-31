import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: any;
  avatarUrl: string | null;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ profile, avatarUrl, onAvatarChange }: ProfileHeaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile.${fileExt}`;

      console.log('Uploading file to path:', filePath);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);

      console.log('File uploaded, public URL:', publicUrl);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile with photo:', updateError);
        throw updateError;
      }

      console.log('Profile updated with new photo URL');

      // Call the parent component's handler to update UI
      await onAvatarChange(event);

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          {profile?.photo ? (
            <img 
              src={profile.photo} 
              alt={`${profile?.first_name}'s profile`}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.error('Error loading profile photo:', e);
                e.currentTarget.src = ''; // Clear the src to show fallback
              }}
            />
          ) : (
            <AvatarFallback>
              <User className="w-12 h-12" />
            </AvatarFallback>
          )}
        </Avatar>
        <label 
          htmlFor="avatar-upload" 
          className={`absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
        >
          <PenLine className="w-4 h-4 text-white" />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <h2 className="text-xl font-semibold">
        {profile?.first_name} {profile?.last_name}
      </h2>
    </div>
  );
};