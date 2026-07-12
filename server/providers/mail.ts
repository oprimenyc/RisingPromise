/**
 * mail.transactional capability (M1 §1 provider rewiring).
 * Business logic depends on this interface, never on the Resend SDK directly.
 * Unconfigured -> capability is null; callers log-and-skip (emails are
 * best-effort side effects, never on the request critical path).
 */
import { Resend } from "resend";
import { providerDisabled } from "./index";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface MailCapability {
  send(message: MailMessage): Promise<void>;
}

const DEFAULT_FROM = "Rising Promise <info@risingpromise.org>";
const DEFAULT_REPLY_TO = "info@risingpromise.org";

function resendMail(apiKey: string): MailCapability {
  const resend = new Resend(apiKey);
  return {
    async send(message) {
      const { error } = await resend.emails.send({
        from: message.from ?? DEFAULT_FROM,
        to: message.to,
        replyTo: message.replyTo ?? DEFAULT_REPLY_TO,
        subject: message.subject,
        html: message.html,
      });
      if (error) throw new Error(`resend send failed: ${error.message}`);
    },
  };
}

/** null when unconfigured or operator-disabled — same visibility rule as the registry probe. */
export const mail: MailCapability | null = (() => {
  if (providerDisabled("resend")) {
    console.warn("[providers] resend DISABLED by operator (PROVIDERS_DISABLED) — mail capability off");
    return null;
  }
  return process.env.RESEND_API_KEY ? resendMail(process.env.RESEND_API_KEY) : null;
})();
