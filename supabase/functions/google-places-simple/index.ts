import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`Making request to: ${url.replace(/key=[\w-]+/, 'key=HIDDEN')} with ${timeoutMs}ms timeout`);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    console.log(`Response received: ${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    const errorObj = error as Error;
    if (errorObj.name === 'AbortError') {
      console.error(`Request timed out after ${timeoutMs}ms`);
      throw new Error(`Request timed out after ${timeoutMs}ms - Google Places API is not responding`);
    }
    console.error('Fetch error:', errorObj.message);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantName, latitude, longitude, plusCode } = await req.json();
    
    console.log('=== GOOGLE PLACES REQUEST START ===');
    console.log('Restaurant name:', restaurantName);
    console.log('Coordinates:', { latitude, longitude });
    console.log('Plus code:', plusCode);
    
    if (!restaurantName) {
      console.log('ERROR: No restaurant name provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Restaurant name required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    console.log('API Key available:', !!apiKey);
    
    if (!apiKey) {
      console.log('ERROR: No API key found in environment');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let searchLat = latitude;
    let searchLng = longitude;

    // Convert Plus Code if needed
    if ((!latitude || !longitude) && plusCode) {
      try {
        console.log('Converting Plus Code:', plusCode);
        console.log('Plus Code type:', typeof plusCode);
        console.log('Plus Code length:', plusCode?.length);
        
        // For Plus Codes, we need to preserve the full string including location context
        // Short Plus Codes (like "8FC5+MM") need the city/country context to work
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${apiKey}`;
        console.log('Geocode URL (without key):', geocodeUrl.replace(apiKey, 'API_KEY_HIDDEN'));
        
        const geocodeResponse = await fetchWithTimeout(geocodeUrl);
        console.log('Geocode response status:', geocodeResponse.status);
        console.log('Geocode response headers:', Object.fromEntries(geocodeResponse.headers.entries()));
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          console.log('Geocode response data:', JSON.stringify(geocodeData, null, 2));
          
          if (geocodeData.status === 'OK' && geocodeData.results?.length > 0) {
            searchLat = geocodeData.results[0].geometry.location.lat;
            searchLng = geocodeData.results[0].geometry.location.lng;
            console.log(`Plus Code ${plusCode} converted to coordinates:`, { searchLat, searchLng });
          } else {
            console.log(`Plus Code geocoding failed with status:`, geocodeData.status);
            console.log('Geocoding error details:', geocodeData.error_message || 'No error message');
            
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Unable to convert Plus Code: ${geocodeData.status}. ${geocodeData.error_message || ''}` 
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          const errorText = await geocodeResponse.text();
          console.log('Geocode API HTTP error:', geocodeResponse.status, errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Google Geocoding API error (${geocodeResponse.status}): ${errorText}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.log('Plus Code geocoding exception:', (error as Error).message);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Plus Code conversion failed: ${(error as Error).message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!searchLat || !searchLng) {
      console.log('ERROR: No valid coordinates found');
      return new Response(
        JSON.stringify({ success: false, error: 'Location coordinates required - provide either GPS coordinates or a valid Plus Code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for restaurant with 500m radius for precise location matching
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${searchLat},${searchLng}&radius=500&type=restaurant&keyword=${encodeURIComponent(restaurantName)}&key=${apiKey}`;
    console.log('Searching for restaurant:', { restaurantName, location: `${searchLat},${searchLng}`, radius: 500 });
    
    const response = await fetchWithTimeout(searchUrl, 5000);
    console.log('Places search response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Google Places API HTTP error:', response.status, errorText);
      
      // Check for specific error types
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Google Places API access denied (403): Your API key may be restricted or invalid. Check API key restrictions in Google Cloud Console.` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Google Places API error (${response.status}): Unable to search for restaurants in this location. ${errorText}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Places search response:', JSON.stringify(data, null, 2));
    
    if (data.status !== 'OK') {
      console.log('Places API returned non-OK status:', data.status);
      console.log('Error message:', data.error_message || 'No error message');
      
      if (data.status === 'REQUEST_DENIED') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Google Places API request denied: ${data.error_message || 'API key may be invalid or restricted'}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!data.results?.length) {
        console.log('No results from nearby search, trying text search as fallback...');
        
        // Try text search as fallback with shorter timeout
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(restaurantName + ' ' + (plusCode || `${searchLat},${searchLng}`))}&key=${apiKey}`;
        const textResponse = await fetchWithTimeout(textSearchUrl, 3000);
        console.log('Text search response status:', textResponse.status);
        
        if (textResponse.ok) {
          const textData = await textResponse.json();
          console.log('Text search response:', JSON.stringify(textData, null, 2));
          
          if (textData.status === 'OK' && textData.results?.length > 0) {
            console.log('Found restaurant via text search!');
            // Use the text search result
            const place = textData.results[0];
            const placeId = place.place_id;
            
            // Continue with details fetch using the text search result
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,reviews,geometry,address_components&key=${apiKey}`;
            
            const detailsResponse = await fetchWithTimeout(detailsUrl);
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
            if (detailsData.status === 'OK') {
                const details = detailsData.result;
                
                // Download photos and convert to base64
                const photos = [];
                if (details.photos?.length > 0) {
                  console.log(`Downloading ${details.photos.length} photos from Google Places (text search)...`);
                  for (let i = 0; i < Math.min(details.photos.length, 5); i++) {
                    try {
                      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${details.photos[i].photo_reference}&key=${apiKey}`;
                      console.log(`Downloading photo ${i + 1} (text search)...`);
                      
                      const photoResponse = await fetchWithTimeout(photoUrl, 10000);
                      if (photoResponse.ok) {
                        const photoBlob = await photoResponse.arrayBuffer();
                        const base64Photo = btoa(String.fromCharCode(...new Uint8Array(photoBlob)));
                        photos.push(`data:image/jpeg;base64,${base64Photo}`);
                        console.log(`Photo ${i + 1} downloaded successfully (text search)`);
                      } else {
                        console.log(`Failed to download photo ${i + 1} (text search): ${photoResponse.status}`);
                      }
                    } catch (error) {
                      console.log(`Error downloading photo ${i + 1} (text search): ${(error as Error).message}`);
                    }
                  }
                }
                
                return new Response(
                  JSON.stringify({
                    success: true,
                    restaurant: {
                      matched: true,
                      name: details.name,
                      address: details.formatted_address,
                      address_components: details.address_components,
                      phone: details.formatted_phone_number,
                      website: details.website,
                      rating: details.rating,
                      latitude: details.geometry?.location?.lat,
                      longitude: details.geometry?.location?.lng,
                      opening_hours: details.opening_hours,
                      photos: photos,
                      message: `Found via text search: ${details.name}`
                    }
                  }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            }
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            restaurant: { 
              matched: false, 
              message: `No matching restaurant found for "${restaurantName}" near coordinates ${searchLat}, ${searchLng}. Tried both nearby search (500m radius) and text search.` 
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const place = data.results[0];
    const placeId = place.place_id;
    
    // Get detailed place information with shorter timeout for details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,reviews,geometry,address_components&key=${apiKey}`;
    
    const detailsResponse = await fetchWithTimeout(detailsUrl, 3000);
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.log('Google Places details API error:', detailsResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unable to fetch restaurant details (${detailsResponse.status}): The restaurant was found but detailed information is unavailable` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          restaurant: { matched: false, message: 'Could not get detailed information' }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const details = detailsData.result;
    
    // Download photos and convert to base64
    const photos = [];
    if (details.photos?.length > 0) {
      console.log(`Downloading ${details.photos.length} photos from Google Places...`);
      for (let i = 0; i < Math.min(details.photos.length, 5); i++) {
        try {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${details.photos[i].photo_reference}&key=${apiKey}`;
          console.log(`Downloading photo ${i + 1}...`);
          
          const photoResponse = await fetchWithTimeout(photoUrl, 10000);
          if (photoResponse.ok) {
            const photoBlob = await photoResponse.arrayBuffer();
            const base64Photo = btoa(String.fromCharCode(...new Uint8Array(photoBlob)));
            photos.push(`data:image/jpeg;base64,${base64Photo}`);
            console.log(`Photo ${i + 1} downloaded successfully`);
          } else {
            console.log(`Failed to download photo ${i + 1}: ${photoResponse.status}`);
          }
        } catch (error) {
          console.log(`Error downloading photo ${i + 1}: ${(error as Error).message}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        restaurant: {
          matched: true,
          name: details.name,
          address: details.formatted_address,
          address_components: details.address_components,
          phone: details.formatted_phone_number,
          website: details.website,
          rating: details.rating,
          latitude: details.geometry?.location?.lat,
          longitude: details.geometry?.location?.lng,
          opening_hours: details.opening_hours,
          photos: photos,
          message: `Found: ${details.name}`
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});