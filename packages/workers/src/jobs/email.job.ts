import type { Job } from "bullmq";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  getRedisConnection,
  type EmailJobData,
  type EmailJobResult,
} from "@starter-kit/shared";

const EMAIL_DELIVERY_TTL_SECONDS = 60 * 60 * 48;

function deliveryKey(jobId: string): string {
  return `email:delivered:${jobId}`;
}

let transporter: Transporter | null = null;

function renderEmail(
  template: string,
  variables?: Record<string, string>,
): { html: string; text: string } {
  if (template === "daily-entry-reminder") {
    const name = variables?.name ?? "there";

    return {
      text: [
        `Hello ${name},`,
        "",
        "Don't forget to complete your daily health entry today.",
        "Take a few minutes to record how you're feeling.",
        "",
        "— HealthTracker",
      ].join("\n"),
      html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Daily Entry Reminder</h2>

          <p>Hello ${name},</p>

          <p>
            Don't forget to complete your daily health entry today.
          </p>

          <p>
            Take a few minutes to record how you're feeling today.
          </p>

          <p>
            — HealthTracker
          </p>
        </body>
      </html>
    `,
    };
  }

  throw new Error(`Unknown email template: ${template}`);
}

function getFromAddress(): { name: string; address: string } {
  const address = env("EMAIL_FROM") || env("SMTP_USER");

  if (!address) {
    throw new Error("EMAIL_FROM is not configured");
  }

  return {
    name: env("EMAIL_FROM_NAME") || "HealthTracker",
    address,
  };
}

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS").replace(/\s+/g, "");

  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }

  if (!user) {
    throw new Error("SMTP_USER is not configured");
  }

  if (!pass) {
    throw new Error("SMTP_PASS is not configured");
  }

  const port = Number(env("SMTP_PORT") || "587");
  const isGmail = host.toLowerCase().includes("gmail.com");

  // Gmail should use the official `service: "gmail"` transport with an App Password.
  transporter = isGmail
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      })
    : nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        auth: { user, pass },
      });

  return transporter;
}

export async function processEmailJob(
  job: Job<EmailJobData, EmailJobResult>,
): Promise<EmailJobResult> {
  const { to, subject, template, variables } = job.data;

  console.info(`[email] Worker received job ${job.id} template=${template}`);

  const jobId = String(job.id);
  const redis = getRedisConnection();
  const key = deliveryKey(jobId);
  const existingMessageId = await redis.get(key);

  if (existingMessageId && existingMessageId !== "pending") {
    console.info(
      `[email] Skipping duplicate delivery, messageId=${existingMessageId}`,
    );
    return { messageId: existingMessageId };
  }

  const claimed = await redis.set(
    key,
    "pending",
    "EX",
    EMAIL_DELIVERY_TTL_SECONDS,
    "NX",
  );

  if (!claimed) {
    const recordedMessageId = await redis.get(key);
    if (recordedMessageId && recordedMessageId !== "pending") {
      console.info(
        `[email] Skipping duplicate delivery, messageId=${recordedMessageId}`,
      );
      return { messageId: recordedMessageId };
    }

    console.info(`[email] Skipping duplicate delivery for job ${job.id}`);
    return { messageId: recordedMessageId || `pending:${jobId}` };
  }

  const from = getFromAddress();
  const { html, text } = renderEmail(template, variables);

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    const messageId = info.messageId || `accepted:${jobId}`;
    await redis.set(key, messageId, "EX", EMAIL_DELIVERY_TTL_SECONDS);

    console.info(`[email] Email sent successfully, messageId=${messageId}`);

    return {
      messageId,
    };
  } catch (error) {
    transporter = null;

    const recordedMessageId = await redis.get(key);
    if (recordedMessageId && recordedMessageId !== "pending") {
      console.info(
        `[email] Reusing recorded delivery, messageId=${recordedMessageId}`,
      );
      return { messageId: recordedMessageId };
    }

    const message = error instanceof Error ? error.message : String(error);
    const ambiguous =
      /timeout|timed out|ETIMEDOUT|ECONNRESET|socket hang up/i.test(message);

    if (!ambiguous) {
      await redis.del(key);
    }

    if (message.includes("Invalid login") || message.includes("535")) {
      throw new Error(
        "Gmail rejected SMTP login (535 BadCredentials). SMTP_USER must be the Google account email, and SMTP_PASS must be a 16-character App Password for that same account — not the Gmail login password. Restart npm run dev after changing .env.",
      );
    }

    throw error;
  }
}
