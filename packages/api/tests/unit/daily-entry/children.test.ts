import { UniqueConstraintError } from "sequelize";
import { EntryCondition, UserCondition } from "../../../src/models";
import {
  insertChildren,
  reconcileConditions,
} from "../../../src/services/daily-entry/children";
import { createError } from "../../../src/middleware/error-handler";

jest.mock("../../../src/models", () => ({
  EntryCondition: {
    findAll: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
  },
  UserCondition: {
    update: jest.fn(),
  },
}));

jest.mock("../../../src/middleware/error-handler", () => ({
  createError: jest.fn((message: string, statusCode: number) => ({
    message,
    statusCode,
  })),
}));

const mockEntryCondition = EntryCondition as jest.Mocked<typeof EntryCondition>;
const mockUserCondition = UserCondition as jest.Mocked<typeof UserCondition>;
const mockCreateError = createError as jest.MockedFunction<typeof createError>;

const fakeTx = { isTransaction: true };

function existingRow(userConditionId: string) {
  return {
    userConditionId,
    update: jest.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("reconcileConditions", () => {
  it("creates submitted conditions as active, updates existing to active, and sets removed to inactive", async () => {
    const stays = existingRow("cond-stays");
    const removed = existingRow("cond-removed");
    mockEntryCondition.findAll.mockResolvedValue([stays, removed] as never);
    mockEntryCondition.create.mockResolvedValue({ id: "new-id" } as never);
    mockUserCondition.update.mockResolvedValue([1] as never);

    await reconcileConditions(
      "entry-1",
      [
        { userConditionId: "cond-stays", notes: "still active" },
        { userConditionId: "cond-added" },
      ],
      fakeTx as never,
    );

    expect(mockEntryCondition.findAll).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      transaction: fakeTx,
    });

    expect(mockEntryCondition.create).toHaveBeenCalledWith(
      {
        entryId: "entry-1",
        userConditionId: "cond-added",
        status: "active",
        notes: undefined,
      },
      { transaction: fakeTx, validate: true },
    );

    expect(stays.update).toHaveBeenCalledWith(
      { status: "active", notes: "still active" },
      { transaction: fakeTx },
    );

    expect(removed.update).toHaveBeenCalledWith(
      { status: "inactive" },
      { transaction: fakeTx },
    );

    expect(mockUserCondition.update).toHaveBeenCalledWith(
      { status: "active" },
      { where: { id: ["cond-stays", "cond-added"] }, transaction: fakeTx },
    );

    expect(mockUserCondition.update).toHaveBeenCalledWith(
      { status: "inactive" },
      { where: { id: ["cond-removed"], status: "active" }, transaction: fakeTx },
    );
  });

  it("does not downgrade resolved user conditions to inactive when removed", async () => {
    const removed = existingRow("cond-resolved");
    mockEntryCondition.findAll.mockResolvedValue([removed] as never);
    mockUserCondition.update.mockResolvedValue([1] as never);

    await reconcileConditions(
      "entry-1",
      [{ userConditionId: "cond-added" }],
      fakeTx as never,
    );

    expect(mockUserCondition.update).toHaveBeenCalledWith(
      { status: "active" },
      { where: { id: ["cond-added"] }, transaction: fakeTx },
    );

    expect(mockUserCondition.update).toHaveBeenCalledWith(
      { status: "inactive" },
      { where: { id: ["cond-resolved"], status: "active" }, transaction: fakeTx },
    );
  });

  it("rethrows duplicate creates as 409", async () => {
    mockEntryCondition.findAll.mockResolvedValue([] as never);
    mockEntryCondition.create.mockRejectedValue(new UniqueConstraintError());
    mockCreateError.mockReturnValue({
      message: "Duplicate condition for this entry",
      statusCode: 409,
    } as never);

    await expect(
      reconcileConditions(
        "entry-1",
        [{ userConditionId: "cond-1" }],
        fakeTx as never,
      ),
    ).rejects.toMatchObject({
      message: "Duplicate condition for this entry",
      statusCode: 409,
    });
  });
});

describe("insertChildren", () => {
  it("does not insert conditions (handled by reconcileConditions)", async () => {
    mockEntryCondition.bulkCreate.mockResolvedValue([] as never);

    await insertChildren(
      "entry-1",
      {
        conditions: [{ userConditionId: "cond-1" }],
      } as never,
      fakeTx as never,
    );

    expect(mockEntryCondition.bulkCreate).not.toHaveBeenCalled();
  });
});
