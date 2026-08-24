"use strict";

const { hashPassword } = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await require("bcryptjs").hash("Admin1234!", 12);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: "00000000-0000-0000-0000-000000000001",
          email: "admin@example.com",
          password_hash: passwordHash,
          name: "Admin User",
          role: "admin",
          email_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    // Delete only the seeded admin row (fixed id + expected attributes).
    // A different user occupying the id or email survives.
    await queryInterface.bulkDelete("users", {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@example.com",
      role: "admin",
    });
  },
};
