import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get platform information
    const body = await req.json().catch(() => ({}));
    const platform = body.platform || 'web';

    console.log(`🔑 Requesting Maps key for platform: ${platform}`);

    // For Maps JavaScript API we always use the WEB key, even in mobile webviews
    const googleMapsKey = Deno.env.get("GOOGLE_MAPS_WEB_KEY");

    console.log(`🔑 Using WEB key for platform: ${platform}. Found: ${googleMapsKey ? 'yes' : 'no'}`);

    if (!googleMapsKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Google Maps ${platform} key not configured` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, key: googleMapsKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('❌ Error in get-google-maps-client-key:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message || "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});