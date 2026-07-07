"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS symptom_catalog_name_unique
        ON symptom_catalog (name);

      CREATE UNIQUE INDEX IF NOT EXISTS condition_catalog_name_unique
        ON condition_catalog (name);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_medications_name_strength
        ON medications (name, COALESCE(strength, ''));

      CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_name_address
        ON clinics (name, COALESCE(address, ''));

      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_name_specialty_phone
        ON doctors (name, COALESCE(specialty, ''), COALESCE(phone, ''));
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS symptom_catalog_name_unique;
      DROP INDEX IF EXISTS condition_catalog_name_unique;
      DROP INDEX IF EXISTS idx_medications_name_strength;
      DROP INDEX IF EXISTS idx_clinics_name_address;
      DROP INDEX IF EXISTS idx_doctors_name_specialty_phone;
    `);
  },
};
