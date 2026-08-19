const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "resolved", "cancelled"], default: "active" },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    // live path recorded during an active emergency
    location_history: {
      type: [
        {
          latitude: Number,
          longitude: Number,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    user_ids: { type: [mongoose.Schema.Types.ObjectId], ref: "Administrator", default: [] },
    description: { type: String, enum: ["general", "medical", "accident", "harassment", "fire", "other"], default: "general" },
    accepted_list: { type: [mongoose.Schema.Types.ObjectId], ref: "Administrator", default: [] },
    audio_evidence_url: { type: String, default: "" },
    trigger_method: { type: String, enum: ["manual", "voice", "shake"], default: "manual" },
  },
  { timestamps: true, collection: "sos" }
);

module.exports = mongoose.model("SOS", sosSchema);
