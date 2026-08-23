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
    for (const part of chunk(
      clinics.map((c) => c.id),
      CHUNK,
    )) {
      await queryInterface.bulkDelete("clinics", {
        id: { [Op.in]: part },
      });
    }
  },
};
