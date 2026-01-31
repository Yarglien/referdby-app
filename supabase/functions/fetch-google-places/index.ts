import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== FUNCTION START ===');
    
    // Parse and validate request
    const { restaurantName, latitude, longitude, plusCode } = await req.json();
    console.log('Request data:', { restaurantName, latitude, longitude, plusCode });
    
    if (!restaurantName) {
      console.error('Missing restaurant name');
      return new Response(
        JSON.stringify({ success: false, error: 'Restaurant name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have either coordinates or plus code
    const hasCoordinates = latitude && longitude;
    const hasPlusCode = plusCode?.trim();

    if (!hasCoordinates && !hasPlusCode) {
      console.error('Missing location data');
      return new Response(
        JSON.stringify({ success: false, error: 'Either GPS coordinates or Plus Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    console.log('API key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('No API key found');
      return new Response(
        JSON.stringify({ success: false, error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let searchLatitude = latitude;
    let searchLongitude = longitude;

    // If we have Plus Code but no coordinates, convert Plus Code to coordinates
    if (hasPlusCode && !hasCoordinates) {
      console.log('Converting Plus Code to coordinates:', plusCode);
      
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${apiKey}`;
        console.log('Geocoding Plus Code...');
        
        const geocodeResponse = await fetch(geocodeUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!geocodeResponse.ok) {
          console.error('Geocoding API error:', geocodeResponse.status);
          return new Response(
            JSON.stringify({ success: false, error: `Geocoding API error: ${geocodeResponse.status}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const geocodeData = await geocodeResponse.json();
        console.log('Geocoding status:', geocodeData.status);
        
        if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
          console.error('Invalid Plus Code or geocoding failed');
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid Plus Code or geocoding failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const location = geocodeData.results[0].geometry.location;
        searchLatitude = location.lat;
        searchLongitude = location.lng;
        console.log('Converted Plus Code to coordinates:', { lat: searchLatitude, lng: searchLongitude });
      } catch (error) {
        console.error('Error converting Plus Code:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to convert Plus Code to coordinates' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Searching for:', restaurantName, 'at', searchLatitude, searchLongitude);

    // Search using Google Places API with timeout
    try {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${searchLatitude},${searchLongitude}&radius=500&type=restaurant&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`;
      console.log('Making Google API request...');
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('Google API response status:', response.status);
      
      if (!response.ok) {
        console.error('Google API error:', response.status, response.statusText);
        return new Response(
          JSON.stringify({ success: false, error: `Google API error: ${response.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const searchData = await response.json();
      console.log('Search results count:', searchData.results?.length || 0);
      console.log('Search status:', searchData.status);

      if (searchData.status !== 'OK' || !searchData.results?.length) {
        console.log('No matches found');
        return new Response(
          JSON.stringify({ 
            success: true, 
            restaurant: { matched: false, message: 'No matching restaurant found' }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return the first result
      const bestMatch = searchData.results[0];
      console.log('Best match found:', bestMatch.name);

      return new Response(
        JSON.stringify({
          success: true,
          restaurant: {
            matched: true,
            name: bestMatch.name,
            address: bestMatch.vicinity || bestMatch.formatted_address,
            message: `Found: ${bestMatch.name}`
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error in Google Places search:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to search Google Places' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});