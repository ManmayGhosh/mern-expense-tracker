const axios = require("axios");
const { Parser } = require("json2csv");
const Expense = require("../models/Expense");

const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

function monthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  return { start, end };
}

// ---- CRUD ----

exports.list = async (req, res) => {
  try {
    const { from, to, category, type } = req.query;
    const query = { user: req.user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (category) query.category = category;
    if (type) query.type = type;

    const items = await Expense.find(query).sort({ date: -1, createdAt: -1 }).limit(500);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch expenses", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { amount, type, category, note, account, date } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    const expense = await Expense.create({
      user: req.user._id,
      amount: Number(amount),
      type: type === "income" ? "income" : "expense",
      category: category || "Other",
      categorySource: req.body.categorySource || "manual",
      note: note || "",
      account: account || "Cash",
      date: date ? new Date(date) : new Date(),
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Could not create expense", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Entry not found" });

    const fields = ["amount", "type", "category", "note", "account", "date"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) expense[f] = f === "amount" ? Number(req.body[f]) : req.body[f];
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Could not update expense", error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!result) return res.status(404).json({ message: "Entry not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete expense", error: err.message });
  }
};

// ---- Aggregation ----

exports.summary = async (req, res) => {
  try {
    const { start, end } = monthRange(0);
    const items = await Expense.find({ user: req.user._id, date: { $gte: start, $lt: end } });

    let totalExpense = 0;
    let totalIncome = 0;
    const byCategoryMap = {};

    items.forEach((e) => {
      if (e.type === "income") {
        totalIncome += e.amount;
      } else {
        totalExpense += e.amount;
        byCategoryMap[e.category] = (byCategoryMap[e.category] || 0) + e.amount;
      }
    });

    const byCategory = Object.entries(byCategoryMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // Cumulative all-time balance (income minus expense across the account's
    // whole history), shown as the headline "Total Balance" figure.
    const allTime = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const allTimeIncome = allTime.find((r) => r._id === "income")?.total || 0;
    const allTimeExpense = allTime.find((r) => r._id === "expense")?.total || 0;
    const totalBalance = allTimeIncome - allTimeExpense;

    // Previous month, for the "+12.5% vs last month" style deltas
    const { start: prevStart, end: prevEnd } = monthRange(1);
    const prevItems = await Expense.find({ user: req.user._id, date: { $gte: prevStart, $lt: prevEnd } });
    let prevExpense = 0;
    let prevIncome = 0;
    prevItems.forEach((e) => {
      if (e.type === "income") prevIncome += e.amount;
      else prevExpense += e.amount;
    });

    const pctChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    res.json({
      totalBalance,
      totalExpense,
      totalIncome,
      savings: totalIncome - totalExpense,
      byCategory,
      deltas: {
        expense: pctChange(totalExpense, prevExpense),
        income: pctChange(totalIncome, prevIncome),
        savings: pctChange(totalIncome - totalExpense, prevIncome - prevExpense),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not build summary", error: err.message });
  }
};

exports.monthly = async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const results = [];
    for (let i = months - 1; i >= 0; i--) {
      const { start, end } = monthRange(i);
      const items = await Expense.find({
        user: req.user._id,
        type: "expense",
        date: { $gte: start, $lt: end },
      });
      const total = items.reduce((sum, e) => sum + e.amount, 0);
      results.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        total,
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Could not build monthly trend", error: err.message });
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const items = await Expense.find({ user: req.user._id }).sort({ date: -1 }).lean();
    const rows = items.map((e) => ({
      date: e.date.toISOString().slice(0, 10),
      type: e.type,
      category: e.category,
      note: e.note,
      account: e.account,
      amount: e.amount,
    }));
    const parser = new Parser({ fields: ["date", "type", "category", "note", "account", "amount"] });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment(`ledger-export-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Could not export CSV", error: err.message });
  }
};

// ---- ML service proxies ----
// The Node backend never runs ML itself — it forwards to the Python
// FastAPI service and degrades gracefully if that service is offline.

exports.categorize = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || note.trim().length < 2) {
      return res.json({ category: null, confidence: 0 });
    }
    const { data } = await axios.post(`${ML_URL}/categorize`, { text: note }, { timeout: 3000 });
    res.json(data);
  } catch (err) {
    // ML service down/unreachable — frontend falls back to manual category selection
    res.json({ category: null, confidence: 0, error: "ml_service_unavailable" });
  }
};

exports.predict = async (req, res) => {
  try {
    const { start } = monthRange(0);
    const history = [];
    for (let i = 11; i >= 0; i--) {
      const { start: s, end: e } = monthRange(i);
      const items = await Expense.find({ user: req.user._id, type: "expense", date: { $gte: s, $lt: e } });
      history.push({ month: s.toISOString().slice(0, 7), total: items.reduce((sum, x) => sum + x.amount, 0) });
    }
    const { data } = await axios.post(`${ML_URL}/predict`, { history }, { timeout: 3000 });
    const nextMonthDate = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    res.json({
      nextMonth: {
        label: nextMonthDate.toLocaleString("en-US", { month: "short" }),
        amount: Math.round(data.predicted_amount),
      },
    });
  } catch (err) {
    res.status(200).json({ nextMonth: null, error: "ml_service_unavailable" });
  }
};
