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
      await queryInterface.bulkInsert("doctors", part);
    }
  },

  async down(queryInterface) {
    for (const part of chunk(
      doctors.map((d) => d.id),
      CHUNK,
    )) {
      await queryInterface.bulkDelete("doctors", {
        id: { [Op.in]: part },
      });
    }
  },
};
