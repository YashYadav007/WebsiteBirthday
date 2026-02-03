/**
 * Serverless function: sends coupon redemption notifications through SendGrid.
 *
 * Environment variables used here:
 * - SENDGRID_API_KEY: SendGrid API key (Bearer token)
 * - SENDGRID_TEMPLATE_ID: SendGrid Dynamic Template ID
 * - SENDGRID_FROM_EMAIL: Verified sender email in SendGrid
 * - NOTIFY_TO_EMAIL: Recipient address for notification emails
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    SENDGRID_API_KEY,
    SENDGRID_TEMPLATE_ID,
    SENDGRID_FROM_EMAIL,
    NOTIFY_TO_EMAIL,
  } = process.env;

  if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID || !SENDGRID_FROM_EMAIL || !NOTIFY_TO_EMAIL) {
    return res.status(500).json({
      success: false,
      error: 'Missing required SendGrid environment variables',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const couponTitle = body.coupon_title || 'Unknown coupon';
    const event = body.event || 'Coupon redeemed';
    const message = body.message || 'A coupon has been redeemed.';
    const timestamp = body.timestamp || new Date().toISOString();

    const sendGridPayload = {
      from: { email: SENDGRID_FROM_EMAIL },
      personalizations: [
        {
          to: [{ email: NOTIFY_TO_EMAIL }],
          dynamic_template_data: {
            coupon_title: couponTitle,
            event,
            message,
            timestamp,
          },
        },
      ],
      template_id: SENDGRID_TEMPLATE_ID,
    };

    // Mail Send API call using fetch (no SDK).
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendGridPayload),
    });

    const messageId = sendGridResponse.headers.get('x-message-id') || null;

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      return res.status(sendGridResponse.status).json({
        success: false,
        error: 'SendGrid request failed',
        details: errorText,
        messageId,
      });
    }

    return res.status(200).json({ success: true, messageId });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error while sending email',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
