const express = require("express");
const router = express.Router();
const telepagosService = require("../services/telepagosService");

router.post("/webhook", async (req, res, next) => {
  try {
    await telepagosService.handleNotification(req.body);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/test", (req, res) => {
  res.json({ ok: true, message: "ms-deposito running" });
});

module.exports = router;
