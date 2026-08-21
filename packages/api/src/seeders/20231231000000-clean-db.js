"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [tables] = await queryInterface.sequelize.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('SequelizeMeta', 'SequelizeData')
      ORDER BY tablename
    `);

    if (tables.length === 0) return;

    const list = tables.map((t) => `"${t.tablename}"`).join(", ");
    await queryInterface.sequelize.query(
      `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
    );
  },

  async down() {
    // Irreversible wipe — nothing to restore
  },
};
