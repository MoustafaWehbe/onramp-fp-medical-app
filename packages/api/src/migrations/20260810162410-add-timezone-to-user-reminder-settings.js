'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn(
      "user_reminder_settings",
      "timezone",
      {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "UTC",
      },
    );
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn(
      "user_reminder_settings",
      "timezone",
    );
  }
};
