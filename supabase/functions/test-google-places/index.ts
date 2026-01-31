import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== TEST FUNCTION CALLED ===');
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    console.log('GOOGLE_MAPS_API_KEY found:', !!apiKey);
    console.log('API key length:', apiKey?.length || 0);
    
    const response = { 
      success: true, 
      message: 'Test function works!',
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning response:', response);
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'Test function failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});