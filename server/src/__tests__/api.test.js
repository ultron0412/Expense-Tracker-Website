const mongoose = require("mongoose");
const request = require("supertest");

const TEST_DB_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/expense-tracker-test";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.MONGO_URI = process.env.MONGO_URI || TEST_DB_URI;

const app = require("../app");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

async function createUserAndToken() {
  const email = `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
  const signupRes = await request(app).post("/api/auth/signup").send({
    name: "Test User",
    email,
    password: "test1234",
  });

  return {
    email,
    token: signupRes.body.token,
    userId: signupRes.body.user?.id,
  };
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

describe("Auth API", () => {
  test("POST /api/auth/signup creates a user and returns token", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "test1234",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe("jane@example.com");

    const userInDb = await User.findOne({ email: "jane@example.com" });
    expect(userInDb).toBeTruthy();
    expect(userInDb.password).not.toBe("test1234");
  });

  test("POST /api/auth/signup rejects duplicate email", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "test1234",
    });

    const response = await request(app).post("/api/auth/signup").send({
      name: "Jane Clone",
      email: "jane@example.com",
      password: "test1234",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/email already in use/i);
  });

  test("POST /api/auth/login returns token for valid credentials", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "test1234",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "test1234",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe("jane@example.com");
  });
});

describe("Transactions API", () => {
  test("GET /api/transactions requires auth", async () => {
    const response = await request(app).get("/api/transactions");
    expect(response.status).toBe(401);
  });

  test("full CRUD flow for authenticated user", async () => {
    const { token } = await createUserAndToken();
    expect(token).toBeTruthy();

    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Groceries",
        amount: 120.5,
        type: "expense",
        category: "Food",
        date: "2026-04-13T00:00:00.000Z",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.transaction.title).toBe("Groceries");
    const id = createResponse.body.transaction._id;

    const listResponse = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.transactions).toHaveLength(1);

    const updateResponse = await request(app)
      .put(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Groceries Updated",
        amount: 135,
        type: "expense",
        category: "Food",
        date: "2026-04-13T00:00:00.000Z",
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.transaction.title).toBe("Groceries Updated");

    const deleteResponse = await request(app)
      .delete(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.transactionId).toBe(id);

    const finalList = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);
    expect(finalList.body.transactions).toHaveLength(0);
  });

  test("POST /api/transactions validates payload", async () => {
    const { token } = await createUserAndToken();

    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "",
        amount: -1,
        type: "bad-type",
        category: "Unknown",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/validation failed/i);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});
