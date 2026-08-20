// ─── Queue names ───────────────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  EMAIL: "email",
  EMBEDDINGS: "embeddings",
  REMINDERS: "reminders",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── Job data shapes ───────────────────────────────────────────────────────────
export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, string>;
  userId?: string;
  localDate?: string;
  language?: "en" | "ar";
}

export interface EmbeddingsJobData {
  entityId: string;
  entityType: string;
  text: string;
}

export type ReminderJobData = Record<string, never>;

export type JobData = EmailJobData | EmbeddingsJobData | ReminderJobData;

// ─── Job result shapes ─────────────────────────────────────────────────────────
export interface EmailJobResult {
  messageId: string;
}

export interface EmbeddingsJobResult {
  dimensions: number;
}

export interface ReminderJobResult {
  remindersQueued: number;
}
