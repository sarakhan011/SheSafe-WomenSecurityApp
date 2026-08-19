const mongoose = require("mongoose");

const anonymousAlertSchema = new mongoose.Schema(
  {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    description: { type: String, default: "general" },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    contact_number: { type: String, default: "" },
  },
  { timestamps: true, collection: "anonymousalerts" }
);

module.exports = mongoose.model("AnonymousAlert", anonymousAlertSchema);
