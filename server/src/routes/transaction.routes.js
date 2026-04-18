const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");

const router = express.Router();

const categories = [
  "Food",
  "Rent",
  "Salary",
  "Entertainment",
  "Transport",
  "Health",
  "Utilities",
  "Other",
];

router.get("/", auth, getTransactions);

router.post(
  "/",
  auth,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 80 })
      .withMessage("Title cannot exceed 80 characters"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a number greater than 0"),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("category").isIn(categories).withMessage("Invalid category"),
    body("date")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Date must be a valid ISO date"),
  ],
  addTransaction
);

router.put(
  "/:id",
  auth,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 80 })
      .withMessage("Title cannot exceed 80 characters"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a number greater than 0"),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("category").isIn(categories).withMessage("Invalid category"),
    body("date")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Date must be a valid ISO date"),
  ],
  updateTransaction
);

router.delete("/:id", auth, deleteTransaction);

module.exports = router;
