import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetEmailRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetEmailRequest = await req.json();

    // Generate proper password recovery link using Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: resetUrl
      }
    });

    if (error) {
      console.error('Error generating recovery link:', error);
      throw error;
    }

    const actualResetUrl = data.properties?.action_link || resetUrl;

    const emailResponse = await resend.emails.send({
      from: "ReferdBy <info@referdby.com>",
      to: [email],
      subject: "Reset Your ReferdBy Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Your ReferdBy Password</h2>
          <p>Click the link below to reset your password:</p>
          <p><a href="${actualResetUrl}" style="background-color: #DB5D27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
          <p>Or copy this link: <br><code>${actualResetUrl}</code></p>
          <p><small>This link expires in 1 hour. If you didn't request this, ignore this email.</small></p>
          <p><small>ReferdBy Team</small></p>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    // Check if Resend returned an error
    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message || emailResponse.error}`);
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);