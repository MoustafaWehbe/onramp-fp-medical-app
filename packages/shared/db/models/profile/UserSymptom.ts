import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface UserSymptomAttributes {
  id: string;
  userId: string;
  catalogId?: string;
  customName?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSymptomCreationAttributes extends Optional<
  UserSymptomAttributes,
  "id" | "catalogId" | "customName" | "active"
> {}

export class UserSymptom
  extends Model<UserSymptomAttributes, UserSymptomCreationAttributes>
  implements UserSymptomAttributes
{
  declare id: string;
  declare userId: string;
  declare catalogId: string | undefined;
  declare customName: string | undefined;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserSymptom {
    UserSymptom.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE",
        },
        catalogId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "symptom_catalog", key: "id" },
          onDelete: "SET NULL",
        },
        customName: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "user_symptoms",
        timestamps: true,
        underscored: true,
        validate: {
          hasCatalogOrCustomName(this: UserSymptom) {
            const hasCatalog = this.catalogId != null;
            const hasCustomName = this.customName != null;

            if (hasCatalog === hasCustomName) {
              throw new Error(
                "UserSymptom must have either catalogId or customName.",
              );
            }
          },
        },
      },
    );
    return UserSymptom;
  }
}
