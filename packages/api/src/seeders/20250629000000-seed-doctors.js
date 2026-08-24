"use strict";

const { Op } = require("sequelize");
const doctors = require("./data/doctors.json");

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
    const rows = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      phone: d.phone,
      created_at: now(),
      updated_at: now(),
    }));

    for (const part of chunk(rows, CHUNK)) {
      await queryInterface.bulkInsert("doctors", part, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    // Delete only rows this seeder inserted (content still matches the seed
    // payload). Rows that pre-existed before up() or were edited afterwards
    // survive, preserving user_doctors ownership links.
    for (const part of chunk(doctors, CHUNK)) {
      await queryInterface.bulkDelete("doctors", {
        [Op.or]: part.map((d) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty ?? null,
          phone: d.phone ?? null,
        })),
      });
    }
  },
};
