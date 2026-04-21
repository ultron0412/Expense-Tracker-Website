const mongoose = require("mongoose");
const request = require("supertest");

const TEST_DB_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/expense-tracker-test";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.MONGO_URI = process.env.MONGO_URI || TEST_DB_URI;

const app = require("../app");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

async function createUserAndToken(name) {
  const email = `${name.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
  const response = await request(app).post("/api/auth/signup").send({
    name,
    email,
    password: "test1234",
  });

  return {
    token: response.body.token,
    userId: response.body.user.id,
  };
}

async function createTransaction(token, payload) {
  const response = await request(app)
    .post("/api/transactions")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  return response.body.transaction;
}

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Transaction.deleteMany({})]);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe("Authorization boundaries", () => {
  test("GET /api/transactions returns only authenticated user records", async () => {
    const userA = await createUserAndToken("Alice");
    const userB = await createUserAndToken("Bob");

    await createTransaction(userA.token, {
      title: "Alice Rent",
      amount: 1200,
      type: "expense",
      category: "Rent",
      date: "2026-04-20T00:00:00.000Z",
    });

    await createTransaction(userB.token, {
      title: "Bob Salary",
      amount: 4200,
      type: "income",
      category: "Salary",
      date: "2026-04-19T00:00:00.000Z",
    });

    const response = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(response.status).toBe(200);
    expect(response.body.transactions).toHaveLength(1);
    expect(response.body.transactions[0].title).toBe("Alice Rent");
    expect(response.body.transactions[0].userId).toBe(String(userA.userId));
  });

  test("PUT /api/transactions/:id cannot update another user's transaction", async () => {
    const userA = await createUserAndToken("Alice");
    const userB = await createUserAndToken("Bob");

    const userATransaction = await createTransaction(userA.token, {
      title: "Private Record",
      amount: 80,
      type: "expense",
      category: "Transport",
      date: "2026-04-20T00:00:00.000Z",
    });

    const updateAttempt = await request(app)
      .put(`/api/transactions/${userATransaction._id}`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({
        title: "Unauthorized Update",
        amount: 90,
        type: "expense",
        category: "Transport",
        date: "2026-04-20T00:00:00.000Z",
      });

    expect(updateAttempt.status).toBe(404);

    const transactionInDb = await Transaction.findById(userATransaction._id).lean();
    expect(transactionInDb.title).toBe("Private Record");
    expect(String(transactionInDb.userId)).toBe(String(userA.userId));
  });

  test("DELETE /api/transactions/:id cannot delete another user's transaction", async () => {
    const userA = await createUserAndToken("Alice");
    const userB = await createUserAndToken("Bob");

    const userATransaction = await createTransaction(userA.token, {
      title: "Untouchable Transaction",
      amount: 200,
      type: "expense",
      category: "Utilities",
      date: "2026-04-20T00:00:00.000Z",
    });

    const deleteAttempt = await request(app)
      .delete(`/api/transactions/${userATransaction._id}`)
      .set("Authorization", `Bearer ${userB.token}`);

    expect(deleteAttempt.status).toBe(404);

    const transactionInDb = await Transaction.findById(userATransaction._id).lean();
    expect(transactionInDb).toBeTruthy();
    expect(transactionInDb.title).toBe("Untouchable Transaction");
  });
});
