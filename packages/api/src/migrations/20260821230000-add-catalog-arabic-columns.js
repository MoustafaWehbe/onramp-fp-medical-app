"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("condition_catalog", "name_ar", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("symptom_catalog", "name_ar", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("symptom_catalog", "category_ar", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn("medications", "name_ar", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("medications", "category_ar", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("medications", "category_ar");
    await queryInterface.removeColumn("medications", "name_ar");
    await queryInterface.removeColumn("symptom_catalog", "category_ar");
    await queryInterface.removeColumn("symptom_catalog", "name_ar");
    await queryInterface.removeColumn("condition_catalog", "name_ar");
  },
};
