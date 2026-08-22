"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE symptom_catalog
      DROP CONSTRAINT IF EXISTS symptom_catalog_name_key;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS symptom_catalog_name;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS symptom_catalog_name_unique;
    `);

    await queryInterface.addIndex("symptom_catalog", ["name", "language"], {
      unique: true,
      name: "symptom_catalog_name_language_unique",
    });
  },

  async down() {
    throw new Error(
      "Irreversible: symptom_catalog may contain the same name in multiple languages; restoring a name-only unique index is unsafe.",
    );
  },
};
