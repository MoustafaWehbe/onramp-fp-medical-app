'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX condition_catalog_name_lower_unique
      ON condition_catalog (LOWER(name));
    `);
  },
   async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS condition_catalog_name_lower_unique;
    `);
  },
};
