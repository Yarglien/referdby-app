import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to calculate and update restaurant return rate
async function updateRestaurantReturnRate(restaurantId: string) {
  const { data: feedback, error } = await supabase
    .from('restaurant_feedback')
    .select('would_return')
    .eq('restaurant_id', restaurantId)
    .not('would_return', 'is', null);

  if (error) {
    console.error("Error fetching feedback data:", error);
    return;
  }

  if (feedback.length === 0) {
    return; // No responses yet
  }

  const positiveResponses = feedback.filter(f => f.would_return === true).length;
  const returnRate = Math.round((positiveResponses / feedback.length) * 100);

  const { error: updateError } = await supabase
    .from('restaurants')
    .update({ return_rate: returnRate })
    .eq('id', restaurantId);

  if (updateError) {
    console.error("Error updating restaurant return rate:", updateError);
  } else {
    console.log(`Updated restaurant ${restaurantId} return rate to ${returnRate}%`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const response = url.searchParams.get('response');

    console.log("Processing feedback response:", { token, response });

    if (!token || !response) {
      return new Response("Missing token or response", { status: 400 });
    }

    if (!['yes', 'no'].includes(response)) {
      return new Response("Invalid response", { status: 400 });
    }

    const wouldReturn = response === 'yes';

    // Update the feedback record
    const { data: feedbackData, error: updateError } = await supabase
      .from('restaurant_feedback')
      .update({
        would_return: wouldReturn,
        response_given_at: new Date().toISOString()
      })
      .eq('feedback_token', token)
      .is('response_given_at', null) // Only update if not already responded
      .select('restaurant_id')
      .single();

    if (updateError) {
      console.error("Error updating feedback:", updateError);
      return new Response("Error processing response", { status: 500 });
    }

    if (!feedbackData) {
      // Response already recorded or invalid token
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ReferdBy - Feedback</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #f8fafc; text-align: center; }
              .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
              h1 { color: #1f2937; margin-bottom: 20px; }
              p { color: #6b7280; font-size: 16px; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Response Already Recorded</h1>
              <p>This feedback link has already been used or is invalid. Thank you for using ReferdBy!</p>
            </div>
          </body>
        </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    // Update restaurant return rate
    await updateRestaurantReturnRate(feedbackData.restaurant_id);

    // Return success page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ReferdBy - Thank You!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #f8fafc; text-align: center; }
            .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            h1 { color: #1f2937; margin-bottom: 20px; }
            p { color: #6b7280; font-size: 16px; line-height: 1.6; }
            .emoji { font-size: 48px; margin-bottom: 20px; }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">${wouldReturn ? '🎉' : '💡'}</div>
            <h1>Thank you for your feedback!</h1>
            <p class="${wouldReturn ? 'positive' : 'negative'}">
              ${wouldReturn 
                ? "We're thrilled you'd return! Your positive experience helps other users discover great restaurants."
                : "Thank you for your honest feedback. We'll use this to help improve the ReferdBy experience."
              }
            </p>
            <p style="margin-top: 30px;">
              <strong>Keep exploring great restaurants with ReferdBy!</strong>
            </p>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in feedback-response function:", error);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ReferdBy - Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #f8fafc; text-align: center; }
            .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; margin-bottom: 20px; }
            p { color: #6b7280; font-size: 16px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Oops! Something went wrong</h1>
            <p>We encountered an error processing your feedback. Please try again later or contact support.</p>
          </div>
        </body>
      </html>
    `;
    return new Response(html, {
      status: 500,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
};

serve(handler);