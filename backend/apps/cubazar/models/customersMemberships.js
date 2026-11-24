const mongoose = require("mongoose");
module.exports = new mongoose.Schema({
  name: String,
  user_id: String,
  details: {
    description: String,
    status: String,
    amount: String,
    benefits: Array,
    payment_link: String,
    renewal_date: String,
  },
  metadata: {
    date_created: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now },
    status: { type: String, default: "active" }, // Borrado lógico
  },
});
