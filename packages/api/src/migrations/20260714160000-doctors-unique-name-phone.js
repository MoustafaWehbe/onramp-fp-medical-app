"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_doctors_name_specialty_phone;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_name_phone
        ON doctors (name, COALESCE(phone, ''));
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_doctors_name_phone;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_name_specialty_phone
        ON doctors (name, COALESCE(specialty, ''), COALESCE(phone, ''));
    `);
  },
};
