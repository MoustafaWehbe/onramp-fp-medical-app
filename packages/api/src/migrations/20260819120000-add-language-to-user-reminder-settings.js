module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_reminder_settings", "language", {
      type: Sequelize.STRING(2),
      allowNull: false,
      defaultValue: "en",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("user_reminder_settings", "language");
  },
};