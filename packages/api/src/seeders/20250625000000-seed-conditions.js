"use strict";

const { Op } = require("sequelize");
const conditions = require("./data/conditions.en.json");

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
    const rows = conditions.map((c) => ({
      id: c.id,
      name: c.name,
      created_at: now(),
      updated_at: now(),
    }));

    for (const part of chunk(rows, CHUNK)) {
      await queryInterface.bulkInsert("condition_catalog", part, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    // Delete only rows this seeder inserted (content still matches the seed
    // payload). Rows that pre-existed before up() or were edited afterwards
    // survive, preserving user_conditions ownership links.
    for (const part of chunk(conditions, CHUNK)) {
      await queryInterface.bulkDelete("condition_catalog", {
        [Op.or]: part.map((c) => ({
          id: c.id,
          name: c.name,
        })),
      });
    }
  },
};
