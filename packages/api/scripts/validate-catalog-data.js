"use strict";

// Validates catalog seed data before it reaches the database.
//
// The catalog seeders insert with ignoreDuplicates: true, so any row that
// violates a unique constraint is skipped SILENTLY — the database ends up
// missing entries that exist in the JSON. This script fails fast instead.
//
// Checks:
//  1. Duplicate `id` in every data file (primary key collisions).
//  2. Duplicate exact-case `name` in files whose table enforces a unique
//     name constraint for the default language (symptoms, conditions).
//     medications.en.json is exempt: same name with a different strength is
//     legal there ((name, strength) is the uniqueness unit).
//
// Run: npm run catalog:validate

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "src", "seeders", "data");

// Files where a duplicate exact-case name would be silently dropped by
// ignoreDuplicates due to a unique (name [, language]) index.
const UNIQUE_NAME_FILES = new Set([
  "symptoms.en.json",
  "conditions.en.json",
]);

function findDuplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    else seen.add(value);
  }
  return [...dupes];
}

let failed = false;

for (const file of fs.readdirSync(DATA_DIR).sort()) {
  if (!file.endsWith(".json")) continue;

  const rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn(`[catalog:validate] ${file}: no rows found`);
    continue;
  }

  const dupIds = findDuplicates(rows.map((r) => r.id));
  if (dupIds.length > 0) {
    failed = true;
    console.error(
      `[catalog:validate] ${file}: duplicate id values: ${dupIds.join(", ")}`,
    );
  }

  if (UNIQUE_NAME_FILES.has(file)) {
    const dupNames = findDuplicates(rows.map((r) => r.name));
    if (dupNames.length > 0) {
      failed = true;
      for (const name of dupNames) {
        const ids = rows
          .filter((r) => r.name === name)
          .map((r) => r.id)
          .join(", ");
        console.error(
          `[catalog:validate] ${file}: duplicate name "${name}" on ids: ${ids}`,
        );
      }
    }
  }
}

if (failed) {
  console.error("[catalog:validate] FAILED");
  process.exit(1);
}

console.log("[catalog:validate] OK");
