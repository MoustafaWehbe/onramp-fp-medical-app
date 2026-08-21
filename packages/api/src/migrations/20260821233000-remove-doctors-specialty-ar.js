"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("doctors");
    if (table.specialty_ar) {
      await queryInterface.removeColumn("doctors", "specialty_ar");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("doctors");
    if (!table.specialty_ar) {
      await queryInterface.addColumn("doctors", "specialty_ar", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },
};
