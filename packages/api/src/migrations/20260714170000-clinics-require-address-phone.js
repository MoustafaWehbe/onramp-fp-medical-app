"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE clinics SET address = '' WHERE address IS NULL;
      UPDATE clinics SET phone = '' WHERE phone IS NULL;
    `);

    await queryInterface.changeColumn("clinics", "address", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("clinics", "phone", {
      type: Sequelize.STRING(50),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("clinics", "address", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("clinics", "phone", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },
};
