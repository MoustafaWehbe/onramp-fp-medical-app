"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_doctors_name_phone;
      DROP INDEX IF EXISTS idx_doctors_name_specialty_phone;

      -- Soft-deactivate active user_doctors that would collide with an
      -- existing active (user_id, keeper.id) if remapped
      UPDATE user_doctors ud
      SET active = false
      FROM doctors d
      INNER JOIN LATERAL (
        SELECT id
        FROM doctors d2
        WHERE d2.phone = d.phone
        ORDER BY d2.created_at ASC, d2.id ASC
        LIMIT 1
      ) keeper ON TRUE
      WHERE ud.doctor_id = d.id
        AND d.id <> keeper.id
        AND d.phone IS NOT NULL
        AND ud.active = true
        AND EXISTS (
          SELECT 1
          FROM user_doctors existing
          WHERE existing.user_id = ud.user_id
            AND existing.doctor_id = keeper.id
            AND existing.active = true
        );

      -- Remap to keeper: skip only when update would create a second
      -- active (user_id, keeper.id) pair
      UPDATE user_doctors ud
      SET doctor_id = keeper.id
      FROM doctors d
      INNER JOIN LATERAL (
        SELECT id
        FROM doctors d2
        WHERE d2.phone = d.phone
        ORDER BY d2.created_at ASC, d2.id ASC
        LIMIT 1
      ) keeper ON TRUE
      WHERE ud.doctor_id = d.id
        AND d.id <> keeper.id
        AND d.phone IS NOT NULL
        AND (
          ud.active = false
          OR NOT EXISTS (
            SELECT 1
            FROM user_doctors existing
            WHERE existing.user_id = ud.user_id
              AND existing.doctor_id = keeper.id
              AND existing.active = true
              AND existing.id <> ud.id
          )
        );

      -- Remove duplicate doctor rows (same phone), keep one
      DELETE FROM doctors d
      USING (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY phone
                 ORDER BY created_at ASC, id ASC
               ) AS rn
        FROM doctors
        WHERE phone IS NOT NULL
      ) ranked
      WHERE d.id = ranked.id
        AND ranked.rn > 1;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_phone
        ON doctors (phone);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_doctors_phone;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_name_phone
        ON doctors (name, COALESCE(phone, ''));
    `);
  },
};
