export function toHhMm(
  value: string | Date | null | undefined,
): string | null {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    // TIME is a wall-clock value; Sequelize Date wrappers are UTC-based.
    return `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;
  }

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}
