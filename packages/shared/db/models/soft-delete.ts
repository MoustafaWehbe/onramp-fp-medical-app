import { DataTypes } from "sequelize";

export const activeColumn = {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
  allowNull: false,
};

export const softDeleteModelOptions = {
  defaultScope: {
    where: { active: true },
  },
  scopes: {
    withInactive: {},
  },
};
