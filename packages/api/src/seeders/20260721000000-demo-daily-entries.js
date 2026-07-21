"use strict";

const { Op } = require("sequelize");

const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";
const now = () => new Date();
const at = (date, time) => new Date(`${date}T${time}Z`);

// Reuses profile resources seeded in 20250625000000-demo-health-data.js:
//   user_conditions: 60000000-…-0001 (Migraine), 60000000-…-0002 (Seasonal Allergies)
//   user_symptoms:   70000000-…-0001 (Headache) … 70000000-…-0005 (Itchy Eyes)
//   user_medications: 80000000-…-0001 (Panadol)
//   user_doctors:    82000000-…-0001, user_clinics: 81000000-…-0001
// The existing demo seeder already owns 2026-06-24, so these use other dates.

const ENTRY_A = "90000000-0000-0000-0000-000000000002"; // 2026-06-23
const ENTRY_B = "90000000-0000-0000-0000-000000000003"; // 2026-06-22
const ENTRY_C = "90000000-0000-0000-0000-000000000004"; // 2026-06-20

const ENTRY_SYMPTOM_IDS = [
  "91000000-0000-0000-0000-000000000002",
  "91000000-0000-0000-0000-000000000003",
  "91000000-0000-0000-0000-000000000004",
  "91000000-0000-0000-0000-000000000005",
  "91000000-0000-0000-0000-000000000006",
];

const ENTRY_CONDITION_IDS = [
  "94000000-0000-0000-0000-000000000001",
  "94000000-0000-0000-0000-000000000002",
  "94000000-0000-0000-0000-000000000003",
];

const ENTRY_MEDICATION_IDS = [
  "92000000-0000-0000-0000-000000000002",
  "92000000-0000-0000-0000-000000000003",
];

const ENTRY_DOCTOR_VISIT_IDS = ["95000000-0000-0000-0000-000000000001"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Idempotent: remove any rows left by a prior partial run before inserting.
    await queryInterface.bulkDelete("entry_doctor_visits", {
      id: { [Op.in]: ENTRY_DOCTOR_VISIT_IDS },
    });
    await queryInterface.bulkDelete("entry_medications", {
      id: { [Op.in]: ENTRY_MEDICATION_IDS },
    });
    await queryInterface.bulkDelete("entry_conditions", {
      id: { [Op.in]: ENTRY_CONDITION_IDS },
    });
    await queryInterface.bulkDelete("entry_symptoms", {
      id: { [Op.in]: ENTRY_SYMPTOM_IDS },
    });
    await queryInterface.bulkDelete("daily_entries", {
      id: { [Op.in]: [ENTRY_A, ENTRY_B, ENTRY_C] },
    });

    await queryInterface.bulkInsert("daily_entries", [
      {
        id: ENTRY_A,
        user_id: ADMIN_USER_ID,
        entry_date: "2026-06-23",
        mood_rating: 4,
        sleep_hours: 8.0,
        journal_notes: "Felt better, lingering fatigue in the morning.",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_B,
        user_id: ADMIN_USER_ID,
        entry_date: "2026-06-22",
        mood_rating: 2,
        sleep_hours: 5.5,
        journal_notes: "Rough night, seasonal allergies flared up badly.",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_C,
        user_id: ADMIN_USER_ID,
        entry_date: "2026-06-20",
        mood_rating: 5,
        sleep_hours: 7.0,
        journal_notes: "Good day, only a faint headache early on.",
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("entry_symptoms", [
      {
        id: ENTRY_SYMPTOM_IDS[0],
        entry_id: ENTRY_A,
        user_symptom_id: "70000000-0000-0000-0000-000000000002", // Fatigue
        severity: 3,
        notes: "Eased after coffee.",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_SYMPTOM_IDS[1],
        entry_id: ENTRY_A,
        user_symptom_id: "70000000-0000-0000-0000-000000000003", // Nausea
        severity: 2,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_SYMPTOM_IDS[2],
        entry_id: ENTRY_B,
        user_symptom_id: "70000000-0000-0000-0000-000000000004", // Sneezing
        severity: 5,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_SYMPTOM_IDS[3],
        entry_id: ENTRY_B,
        user_symptom_id: "70000000-0000-0000-0000-000000000005", // Itchy Eyes
        severity: 4,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_SYMPTOM_IDS[4],
        entry_id: ENTRY_C,
        user_symptom_id: "70000000-0000-0000-0000-000000000001", // Headache
        severity: 2,
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("entry_conditions", [
      {
        id: ENTRY_CONDITION_IDS[0],
        entry_id: ENTRY_A,
        user_condition_id: "60000000-0000-0000-0000-000000000001", // Migraine
        status: "active",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_CONDITION_IDS[1],
        entry_id: ENTRY_B,
        user_condition_id: "60000000-0000-0000-0000-000000000002", // Seasonal Allergies
        status: "active",
        notes: "Pollen count high.",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_CONDITION_IDS[2],
        entry_id: ENTRY_C,
        user_condition_id: "60000000-0000-0000-0000-000000000001", // Migraine
        status: "resolved",
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("entry_medications", [
      {
        id: ENTRY_MEDICATION_IDS[0],
        entry_id: ENTRY_A,
        user_medication_id: "80000000-0000-0000-0000-000000000001", // Panadol
        quantity: 1,
        unit: "tablet",
        taken: true,
        taken_at: at("2026-06-23", "09:00:00"),
        created_at: now(),
        updated_at: now(),
      },
      {
        id: ENTRY_MEDICATION_IDS[1],
        entry_id: ENTRY_C,
        user_medication_id: "80000000-0000-0000-0000-000000000001", // Panadol
        quantity: 2,
        unit: "tablet",
        taken: true,
        taken_at: at("2026-06-20", "09:30:00"),
        notes: "Took with breakfast.",
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("entry_doctor_visits", [
      {
        id: ENTRY_DOCTOR_VISIT_IDS[0],
        entry_id: ENTRY_B,
        user_doctor_id: "82000000-0000-0000-0000-000000000001", // Dr. Sarah Johnson
        user_clinic_id: "81000000-0000-0000-0000-000000000001", // City Hospital
        summary: "Neurology follow-up for migraine management.",
        notes: "Advised to keep a symptom diary; review in 6 weeks.",
        created_at: now(),
        updated_at: now(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("entry_doctor_visits", {
      id: { [Op.in]: ENTRY_DOCTOR_VISIT_IDS },
    });
    await queryInterface.bulkDelete("entry_medications", {
      id: { [Op.in]: ENTRY_MEDICATION_IDS },
    });
    await queryInterface.bulkDelete("entry_conditions", {
      id: { [Op.in]: ENTRY_CONDITION_IDS },
    });
    await queryInterface.bulkDelete("entry_symptoms", {
      id: { [Op.in]: ENTRY_SYMPTOM_IDS },
    });
    await queryInterface.bulkDelete("daily_entries", {
      id: { [Op.in]: [ENTRY_A, ENTRY_B, ENTRY_C] },
    });
  },
};
