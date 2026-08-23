"use strict";

const { Op } = require("sequelize");
const symptoms = require("./data/symptoms.en.json");

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
    const rows = symptoms.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category || null,
      created_at: now(),
      updated_at: now(),
    }));

    for (const part of chunk(rows, CHUNK)) {
      await queryInterface.bulkInsert("symptom_catalog", part, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    for (const part of chunk(
      symptoms.map((s) => s.id),
      CHUNK,
    )) {
      await queryInterface.bulkDelete("symptom_catalog", {
        id: { [Op.in]: part },
      });
    }
  },
};
