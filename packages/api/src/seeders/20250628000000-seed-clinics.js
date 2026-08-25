"use strict";

const { Op } = require("sequelize");
const clinics = require("./data/clinics.json");

const CHUNK = 500;
const now = () => new Date();

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const rows = clinics.map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      phone: c.phone,
      created_at: now(),
      updated_at: now(),
    }));

    for (const part of chunk(rows, CHUNK)) {
      await queryInterface.bulkInsert("clinics", part, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    // Delete only rows this seeder inserted (content still matches the seed
    // payload). Rows that pre-existed before up() or were edited afterwards
    // survive, preserving user_clinics ownership links.
    for (const part of chunk(clinics, CHUNK)) {
      await queryInterface.bulkDelete("clinics", {
        [Op.or]: part.map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address ?? null,
          phone: c.phone ?? null,
        })),
      });
    }
  },
};
