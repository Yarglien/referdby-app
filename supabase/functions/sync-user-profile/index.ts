import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, email')
      .not('first_name', 'is', null)

    if (!profiles) {
      throw new Error('No profiles found')
    }

    for (const profile of profiles) {
      if (profile.first_name || profile.last_name) {
        await supabaseClient.auth.admin.updateUserById(profile.id, {
          user_metadata: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          }
        })
      }
    }

    return new Response(
      JSON.stringify({ message: 'Profiles synced successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})