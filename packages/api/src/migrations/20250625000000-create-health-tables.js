"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const uuidPk = {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
    };

    const createdAt = {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    };

    const timestamps = {
      created_at: createdAt,
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };

    await queryInterface.createTable("symptom_catalog", {
      id: uuidPk,
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.createTable("condition_catalog", {
      id: uuidPk,
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      created_at: createdAt,
    });

    await queryInterface.createTable("medications", {
      id: uuidPk,
      name: { type: Sequelize.STRING(255), allowNull: false },
      strength: { type: Sequelize.STRING(100), allowNull: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_medications_name_strength
      ON medications (name, COALESCE(strength, ''));
    `);

    await queryInterface.createTable("clinics", {
      id: uuidPk,
      name: { type: Sequelize.STRING(255), allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: true },
      phone: { type: Sequelize.STRING(50), allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_clinics_name_address
      ON clinics (name, COALESCE(address, ''));
    `);

    await queryInterface.createTable("doctors", {
      id: uuidPk,
      name: { type: Sequelize.STRING(255), allowNull: false },
      specialty: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(50), allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.createTable("user_conditions", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      condition_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "condition_catalog", key: "id" },
        onDelete: "SET NULL",
      },
      custom_name: { type: Sequelize.STRING(255), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      diagnosed_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "active",
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ...timestamps,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE user_conditions
      ADD CONSTRAINT chk_user_condition_source
      CHECK (
        (condition_id IS NOT NULL AND custom_name IS NULL)
        OR
        (condition_id IS NULL AND custom_name IS NOT NULL)
      );
    `);

    await queryInterface.createTable("user_symptoms", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      catalog_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "symptom_catalog", key: "id" },
        onDelete: "SET NULL",
      },
      custom_name: { type: Sequelize.STRING(255), allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ...timestamps,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE user_symptoms
      ADD CONSTRAINT chk_user_symptom_source
      CHECK (
        (catalog_id IS NOT NULL AND custom_name IS NULL)
        OR
        (catalog_id IS NULL AND custom_name IS NOT NULL)
      );
    `);

    await queryInterface.createTable("condition_symptoms", {
      id: uuidPk,
      user_condition_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "user_conditions", key: "id" },
        onDelete: "CASCADE",
      },
      user_symptom_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "user_symptoms", key: "id" },
        onDelete: "CASCADE",
      },
      created_at: createdAt,
    });

    await queryInterface.addIndex("condition_symptoms", {
      fields: ["user_condition_id", "user_symptom_id"],
      unique: true,
      name: "condition_symptoms_user_condition_id_user_symptom_id_unique",
    });

    await queryInterface.createTable("user_medications", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      medication_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "medications", key: "id" },
        onDelete: "SET NULL",
      },
      custom_name: { type: Sequelize.STRING(255), allowNull: true },
      frequency: { type: Sequelize.STRING(100), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ...timestamps,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE user_medications
      ADD CONSTRAINT chk_user_medication_source
      CHECK (
        (medication_id IS NOT NULL AND custom_name IS NULL)
        OR
        (medication_id IS NULL AND custom_name IS NOT NULL)
      );
    `);

    await queryInterface.createTable("user_clinics", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      clinic_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "clinics", key: "id" },
        onDelete: "SET NULL",
      },
      custom_name: { type: Sequelize.STRING(255), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ...timestamps,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE user_clinics
      ADD CONSTRAINT chk_user_clinic_source
      CHECK (
        (clinic_id IS NOT NULL AND custom_name IS NULL)
        OR
        (clinic_id IS NULL AND custom_name IS NOT NULL)
      );
    `);

    await queryInterface.createTable("user_doctors", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "doctors", key: "id" },
        onDelete: "SET NULL",
      },
      custom_name: { type: Sequelize.STRING(255), allowNull: true },
      user_clinic_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "user_clinics", key: "id" },
        onDelete: "SET NULL",
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ...timestamps,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE user_doctors
      ADD CONSTRAINT chk_user_doctor_source
      CHECK (
        (doctor_id IS NOT NULL AND custom_name IS NULL)
        OR
        (doctor_id IS NULL AND custom_name IS NOT NULL)
      );
    `);

    await queryInterface.createTable("daily_entries", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      entry_date: { type: Sequelize.DATEONLY, allowNull: false },
      mood_rating: { type: Sequelize.SMALLINT, allowNull: true },
      sleep_hours: { type: Sequelize.FLOAT, allowNull: true },
      journal_notes: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps,
    });

    await queryInterface.addIndex("daily_entries", {
      fields: ["user_id", "entry_date"],
      unique: true,
      name: "daily_entries_user_id_entry_date_unique",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE daily_entries
      ADD CONSTRAINT chk_daily_entries_mood_rating
      CHECK (mood_rating IS NULL OR (mood_rating BETWEEN 1 AND 5)),
      ADD CONSTRAINT chk_daily_entries_sleep_hours
      CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24));
    `);

    await queryInterface.createTable("entry_conditions", {
      id: uuidPk,
      entry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "daily_entries", key: "id" },
        onDelete: "CASCADE",
      },
      user_condition_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "user_conditions", key: "id" },
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "active",
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.addIndex("entry_conditions", {
      fields: ["entry_id", "user_condition_id"],
      unique: true,
      name: "entry_conditions_entry_id_user_condition_id_unique",
    });

    await queryInterface.createTable("entry_symptoms", {
      id: uuidPk,
      entry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "daily_entries", key: "id" },
        onDelete: "CASCADE",
      },
      user_symptom_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "user_symptoms", key: "id" },
        onDelete: "RESTRICT",
      },
      severity: { type: Sequelize.SMALLINT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.addIndex("entry_symptoms", {
      fields: ["entry_id", "user_symptom_id"],
      unique: true,
      name: "entry_symptoms_entry_id_user_symptom_id_unique",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE entry_symptoms
      ADD CONSTRAINT chk_entry_symptoms_severity
      CHECK (severity IS NULL OR (severity BETWEEN 1 AND 10));
    `);

    await queryInterface.createTable("entry_medications", {
      id: uuidPk,
      entry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "daily_entries", key: "id" },
        onDelete: "CASCADE",
      },
      user_medication_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "user_medications", key: "id" },
        onDelete: "RESTRICT",
      },
      quantity: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      unit: { type: Sequelize.STRING(50), allowNull: false },
      taken: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      taken_at: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: createdAt,
    });

    await queryInterface.addIndex("entry_medications", {
      fields: ["entry_id", "user_medication_id", "taken_at"],
      unique: true,
      name: "entry_medications_entry_id_user_medication_id_taken_at_unique",
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE entry_medications
      ADD CONSTRAINT chk_entry_medications_quantity
      CHECK (quantity > 0);
    `);

    await queryInterface.createTable("entry_doctor_visits", {
      id: uuidPk,
      entry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "daily_entries", key: "id" },
        onDelete: "CASCADE",
      },
      user_doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "user_doctors", key: "id" },
        onDelete: "RESTRICT",
      },
      user_clinic_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "user_clinics", key: "id" },
        onDelete: "SET NULL",
      },
      summary: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps,
    });

    await queryInterface.addIndex("entry_doctor_visits", {
      fields: ["entry_id", "user_doctor_id"],
      unique: true,
      name: "entry_doctor_visits_entry_id_user_doctor_id_unique",
    });

    await queryInterface.createTable("ai_reports", {
      id: uuidPk,
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      date_range_start: { type: Sequelize.DATEONLY, allowNull: false },
      date_range_end: { type: Sequelize.DATEONLY, allowNull: false },
      report_content: { type: Sequelize.JSONB, allowNull: false },
      created_at: createdAt,
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_user_conditions_user
        ON user_conditions (user_id) WHERE active = true;
      CREATE INDEX idx_user_conditions_condition
        ON user_conditions (condition_id) WHERE condition_id IS NOT NULL;
      CREATE INDEX idx_user_conditions_custom
        ON user_conditions (custom_name) WHERE condition_id IS NULL;

      CREATE INDEX idx_user_symptoms_user ON user_symptoms (user_id);
      CREATE INDEX idx_user_symptoms_catalog
        ON user_symptoms (catalog_id) WHERE catalog_id IS NOT NULL;
      CREATE INDEX idx_user_symptoms_custom
        ON user_symptoms (custom_name) WHERE catalog_id IS NULL;

      CREATE INDEX idx_condition_symptoms_condition
        ON condition_symptoms (user_condition_id);

      CREATE INDEX idx_user_medications_user
        ON user_medications (user_id) WHERE active = true;
      CREATE INDEX idx_user_medications_med
        ON user_medications (medication_id) WHERE medication_id IS NOT NULL;
      CREATE INDEX idx_user_medications_custom
        ON user_medications (custom_name) WHERE medication_id IS NULL;

      CREATE INDEX idx_user_clinics_user
        ON user_clinics (user_id) WHERE active = true;
      CREATE INDEX idx_user_clinics_clinic
        ON user_clinics (clinic_id) WHERE clinic_id IS NOT NULL;
      CREATE INDEX idx_user_clinics_custom
        ON user_clinics (custom_name) WHERE clinic_id IS NULL;

      CREATE INDEX idx_user_doctors_user
        ON user_doctors (user_id) WHERE active = true;
      CREATE INDEX idx_user_doctors_doctor
        ON user_doctors (doctor_id) WHERE doctor_id IS NOT NULL;
      CREATE INDEX idx_user_doctors_custom
        ON user_doctors (custom_name) WHERE doctor_id IS NULL;
      CREATE INDEX idx_user_doctors_clinic
        ON user_doctors (user_clinic_id) WHERE user_clinic_id IS NOT NULL;

      CREATE INDEX idx_daily_entries_user_date
        ON daily_entries (user_id, entry_date);
      CREATE INDEX idx_entry_conditions_entry ON entry_conditions (entry_id);
      CREATE INDEX idx_entry_symptoms_entry ON entry_symptoms (entry_id);
      CREATE INDEX idx_entry_medications_entry ON entry_medications (entry_id);
      CREATE INDEX idx_entry_doctor_visits_entry ON entry_doctor_visits (entry_id);
      CREATE INDEX idx_ai_reports_user ON ai_reports (user_id, date_range_end);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ai_reports");
    await queryInterface.dropTable("entry_doctor_visits");
    await queryInterface.dropTable("entry_medications");
    await queryInterface.dropTable("entry_symptoms");
    await queryInterface.dropTable("entry_conditions");
    await queryInterface.dropTable("daily_entries");
    await queryInterface.dropTable("user_doctors");
    await queryInterface.dropTable("user_clinics");
    await queryInterface.dropTable("user_medications");
    await queryInterface.dropTable("condition_symptoms");
    await queryInterface.dropTable("user_symptoms");
    await queryInterface.dropTable("user_conditions");
    await queryInterface.dropTable("doctors");
    await queryInterface.dropTable("clinics");
    await queryInterface.dropTable("medications");
    await queryInterface.dropTable("condition_catalog");
    await queryInterface.dropTable("symptom_catalog");
  },
};
