
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dice6 } from "lucide-react";
import { toast } from "sonner";
import { generateRollToken } from "@/utils/tokenUtils";

export const RollTokenGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Get user and restaurant info
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('restaurant_id, role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const createTokenMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.restaurant_id) {
        throw new Error('No restaurant associated with user');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const token = await generateRollToken(profile.restaurant_id, user.id);
      return token;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-roll-tokens'] });
      toast.success('Roll token generated successfully');
    },
    onError: (error: Error) => {
      console.error('Error generating token:', error);
      toast.error(error.message || 'Failed to generate token');
    }
  });

  const handleGenerateToken = async () => {
    if (!profile?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return;
    }

    if (profile.role !== 'manager' && profile.role !== 'server') {
      toast.error('Only restaurant staff can generate tokens');
      return;
    }

    setIsGenerating(true);
    try {
      await createTokenMutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile || (profile.role !== 'manager' && profile.role !== 'server')) {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dice6 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Generate Roll Token</h2>
        </div>
        <Button
          onClick={handleGenerateToken}
          disabled={isGenerating || !profile?.restaurant_id}
        >
          {isGenerating ? 'Generating...' : 'Generate Token'}
        </Button>
      </div>
    </div>
  );
};
