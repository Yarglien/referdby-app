import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackEmailRequest {
  activityId: string;
  customerEmail: string;
  customerName: string;
  restaurantName: string;
  customerId: string;
  restaurantId: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      activityId, 
      customerEmail, 
      customerName, 
      restaurantName, 
      customerId, 
      restaurantId 
    }: FeedbackEmailRequest = await req.json();

    console.log("Processing feedback email request:", {
      activityId,
      customerEmail,
      customerName,
      restaurantName,
      customerId,
      restaurantId
    });

    // Create a feedback record in the database
    const { data: feedbackRecord, error: feedbackError } = await supabase
      .from('restaurant_feedback')
      .insert({
        activity_id: activityId,
        restaurant_id: restaurantId,
        customer_id: customerId,
        email_sent_at: new Date().toISOString()
      })
      .select('feedback_token')
      .single();

    if (feedbackError) {
      console.error("Error creating feedback record:", feedbackError);
      throw feedbackError;
    }

    const feedbackToken = feedbackRecord.feedback_token;
    const baseUrl = "https://lykukadtlhptlskrocux.supabase.co/functions/v1";

    // Create the email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for dining with ReferdBy</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .button-container { text-align: center; margin: 40px 0; }
            .button { display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
            .button-yes { background-color: #10b981; color: white; }
            .button-no { background-color: #ef4444; color: white; }
            .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Thank you for using ReferdBy!</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${customerName}!</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                We hope you enjoyed your meal at <strong>${restaurantName}</strong>! Your experience matters to us and helps other users discover great restaurants.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Can you tell us whether you would go back there again?
              </p>
              <div class="button-container">
                <a href="${baseUrl}/feedback-response?token=${feedbackToken}&response=yes" class="button button-yes">
                  Yes, I'd return! 👍
                </a>
                <a href="${baseUrl}/feedback-response?token=${feedbackToken}&response=no" class="button button-no">
                  Not likely 👎
                </a>
              </div>
              <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
                Your feedback helps us improve the ReferdBy experience for everyone.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">
                Best regards,<br>
                <strong>The ReferdBy Team</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "ReferdBy <noreply@referdby.com>",
      to: [customerEmail],
      subject: `Thank you for dining at ${restaurantName}!`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedbackToken,
        emailId: emailResponse.data?.id
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-feedback-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);