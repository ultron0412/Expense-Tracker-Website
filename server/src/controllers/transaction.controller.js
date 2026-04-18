const { validationResult } = require("express-validator");
const Transaction = require("../models/Transaction");

async function addTransaction(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { title, amount, type, category, date } = req.body;
    const transaction = await Transaction.create({
      userId: req.user.id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date || new Date(),
    });

    return res.status(201).json({
      message: "Transaction created",
      transaction,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Server error while creating transaction" });
  }
}

async function getTransactions(req, res) {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    return res.json({ transactions });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
}

async function updateTransaction(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { title, amount, type, category, date } = req.body;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title, amount: Number(amount), type, category, date: date || new Date() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ message: "Transaction updated", transaction: updated });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to update transaction" });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ message: "Transaction deleted", transactionId: id });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to delete transaction" });
  }
}

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
