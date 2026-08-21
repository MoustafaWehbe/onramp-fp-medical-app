"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("symptom_catalog", "language", {
      type: Sequelize.STRING(5),
      allowNull: false,
      defaultValue: "en",
    });

    await queryInterface.addIndex("symptom_catalog", ["language"], {
      name: "symptom_catalog_language_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "symptom_catalog",
      "symptom_catalog_language_idx",
    );
    await queryInterface.removeColumn("symptom_catalog", "language");
  },
};
