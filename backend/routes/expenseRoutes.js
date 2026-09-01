const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/expenseController");

router.use(protect);

router.get("/summary", ctrl.summary);
router.get("/monthly", ctrl.monthly);
router.get("/predict", ctrl.predict);
router.get("/export", ctrl.exportCsv);
router.post("/categorize", ctrl.categorize);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
