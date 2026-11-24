const mongoose = require("mongoose");
module.exports = new mongoose.Schema({
  name: String,
  user_id: String,
  details: {
    access_link: String,
    download_link: String,
    analytics_link: String,
    manage_link: String,
    description: String,
    status: String, // Estado de desarrollo, en revisión, finalizado, etc.
    image_preview: String,
  },
  metadata: {
    date_created: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now },
    status: { type: String, default: "active" }, // Borrado lógico
  },
});
