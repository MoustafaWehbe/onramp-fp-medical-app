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
    for (const part of chunk(
      conditions.map((c) => c.id),
      CHUNK,
    )) {
      await queryInterface.bulkDelete("condition_catalog", {
        id: { [Op.in]: part },
      });
    }
  },
};
