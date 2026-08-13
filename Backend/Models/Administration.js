const mongoose = require("mongoose");

const administratorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    branch_name: { type: String, required: true },
    type_of_user: { type: String, enum: ["police", "hospital", "ngo", "superadmin"], required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true, collection: "administrators" }
);

module.exports = mongoose.model("Administrator", administratorSchema);
