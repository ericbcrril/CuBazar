const mongoose = require("mongoose");
module.exports = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ["info", "warn", "error"], required: true },
  metadata: {
    date_created: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now },
    status: { type: String, default: "active" }, // Borrado lógico
  },
});
