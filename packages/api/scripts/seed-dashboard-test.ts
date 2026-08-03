import * as readline from "node:readline";
import axios, { type AxiosInstance } from "axios";

const BASE_URL = "http://localhost:3000/api";

interface LoginResponse {
  data: {
    user: { id: string; email: string; name: string; role: string };
  };
}

interface CreateEntryBody {
  entryDate: string;
  moodRating?: number;
  sleepHours?: number;
  journalNotes?: string;
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;

    if (!stdin.isTTY) {
      stdin.resume();
      stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
      return;
    }

    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();

    let password = '';
    const onData = (char: Buffer) => {
      const key = char.toString();
      if (key === '\r' || key === '\n') {
        process.stdout.write('\n');
        stdin.setRawMode(wasRaw);
        stdin.pause();
        stdin.removeListener('data', onData);
        resolve(password);
      } else if (key === '\x7f' || key === '\b') {
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
      } else if (key === '\x03') {
        process.stdout.write('\n');
        process.exit(1);
      } else {
        password += key;
      }
    };
    stdin.on('data', onData);
  });
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function login(email: string, password: string): Promise<string> {
  const res = await axios.post<LoginResponse>(
    `${BASE_URL}/auth/login`,
    { email, password },
    { withCredentials: true },
  );

  const cookies = res.headers["set-cookie"];
  if (!cookies || cookies.length === 0) {
    throw new Error("No cookie returned from login");
  }

  return Array.isArray(cookies) ? cookies.join("; ") : cookies;
}

async function createEntry(
  client: AxiosInstance,
  body: CreateEntryBody,
): Promise<void> {
  const res = await client.post("/profile/daily-entries", body);

  console.log(
    `  ${res.status === 201 ? "OK" : res.status}  ${body.entryDate} | mood=${body.moodRating ?? "-"} | sleep=${body.sleepHours ?? "-"}h`,
  );
}

async function main() {
  console.log("Seed 10 daily entries for dashboard testing\n");

  const email = await prompt("Email: ");
  const password = await promptPassword("Password: ");

  if (!email || !password) {
    console.error("Email and password are required.");
    process.exit(1);
  }

  console.log("\nLogging in...");

  let cookie: string;
  try {
    cookie = await login(email, password);
    console.log("Logged in successfully.\n");
  } catch (err: any) {
    console.error(
      "Login failed:",
      err.response?.data?.error ?? err.message,
    );
    process.exit(1);
  }

  const client = axios.create({
    baseURL: BASE_URL,
    headers: { Cookie: cookie },
    withCredentials: true,
  });

  const today = new Date();

  const entries: CreateEntryBody[] = [
    {
      entryDate: formatDate(new Date(today.getTime() - 1 * 86400000)),
      moodRating: 5,
      sleepHours: 8.0,
      journalNotes: "Felt great today, lots of energy and focus.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 2 * 86400000)),
      moodRating: 4,
      sleepHours: 7.5,
      journalNotes: "Good day overall, got a lot done.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 3 * 86400000)),
      moodRating: 3,
      sleepHours: 6.0,
      journalNotes: "Mild headache in the afternoon, took it easy.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 4 * 86400000)),
      moodRating: 2,
      sleepHours: 5.0,
      journalNotes: "Feeling under the weather, stayed home.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 5 * 86400000)),
      moodRating: 4,
      sleepHours: 7.0,
      journalNotes: "Back to normal, went for a walk.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 6 * 86400000)),
      moodRating: 4,
      sleepHours: 8.0,
      journalNotes: "Productive day, finished all tasks.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 8 * 86400000)),
      moodRating: 3,
      sleepHours: 6.5,
      journalNotes: "A bit tired but pushed through.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 10 * 86400000)),
      moodRating: 5,
      sleepHours: 8.5,
      journalNotes: "Best day this week, felt amazing.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 15 * 86400000)),
      moodRating: 3,
      sleepHours: 7.0,
      journalNotes: "Average day, nothing special.",
    },
    {
      entryDate: formatDate(new Date(today.getTime() - 22 * 86400000)),
      moodRating: 4,
      sleepHours: 7.5,
      journalNotes: "Steady day, kept up with routines.",
    },
  ];

  console.log(`Creating ${entries.length} entries...\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      await createEntry(client, entry);
      created++;
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.log(`  SKIP ${entry.entryDate} | already exists`);
        skipped++;
      } else {
        failed++;
        console.log(
          `  FAIL ${entry.entryDate} | ${err.response?.data?.error ?? err.message}`,
        );
      }
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
