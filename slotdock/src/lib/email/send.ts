import { getResend } from "./client";
import type { ReactElement } from "react";

const FROM_ADDRESS = "SlotDock <noreply@slotdock.com>";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send an email via Resend with retry logic.
 * Never throws — on failure, logs the error and returns false.
 * Booking flow must succeed even if email delivery fails.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured — skipping email send");
    return false;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: options.to,
        subject: options.subject,
        react: options.react,
      });

      if (error) {
        console.error(`Email send error (attempt ${attempt}/${MAX_RETRIES}):`, error);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error(`Email send exception (attempt ${attempt}/${MAX_RETRIES}):`, err);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  return false;
}
