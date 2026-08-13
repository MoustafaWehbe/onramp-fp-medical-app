import type { Job } from "bullmq";
import { Resend } from "resend";
import type { EmailJobData, EmailJobResult } from "@starter-kit/shared";

function renderEmail(
  template: string,
  variables?: Record<string, string>,
): string {
  if (template === "daily-entry-reminder") {
    const name = variables?.name ?? "there";

    return `
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
    `;
  }

  throw new Error(`Unknown email template: ${template}`);
}

export async function processEmailJob(
  job: Job<EmailJobData, EmailJobResult>,
): Promise<EmailJobResult> {

  console.log(
    `[email] Worker received job ${job.id}`,
    job.data,
  );
  const { to, subject, template, variables } = job.data;

  console.info(`[email] Sending "${subject}" to ${to} (template: ${template})`);

    if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = renderEmail(template, variables);

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

   if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Email provider did not return a message ID");
  }

  console.info(
    `[email] Email sent successfully to ${to}, messageId=${data.id}`,
  );

  return {
    messageId: data.id,
  };
}
