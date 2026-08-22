"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("medications");
    if (table.category_ar) {
      await queryInterface.removeColumn("medications", "category_ar");
    }
    if (table.name_ar) {
      await queryInterface.removeColumn("medications", "name_ar");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("medications");
    if (!table.name_ar) {
      await queryInterface.addColumn("medications", "name_ar", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
    if (!table.category_ar) {
      await queryInterface.addColumn("medications", "category_ar", {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }
  },
};
