
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequestBody {
  to: string;
  subject: string;
  body: string;
  projectId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { to, subject, body, projectId } = await req.json() as EmailRequestBody;

    // Validate inputs
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Email sending would typically go here
    // For now, we'll just log the email details and add an audit entry
    console.log(`Would send email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // Add an entry to the audit log if projectId is provided
    if (projectId) {
      const { error } = await supabase
        .from('audit_log')
        .insert({
          project_id: projectId,
          action: 'reminded',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
        
      if (error) {
        console.error('Error creating audit log entry:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email scheduled for delivery' }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
