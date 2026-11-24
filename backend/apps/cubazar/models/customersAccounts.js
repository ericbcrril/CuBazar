const mongoose = require("mongoose");
module.exports = new mongoose.Schema({
  user_name: String,
  password_hash: String,
  contact: {
    email: String,
    phone: String
  },
  full_name: {
    first_name: String,
    last_name: String
  },
  metadata: {
    date_created: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now },
    last_login: { type: Date },
    status: { type: String, default: "active"},
    email_verified: { type: Boolean, default: false },
  }
});
