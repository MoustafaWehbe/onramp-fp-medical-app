"use strict";

const { Op } = require("sequelize");

const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";
const now = () => new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("symptom_catalog", [
      {
        id: "10000000-0000-0000-0000-000000000001",
        name: "Headache",
        category: "Pain",
        created_at: now(),
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        name: "Fatigue",
        category: "Energy",
        created_at: now(),
      },
      {
        id: "10000000-0000-0000-0000-000000000003",
        name: "Nausea",
        category: "Digestive",
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("condition_catalog", [
      {
        id: "20000000-0000-0000-0000-000000000001",
        name: "Migraine",
        created_at: now(),
      },
      {
        id: "20000000-0000-0000-0000-000000000002",
        name: "Diabetes",
        created_at: now(),
      },
      {
        id: "20000000-0000-0000-0000-000000000003",
        name: "Asthma",
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("medications", [
      {
        id: "30000000-0000-0000-0000-000000000001",
        name: "Panadol",
        strength: "500mg",
        category: "Painkiller",
        created_at: now(),
      },
      {
        id: "30000000-0000-0000-0000-000000000002",
        name: "Ibuprofen",
        strength: "400mg",
        category: "Painkiller",
        created_at: now(),
      },
      {
        id: "30000000-0000-0000-0000-000000000003",
        name: "Metformin",
        strength: "500mg",
        category: "Diabetes",
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("clinics", [
      {
        id: "40000000-0000-0000-0000-000000000001",
        name: "City Hospital",
        address: "123 Main St",
        phone: "+1-555-0101",
        created_at: now(),
      },
      {
        id: "40000000-0000-0000-0000-000000000002",
        name: "Downtown Clinic",
        address: "456 Oak Ave",
        phone: "+1-555-0102",
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("doctors", [
      {
        id: "50000000-0000-0000-0000-000000000001",
        name: "Dr. Sarah Johnson",
        specialty: "Neurology",
        phone: "+1-555-0201",
        created_at: now(),
      },
      {
        id: "50000000-0000-0000-0000-000000000002",
        name: "Dr. Michael Chen",
        specialty: "Cardiology",
        phone: "+1-555-0202",
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("user_conditions", [
      {
        id: "60000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        condition_id: "20000000-0000-0000-0000-000000000001",
        custom_name: null,
        status: "active",
        active: true,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: "60000000-0000-0000-0000-000000000002",
        user_id: ADMIN_USER_ID,
        condition_id: null,
        custom_name: "Seasonal Allergies",
        status: "active",
        active: true,
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("user_symptoms", [
      {
        id: "70000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        catalog_id: "10000000-0000-0000-0000-000000000001",
        custom_name: null,
        active: true,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: "70000000-0000-0000-0000-000000000002",
        user_id: ADMIN_USER_ID,
        catalog_id: "10000000-0000-0000-0000-000000000002",
        custom_name: null,
        active: true,
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("user_medications", [
      {
        id: "80000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        medication_id: "30000000-0000-0000-0000-000000000001",
        custom_name: null,
        frequency: "Twice daily",
        active: true,
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("user_clinics", [
      {
        id: "81000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        clinic_id: "40000000-0000-0000-0000-000000000001",
        custom_name: null,
        active: true,
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("user_doctors", [
      {
        id: "82000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        doctor_id: "50000000-0000-0000-0000-000000000001",
        custom_name: null,
        user_clinic_id: "81000000-0000-0000-0000-000000000001",
        active: true,
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("condition_symptoms", [
      {
        id: "83000000-0000-0000-0000-000000000001",
        user_condition_id: "60000000-0000-0000-0000-000000000001",
        user_symptom_id: "70000000-0000-0000-0000-000000000001",
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("daily_entries", [
      {
        id: "90000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        entry_date: "2026-06-24",
        mood_rating: 3,
        sleep_hours: 7.5,
        journal_notes: "Mild headache in the afternoon.",
        created_at: now(),
        updated_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("entry_symptoms", [
      {
        id: "91000000-0000-0000-0000-000000000001",
        entry_id: "90000000-0000-0000-0000-000000000001",
        user_symptom_id: "70000000-0000-0000-0000-000000000001",
        severity: 6,
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("entry_medications", [
      {
        id: "92000000-0000-0000-0000-000000000001",
        entry_id: "90000000-0000-0000-0000-000000000001",
        user_medication_id: "80000000-0000-0000-0000-000000000001",
        quantity: 1,
        unit: "tablet",
        taken: true,
        taken_at: now(),
        created_at: now(),
      },
    ]);

    await queryInterface.bulkInsert("ai_reports", [
      {
        id: "93000000-0000-0000-0000-000000000001",
        user_id: ADMIN_USER_ID,
        date_range_start: "2026-06-18",
        date_range_end: "2026-06-24",
        report_content: JSON.stringify({
          summary: "Patient logged mild headache and fatigue over the past week.",
          conditions: ["Migraine"],
          symptoms: ["Headache", "Fatigue"],
          medications: ["Panadol 500mg"],
          recommendations: ["Monitor symptom frequency and hydration."],
        }),
        created_at: now(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ai_reports", {
      id: "93000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("entry_medications", {
      id: "92000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("entry_symptoms", {
      id: "91000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("daily_entries", {
      id: "90000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("condition_symptoms", {
      id: "83000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("user_doctors", {
      id: "82000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("user_clinics", {
      id: "81000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("user_medications", {
      id: "80000000-0000-0000-0000-000000000001",
    });
    await queryInterface.bulkDelete("user_symptoms", {
      id: {
        [Op.in]: [
          "70000000-0000-0000-0000-000000000001",
          "70000000-0000-0000-0000-000000000002",
        ],
      },
    });
    await queryInterface.bulkDelete("user_conditions", {
      id: {
        [Op.in]: [
          "60000000-0000-0000-0000-000000000001",
          "60000000-0000-0000-0000-000000000002",
        ],
      },
    });
    await queryInterface.bulkDelete("doctors", {
      id: {
        [Op.in]: [
          "50000000-0000-0000-0000-000000000001",
          "50000000-0000-0000-0000-000000000002",
        ],
      },
    });
    await queryInterface.bulkDelete("clinics", {
      id: {
        [Op.in]: [
          "40000000-0000-0000-0000-000000000001",
          "40000000-0000-0000-0000-000000000002",
        ],
      },
    });
    await queryInterface.bulkDelete("medications", {
      id: {
        [Op.in]: [
          "30000000-0000-0000-0000-000000000001",
          "30000000-0000-0000-0000-000000000002",
          "30000000-0000-0000-0000-000000000003",
        ],
      },
    });
    await queryInterface.bulkDelete("condition_catalog", {
      id: {
        [Op.in]: [
          "20000000-0000-0000-0000-000000000001",
          "20000000-0000-0000-0000-000000000002",
          "20000000-0000-0000-0000-000000000003",
        ],
      },
    });
    await queryInterface.bulkDelete("symptom_catalog", {
      id: {
        [Op.in]: [
          "10000000-0000-0000-0000-000000000001",
          "10000000-0000-0000-0000-000000000002",
          "10000000-0000-0000-0000-000000000003",
        ],
      },
    });
  },
};
