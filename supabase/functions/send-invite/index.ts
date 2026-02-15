
import nodemailer from "npm:nodemailer@6.9.16";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitePayload {
  partner_email: string;
  invite_code: string;
  temp_password: string;
  valentine_plans?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { partner_email, invite_code, temp_password, valentine_plans } = await req.json() as InvitePayload;

    if (!partner_email || !invite_code || !temp_password) {
      throw new Error('Missing required fields');
    }

    const transporter = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOSTNAME'),
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      auth: {
        user: Deno.env.get('SMTP_USERNAME'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #fff0f5; color: #5a2d3c; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 15px rgba(255, 105, 180, 0.2); border: 2px solid #ffb6c1; }
            h1 { color: #d6336c; text-align: center; font-size: 32px; margin-bottom: 10px; }
            .heart { text-align: center; font-size: 40px; margin: 20px 0; }
            .content { font-size: 18px; line-height: 1.6; margin-bottom: 30px; text-align: center; }
            .box { background: #fff5f7; border: 1px dashed #ff69b4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; }
            .code { font-family: monospace; font-size: 24px; font-weight: bold; color: #d6336c; letter-spacing: 2px; }
            .btn { display: inline-block; background: #ff69b4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 18px; transition: background 0.3s; }
            .btn:hover { background: #d6336c; }
            .footer { margin-top: 40px; font-size: 14px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Will you be my Valentine? 💖</h1>
            <div class="heart">💌</div>
            <div class="content">
              <p>You have been invited to join a special shared timeline for <strong>A Lifetime of Valentines</strong>.</p>
              ${valentine_plans ? `<p><em>"${valentine_plans}"</em></p>` : ''}
              
              <div class="box">
                <p><strong>Your Invite Code:</strong> <span class="code">${invite_code}</span></p>
                <p><strong>Temporary Password:</strong> <span class="code">${temp_password}</span></p>
              </div>

              <p>Use these credentials to join and start building our memories together.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/register-partner" class="btn">Accept Invite</a>
                <!-- Production Link: <a href="https://a-lifetime-of-valentines.vercel.app/register-partner" class="btn">Accept Invite</a> -->
              </div>
            </div>
            <div class="footer">
              With love,<br>A Lifetime of Valentines
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"A Lifetime of Valentines" <' + Deno.env.get('SMTP_USERNAME') + '>',
      to: partner_email,
      subject: "You're Invited! 💖 A Lifetime of Valentines",
      html: html,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
