import { Worker } from "bullmq";
import { getRedisConnection, QUEUE_NAMES } from "@starter-kit/shared";
import { processEmailJob } from "../jobs/email.job";
import { processEmbeddingsJob } from "../jobs/embeddings.job";
import { processReminderJob } from "../jobs/reminder.job";

export function createWorkers(): Worker[] {
  const emailWorker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, {
    connection: getRedisConnection().duplicate(),
    concurrency: 10,
  });

  const embeddingsWorker = new Worker(
    QUEUE_NAMES.EMBEDDINGS,
    processEmbeddingsJob,
    {
      connection: getRedisConnection().duplicate(),
      concurrency: 5,
    },
  );

  const reminderWorker = new Worker(
    QUEUE_NAMES.REMINDERS,
    processReminderJob,
    {
      connection: getRedisConnection().duplicate(),
      concurrency: 1,
    },
  );
  const workers = [emailWorker, embeddingsWorker, reminderWorker];

  

  workers.forEach((worker) => {
    worker.on("completed", (job) => {
      console.info(`[${worker.name}] Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
      console.error(`[${worker.name}] Job ${job?.id} failed:`, err.message);
    });

    worker.on("error", (err) => {
      console.error(`[${worker.name}] Worker error:`, err);
    });
  });

  return workers;
}
