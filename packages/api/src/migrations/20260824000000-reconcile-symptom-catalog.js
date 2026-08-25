"use strict";

// Reconciles existing databases with the cleaned symptoms.en.json catalog.
// The old seeder was recorded as already executed (seederStorage: "sequelize"),
// so these edits never reached databases seeded before the cleanup.
//
// Embedded snapshot taken from the main..HEAD diff of
// packages/api/src/seeders/data/symptoms.en.json plus the follow-up removal of
// two exact-duplicate names ("Itchy bottom" id …035 vs canonical …290,
// "Flatulence" id …214 vs canonical …213) whose loser ids can only exist in
// databases seeded before the dedupe. 42 entries are removed or retired, 29
// renamed in place under stable ids. Kept inline so this migration stays
// reproducible even if the JSON changes again later.

const REMOVED = [
  { id: "10000000-0000-4000-8000-000000000011", name: "Add images or other media for use on Wikipedia", category: "General" },
  { id: "10000000-0000-4000-8000-000000000032", name: "Anosmia, see Lost or changed sense of smell", category: "ENT" },
  { id: "10000000-0000-4000-8000-000000000035", name: "Anus (itchy), see Itchy bottom", category: "Skin" },
  { id: "10000000-0000-4000-8000-000000000043", name: "Arm pain, see Elbow and arm pain", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000046", name: "Articles related to current events", category: "General" },
  { id: "10000000-0000-4000-8000-000000000110", name: "Confusion (sudden), see Sudden confusion (delirium)", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000111", name: "Connect with NLM", category: "General" },
  { id: "10000000-0000-4000-8000-000000000114", name: "Copyright", category: "General" },
  { id: "10000000-0000-4000-8000-000000000214", name: "Flatulence, see Farting (flatulence)", category: "General" },
  { id: "10000000-0000-4000-8000-000000000228", name: "Guidance on how to use and edit Wikipedia", category: "General" },
  { id: "10000000-0000-4000-8000-000000000230", name: "Guides to browsing Wikipedia", category: "General" },
  { id: "10000000-0000-4000-8000-000000000256", name: "High temperature (fever) in children", category: "General" },
  { id: "10000000-0000-4000-8000-000000000258", name: "Hip pain in adults", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000259", name: "Hip pain in children (irritable hip)", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000261", name: "Hirsutism, see Excessive hair growth (hirsutism)", category: "Skin" },
  { id: "10000000-0000-4000-8000-000000000266", name: "How to contact Wikipedia", category: "General" },
  { id: "10000000-0000-4000-8000-000000000303", name: "Learn about Wikipedia and how it works", category: "ENT" },
  { id: "10000000-0000-4000-8000-000000000304", name: "Learn how to edit Wikipedia", category: "ENT" },
  { id: "10000000-0000-4000-8000-000000000338", name: "MedlinePlus Connect for EHRs", category: "General" },
  { id: "10000000-0000-4000-8000-000000000403", name: "Past revisions of this page [h]", category: "Eye" },
  { id: "10000000-0000-4000-8000-000000000425", name: "Printable version of this page [p]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000437", name: "Recent changes in pages linked from this page [k]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000455", name: "Seizures", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000463", name: "Shaking, see Tremor or shaking hands", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000496", name: "Structured data on this page hosted by Wikidata [g]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000498", name: "Subscribe to RSS", category: "General" },
  { id: "10000000-0000-4000-8000-000000000514", name: "Symptoms", category: "General" },
  { id: "10000000-0000-4000-8000-000000000525", name: "The hub for editors", category: "General" },
  { id: "10000000-0000-4000-8000-000000000554", name: "Upload files [u]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000566", name: "Vaginal bleeding between periods or after sex", category: "Genitourinary" },
  { id: "10000000-0000-4000-8000-000000000572", name: "View the category page [c]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000573", name: "View the content page [c]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000574", name: "Viewers & Players", category: "General" },
  { id: "10000000-0000-4000-8000-000000000577", name: "Visit a randomly selected article [x]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000578", name: "Visit the main page [z]", category: "General" },
  { id: "10000000-0000-4000-8000-000000000582", name: "Vomiting, see Diarrhoea and vomiting", category: "Digestive" },
  { id: "10000000-0000-4000-8000-000000000586", name: "Watering eyes", category: "Eye" },
  { id: "10000000-0000-4000-8000-000000000592", name: "Weight loss (unintentional), see Unintentional weight loss", category: "General" },
  { id: "10000000-0000-4000-8000-000000000593", name: "What to do if someone has a seizure (fit)", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000594", name: "What's New", category: "General" },
  { id: "10000000-0000-4000-8000-000000000603", name: "You are encouraged to create an account and log in; however, it is not mandatory", category: "General" },
  { id: "10000000-0000-4000-8000-000000000604", name: "You&#039;re encouraged to log in; however, it&#039;s not mandatory. [o]", category: "General" },
];

const RENAMED = [
  { id: "10000000-0000-4000-8000-000000000055", from: "Being sick, see Diarrhoea and vomiting", to: "Being sick", category: "Digestive" },
  { id: "10000000-0000-4000-8000-000000000059", from: "Bleeding after the menopause, see Postmenopausal bleeding", to: "Bleeding after the menopause", category: "General" },
  { id: "10000000-0000-4000-8000-000000000060", from: "Bleeding between periods or after sex, see Vaginal bleeding between periods or after sex", to: "Bleeding between periods or after sex", category: "Genitourinary" },
  { id: "10000000-0000-4000-8000-000000000061", from: "Bleeding from the bottom (rectal bleeding)", to: "Bleeding from the bottom", category: "General" },
  { id: "10000000-0000-4000-8000-000000000067", from: "Blood in phlegm, see Coughing up blood (blood in phlegm)", to: "Blood in phlegm", category: "Respiratory" },
  { id: "10000000-0000-4000-8000-000000000120", from: "Cyanosis, see Blue or grey skin or lips (cyanosis)", to: "Cyanosis", category: "Skin" },
  { id: "10000000-0000-4000-8000-000000000128", from: "Delirium, see Sudden confusion (delirium)", to: "Delirium", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000131", from: "Dental pain, see Toothache", to: "Dental pain", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000151", from: "Dry lips, see Sore or dry lips", to: "Dry lips", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000207", from: "Fever in adults, see High temperature (fever) in adults", to: "Fever in adults", category: "General" },
  { id: "10000000-0000-4000-8000-000000000208", from: "Fever in children, see High temperature (fever) in children", to: "Fever in children", category: "General" },
  { id: "10000000-0000-4000-8000-000000000211", from: "Fits (seizures), see What to do if someone has a seizure (fit)", to: "Fits (seizures)", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000255", from: "High temperature (fever) in adults", to: "High temperature", category: "General" },
  { id: "10000000-0000-4000-8000-000000000287", from: "Irritable hip, see Hip pain in children (irritable hip)", to: "Irritable hip", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000315", from: "Lips (sore or dry), see Sore or dry lips", to: "Lips (sore or dry)", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000327", from: "Low sex drive (loss of libido)", to: "Low sex drive", category: "General" },
  { id: "10000000-0000-4000-8000-000000000343", from: "Menstrual pain, see Period pain", to: "Menstrual pain", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000450", from: "Roundworm, see Worms in humans", to: "Roundworm", category: "General" },
  { id: "10000000-0000-4000-8000-000000000457", from: "Sense of smell (lost/changed), see Lost or changed sense of smell", to: "Lost sense of smell", category: "ENT" },
  { id: "10000000-0000-4000-8000-000000000483", from: "Soiling (child pooing their pants)", to: "Soiling", category: "General" },
  { id: "10000000-0000-4000-8000-000000000503", from: "Swallowing problems, see Dysphagia (swallowing problems)", to: "Swallowing problems", category: "General" },
  { id: "10000000-0000-4000-8000-000000000505", from: "Sweating at night, see Night sweats", to: "Night sweats", category: "General" },
  { id: "10000000-0000-4000-8000-000000000517", from: "Tapeworm, see Worms in humans", to: "Tapeworm", category: "General" },
  { id: "10000000-0000-4000-8000-000000000527", from: "Thirst (excessive), see Excessive thirst", to: "Excessive thirst", category: "General" },
  { id: "10000000-0000-4000-8000-000000000528", from: "Throat (sore), see Sore throat", to: "Throat (sore)", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000537", from: "Tongue (sore or white), see Sore or white tongue", to: "Sore tongue", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000542", from: "Tremor or shaking hands", to: "Shaking hands", category: "Neurological / Mental" },
  { id: "10000000-0000-4000-8000-000000000548", from: "Tummy ache, see Stomach ache", to: "Tummy ache", category: "Pain" },
  { id: "10000000-0000-4000-8000-000000000563", from: "Urine (smelly), see Smelly urine", to: "Urine", category: "ENT" },
];

function q(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function idList(entries) {
  return entries.map((entry) => q(entry.id)).join(", ");
}

function renameValues(entries, nameKey) {
  return entries
    .map((entry) => `(${q(entry.id)}::uuid, ${q(entry[nameKey])}, ${q(entry.category)})`)
    .join(", ");
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "symptom_catalog",
        "retired_at",
        { type: Sequelize.DATE, allowNull: true },
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE symptom_catalog AS sc
        SET retired_at = NOW()
        WHERE sc.id IN (${idList(REMOVED)})
          AND EXISTS (
            SELECT 1 FROM user_symptoms us WHERE us.catalog_id = sc.id
          );
      `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        DELETE FROM symptom_catalog
        WHERE id IN (${idList(REMOVED)})
          AND NOT EXISTS (
            SELECT 1 FROM user_symptoms us
            WHERE us.catalog_id = symptom_catalog.id
          );
      `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE symptom_catalog AS sc
        SET name = v.new_name,
            category = v.category::character varying(100),
            updated_at = NOW()
        FROM (VALUES ${renameValues(RENAMED, "to")}) AS v(id, new_name, category)
        WHERE sc.id = v.id
          AND NOT EXISTS (
            SELECT 1 FROM symptom_catalog other
            WHERE other.name = v.new_name
              AND other.language = sc.language
              AND other.id <> sc.id
          );
      `,
        { transaction },
      );

      const [renamedRows] = await queryInterface.sequelize.query(
        `SELECT id, name FROM symptom_catalog WHERE id IN (${idList(RENAMED)});`,
        { transaction },
      );
      for (const entry of RENAMED) {
        const row = renamedRows.find((r) => r.id === entry.id);
        if (!row || row.name !== entry.to) {
          console.warn(
            `[reconcile-symptom-catalog] skipped rename ${entry.id} "${entry.from}" -> "${entry.to}": target name unavailable`,
          );
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const restoreValues = REMOVED.map(
        (entry) =>
          `(${q(entry.id)}::uuid, ${q(entry.name)}, ${q(entry.category)}, 'en', false, NOW(), NOW())`,
      ).join(", ");

      await queryInterface.sequelize.query(
        `
        INSERT INTO symptom_catalog (id, name, category, language, is_custom, created_at, updated_at)
        VALUES ${restoreValues}
        ON CONFLICT DO NOTHING;
      `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `UPDATE symptom_catalog SET retired_at = NULL WHERE id IN (${idList(REMOVED)});`,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE symptom_catalog AS sc
        SET name = v.old_name,
            updated_at = NOW()
        FROM (VALUES ${renameValues(RENAMED, "from")}) AS v(id, old_name, category)
        WHERE sc.id = v.id
          AND NOT EXISTS (
            SELECT 1 FROM symptom_catalog other
            WHERE other.name = v.old_name
              AND other.language = sc.language
              AND other.id <> sc.id
          );
      `,
        { transaction },
      );

      await queryInterface.removeColumn("symptom_catalog", "retired_at", {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
