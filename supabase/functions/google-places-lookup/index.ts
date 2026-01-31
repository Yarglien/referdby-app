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
    console.log('=== GOOGLE PLACES FUNCTION START ===');
    
    const { restaurantName, latitude, longitude, plusCode } = await req.json();
    console.log('Request data:', { restaurantName, latitude, longitude, plusCode });
    
    if (!restaurantName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Restaurant name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Primary check: GPS coordinates (original working logic)
    if (!latitude || !longitude) {
      // Only if GPS is missing, check for Plus Code
      if (!plusCode?.trim()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing parameters - need either GPS coordinates or Plus Code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get API key using the exact secret name
    const apiKey = Deno.env.get('Google Maps Server Side Key');
    console.log('API key found:', !!apiKey);
    
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let actualLatitude = latitude;
    let actualLongitude = longitude;

    // Only convert Plus Code if we don't have GPS coordinates
    if ((!latitude || !longitude) && plusCode?.trim()) {
      console.log('Converting Plus Code to coordinates:', plusCode);
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${apiKey}`;
      
      const geocodeResponse = await fetch(geocodeUrl);
      if (!geocodeResponse.ok) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to geocode Plus Code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid Plus Code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      actualLatitude = geocodeData.results[0].geometry.location.lat;
      actualLongitude = geocodeData.results[0].geometry.location.lng;
      console.log('Plus Code converted to coordinates:', { lat: actualLatitude, lng: actualLongitude });
    }

    // Call Google Places API - Nearby Search (same as yesterday's working version)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${actualLatitude},${actualLongitude}&radius=500&type=restaurant&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`;
    
    console.log('Making Google API request...');
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('Google API error:', response.status);
      return new Response(
        JSON.stringify({ success: false, error: `Google API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Search results:', data.results?.length || 0, 'found');
    console.log('API response status:', data.status);

    if (data.status !== 'OK' || !data.results?.length) {
      console.log('No results found or API error:', data.status);
      return new Response(
        JSON.stringify({ 
          success: true, 
          restaurant: { matched: false, message: 'No matching restaurant found' }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bestMatch = data.results[0];
    console.log('Best match found:', bestMatch.name, 'Place ID:', bestMatch.place_id);

    // Get detailed information using Place Details API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${bestMatch.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,price_level,types,vicinity&key=${apiKey}`;
    
    console.log('Fetching place details...');
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      console.error('Details API error:', detailsResponse.status);
      // Return basic info if details fail
      return new Response(
        JSON.stringify({
          success: true,
          restaurant: {
            matched: true,
            name: bestMatch.name,
            address: bestMatch.vicinity || bestMatch.formatted_address,
            message: `Found: ${bestMatch.name} (limited details)`
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detailsData = await detailsResponse.json();
    console.log('Details API status:', detailsData.status);
    
    if (detailsData.status !== 'OK') {
      console.error('Details API error:', detailsData.status);
      // Return basic info if details fail
      return new Response(
        JSON.stringify({
          success: true,
          restaurant: {
            matched: true,
            name: bestMatch.name,
            address: bestMatch.vicinity || bestMatch.formatted_address,
            message: `Found: ${bestMatch.name} (limited details)`
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const place = detailsData.result;
    console.log('Detailed place info retrieved for:', place.name);

    // Format opening hours
    const openingHours = place.opening_hours?.weekday_text || [];
    
    // Get photo URLs (first 5 photos)
    const photos = place.photos?.slice(0, 5).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=${apiKey}`
    ) || [];

    return new Response(
      JSON.stringify({
        success: true,
        restaurant: {
          matched: true,
          name: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          priceLevel: place.price_level,
          types: place.types,
          openingHours: openingHours,
          photos: photos,
          message: `Found complete details for: ${place.name}`
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});