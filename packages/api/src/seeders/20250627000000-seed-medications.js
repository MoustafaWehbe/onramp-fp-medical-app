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
      await queryInterface.bulkInsert("medications", part);
    }
  },

  async down(queryInterface) {
    for (const part of chunk(
      medications.map((m) => m.id),
      CHUNK,
    )) {
      await queryInterface.bulkDelete("medications", {
        id: { [Op.in]: part },
      });
    }
  },
};
