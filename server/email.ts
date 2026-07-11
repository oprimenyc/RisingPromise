import { mail } from "./providers/mail";

function baseHtml(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0D1B2A;padding:28px 40px;">
              <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">Rising Promise</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;color:#2d2d2d;font-size:16px;line-height:1.65;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #e8e8e8;font-size:12px;color:#999;line-height:1.5;">
              Rising Promise &nbsp;|&nbsp; 501(c)(3) Nonprofit &nbsp;|&nbsp;
              <a href="mailto:info@risingpromise.org" style="color:#999;">info@risingpromise.org</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendDonationReceipt(
  to: string,
  donorName: string,
  amountCents: number,
  donationId: string
): Promise<void> {
  if (!mail) {
    console.warn("mail.transactional unconfigured — skipping donation receipt email");
    return;
  }

  const dollars = (amountCents / 100).toFixed(2);
  const displayName = donorName || "Friend";

  const body = `
    <p style="margin:0 0 16px;">Dear ${displayName},</p>
    <p style="margin:0 0 16px;">Thank you for your generous gift of <strong>$${dollars}</strong> to Rising Promise. Your support directly funds training, wraparound services, and job placement for people who are building a new future — and that matters more than we can say.</p>
    <p style="margin:0 0 16px;">Rising Promise is a registered 501(c)(3) nonprofit. <strong>No goods or services were provided in exchange for this contribution.</strong> Your contribution may be tax-deductible to the extent permitted by law. Please retain this email as your official receipt.</p>
    <table cellpadding="0" cellspacing="0" style="background:#f4f6f9;border-radius:6px;padding:20px 24px;margin:24px 0;width:100%;box-sizing:border-box;">
      <tr>
        <td style="color:#555;font-size:14px;padding:5px 0;">Donation amount</td>
        <td style="font-weight:bold;text-align:right;">$${dollars}</td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding:5px 0;">Organization</td>
        <td style="font-weight:bold;text-align:right;">Rising Promise</td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding:5px 0;">Reference ID</td>
        <td style="font-weight:bold;text-align:right;font-size:12px;color:#777;">${donationId}</td>
      </tr>
    </table>
    <p style="margin:0 0 16px;">If you have any questions about your donation, reply to this email and we'll get back to you.</p>
    <p style="margin:0;">With gratitude,<br/><strong>The Rising Promise Team</strong></p>
  `;

  await mail.send({
    to,
    subject: "Thank you for supporting Rising Promise",
    html: baseHtml("Donation Receipt — Rising Promise", body),
  });
}

export async function sendApplicationConfirmation(
  to: string,
  firstName: string,
  programType: string
): Promise<void> {
  if (!mail) {
    console.warn("mail.transactional unconfigured — skipping application confirmation email");
    return;
  }

  const programLabel =
    programType === "cna"
      ? "Certified Nursing Assistant (CNA)"
      : "IT Fundamentals";

  const body = `
    <p style="margin:0 0 16px;">Hi ${firstName},</p>
    <p style="margin:0 0 16px;">We got it. Your application for the <strong>${programLabel}</strong> program at Rising Promise has been received — and we're really glad you took that step.</p>
    <p style="margin:0 0 12px;font-weight:bold;">Here's what happens next:</p>
    <ul style="margin:0 0 24px;padding-left:20px;line-height:1.9;">
      <li>A member of our team will review your application</li>
      <li>We'll follow up with you within <strong>3–5 business days</strong></li>
      <li>If we need anything else from you, we'll reach out directly</li>
    </ul>
    <p style="margin:0 0 16px;">In the meantime, feel free to reply to this email with any questions. We're real people who read every message.</p>
    <p style="margin:0;">Warmly,<br/><strong>The Rising Promise Team</strong></p>
  `;

  await mail.send({
    to,
    subject: "We received your Rising Promise application",
    html: baseHtml("Application Received — Rising Promise", body),
  });
}

export async function sendRaffleConfirmation(
  to: string,
  name: string,
  entryNumbers: string[],
  ticketTier: string,
  drawDate: string,
  legal: string
): Promise<void> {
  if (!mail) {
    console.warn("mail.transactional unconfigured — skipping raffle confirmation email");
    return;
  }

  const displayName = name || "Friend";
  const entryList = entryNumbers
    .map(
      (n) =>
        `<li style="font-family:monospace;font-size:15px;padding:4px 0;color:#0D1B2A;">${n}</li>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;">Hi ${displayName},</p>
    <p style="margin:0 0 16px;">You're in. Your <strong>${ticketTier}</strong> purchase for the Rising Promise raffle has been confirmed.</p>
    <p style="margin:0 0 8px;font-weight:bold;">Your entry numbers:</p>
    <ul style="background:#f4f6f9;border-radius:6px;padding:16px 24px;list-style:none;margin:0 0 24px;">
      ${entryList}
    </ul>
    <p style="margin:0 0 16px;"><strong>Draw date:</strong> ${drawDate}</p>
    <p style="margin:0 0 16px;">Winners are notified by email. Keep this message — it contains your official entry numbers.</p>
    <p style="margin:0 0 32px;">Thank you for supporting Rising Promise. Every ticket directly funds a student's path to a new career.</p>
    <p style="margin:0 0 16px;font-size:13px;color:#777;">Please note: raffle ticket purchases are <strong>not tax-deductible</strong> as charitable contributions under IRS rules.</p>
    <p style="margin:0 0 16px;">Good luck,<br/><strong>The Rising Promise Team</strong></p>
    <p style="font-size:12px;color:#aaa;margin-top:32px;padding-top:16px;border-top:1px solid #eee;">${legal}</p>
  `;

  await mail.send({
    to,
    subject: "You're in — your Rising Promise raffle entries",
    html: baseHtml("Raffle Confirmation — Rising Promise", body),
  });
}
