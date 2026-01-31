import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCORS = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const GOOGLE_MAPS_API_KEY = Deno.env.get('Google Maps Server Side Key')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    const { restaurant_id, address } = await req.json();
    
    if (!restaurant_id || !address) {
      throw new Error('Missing required parameters');
    }

    console.log(`Geocoding restaurant ${restaurant_id} with address: ${address}`);

    // Encode the address for the URL
    const encodedAddress = encodeURIComponent(address);
    
    // Call Google Maps Geocoding API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const geocodingResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (!geocodingResponse.ok) {
      throw new Error(`Geocoding API error: ${geocodingResponse.statusText}`);
    }

    const geocodingData = await geocodingResponse.json();
    console.log('Geocoding response:', geocodingData);

    if (geocodingData.status !== 'OK' || !geocodingData.results?.[0]?.geometry?.location) {
      throw new Error('No geocoding results found');
    }

    const { lat, lng } = geocodingData.results[0].geometry.location;

    // Update restaurant coordinates
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        latitude: lat,
        longitude: lng
      })
      .eq('id', restaurant_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, latitude: lat, longitude: lng }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});