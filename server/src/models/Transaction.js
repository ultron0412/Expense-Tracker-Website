const mongoose = require("mongoose");

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

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      enum: categories,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);

