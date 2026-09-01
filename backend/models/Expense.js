const mongoose = require("mongoose");

const CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Travel",
  "Investment",
  "Income",
  "Other",
];

const ExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    category: { type: String, enum: CATEGORIES, default: "Other" },
    categorySource: { type: String, enum: ["manual", "ml"], default: "manual" },
    note: { type: String, trim: true, default: "" },
    account: { type: String, trim: true, default: "Cash" },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

ExpenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
module.exports.CATEGORIES = CATEGORIES;
