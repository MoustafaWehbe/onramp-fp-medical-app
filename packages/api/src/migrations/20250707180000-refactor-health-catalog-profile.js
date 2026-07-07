"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const addUpdatedAt = async (table) => {
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
      `);
    };

    await addUpdatedAt("symptom_catalog");
    await addUpdatedAt("condition_catalog");
    await addUpdatedAt("medications");
    await addUpdatedAt("clinics");
    await addUpdatedAt("doctors");
    await addUpdatedAt("condition_symptoms");
    await addUpdatedAt("entry_conditions");
    await addUpdatedAt("entry_symptoms");
    await addUpdatedAt("entry_medications");
    await addUpdatedAt("ai_reports");

    await queryInterface.sequelize.query(`
      ALTER TABLE user_conditions DROP CONSTRAINT IF EXISTS chk_user_condition_source;
      ALTER TABLE user_symptoms DROP CONSTRAINT IF EXISTS chk_user_symptom_source;
      ALTER TABLE user_medications DROP CONSTRAINT IF EXISTS chk_user_medication_source;
      ALTER TABLE user_clinics DROP CONSTRAINT IF EXISTS chk_user_clinic_source;
      ALTER TABLE user_doctors DROP CONSTRAINT IF EXISTS chk_user_doctor_source;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO condition_catalog (id, name, created_at, updated_at)
      SELECT gen_random_uuid(), uc.custom_name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM user_conditions uc
      WHERE uc.custom_name IS NOT NULL
        AND uc.condition_id IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM condition_catalog cc WHERE cc.name = uc.custom_name
        );

      UPDATE user_conditions uc
      SET condition_id = cc.id,
          custom_name = NULL
      FROM condition_catalog cc
      WHERE uc.custom_name IS NOT NULL
        AND uc.condition_id IS NULL
        AND cc.name = uc.custom_name;

      INSERT INTO symptom_catalog (id, name, created_at, updated_at)
      SELECT gen_random_uuid(), us.custom_name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM user_symptoms us
      WHERE us.custom_name IS NOT NULL
        AND us.catalog_id IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM symptom_catalog sc WHERE sc.name = us.custom_name
        );

      UPDATE user_symptoms us
      SET catalog_id = sc.id,
          custom_name = NULL
      FROM symptom_catalog sc
      WHERE us.custom_name IS NOT NULL
        AND us.catalog_id IS NULL
        AND sc.name = us.custom_name;

      INSERT INTO medications (id, name, strength, created_at, updated_at)
      SELECT gen_random_uuid(), um.custom_name, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM user_medications um
      WHERE um.custom_name IS NOT NULL
        AND um.medication_id IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM medications m
          WHERE m.name = um.custom_name AND COALESCE(m.strength, '') = ''
        );

      UPDATE user_medications um
      SET medication_id = m.id,
          custom_name = NULL
      FROM medications m
      WHERE um.custom_name IS NOT NULL
        AND um.medication_id IS NULL
        AND m.name = um.custom_name
        AND COALESCE(m.strength, '') = '';

      INSERT INTO clinics (id, name, address, phone, created_at, updated_at)
      SELECT gen_random_uuid(), ucl.custom_name, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM user_clinics ucl
      WHERE ucl.custom_name IS NOT NULL
        AND ucl.clinic_id IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM clinics c
          WHERE c.name = ucl.custom_name AND COALESCE(c.address, '') = ''
        );

      UPDATE user_clinics ucl
      SET clinic_id = c.id,
          custom_name = NULL
      FROM clinics c
      WHERE ucl.custom_name IS NOT NULL
        AND ucl.clinic_id IS NULL
        AND c.name = ucl.custom_name
        AND COALESCE(c.address, '') = '';

      INSERT INTO doctors (id, name, specialty, phone, created_at, updated_at)
      SELECT gen_random_uuid(), ud.custom_name, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM user_doctors ud
      WHERE ud.custom_name IS NOT NULL
        AND ud.doctor_id IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM doctors d
          WHERE d.name = ud.custom_name
            AND COALESCE(d.specialty, '') = ''
            AND COALESCE(d.phone, '') = ''
        );

      UPDATE user_doctors ud
      SET doctor_id = d.id,
          custom_name = NULL
      FROM doctors d
      WHERE ud.custom_name IS NOT NULL
        AND ud.doctor_id IS NULL
        AND d.name = ud.custom_name
        AND COALESCE(d.specialty, '') = ''
        AND COALESCE(d.phone, '') = '';
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM user_conditions WHERE condition_id IS NULL;
      DELETE FROM user_symptoms WHERE catalog_id IS NULL;
      DELETE FROM user_medications WHERE medication_id IS NULL;
      DELETE FROM user_clinics WHERE clinic_id IS NULL;
      DELETE FROM user_doctors WHERE doctor_id IS NULL;
    `);

    await queryInterface.removeColumn("user_conditions", "custom_name");
    await queryInterface.removeColumn("user_symptoms", "custom_name");
    await queryInterface.removeColumn("user_medications", "custom_name");
    await queryInterface.removeColumn("user_clinics", "custom_name");
    await queryInterface.removeColumn("user_doctors", "custom_name");

    const profileFkMigrations = [
      {
        table: "user_conditions",
        column: "condition_id",
        refTable: "condition_catalog",
      },
      {
        table: "user_symptoms",
        column: "catalog_id",
        refTable: "symptom_catalog",
      },
      {
        table: "user_medications",
        column: "medication_id",
        refTable: "medications",
      },
      { table: "user_clinics", column: "clinic_id", refTable: "clinics" },
      { table: "user_doctors", column: "doctor_id", refTable: "doctors" },
    ];

    for (const { table, column, refTable } of profileFkMigrations) {
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table}
          DROP CONSTRAINT IF EXISTS ${table}_${column}_fkey;
        ALTER TABLE ${table}
          ALTER COLUMN ${column} SET NOT NULL;
        ALTER TABLE ${table}
          ADD CONSTRAINT ${table}_${column}_fkey
          FOREIGN KEY (${column}) REFERENCES ${refTable}(id) ON DELETE NO ACTION;
      `);
    }

    await queryInterface.addColumn("user_medications", "dosage", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("user_medications", "dosage_measurement", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE user_medications
      ADD CONSTRAINT chk_user_medication_dosage
      CHECK (
        (dosage IS NULL AND dosage_measurement IS NULL)
        OR (dosage IS NOT NULL AND dosage_measurement IS NOT NULL)
      ),
      ADD CONSTRAINT chk_user_medication_dosage_value
      CHECK (dosage IS NULL OR dosage >= 0),
      ADD CONSTRAINT chk_user_medication_dosage_measurement
      CHECK (
        dosage_measurement IS NULL
        OR dosage_measurement IN ('mg', 'g', 'ml', 'mcg', 'tablet', 'capsule', 'drop', 'unit')
      );

      DROP INDEX IF EXISTS idx_user_conditions_custom;
      DROP INDEX IF EXISTS idx_user_symptoms_custom;
      DROP INDEX IF EXISTS idx_user_medications_custom;
      DROP INDEX IF EXISTS idx_user_clinics_custom;
      DROP INDEX IF EXISTS idx_user_doctors_custom;
      DROP INDEX IF EXISTS idx_daily_entries_user_date;

      CREATE UNIQUE INDEX IF NOT EXISTS user_conditions_user_condition_active_unique
        ON user_conditions (user_id, condition_id) WHERE active = true;
      CREATE UNIQUE INDEX IF NOT EXISTS user_symptoms_user_catalog_active_unique
        ON user_symptoms (user_id, catalog_id) WHERE active = true;
      CREATE UNIQUE INDEX IF NOT EXISTS user_medications_user_medication_active_unique
        ON user_medications (user_id, medication_id) WHERE active = true;
      CREATE UNIQUE INDEX IF NOT EXISTS user_clinics_user_clinic_active_unique
        ON user_clinics (user_id, clinic_id) WHERE active = true;
      CREATE UNIQUE INDEX IF NOT EXISTS user_doctors_user_doctor_active_unique
        ON user_doctors (user_id, doctor_id) WHERE active = true;

      DROP INDEX IF EXISTS idx_user_conditions_condition;
      CREATE INDEX IF NOT EXISTS idx_user_conditions_condition
        ON user_conditions (condition_id);

      DROP INDEX IF EXISTS idx_user_symptoms_catalog;
      CREATE INDEX IF NOT EXISTS idx_user_symptoms_catalog
        ON user_symptoms (catalog_id);

      DROP INDEX IF EXISTS idx_user_medications_med;
      CREATE INDEX IF NOT EXISTS idx_user_medications_med
        ON user_medications (medication_id);

      DROP INDEX IF EXISTS idx_user_clinics_clinic;
      CREATE INDEX IF NOT EXISTS idx_user_clinics_clinic
        ON user_clinics (clinic_id);

      DROP INDEX IF EXISTS idx_user_doctors_doctor;
      CREATE INDEX IF NOT EXISTS idx_user_doctors_doctor
        ON user_doctors (doctor_id);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS user_conditions_user_condition_active_unique;
      DROP INDEX IF EXISTS user_symptoms_user_catalog_active_unique;
      DROP INDEX IF EXISTS user_medications_user_medication_active_unique;
      DROP INDEX IF EXISTS user_clinics_user_clinic_active_unique;
      DROP INDEX IF EXISTS user_doctors_user_doctor_active_unique;

      ALTER TABLE user_medications DROP CONSTRAINT IF EXISTS chk_user_medication_dosage;
      ALTER TABLE user_medications DROP CONSTRAINT IF EXISTS chk_user_medication_dosage_value;
      ALTER TABLE user_medications DROP CONSTRAINT IF EXISTS chk_user_medication_dosage_measurement;
    `);

    await queryInterface.removeColumn("user_medications", "dosage_measurement");
    await queryInterface.removeColumn("user_medications", "dosage");

    await queryInterface.addColumn("user_conditions", "custom_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("user_symptoms", "custom_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("user_medications", "custom_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("user_clinics", "custom_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("user_doctors", "custom_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    const profileFkMigrations = [
      {
        table: "user_conditions",
        column: "condition_id",
        refTable: "condition_catalog",
      },
      {
        table: "user_symptoms",
        column: "catalog_id",
        refTable: "symptom_catalog",
      },
      {
        table: "user_medications",
        column: "medication_id",
        refTable: "medications",
      },
      { table: "user_clinics", column: "clinic_id", refTable: "clinics" },
      { table: "user_doctors", column: "doctor_id", refTable: "doctors" },
    ];

    for (const { table, column, refTable } of profileFkMigrations) {
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table}
          DROP CONSTRAINT IF EXISTS ${table}_${column}_fkey;
        ALTER TABLE ${table}
          ALTER COLUMN ${column} DROP NOT NULL;
        ALTER TABLE ${table}
          ADD CONSTRAINT ${table}_${column}_fkey
          FOREIGN KEY (${column}) REFERENCES ${refTable}(id) ON DELETE SET NULL;
      `);
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE user_conditions
      ADD CONSTRAINT chk_user_condition_source
      CHECK (
        (condition_id IS NOT NULL AND custom_name IS NULL)
        OR (condition_id IS NULL AND custom_name IS NOT NULL)
      );
      ALTER TABLE user_symptoms
      ADD CONSTRAINT chk_user_symptom_source
      CHECK (
        (catalog_id IS NOT NULL AND custom_name IS NULL)
        OR (catalog_id IS NULL AND custom_name IS NOT NULL)
      );
      ALTER TABLE user_medications
      ADD CONSTRAINT chk_user_medication_source
      CHECK (
        (medication_id IS NOT NULL AND custom_name IS NULL)
        OR (medication_id IS NULL AND custom_name IS NOT NULL)
      );
      ALTER TABLE user_clinics
      ADD CONSTRAINT chk_user_clinic_source
      CHECK (
        (clinic_id IS NOT NULL AND custom_name IS NULL)
        OR (clinic_id IS NULL AND custom_name IS NOT NULL)
      );
      ALTER TABLE user_doctors
      ADD CONSTRAINT chk_user_doctor_source
      CHECK (
        (doctor_id IS NOT NULL AND custom_name IS NULL)
        OR (doctor_id IS NULL AND custom_name IS NOT NULL)
      );

      CREATE INDEX IF NOT EXISTS idx_user_conditions_custom
        ON user_conditions (custom_name) WHERE condition_id IS NULL;
      CREATE INDEX IF NOT EXISTS idx_user_symptoms_custom
        ON user_symptoms (custom_name) WHERE catalog_id IS NULL;
      CREATE INDEX IF NOT EXISTS idx_user_medications_custom
        ON user_medications (custom_name) WHERE medication_id IS NULL;
      CREATE INDEX IF NOT EXISTS idx_user_clinics_custom
        ON user_clinics (custom_name) WHERE clinic_id IS NULL;
      CREATE INDEX IF NOT EXISTS idx_user_doctors_custom
        ON user_doctors (custom_name) WHERE doctor_id IS NULL;
      CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date
        ON daily_entries (user_id, entry_date);
    `);

    const tablesWithUpdatedAt = [
      "symptom_catalog",
      "condition_catalog",
      "medications",
      "clinics",
      "doctors",
      "condition_symptoms",
      "entry_conditions",
      "entry_symptoms",
      "entry_medications",
      "ai_reports",
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryInterface.removeColumn(table, "updated_at");
    }
  },
};
