import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
) {
  const firstName = name.split(' ')[0]

  await resend.emails.send({
    from: 'JobPilot <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your JobPilot account',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your email — JobPilot</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#0d1117;color:#e6edf3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="color:#1F4E79;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Job</span><span style="color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Pilot</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px;">

              <!-- Heading -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#e6edf3;">Hi ${firstName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#8b949e;line-height:1.6;">
                Thanks for signing up for JobPilot. One quick step — verify your email address to activate your account.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display:inline-block;background-color:#1F4E79;color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.01em;">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- URL fallback -->
              <p style="margin:0 0 8px;font-size:12px;color:#484f58;">Or copy this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;color:#4a9eda;word-break:break-all;">${verificationUrl}</p>

              <!-- Footer note -->
              <p style="margin:0;font-size:12px;color:#484f58;line-height:1.6;border-top:1px solid #21262d;padding-top:20px;">
                This link expires in 24 hours. If you didn't create a JobPilot account, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Bottom -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#30363d;">JobPilot — AI-Powered Job Application Platform</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
