"use strict";

const { Op } = require("sequelize");
const medications = require("./data/medications.en.json");

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
    const rows = medications.map((m) => ({
      id: m.id,
      name: m.name,
      strength: m.strength,
      category: m.category,
      created_at: now(),
      updated_at: now(),
    }));

    for (const part of chunk(rows, CHUNK)) {
      await queryInterface.bulkInsert("medications", part, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    // Delete only rows this seeder inserted (content still matches the seed
    // payload). Rows that pre-existed before up() or were edited afterwards
    // survive, preserving user_medications ownership links.
    for (const part of chunk(medications, CHUNK)) {
      await queryInterface.bulkDelete("medications", {
        [Op.or]: part.map((m) => ({
          id: m.id,
          name: m.name,
          strength: m.strength ?? null,
          category: m.category ?? null,
        })),
      });
    }
  },
};
