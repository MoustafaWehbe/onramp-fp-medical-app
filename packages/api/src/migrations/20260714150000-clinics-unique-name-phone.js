"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_clinics_name_address;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_name_phone
        ON clinics (name, COALESCE(phone, ''));
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_clinics_name_phone;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_name_address
        ON clinics (name, COALESCE(address, ''));
    `);
  },
};
