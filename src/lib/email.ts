import nodemailer from 'nodemailer'

// ─── Transport ───────────────────────────────────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const from = process.env.SMTP_FROM || `"النشرة" <newsletter@example.com>`

  if (!host || !user || !pass) return null

  return {
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
    from,
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const config = createTransport()
  if (!config) {
    console.log('[Email] SMTP not configured — skipping send to:', to)
    return false
  }
  try {
    await config.transport.sendMail({ from: config.from, to, subject, html })
    return true
  } catch (err) {
    console.error('[Email] Send failed:', err)
    return false
  }
}

// ─── Newsletter email template ────────────────────────────────────────────────

function newsletterEmailHtml({
  firstName,
  title,
  newsletterUrl,
  unsubscribeUrl,
  siteName,
  emailMessage,
  emailCtaText,
}: {
  firstName: string
  title: string
  newsletterUrl: string
  unsubscribeUrl: string
  siteName: string
  emailMessage?: string
  emailCtaText?: string
}): string {
  const ctaText = emailCtaText || 'اقرأ العدد الجديد'
  const bodyMessage = emailMessage
    ? `<p style="font-size:15px;color:#4b5563;margin:0 0 28px 0;line-height:1.7;">${emailMessage.replace(/\n/g, '<br/>')}</p>`
    : `<p style="font-size:15px;color:#6b7280;margin:0 0 28px 0;">صدر عدد جديد من ${siteName} — إليك ملخص سريع:</p>`

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Tahoma,'IBM Plex Sans Arabic',sans-serif;direction:rtl;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;border-radius:16px 16px 0 0;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">${siteName}</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-right:1px solid #e5e7eb;border-left:1px solid #e5e7eb;">
              <p style="font-size:16px;color:#4b5563;margin:0 0 8px 0;">مرحباً <strong style="color:#1a1a2e;">${firstName}</strong>،</p>
              ${bodyMessage}

              <!-- Title card -->
              <div style="background:#f9fafb;border-radius:12px;padding:24px;border-right:4px solid #e63946;margin-bottom:32px;">
                <p style="font-size:20px;font-weight:bold;color:#1a1a2e;margin:0;line-height:1.4;">${title}</p>
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding:8px 0 40px;">
                    <a href="${newsletterUrl}" style="display:inline-block;background:#e63946;color:#ffffff;text-decoration:none;padding:14px 44px;border-radius:50px;font-size:16px;font-weight:bold;letter-spacing:0.3px;">
                      ${ctaText} &larr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#9ca3af;text-align:center;margin:0;">
                أو انسخ هذا الرابط في متصفحك:<br />
                <span style="color:#6b7280;word-break:break-all;">${newsletterUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;text-align:center;">
              <p style="font-size:13px;color:#9ca3af;margin:0 0 8px 0;">
                تصلك هذه الرسالة لأنك اشتركت في <strong>${siteName}</strong>
              </p>
              <a href="${unsubscribeUrl}" style="color:#6b7280;font-size:13px;text-decoration:underline;">
                إلغاء الاشتراك
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Broadcast helper ─────────────────────────────────────────────────────────

export async function broadcastNewsletter({
  newsletter,
  subscribers,
  siteUrl,
  siteName,
  emailSubject,
  emailMessage,
  emailCtaText,
}: {
  newsletter: { title: string; slug: string }
  subscribers: { firstName: string; email: string; unsubscribeToken: string | null }[]
  siteUrl: string
  siteName: string
  emailSubject?: string
  emailMessage?: string
  emailCtaText?: string
}): Promise<void> {
  const config = createTransport()
  if (!config) {
    console.log('[Email] SMTP not configured — broadcast skipped')
    return
  }

  const newsletterUrl = `${siteUrl}/newsletter/${newsletter.slug}`
  const subject = emailSubject || `📬 ${newsletter.title} — ${siteName}`

  for (const sub of subscribers) {
    const unsubscribeUrl = sub.unsubscribeToken
      ? `${siteUrl}/unsubscribe?token=${sub.unsubscribeToken}`
      : `${siteUrl}/unsubscribe`

    const html = newsletterEmailHtml({
      firstName: sub.firstName,
      title: newsletter.title,
      newsletterUrl,
      unsubscribeUrl,
      siteName,
      emailMessage,
      emailCtaText,
    })

    await sendEmail({
      to: sub.email,
      subject,
      html,
    })
  }
}
